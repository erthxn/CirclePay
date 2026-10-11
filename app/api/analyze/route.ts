import { NextRequest, NextResponse } from 'next/server';

const SORSA_BASE = 'https://api.sorsa.io/v3';

function higherResPfp(url?: string) {
  if (!url) return undefined;
  return url
    .replace('_normal', '_400x400')
    .replace('_bigger', '_400x400')
    .replace('_mini', '_400x400');
}

async function trySorsa(handle: string) {
  const apiKey = process.env.SORSA_API;
  if (!apiKey) throw new Error('No SORSA_API');

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const res = await fetch(`${SORSA_BASE}/mentions`, {
    method: 'POST',
    headers: { ApiKey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: handle, order: 'latest', since_date: since }),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function tryX(handle: string) {
  const bearer = process.env.BEARER_TOKEN;
  if (!bearer) throw new Error('No BEARER_TOKEN');

  const query = encodeURIComponent(`@${handle} -from:${handle}`);
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=username,profile_image_url`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function scoreInteractions(tweets: any[], selfHandle: string) {
  const map: Record<string, { score: number; count: number; pfp?: string }> = {};

  for (const t of tweets) {
    const user = t.user?.username;
    if (!user || user.toLowerCase() === selfHandle.toLowerCase()) continue;

    const pfp = higherResPfp(t.user?.profile_image_url || t.user?.profile_image_url_https);

    let base = 1;
    if (t.is_quote_status) base = 4;
    else if (t.is_reply) base = 1.2;
    else base = 2.5;

    const metrics = t.public_metrics || t;
    const eng =
      (metrics.like_count || metrics.likes_count || 0) * 0.4 +
      (metrics.reply_count || 0) * 1.2 +
      (metrics.quote_count || 0) * 2.5;

    const add = base * (1 + Math.log1p(eng));

    if (!map[user]) map[user] = { score: 0, count: 0, pfp };
    map[user].score += add;
    map[user].count += 1;
    if (pfp) map[user].pfp = pfp;
  }

  return Object.entries(map)
    .map(([handle, v]) => {
      let final = v.score;
      if (v.count === 1) final *= 0.45;
      if (v.count >= 3) final *= 1.4;
      if (v.count >= 5) final *= 1.25;
      return { handle, score: Math.round(final), count: v.count, pfp: v.pfp };
    })
    .sort((a, b) => b.score - a.score);
}

export async function POST(req: NextRequest) {
  try {
    const { handle, count = 5, pool = 20 } = await req.json();
    const h = String(handle || '').replace('@', '').trim();
    if (!h) return NextResponse.json({ error: 'Handle required' }, { status: 400 });

    let tweets: any[] = [];
    let source = 'sorsa';
    let centerPfp: string | undefined;

    try {
      const sorsa = await trySorsa(h);
      tweets = sorsa.tweets || [];
      // Try to get self pfp from first tweet author if present, else leave undefined
    } catch {
      source = 'x';
      try {
        const x = await tryX(h);
        const users = Object.fromEntries((x.includes?.users || []).map((u: any) => [u.id, u]));
        tweets = (x.data || []).map((t: any) => ({
          ...t,
          user: users[t.author_id] || {},
          is_reply: !!t.in_reply_to_user_id,
          is_quote_status: false,
        }));
      } catch (e2: any) {
        return NextResponse.json({ error: 'Both sources failed', detail: e2.message }, { status: 502 });
      }
    }

    const ranked = scoreInteractions(tweets, h).slice(0, Math.min(25, Number(count) || 5));

    if (!ranked.length) {
      return NextResponse.json({ members: [], prompt: '', message: 'No recent interactions', source, centerPfp });
    }

    const total = ranked.reduce((s, m) => s + m.score, 0) || 1;
    const poolNum = Number(pool);

    // Distribute in cents to avoid $0
    let remainingCents = Math.round(poolNum * 100);
    const raw = ranked.map((m) => ({
      ...m,
      cents: Math.floor((m.score / total) * remainingCents),
    }));
    let used = raw.reduce((s, m) => s + m.cents, 0);
    let leftover = remainingCents - used;

    // Give leftover to top ranked
    for (let i = 0; i < leftover; i++) {
      raw[i % raw.length].cents += 1;
    }

    const members = raw.map((m) => ({
      handle: m.handle,
      score: m.score,
      count: m.count,
      pfp: m.pfp,
      amount: Number((m.cents / 100).toFixed(2)),
    }));

    const lines = members.map((m) => `- @${m.handle}: $${m.amount.toFixed(2)}`).join('\n');
    const prompt = `Send rewards via PayBox to these X handles:\n${lines}\n\nTotal: $${poolNum.toFixed(2)}. Execute the transfers.`;

    return NextResponse.json({ members, prompt, handle: h, pool: poolNum, source, centerPfp });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}

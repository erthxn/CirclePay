import { NextRequest, NextResponse } from 'next/server';

const BLITZ_BASE = 'https://blitzyxsc-plus.blitzx.workers.dev';
const SORSA_BASE = 'https://api.sorsa.io/v3';

function higherResPfp(url?: string) {
  if (!url) return undefined;
  return url
    .replace('_normal', '_400x400')
    .replace('_bigger', '_400x400')
    .replace('_mini', '_400x400')
    .replace('_200x200', '_400x400');
}

async function tryBlitz(handle: string) {
  const res = await fetch(`${BLITZ_BASE}/api/mentions/${encodeURIComponent(handle)}?limit=40`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || 'Blitz failed');

  const tweets = data.data?.tweets || [];
  return tweets.map((t: any) => ({
    user: {
      username: t.author?.screenName || t.author?.username,
      profile_image_url: t.author?.avatarUrl,
    },
    public_metrics: {
      like_count: t.favoriteCount || t.likeCount || 0,
      reply_count: t.replyCount || 0,
      quote_count: t.quoteCount || 0,
    },
    is_quote_status: !!t.isQuoteStatus,
    is_reply: !!t.isReply,
    text: t.text,
  }));
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

async function tryRapid(handle: string) {
  const key = process.env.X_RapidAPI_Key;
  if (!key) throw new Error('No X_RapidAPI_Key');

  const query = encodeURIComponent(`@${handle} -from:${handle}`);
  const url = `https://twitter241.p.rapidapi.com/search?query=${query}&count=30&type=Latest`;

  const res = await fetch(url, {
    headers: {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': 'twitter241.p.rapidapi.com',
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  const items = data.result?.tweets || data.tweets || data.timeline || data.data || data.result || [];
  return (Array.isArray(items) ? items : []).map((t: any) => ({
    user: {
      username: t.user?.screen_name || t.author?.username || t.user?.username || t.legacy?.user?.screen_name,
      profile_image_url: t.user?.profile_image_url || t.author?.profile_image_url || t.legacy?.user?.profile_image_url_https,
    },
    public_metrics: {
      like_count: t.favorite_count || t.like_count || t.legacy?.favorite_count || 0,
      reply_count: t.reply_count || t.legacy?.reply_count || 0,
      quote_count: t.quote_count || t.legacy?.quote_count || 0,
    },
    is_quote_status: t.is_quote_status || false,
    is_reply: t.in_reply_to_status_id != null || t.is_reply || false,
  }));
}

async function tryApify(handle: string) {
  const token = process.env.APIFY_API;
  if (!token) throw new Error('No APIFY_API');

  const actor = 'khadinakbar~x-tweet-scraper';
  const url = `https://api.apify.com/v2/actors/${actor}/run-sync-get-dataset-items?token=${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchTerms: [`@${handle} -from:${handle}`],
      maxItems: 30,
      queryType: 'Latest',
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = await res.json();

  return (items || []).map((t: any) => ({
    user: {
      username: t.author?.username || t.user?.username,
      profile_image_url: t.author?.profileImageUrl || t.user?.profile_image_url,
    },
    public_metrics: {
      like_count: t.likeCount || t.favorite_count || 0,
      reply_count: t.replyCount || 0,
      quote_count: t.quoteCount || 0,
    },
    is_quote_status: t.isQuoteStatus || false,
    is_reply: t.isReply || false,
  }));
}

async function tryX(handle: string) {
  const bearer = process.env.BEARER_TOKEN;
  if (!bearer) throw new Error('No BEARER_TOKEN');

  const query = encodeURIComponent(`@${handle} -from:${handle}`);
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=username,profile_image_url`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchSelfPfp(handle: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${BLITZ_BASE}/api/profile/${encodeURIComponent(handle)}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return higherResPfp(data.data?.avatarUrl || data.data?.profile_image_url);
  } catch {
    return undefined;
  }
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
    let source = 'blitz';

    const sources = [
      { name: 'blitz', fn: () => tryBlitz(h) },
      { name: 'sorsa', fn: () => trySorsa(h).then((d) => d.tweets || []) },
      { name: 'rapid', fn: () => tryRapid(h) },
      { name: 'apify', fn: () => tryApify(h) },
      {
        name: 'x',
        fn: async () => {
          const x = await tryX(h);
          const users = Object.fromEntries((x.includes?.users || []).map((u: any) => [u.id, u]));
          return (x.data || []).map((t: any) => ({
            ...t,
            user: users[t.author_id] || {},
            is_reply: !!t.in_reply_to_user_id,
            is_quote_status: false,
          }));
        },
      },
    ];

    for (const s of sources) {
      try {
        tweets = await s.fn();
        if (tweets.length) {
          source = s.name;
          break;
        }
      } catch {
        // try next
      }
    }

    if (!tweets.length) {
      return NextResponse.json({ error: 'All sources failed or returned empty', source: 'none' }, { status: 502 });
    }

    const centerPfp = await fetchSelfPfp(h);

    const ranked = scoreInteractions(tweets, h).slice(0, Math.min(25, Number(count) || 5));

    if (!ranked.length) {
      return NextResponse.json({ members: [], prompt: '', message: 'No recent interactions', source, centerPfp });
    }

    const total = ranked.reduce((s, m) => s + m.score, 0) || 1;
    const poolNum = Number(pool);

    let remainingCents = Math.round(poolNum * 100);
    const raw = ranked.map((m) => ({
      ...m,
      cents: Math.floor((m.score / total) * remainingCents),
    }));
    let used = raw.reduce((s, m) => s + m.cents, 0);
    let leftover = remainingCents - used;

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

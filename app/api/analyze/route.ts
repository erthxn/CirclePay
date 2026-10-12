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

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

async function tryBlitz(handle: string) {
  const res = await fetchWithTimeout(
    `${BLITZ_BASE}/api/mentions/${encodeURIComponent(handle)}?limit=25`,
    {},
    10000
  );
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

  const res = await fetchWithTimeout(
    `${SORSA_BASE}/mentions`,
    {
      method: 'POST',
      headers: { ApiKey: apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: handle, order: 'latest', since_date: since }),
    },
    15000
  );

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function tryRapid(handle: string) {
  const key = process.env.X_RapidAPI_Key;
  if (!key) throw new Error('No X_RapidAPI_Key');

  const query = encodeURIComponent(`@${handle} -from:${handle}`);
  const url = `https://twitter241.p.rapidapi.com/search?query=${query}&count=30&type=Latest`;

  const res = await fetchWithTimeout(
    url,
    {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'twitter241.p.rapidapi.com',
      },
    },
    12000
  );

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

  const res = await fetchWithTimeout(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchTerms: [`@${handle} -from:${handle}`],
        maxItems: 30,
        queryType: 'Latest',
      }),
    },
    20000
  );

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

  const res = await fetchWithTimeout(
    url,
    { headers: { Authorization: `Bearer ${bearer}` } },
    12000
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchSelfPfp(handle: string): Promise<{ pfp?: string; exists: boolean | null; rateLimited?: boolean }> {
  try {
    const res = await fetchWithTimeout(
      `${BLITZ_BASE}/api/profile/${encodeURIComponent(handle)}`,
      {},
      8000
    );
    if (res.status === 429) return { exists: null, rateLimited: true };
    if (res.status === 404) return { exists: false };
    if (!res.ok) return { exists: null };

    const data = await res.json();
    if (data.statusCode === 429 || data.error === 'RATE_LIMITED') {
      return { exists: null, rateLimited: true };
    }
    if (!data.ok || !data.data) {
      if (data.error === 'NOT_FOUND' || data.message?.toLowerCase().includes('not found')) {
        return { exists: false };
      }
      return { exists: null };
    }
    return {
      pfp: higherResPfp(data.data?.avatarUrl || data.data?.profile_image_url),
      exists: true,
    };
  } catch {
    return { exists: null };
  }
}

function scoreInteractions(tweets: any[], selfHandle: string) {
  const map: Record<string, { score: number; count: number; pfp?: string }> = {};

  for (const t of tweets) {
    const user = t.user?.username;
    if (!user || user.toLowerCase() === selfHandle.toLowerCase()) continue;

    const pfp = higherResPfp(t.user?.profile_image_url || t.user?.profile_image_url_https);

    let base = 1;
    if (t.is_quote_status) base = 2.4;
    else if (t.is_reply) base = 1.4;
    else base = 1.8;

    const metrics = t.public_metrics || t;
    const eng =
      (metrics.like_count || metrics.likes_count || 0) * 0.25 +
      (metrics.reply_count || 0) * 0.8 +
      (metrics.quote_count || 0) * 1.4;

    const add = base * (1 + Math.log1p(eng) * 0.35);

    if (!map[user]) map[user] = { score: 0, count: 0, pfp };
    map[user].score += add;
    map[user].count += 1;
    if (pfp) map[user].pfp = pfp;
  }

  return Object.entries(map)
    .map(([handle, v]) => {
      let final = v.score;
      if (v.count === 1) final *= 0.85;
      if (v.count >= 2) final *= 1.05;
      if (v.count >= 4) final *= 1.08;
      return { handle, score: Math.round(final * 10) / 10, count: v.count, pfp: v.pfp };
    })
    .sort((a, b) => b.score - a.score);
}

function distribute(ranked: { score: number }[], poolNum: number) {
  // compress scores so top isn't 70%+
  const compressed = ranked.map((m) => Math.pow(Math.max(m.score, 0.1), 0.42));
  const total = compressed.reduce((s, n) => s + n, 0) || 1;
  let remainingCents = Math.round(poolNum * 100);

  const raw = compressed.map((c) => Math.floor((c / total) * remainingCents));

  // soft cap: no one above ~38% of pool
  const cap = Math.floor(remainingCents * 0.38);
  let excess = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] > cap) {
      excess += raw[i] - cap;
      raw[i] = cap;
    }
  }

  // redistribute excess to the rest, proportionally, respecting cap
  if (excess > 0) {
    const open = raw.map((n, i) => (n < cap ? i : -1)).filter((i) => i >= 0);
    let guard = 0;
    while (excess > 0 && open.length && guard < 500) {
      for (const i of open) {
        if (excess <= 0) break;
        if (raw[i] < cap) {
          raw[i] += 1;
          excess -= 1;
        }
      }
      guard++;
    }
  }

  let used = raw.reduce((s, n) => s + n, 0);
  let leftover = remainingCents - used;
  for (let i = 0; i < leftover; i++) {
    raw[i % raw.length] += 1;
  }

  return raw;
}

export async function POST(req: NextRequest) {
  try {
    const { handle, count = 5, pool = 20 } = await req.json();
    const h = String(handle || '').replace('@', '').trim();
    if (!h) return NextResponse.json({ error: 'Handle required' }, { status: 400 });

    const profile = await fetchSelfPfp(h);

    if (profile.exists === false) {
      return NextResponse.json({
        members: [],
        prompt: '',
        handle: h,
        pool: Number(pool),
        source: 'none',
        centerPfp: null,
        emptyReason: 'not_found',
        message: 'Account not found on X',
      });
    }

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
        // continue
      }
    }

    if (!tweets.length) {
      return NextResponse.json({
        members: [],
        prompt: '',
        handle: h,
        pool: Number(pool),
        source: 'none',
        centerPfp: profile.pfp,
        emptyReason: 'no_activity',
        message: profile.rateLimited
          ? 'Could not read recent activity. Try again in a minute.'
          : 'No recent interactions in the last 7 days',
      });
    }

    const ranked = scoreInteractions(tweets, h).slice(0, Math.min(25, Number(count) || 5));

    if (!ranked.length) {
      return NextResponse.json({
        members: [],
        prompt: '',
        handle: h,
        pool: Number(pool),
        source,
        centerPfp: profile.pfp,
        emptyReason: 'no_activity',
        message: 'No recent interactions in the last 7 days',
      });
    }

    const poolNum = Number(pool);
    const cents = distribute(ranked, poolNum);

    const members = ranked.map((m, i) => ({
      handle: m.handle,
      score: m.score,
      count: m.count,
      pfp: m.pfp,
      amount: Number((cents[i] / 100).toFixed(2)),
    }));

    const lines = members.map((m) => `- @${m.handle}: $${m.amount.toFixed(2)}`).join('\n');
    const prompt = `Send rewards via PayBox to these X handles:\n${lines}\n\nTotal: $${poolNum.toFixed(2)}. Execute the transfers.`;

    return NextResponse.json({
      members,
      prompt,
      handle: h,
      pool: poolNum,
      source,
      centerPfp: profile.pfp,
      emptyReason: null,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}

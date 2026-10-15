import { NextRequest, NextResponse } from 'next/server';

const PRIMARY = 'https://blitzyxsc.vercel.app';
const FALLBACKS = [
  'https://blitzyxsc-plus.vercel.app',
  'https://blitzyxsc-nx.vercel.app',
  'https://blitzyxsc-go.vercel.app',
  'https://blitzyxsc-nd.vercel.app',
];

const SORSA_BASE = 'https://api.sorsa.io/v3';

function higherResPfp(url?: string) {
  if (!url) return undefined;
  return url
    .replace('_normal', '_400x400')
    .replace('_bigger', '_400x400')
    .replace('_mini', '_400x400')
    .replace('_200x200', '_400x400');
}

function isValidHandle(h?: string) {
  if (!h) return false;
  const clean = h.trim();
  if (clean.length < 2 || clean.length > 15) return false;
  if (/\s/.test(clean)) return false;
  if (!/^[A-Za-z0-9_]+$/.test(clean)) return false;
  if (/^(RT|R|by|to|from|via)$/i.test(clean)) return false;
  return true;
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 12000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal, cache: 'no-store' });
  } finally {
    clearTimeout(t);
  }
}

function normalizeTweets(raw: any[]): any[] {
  return (raw || [])
    .map((t: any) => {
      const author = t.author || t.user || {};
      const username =
        author.screenName ||
        author.username ||
        author.screen_name ||
        t.user?.username ||
        t.user?.screen_name;
      if (!isValidHandle(username)) return null;
      return {
        user: {
          username,
          profile_image_url: author.avatarUrl || author.profile_image_url || author.avatar_url || author.profileImageUrl,
        },
        public_metrics: {
          like_count: t.favoriteCount || t.likeCount || t.likes || t.public_metrics?.like_count || 0,
          reply_count: t.replyCount || t.replies || t.public_metrics?.reply_count || 0,
          quote_count: t.quoteCount || t.quotes || t.public_metrics?.quote_count || 0,
        },
        is_quote_status: !!t.isQuoteStatus || !!t.is_quote_status || !!t.is_quote,
        is_reply: !!t.isReply || !!t.is_reply || !!t.inReplyToStatusId,
        text: t.text,
      };
    })
    .filter(Boolean);
}

async function pullPath(base: string, path: string) {
  try {
    const res = await fetchWithTimeout(base + path, {}, 10000);
    if (!res.ok) return [];
    const data = await res.json();
    const tweets =
      data.data?.tweets ||
      data.tweets ||
      data.data ||
      data.items ||
      (Array.isArray(data) ? data : []);
    return Array.isArray(tweets) ? normalizeTweets(tweets) : [];
  } catch {
    return [];
  }
}

async function tryPrimary(handle: string) {
  const [quotes, mentions, timeline] = await Promise.all([
    pullPath(PRIMARY, `/posts/user/${encodeURIComponent(handle)}/quotes?limit=40`),
    pullPath(PRIMARY, `/mentions/${encodeURIComponent(handle)}?limit=40`),
    pullPath(PRIMARY, `/posts/user/${encodeURIComponent(handle)}?limit=20`),
  ]);

  const merged = [...quotes, ...mentions, ...timeline];
  const seen = new Set<string>();
  const unique = merged.filter((t) => {
    const key = (t.user?.username || '') + (t.text || '').slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!unique.length) throw new Error('empty');
  return unique;
}

async function tryFallback(base: string, handle: string) {
  const [mentions, timeline] = await Promise.all([
    pullPath(base, `/api/mentions/${encodeURIComponent(handle)}?limit=40`),
    pullPath(base, `/api/timeline/${encodeURIComponent(handle)}?limit=30`),
  ]);

  const merged = [...mentions, ...timeline];
  const seen = new Set<string>();
  const unique = merged.filter((t) => {
    const key = (t.user?.username || '') + (t.text || '').slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (!unique.length) throw new Error('empty');
  return unique;
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
  const d = await res.json();
  return normalizeTweets(d.tweets || d.data || []);
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
  return normalizeTweets(Array.isArray(items) ? items : []);
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
  return normalizeTweets(items || []);
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
  const x = await res.json();
  const users = Object.fromEntries((x.includes?.users || []).map((u: any) => [u.id, u]));
  return (x.data || []).map((t: any) => ({
    user: {
      username: users[t.author_id]?.username,
      profile_image_url: users[t.author_id]?.profile_image_url,
    },
    public_metrics: t.public_metrics || {},
    is_quote_status: false,
    is_reply: !!t.in_reply_to_user_id,
  }));
}

async function fetchSelfPfp(handle: string): Promise<{ pfp?: string; exists: boolean | null; rateLimited?: boolean }> {
  const tryExtract = (data: any) => {
    const d = data.data || data.profile || data;
    const avatar =
      d.avatarUrl ||
      d.avatar ||
      d.profile_image_url ||
      d.avatar_url ||
      d.profileImageUrl ||
      d.avatar_url_https;
    if (d.screenName || d.username || d.screen_name || avatar) {
      return { pfp: higherResPfp(avatar), exists: true as const };
    }
    return null;
  };

  try {
    const res = await fetchWithTimeout(`${PRIMARY}/profile/${encodeURIComponent(handle)}`, {}, 8000);
    if (res.ok) {
      const got = tryExtract(await res.json());
      if (got) return got;
    } else if (res.status === 404) {
      return { exists: false };
    }
  } catch {
    // fall through
  }

  for (const base of FALLBACKS) {
    try {
      const res = await fetchWithTimeout(`${base}/api/profile/${encodeURIComponent(handle)}`, {}, 8000);
      if (res.status === 429) return { exists: null, rateLimited: true };
      if (res.status === 404) return { exists: false };
      if (!res.ok) continue;

      const data = await res.json();
      if (data.ok === false && (data.error === 'NOT_FOUND' || String(data.message || '').toLowerCase().includes('not found'))) {
        return { exists: false };
      }
      const got = tryExtract(data);
      if (got) return got;
    } catch {
      // next
    }
  }
  return { exists: null };
}

function scoreInteractions(tweets: any[], selfHandle: string) {
  const map: Record<string, { score: number; count: number; pfp?: string }> = {};

  for (const t of tweets) {
    const user = t.user?.username;
    if (!user || user.toLowerCase() === selfHandle.toLowerCase()) continue;
    if (!isValidHandle(user)) continue;

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
  const compressed = ranked.map((m) => Math.pow(Math.max(m.score, 0.1), 0.42));
  const total = compressed.reduce((s, n) => s + n, 0) || 1;
  let remainingCents = Math.round(poolNum * 100);

  const raw = compressed.map((c) => Math.floor((c / total) * remainingCents));

  const cap = Math.floor(remainingCents * 0.38);
  let excess = 0;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] > cap) {
      excess += raw[i] - cap;
      raw[i] = cap;
    }
  }

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
    let source = 'none';

    const chain: { name: string; fn: () => Promise<any[]> }[] = [
      { name: 'primary', fn: () => tryPrimary(h) },
      ...FALLBACKS.map((base, i) => ({ name: `fb${i}`, fn: () => tryFallback(base, h) })),
      { name: 'sorsa', fn: () => trySorsa(h) },
      { name: 'rapid', fn: () => tryRapid(h) },
      { name: 'apify', fn: () => tryApify(h) },
      { name: 'x', fn: () => tryX(h) },
    ];

    for (const s of chain) {
      try {
        const got = await s.fn();
        if (got && got.length) {
          tweets = got;
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

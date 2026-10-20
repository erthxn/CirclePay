import { NextRequest, NextResponse } from 'next/server';

const PLUS = 'https://blitzyxsc-plus.vercel.app';
const PRIMARY = 'https://blitzyxsc.vercel.app';
const OTHERS = [
  'https://blitzyxsc-nx.vercel.app',
  'https://blitzyxsc-go.vercel.app',
  'https://blitzyxsc-nd.vercel.app',
];

const SORSA_BASE = 'https://api.sorsa.io/v3';

const cache = new Map<string, { at: number; data: any }>();
const CACHE_MS = 8 * 60 * 1000;

const ipHits = new Map<string, number[]>();
const handleLast = new Map<string, number>();
const IP_WINDOW = 10 * 60 * 1000;
const IP_MAX = 6;
const HANDLE_COOLDOWN = 3 * 60 * 1000;

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

function getIp(req: NextRequest) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

function riskScore(req: NextRequest, handle: string) {
  let score = 0;
  const reasons: string[] = [];

  const ua = req.headers.get('user-agent') || '';
  if (!ua || ua.length < 12) {
    score += 40;
    reasons.push('missing-ua');
  } else if (/bot|crawl|spider|python|curl|wget|scrapy|axios|node-fetch/i.test(ua)) {
    score += 50;
    reasons.push('bot-ua');
  }

  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';
  const allowed = ['circlepay.fun', 'circlepay.fyi', 'vercel.app', 'localhost'];
  const fromSite = allowed.some((d) => referer.includes(d) || origin.includes(d));
  if (!fromSite && !referer && !origin) {
    score += 25;
    reasons.push('no-origin');
  }

  const ip = getIp(req);
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter((t) => now - t < 60 * 1000);
  if (hits.length >= 4) {
    score += 35;
    reasons.push('burst');
  }

  const last = handleLast.get(handle.toLowerCase()) || 0;
  if (now - last < 30 * 1000) {
    score += 20;
    reasons.push('handle-burst');
  }

  return { score, reasons };
}

function checkLimits(req: NextRequest, handle: string) {
  const ip = getIp(req);
  const now = Date.now();
  const key = handle.toLowerCase();

  const hits = (ipHits.get(ip) || []).filter((t) => now - t < IP_WINDOW);
  if (hits.length >= IP_MAX) {
    return { ok: false, status: 429, error: 'Too many checks from this network. Try again in a few minutes.' };
  }

  const last = handleLast.get(key) || 0;
  if (now - last < HANDLE_COOLDOWN) {
    const wait = Math.ceil((HANDLE_COOLDOWN - (now - last)) / 1000);
    return { ok: false, status: 429, error: `This handle was checked recently. Wait ${wait}s.` };
  }

  hits.push(now);
  ipHits.set(ip, hits);
  handleLast.set(key, now);

  if (ipHits.size > 5000) {
    for (const [k, arr] of ipHits) {
      if (!arr.some((t) => now - t < IP_WINDOW)) ipHits.delete(k);
    }
  }

  return { ok: true };
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}, ms = 8000) {
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
    const res = await fetchWithTimeout(base + path, {}, 7000);
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

async function tryPlus(handle: string) {
  const results = await Promise.allSettled([
    pullPath(PLUS, `/api/timeline/${encodeURIComponent(handle)}?limit=50`),
    pullPath(PLUS, `/api/mentions/${encodeURIComponent(handle)}?limit=40`),
  ]);
  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const seen = new Set<string>();
  return all.filter((t) => {
    const key = (t.user?.username || '') + (t.text || '').slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function tryPrimary(handle: string) {
  const results = await Promise.allSettled([
    pullPath(PRIMARY, `/posts/user/${encodeURIComponent(handle)}/quotes?limit=30`),
    pullPath(PRIMARY, `/mentions/${encodeURIComponent(handle)}?limit=30`),
    pullPath(PRIMARY, `/posts/user/${encodeURIComponent(handle)}?limit=20`),
  ]);
  const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const seen = new Set<string>();
  return all.filter((t) => {
    const key = (t.user?.username || '') + (t.text || '').slice(0, 40);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function tryOther(base: string, handle: string) {
  const results = await Promise.allSettled([
    pullPath(base, `/api/mentions/${encodeURIComponent(handle)}?limit=30`),
    pullPath(base, `/api/timeline/${encodeURIComponent(handle)}?limit=20`),
  ]);
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

async function trySorsa(handle: string) {
  const apiKey = process.env.SORSA_API;
  if (!apiKey) return [];
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const res = await fetchWithTimeout(
      `${SORSA_BASE}/mentions`,
      {
        method: 'POST',
        headers: { ApiKey: apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: handle, order: 'latest', since_date: since }),
      },
      10000
    );
    if (!res.ok) return [];
    const d = await res.json();
    return normalizeTweets(d.tweets || d.data || []);
  } catch {
    return [];
  }
}

async function tryRapid(handle: string) {
  const key = process.env.X_RapidAPI_Key;
  if (!key) return [];
  try {
    const query = encodeURIComponent(`@${handle} -from:${handle}`);
    const url = `https://twitter241.p.rapidapi.com/search?query=${query}&count=30&type=Latest`;
    const res = await fetchWithTimeout(url, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'twitter241.p.rapidapi.com',
      },
    }, 8000);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.result?.tweets || data.tweets || data.timeline || data.data || data.result || [];
    return normalizeTweets(Array.isArray(items) ? items : []);
  } catch {
    return [];
  }
}

async function tryApify(handle: string) {
  const token = process.env.APIFY_API;
  if (!token) return [];
  try {
    const actor = 'khadinakbar~x-tweet-scraper';
    const url = `https://api.apify.com/v2/actors/${actor}/run-sync-get-dataset-items?token=${token}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        searchTerms: [`@${handle} -from:${handle}`],
        maxItems: 30,
        queryType: 'Latest',
      }),
    }, 12000);
    if (!res.ok) return [];
    const items = await res.json();
    return normalizeTweets(items || []);
  } catch {
    return [];
  }
}

async function tryX(handle: string) {
  const bearer = process.env.BEARER_TOKEN;
  if (!bearer) return [];
  try {
    const query = encodeURIComponent(`@${handle} -from:${handle}`);
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${query}&max_results=50&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=username,profile_image_url`;
    const res = await fetchWithTimeout(url, { headers: { Authorization: `Bearer ${bearer}` } }, 8000);
    if (!res.ok) return [];
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
  } catch {
    return [];
  }
}

async function fetchSelfPfp(handle: string): Promise<{ pfp?: string; exists: boolean | null }> {
  const tryExtract = (data: any) => {
    const d = data.data || data.profile || data;
    const avatar =
      d.avatarUrl ||
      d.avatar ||
      d.profile_image_url ||
      d.avatar_url ||
      d.profileImageUrl;
    if (d.screenName || d.username || d.screen_name || avatar) {
      return { pfp: higherResPfp(avatar), exists: true as const };
    }
    return null;
  };

  // Skip broken plus profile; try nx and primary first
  const order = [
    { base: 'https://blitzyxsc-nx.vercel.app', path: `/api/profile/${encodeURIComponent(handle)}` },
    { base: PRIMARY, path: `/profile/${encodeURIComponent(handle)}` },
    { base: 'https://blitzyxsc-go.vercel.app', path: `/api/profile/${encodeURIComponent(handle)}` },
    { base: 'https://blitzyxsc-nd.vercel.app', path: `/api/profile/${encodeURIComponent(handle)}` },
  ];

  for (const s of order) {
    try {
      const res = await fetchWithTimeout(s.base + s.path, {}, 5000);
      if (res.status === 404) return { exists: false };
      if (!res.ok) continue;
      const got = tryExtract(await res.json());
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
    const body = await req.json();
    const { handle, count = 5, pool = 20, proof } = body;
    const h = String(handle || '').replace('@', '').trim();
    if (!h) return NextResponse.json({ error: 'Handle required' }, { status: 400 });

    const risk = riskScore(req, h);

    if (risk.score >= 70) {
      return NextResponse.json(
        { error: 'Request blocked', challenge: false },
        { status: 429 }
      );
    }

    if (risk.score >= 35) {
      const now = Date.now();
      const ts = Number(proof);
      if (!ts || now - ts < 1500 || now - ts > 30000) {
        return NextResponse.json(
          { challenge: true, error: 'Please confirm and try again' },
          { status: 428 }
        );
      }
    }

    const limit = checkLimits(req, h);
    if (!limit.ok) {
      return NextResponse.json({ error: limit.error }, { status: limit.status });
    }

    const cacheKey = `${h.toLowerCase()}|${count}|${pool}`;
    const hit = cache.get(cacheKey);
    if (hit && Date.now() - hit.at < CACHE_MS) {
      return NextResponse.json({ ...hit.data, cached: true });
    }

    // Run profile and first tweet source in parallel
    const [profile, plusTweets] = await Promise.all([
      fetchSelfPfp(h),
      tryPlus(h),
    ]);

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

    let tweets: any[] = plusTweets;
    let source = plusTweets.length ? 'plus' : 'none';

    if (!tweets.length) {
      const chain: { name: string; fn: () => Promise<any[]> }[] = [
        { name: 'primary', fn: () => tryPrimary(h) },
        ...OTHERS.map((base, i) => ({ name: `other${i}`, fn: () => tryOther(base, h) })),
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
        message: 'No recent interactions in the last 7 days',
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

    const result = {
      members,
      prompt,
      handle: h,
      pool: poolNum,
      source,
      centerPfp: profile.pfp,
      emptyReason: null,
    };

    cache.set(cacheKey, { at: Date.now(), data: result });

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Unknown error' }, { status: 500 });
  }
}

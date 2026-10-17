import { NextRequest, NextResponse } from 'next/server';

const BLITZ_SOURCES = [
  { id: 'plus', base: 'https://blitzyxsc-plus.vercel.app' },
  { id: 'nx', base: 'https://blitzyxsc-nx.vercel.app' },
  { id: 'go', base: 'https://blitzyxsc-go.vercel.app' },
  { id: 'nd', base: 'https://blitzyxsc-nd.vercel.app' },
  { id: 'py', base: 'https://blitzyxsc.vercel.app' },
];

export async function GET(req: NextRequest) {
  const source = req.nextUrl.searchParams.get('source');

  try {
    const blitz = BLITZ_SOURCES.find((s) => s.id === source);
    if (blitz) {
      const r = await fetch(`${blitz.base}/health`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
      if (!r) {
        const r2 = await fetch(`${blitz.base}/api/profile/erthxn`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
        return NextResponse.json({ ok: !!r2?.ok, detail: r2?.ok ? 'Reachable' : 'Down' });
      }
      return NextResponse.json({ ok: r.ok, detail: r.ok ? 'Reachable' : `HTTP ${r.status}` });
    }

    if (source === 'sorsa') {
      if (!process.env.SORSA_API) return NextResponse.json({ ok: false, detail: 'No key' });
      const r = await fetch('https://api.sorsa.io/v3/mentions', {
        method: 'POST',
        headers: { ApiKey: process.env.SORSA_API, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'elonmusk', order: 'latest', since_date: '2026-10-01' }),
      });
      return NextResponse.json({ ok: r.ok, detail: r.ok ? 'Reachable' : `HTTP ${r.status}` });
    }

    if (source === 'rapid') {
      if (!process.env.X_RapidAPI_Key) return NextResponse.json({ ok: false, detail: 'No key' });
      const r = await fetch('https://twitter241.p.rapidapi.com/search?query=elonmusk&count=1&type=Latest', {
        headers: {
          'X-RapidAPI-Key': process.env.X_RapidAPI_Key,
          'X-RapidAPI-Host': 'twitter241.p.rapidapi.com',
        },
      });
      return NextResponse.json({ ok: r.ok, detail: r.ok ? 'Reachable' : `HTTP ${r.status}` });
    }

    if (source === 'apify') {
      if (!process.env.APIFY_API) return NextResponse.json({ ok: false, detail: 'No key' });
      const r = await fetch(
        `https://api.apify.com/v2/acts/khadinakbar~x-tweet-scraper?token=${process.env.APIFY_API}`
      );
      return NextResponse.json({ ok: r.ok, detail: r.ok ? 'Token valid' : `HTTP ${r.status}` });
    }

    if (source === 'x') {
      if (!process.env.BEARER_TOKEN) return NextResponse.json({ ok: false, detail: 'No bearer' });
      const r = await fetch('https://api.twitter.com/2/users/by/username/elonmusk', {
        headers: { Authorization: `Bearer ${process.env.BEARER_TOKEN}` },
      });
      return NextResponse.json({ ok: r.ok, detail: r.ok ? 'Reachable' : `HTTP ${r.status}` });
    }

    return NextResponse.json({ ok: false, detail: 'Unknown source' });
  } catch (e: any) {
    return NextResponse.json({ ok: false, detail: e.message });
  }
}

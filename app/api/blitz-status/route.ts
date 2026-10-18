import { NextRequest, NextResponse } from 'next/server';

const BASE = 'https://blitzyxsc-plus.blitzx.workers.dev';

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/api/health';

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const r = await fetch(BASE + path, { signal: ctrl.signal });
    clearTimeout(t);

    let detail = r.ok ? 'OK' : `HTTP ${r.status}`;
    if (r.ok) {
      try {
        const data = await r.json();
        if (data.ok === false) detail = data.error || data.message || 'Not ok';
        else if (data.data) detail = 'Reachable';
      } catch {
        // non-json ok
      }
    }

    return NextResponse.json({ ok: r.ok && detail !== 'Not ok', detail });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      detail: e.name === 'AbortError' ? 'Timeout' : e.message || 'Error',
    });
  }
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const LETTERS = ['C', 'I', 'R', 'C', 'L', 'E'];

function stepsFor(handle: string) {
  const u = `@${handle}`;
  return [
    'connecting…',
    `looking up ${u}…`,
    `searching recent posts…`,
    `reading replies and mentions…`,
    `scoring interactions…`,
    `ranking circle…`,
    'preparing prompt…',
  ];
}

export default function CirclePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [thought, setThought] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lockedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function run() {
    const h = handle.trim().replace('@', '');
    if (!h) {
      setError('Please enter your X handle');
      return;
    }
    const p = Number(String(pool).replace(/,/g, '')) || 0;
    if (p <= 0) {
      setError('Enter a reward pool greater than 0');
      return;
    }

    const steps = stepsFor(h);
    lockedRef.current = false;
    setError('');
    setLoading(true);
    setThought(steps[0]);

    const start = Date.now();
    timerRef.current = setInterval(() => {
      if (lockedRef.current) return;
      const sec = (Date.now() - start) / 1000;
      const idx = Math.min(steps.length - 1, Math.floor(sec / 1.7));
      setThought(steps[idx]);
    }, 400);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 28000);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: h, count, pool: p }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const data = await res.json();

      lockedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);

      if (data.emptyReason === 'not_found') {
        setThought(`couldn't find @${h}`);
      } else if (data.emptyReason === 'no_activity') {
        setThought(`no recent activity on @${h}`);
      } else if (!res.ok || data.error) {
        setThought('something went wrong');
      } else {
        setThought('preparing prompt…');
      }

      const minDisplay = 11000;
      const took = Date.now() - start;
      if (took < minDisplay) {
        await new Promise((r) => setTimeout(r, minDisplay - took));
      }

      if (!res.ok || data.error) {
        router.push(`/circle/error?msg=${encodeURIComponent(data.error || 'Request failed')}`);
        return;
      }

      sessionStorage.setItem('circleResult', JSON.stringify(data));
      router.push('/circle/pay');
    } catch (err: any) {
      lockedRef.current = true;
      if (timerRef.current) clearInterval(timerRef.current);
      setThought('connection issue');
      const msg =
        err?.name === 'AbortError'
          ? 'Request timed out — try again'
          : 'Network error';
      router.push('/circle/error?msg=' + encodeURIComponent(msg));
    }
  }

  function formatPool(v: string) {
    const cleaned = v.replace(/[^0-9.]/g, '');
    if (!cleaned) return '';
    const [int, dec] = cleaned.split('.');
    const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return dec !== undefined ? `${withCommas}.${dec}` : withCommas;
  }

  return (
    <div className="max-w-md mx-auto px-5 py-6 min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Check your X circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Last 7 days · ranked by engagement</p>

      {!loading ? (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[var(--text-muted)] block mb-1.5">X handle</label>
            <input
              value={handle}
              onChange={(e) => {
                setHandle(e.target.value.replace('@', ''));
                if (error) setError('');
              }}
              placeholder="erthxn"
              className="neu-input w-full px-4 py-3.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1.5">Circle size</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="neu-input w-full px-4 py-3.5 text-sm appearance-none"
              >
                {[5, 7, 10, 15].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1.5">Reward pool ($)</label>
              <input
                type="text"
                inputMode="decimal"
                value={pool}
                onChange={(e) => setPool(formatPool(e.target.value))}
                placeholder="20"
                className="neu-input w-full px-4 py-3.5 text-sm"
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={run}
            className="w-full py-3.5 text-sm font-medium text-white rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.3)' }}
          >
            Analyze & generate prompt
          </button>
        </div>
      ) : (
        <div className="mt-16 flex flex-col items-center justify-center min-h-[40vh]">
          <div className="flex items-center gap-2 sm:gap-2.5">
            {LETTERS.map((letter, i) => (
              <div
                key={i}
                className="tile"
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                {letter}
              </div>
            ))}
          </div>

          <p className="mt-10 text-sm text-[var(--text-muted)] text-center max-w-[16rem] leading-relaxed">
            {thought}
          </p>
        </div>
      )}
    </div>
  );
}

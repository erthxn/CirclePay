'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function CirclePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(10);

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

    setError('');
    setLoading(true);
    setSeconds(10);

    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setSeconds(Math.max(0, 10 - elapsed));
    }, 200);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: h, count, pool: p }),
      });
      const data = await res.json();

      const remaining = 10000 - (Date.now() - start);
      if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

      clearInterval(timer);

      if (!res.ok || data.error) {
        router.push(`/circle/error?msg=${encodeURIComponent(data.error || 'Request failed')}`);
        return;
      }

      sessionStorage.setItem('circleResult', JSON.stringify(data));
      router.push('/circle/pay');
    } catch {
      clearInterval(timer);
      router.push('/circle/error?msg=' + encodeURIComponent('Network error'));
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
                {[5, 10, 20, 25].map((n) => (
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
        <div className="mt-8 flex flex-col items-center justify-center min-h-[50vh]">
          <div className="relative">
            <Logo className="w-40 h-40" />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3">
              <div className="h-3 w-24 bg-[#0D5CFF] rounded-full animate-[motion_1.6s_ease-in-out_infinite]" />
              <div className="h-3 w-16 bg-[#0D5CFF] rounded-full animate-[motion_1.6s_ease-in-out_infinite_0.4s]" />
            </div>
          </div>
          <p className="mt-12 text-xl font-semibold text-[var(--text)]">Reading @{handle.replace('@','')}</p>
          <p className="mt-6 text-6xl font-bold tabular-nums text-[var(--accent)]">{seconds}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">seconds remaining</p>
        </div>
      )}

      <style jsx>{`
        @keyframes motion {
          0%, 100% { transform: translateX(0); opacity: 0.45; }
          50% { transform: translateX(20px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

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
  const [progress, setProgress] = useState(0);

  async function run() {
    const h = handle.trim().replace('@', '');
    if (!h) {
      setError('Please enter your X handle');
      return;
    }
    const p = Number(pool) || 0;
    if (p <= 0) {
      setError('Enter a reward pool greater than 0');
      return;
    }

    setError('');
    setLoading(true);
    setProgress(0);

    const duration = 8000;
    const interval = 80;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(100, Math.round((step / steps) * 100)));
    }, interval);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: h, count, pool: p }),
      });

      const data = await res.json();

      clearInterval(timer);
      setProgress(100);

      if (!res.ok || data.error) {
        router.push(`/circle/error?msg=${encodeURIComponent(data.error || 'Request failed')}`);
        return;
      }

      // Store in session for the pay page
      sessionStorage.setItem('circleResult', JSON.stringify(data));
      setTimeout(() => {
        router.push('/circle/pay');
      }, 300);
    } catch (err) {
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
    <div className="max-w-md mx-auto px-5 py-6">
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
              className={`neu-input w-full px-4 py-3.5 text-sm ${error && !handle ? 'ring-2 ring-red-500' : ''}`}
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
        <div className="mt-10 flex flex-col items-center">
          <div className="relative">
            <Logo className="w-28 h-28" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <div className="h-1.5 w-14 bg-[#0D5CFF] rounded-full animate-[bar_1.4s_ease-in-out_infinite]" />
              <div className="h-1.5 w-9 bg-[#0D5CFF] rounded-full animate-[bar_1.4s_ease-in-out_infinite_0.35s]" />
            </div>
          </div>
          <p className="mt-8 text-sm font-medium text-[var(--text)]">Reading @{handle.replace('@','')}</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Analyzing interactions…</p>
          <div className="mt-6 w-56 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
            <div
              className="h-full bg-[var(--accent)] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{progress}%</p>
        </div>
      )}

      <style jsx>{`
        @keyframes bar {
          0%, 100% { transform: translateX(0); opacity: 0.5; }
          50% { transform: translateX(10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

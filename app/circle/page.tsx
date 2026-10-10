'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';

export default function CirclePage() {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function run() {
    if (!handle.trim()) {
      setError('Please enter your X handle');
      return;
    }
    setError('');
    setLoading(true);
    setProgress(0);

    const duration = 30000;
    const interval = 100;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setProgress(Math.min(100, Math.round((step / steps) * 100)));
      if (step >= steps) {
        clearInterval(timer);
        // Pass data via query for the results page
        const params = new URLSearchParams({
          handle: handle.trim(),
          count: String(count),
          pool: String(pool),
        });
        router.push(`/circle/pay?${params.toString()}`);
      }
    }, interval);
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
              className={`neu-input w-full px-4 py-3.5 text-sm ${error ? 'ring-2 ring-red-500' : ''}`}
            />
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
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
                type="number"
                value={pool}
                onChange={(e) => setPool(Number(e.target.value) || 0)}
                className="neu-input w-full px-4 py-3.5 text-sm"
              />
            </div>
          </div>

          <button
            onClick={run}
            className="w-full py-3.5 text-sm font-medium text-white rounded-full"
            style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.3)' }}
          >
            Analyze & generate prompt
          </button>
        </div>
      ) : (
        <div className="mt-12 flex flex-col items-center">
          <div className="relative">
            <Logo className="w-24 h-24" />
            <div className="absolute inset-0 flex items-center justify-end pr-2">
              <div className="flex flex-col gap-1.5">
                <div className="h-2 w-12 bg-[#0D5CFF] rounded-full animate-[slide_1.2s_ease-in-out_infinite]" />
                <div className="h-2 w-8 bg-[#0D5CFF] rounded-full animate-[slide_1.2s_ease-in-out_infinite_0.3s]" />
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-[var(--text-muted)]">Reading @{handle}…</p>
          <div className="mt-4 w-48 h-1.5 bg-[var(--bg-dark)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{progress}%</p>
        </div>
      )}

      <style jsx>{`
        @keyframes slide {
          0%, 100% { transform: translateX(0); opacity: 0.6; }
          50% { transform: translateX(8px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

type Status = { ok: boolean; detail: string; loading?: boolean };

const PASS = 'oluwaseun07';

export default function SourceStatusPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    blitz: { ok: false, detail: '', loading: true },
    sorsa: { ok: false, detail: '', loading: true },
    rapid: { ok: false, detail: '', loading: true },
    apify: { ok: false, detail: '', loading: true },
    x: { ok: false, detail: '', loading: true },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('cp_admin') === '1') {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (!authed) return;
    const sources = ['blitz', 'sorsa', 'rapid', 'apify', 'x'];
    sources.forEach(async (source) => {
      try {
        const res = await fetch(`/api/status-check?source=${source}`);
        const data = await res.json();
        setStatuses((prev) => ({
          ...prev,
          [source]: { ok: !!data.ok, detail: data.detail || '', loading: false },
        }));
      } catch {
        setStatuses((prev) => ({
          ...prev,
          [source]: { ok: false, detail: 'Error', loading: false },
        }));
      }
    });
  }, [authed]);

  function unlock() {
    if (pw === PASS) {
      sessionStorage.setItem('cp_admin', '1');
      setAuthed(true);
      setErr('');
    } else {
      setErr('Wrong password');
    }
  }

  if (!authed) {
    return (
      <div className="max-w-sm mx-auto px-5 py-16">
        <h1 className="text-xl font-bold mb-2 text-[var(--text)]">Admin</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Source status is restricted.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && unlock()}
          placeholder="Password"
          className="neu-input w-full px-4 py-3 text-sm mb-3"
        />
        {err && <p className="text-xs text-red-600 mb-2">{err}</p>}
        <button
          onClick={unlock}
          className="w-full py-3 text-sm font-medium text-white rounded-full"
          style={{ background: 'var(--accent)' }}
        >
          Unlock
        </button>
      </div>
    );
  }

  const items = [
    { key: 'blitz', label: 'Blitz' },
    { key: 'sorsa', label: 'Sorsa' },
    { key: 'rapid', label: 'RapidAPI' },
    { key: 'apify', label: 'Apify' },
    { key: 'x', label: 'X Official' },
  ];

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Source status</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Admin only</p>

      <div className="space-y-3">
        {items.map((item) => {
          const s = statuses[item.key];
          return (
            <div key={item.key} className="neu-raised p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--text)]">{item.label}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">
                  {s.loading ? 'Checking…' : s.detail || (s.ok ? 'OK' : 'Fail')}
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  s.loading
                    ? 'bg-gray-100 text-gray-500'
                    : s.ok
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {s.loading ? '...' : s.ok ? 'OK' : 'Fail'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

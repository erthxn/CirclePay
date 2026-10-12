'use client';

import { useEffect, useState } from 'react';

type Status = { ok: boolean; detail: string; loading?: boolean };

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({
    blitz: { ok: false, detail: '', loading: true },
    sorsa: { ok: false, detail: '', loading: true },
    rapid: { ok: false, detail: '', loading: true },
    apify: { ok: false, detail: '', loading: true },
    x: { ok: false, detail: '', loading: true },
  });

  useEffect(() => {
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
  }, []);

  const items = [
    { key: 'blitz', label: 'Blitz' },
    { key: 'sorsa', label: 'Sorsa' },
    { key: 'rapid', label: 'RapidAPI' },
    { key: 'apify', label: 'Apify' },
    { key: 'x', label: 'X Official' },
  ];

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Status</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Live checks for data sources</p>

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

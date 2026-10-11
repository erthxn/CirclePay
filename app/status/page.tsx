'use client';

import { useEffect, useState } from 'react';

type Status = { name: string; ok: boolean; detail?: string };

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const results: Status[] = [];

      // Sorsa
      try {
        const r = await fetch('/api/status-check?source=sorsa');
        const d = await r.json();
        results.push({ name: 'Sorsa', ok: d.ok, detail: d.detail });
      } catch {
        results.push({ name: 'Sorsa', ok: false, detail: 'Request failed' });
      }

      // RapidAPI
      try {
        const r = await fetch('/api/status-check?source=rapid');
        const d = await r.json();
        results.push({ name: 'RapidAPI', ok: d.ok, detail: d.detail });
      } catch {
        results.push({ name: 'RapidAPI', ok: false, detail: 'Request failed' });
      }

      // Apify
      try {
        const r = await fetch('/api/status-check?source=apify');
        const d = await r.json();
        results.push({ name: 'Apify', ok: d.ok, detail: d.detail });
      } catch {
        results.push({ name: 'Apify', ok: false, detail: 'Request failed' });
      }

      // X Official
      try {
        const r = await fetch('/api/status-check?source=x');
        const d = await r.json();
        results.push({ name: 'X Official', ok: d.ok, detail: d.detail });
      } catch {
        results.push({ name: 'X Official', ok: false, detail: 'Request failed' });
      }

      setStatuses(results);
      setLoading(false);
    }
    check();
  }, []);

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Status</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Live checks for data sources</p>

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Checking…</p>
      ) : (
        <div className="space-y-3">
          {statuses.map((s) => (
            <div key={s.name} className="neu-raised px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-[var(--text)]">{s.name}</div>
                {s.detail && <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.detail}</div>}
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {s.ok ? 'OK' : 'Fail'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

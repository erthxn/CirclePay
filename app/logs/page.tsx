'use client';

import { useEffect, useState } from 'react';

type Log = {
  ts: string;
  type: string;
  handle: string;
  status: string;
  detail: string;
  durationMs: number;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.logs || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Logs</h1>
          <p className="text-sm text-[var(--text-muted)]">Recent analyze attempts (ephemeral per instance)</p>
        </div>
        <button onClick={load} className="text-xs font-medium text-[var(--accent)]">Refresh</button>
      </div>

      {loading && <p className="text-sm text-[var(--text-muted)]">Loading…</p>}

      {!loading && logs.length === 0 && (
        <div className="neu-raised p-6 text-center text-sm text-[var(--text-muted)]">
          No logs yet. Run an analysis to see entries here.
        </div>
      )}

      <div className="space-y-2">
        {logs.map((l, i) => (
          <div key={i} className="neu-raised px-4 py-3 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-[var(--text)]">
                {l.type} · @{l.handle || '—'}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  l.status === 'ok'
                    ? 'bg-green-100 text-green-700'
                    : l.status === 'empty' || l.status === 'not_found'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {l.status}
              </span>
            </div>
            <div className="text-[var(--text-muted)]">{l.detail}</div>
            <div className="mt-1 text-[10px] text-[var(--text-muted)]">
              {new Date(l.ts).toLocaleString()} · {l.durationMs}ms
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

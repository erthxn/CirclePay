'use client';

import { useEffect, useState } from 'react';

type Status = { ok: boolean; detail: string; loading?: boolean };

const ENDPOINTS = [
  { key: 'profile', path: '/api/profile/erthxn', label: 'Profile' },
  { key: 'mentions', path: '/api/mentions/erthxn?limit=1', label: 'Post reader' },
  { key: 'timeline', path: '/api/timeline/erthxn?limit=1', label: 'Timeline' },
  { key: 'status', path: '/api/status/2109170862972899567', label: 'Single tweet' },
  { key: 'trends', path: '/api/trends', label: 'Trends' },
  { key: 'search', path: '/api/search/users?q=elon', label: 'User search' },
  { key: 'followers', path: '/api/followers/erthxn?limit=1', label: 'Followers' },
  { key: 'following', path: '/api/following/erthxn?limit=1', label: 'Following' },
  { key: 'media', path: '/api/media/erthxn?limit=1', label: 'Media' },
  { key: 'about', path: '/api/about/erthxn', label: 'About' },
  { key: 'health', path: '/api/health', label: 'Health' },
];

export default function StatusPage() {
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  useEffect(() => {
    const initial: Record<string, Status> = {};
    ENDPOINTS.forEach((e) => {
      initial[e.key] = { ok: false, detail: '', loading: true };
    });
    setStatuses(initial);

    ENDPOINTS.forEach(async (ep) => {
      try {
        const res = await fetch(`/api/blitz-status?path=${encodeURIComponent(ep.path)}`);
        const data = await res.json();
        setStatuses((prev) => ({
          ...prev,
          [ep.key]: { ok: !!data.ok, detail: data.detail || '', loading: false },
        }));
      } catch {
        setStatuses((prev) => ({
          ...prev,
          [ep.key]: { ok: false, detail: 'Error', loading: false },
        }));
      }
    });
  }, []);

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Status</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8">Endpoint health</p>

      <div className="space-y-3">
        {ENDPOINTS.map((ep) => {
          const s = statuses[ep.key] || { ok: false, detail: '', loading: true };
          return (
            <div key={ep.key} className="neu-raised p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-[var(--text)]">{ep.label}</div>
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

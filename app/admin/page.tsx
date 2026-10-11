'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin_ok') === '1') setAuthed(true);
  }, []);

  async function login() {
    const res = await fetch('/api/admin/grant', {
      method: 'GET',
      headers: { 'x-admin-password': pass },
    });
    if (res.ok) {
      sessionStorage.setItem('admin_ok', '1');
      sessionStorage.setItem('admin_pass', pass);
      setAuthed(true);
      const data = await res.json();
      setList(data.users || []);
    } else {
      setError('Wrong password');
    }
  }

  async function add() {
    const h = input.trim().replace('@', '').toLowerCase();
    if (!h) return;
    const res = await fetch('/api/admin/grant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': sessionStorage.getItem('admin_pass') || '',
      },
      body: JSON.stringify({ username: h }),
    });
    if (res.ok) {
      setList((prev) => [...prev, h]);
      setInput('');
    }
  }

  if (!authed) {
    return (
      <div className="max-w-xs mx-auto px-5 py-16 text-center">
        <h1 className="text-lg font-bold mb-4">Admin</h1>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          placeholder="Password"
          className="neu-input w-full px-4 py-3 text-sm mb-3"
        />
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button onClick={login} className="w-full py-3 text-sm text-white rounded-full" style={{ background: 'var(--accent)' }}>
          Enter
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <h1 className="text-xl font-bold mb-6">Admin · Early access</h1>

      <div className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="username"
          className="neu-input flex-1 px-4 py-3 text-sm"
        />
        <button onClick={add} className="px-4 py-3 text-sm text-white rounded-full" style={{ background: 'var(--accent)' }}>
          Grant
        </button>
      </div>

      <div className="space-y-2">
        {list.map((h) => (
          <div key={h} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
            <span>@{h}</span>
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-[var(--text-muted)]">No users granted yet.</p>}
      </div>

      <p className="mt-8 text-xs text-[var(--text-muted)]">
        Password is read from the PASSWORD env var on Vercel.
      </p>
    </div>
  );
}

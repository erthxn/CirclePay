'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('circlepay_admin_list');
    if (saved) setList(JSON.parse(saved));
    if (localStorage.getItem('circlepay_admin') === '1') setAuthed(true);
  }, []);

  function login() {
    // Simple gate — change the password in code or env later
    if (pass === 'circlepay2026') {
      localStorage.setItem('circlepay_admin', '1');
      setAuthed(true);
    }
  }

  function add() {
    const h = input.trim().replace('@', '').toLowerCase();
    if (!h || list.includes(h)) return;
    const next = [...list, h];
    setList(next);
    localStorage.setItem('circlepay_admin_list', JSON.stringify(next));
    setInput('');
  }

  function remove(h: string) {
    const next = list.filter((x) => x !== h);
    setList(next);
    localStorage.setItem('circlepay_admin_list', JSON.stringify(next));
  }

  function grant(h: string) {
    // Mark as having access (client-side for now)
    localStorage.setItem('circlepay_access_' + h, '1');
    alert(`Access granted to @${h}. They still need to Connect X on the site.`);
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
          Add
        </button>
      </div>

      <div className="space-y-2">
        {list.map((h) => (
          <div key={h} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
            <span>@{h}</span>
            <div className="flex gap-3">
              <button onClick={() => grant(h)} className="text-xs text-[var(--accent)]">Grant</button>
              <button onClick={() => remove(h)} className="text-xs text-red-500">Remove</button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-[var(--text-muted)]">No users yet.</p>}
      </div>

      <p className="mt-8 text-xs text-[var(--text-muted)]">
        This is a local admin list for now. Full server-side access control + points system next.
      </p>
    </div>
  );
}

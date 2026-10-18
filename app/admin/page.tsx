'use client';

import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'oluwaseun07';

export default function AdminPage() {
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (sessionStorage.getItem('admin_ok') === '1') setAuthed(true);
    const saved = localStorage.getItem('circlepay_admin_list');
    if (saved) setList(JSON.parse(saved));
  }, []);

  function login() {
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_ok', '1');
      setAuthed(true);
      setError('');
    } else {
      setError('Wrong password');
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
          onKeyDown={(e) => e.key === 'Enter' && login()}
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
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="px-4 py-3 text-sm text-white rounded-full" style={{ background: 'var(--accent)' }}>
          Add
        </button>
      </div>

      <div className="space-y-2">
        {list.map((h) => (
          <div key={h} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
            <span>@{h}</span>
            <button onClick={() => remove(h)} className="text-xs text-red-500">Remove</button>
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-[var(--text-muted)]">No users yet.</p>}
      </div>
    </div>
  );
}

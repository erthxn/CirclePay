'use client';

import { useState, useRef } from 'react';
import Logo from '@/components/Logo';

type Member = {
  handle: string;
  score: number;
  amount: number;
};

const MOCK_HANDLES = ['matchayuma', 'hollyboysol', 'AiFlippa', 'gotto_', 'needsignal', 'ZheaOnAir', 'weprasee', 'prxfecy0x'];

export default function CirclePage() {
  const [handle, setHandle] = useState('');
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState(20);
  const [members, setMembers] = useState<Member[]>([]);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [accentColor, setAccentColor] = useState('#0D5CFF');
  const visualRef = useRef<HTMLDivElement>(null);

  function generateMock(size: number): Member[] {
    return Array.from({ length: size }, (_, i) => ({
      handle: MOCK_HANDLES[i % MOCK_HANDLES.length],
      score: Math.max(20, 100 - i * 12),
      amount: 0,
    }));
  }

  async function run() {
    if (!handle.trim()) {
      setError('Please enter your X handle');
      setMembers([]);
      setPrompt('');
      return;
    }
    setError('');
    setLoading(true);
    setMembers([]);
    setPrompt('');

    // Simulate reading / API delay with logo motion
    await new Promise((r) => setTimeout(r, 1800));

    const raw = generateMock(count);
    const totalScore = raw.reduce((s, m) => s + m.score, 0) || 1;
    const weighted = raw.map((m) => ({
      ...m,
      amount: Number(((m.score / totalScore) * pool).toFixed(2)),
    }));

    setMembers(weighted);

    const lines = weighted.map((m) => `- @${m.handle}: $${m.amount.toFixed(2)}`).join('\n');
    const text = `Send rewards via PayBox to these X handles:\n${lines}\n\nTotal: $${pool.toFixed(2)}. Execute the transfers.`;
    setPrompt(text);
    setLoading(false);
  }

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadVisual() {
    if (!visualRef.current) return;
    // Simple approach: user can screenshot; for real PNG we'd use html2canvas later
    alert('Long-press or screenshot the circle card to save. Full PNG export coming with real data.');
  }

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Check your X circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">Last 7 days · ranked by engagement</p>

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
          disabled={loading}
          className="w-full py-3.5 text-sm font-medium text-white rounded-full disabled:opacity-60"
          style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.3)' }}
        >
          {loading ? 'Reading…' : 'Analyze & generate prompt'}
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex flex-col items-center">
          <div className="animate-pulse">
            <Logo className="w-16 h-16" />
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">Reading @{handle} interactions…</p>
        </div>
      )}

      {members.length > 0 && !loading && (
        <div className="mt-8 space-y-8">
          {/* Visual Circle Card */}
          <div ref={visualRef} className="neu-raised p-6 text-center">
            <div className="text-xs text-[var(--text-muted)] mb-2">@{handle}</div>
            <div
              className="mx-auto w-40 h-40 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ background: accentColor, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.15)' }}
            >
              {members.length}
            </div>
            <div className="mt-4 text-xs font-medium" style={{ color: accentColor }}>
              CirclePay.fun
            </div>
            <div className="mt-4 flex justify-center gap-2">
              {['#0D5CFF', '#111827', '#7C3AED', '#059669'].map((c) => (
                <button
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className="w-6 h-6 rounded-full border-2 border-white shadow"
                  style={{ background: c }}
                />
              ))}
            </div>
            <button
              onClick={downloadVisual}
              className="mt-4 text-xs font-medium text-[var(--accent)]"
            >
              Save circle image
            </button>
          </div>

          {/* Ranked list */}
          <div>
            <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Ranked circle</h2>
            <div className="space-y-3">
              {members.map((m, i) => (
                <div key={i} className="neu-raised flex items-center justify-between px-4 py-3.5 text-sm">
                  <div className="text-[var(--text)]">
                    <span className="text-[var(--text-muted)] mr-2">{i + 1}.</span>
                    @{m.handle}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[var(--accent)]">${m.amount.toFixed(2)}</div>
                    <div className="text-xs text-[var(--text-muted)]">score {m.score}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-[var(--text)]">PayBox prompt</h2>
              <button onClick={copy} className="text-xs font-medium text-[var(--accent)]">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="neu-pressed text-xs text-[var(--text)] p-4 whitespace-pre-wrap">
              {prompt}
            </pre>
          </div>

          <p className="text-xs text-center text-[var(--text-muted)]">
            Powered by PayBox · Not affiliated with PayBox
          </p>
        </div>
      )}

      {!loading && members.length === 0 && (
        <p className="mt-8 text-xs text-[var(--text-muted)] text-center">
          Demo data until X API is connected.
        </p>
      )}
    </div>
  );
}

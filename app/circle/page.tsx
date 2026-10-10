'use client';

import { useState } from 'react';

type Member = {
  handle: string;
  score: number;
  type: string;
  amount: number;
};

const MOCK: Member[] = [
  { handle: 'matchayuma', score: 92, type: 'Quote', amount: 0 },
  { handle: 'hollyboysol', score: 78, type: 'Mention', amount: 0 },
  { handle: 'AiFlippa', score: 65, type: 'Quote', amount: 0 },
  { handle: 'gotto_', score: 51, type: 'Reply', amount: 0 },
  { handle: 'erthxn', score: 44, type: 'Mention', amount: 0 },
];

export default function CirclePage() {
  const [handle, setHandle] = useState('');
  const [count, setCount] = useState(5);
  const [pool, setPool] = useState(20);
  const [members, setMembers] = useState<Member[]>([]);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  function run() {
    const top = MOCK.slice(0, count);
    const totalScore = top.reduce((s, m) => s + m.score, 0);
    const weighted = top.map((m) => ({
      ...m,
      amount: Number(((m.score / totalScore) * pool).toFixed(2)),
    }));
    setMembers(weighted);

    const lines = weighted
      .map((m) => `- @${m.handle}: $${m.amount.toFixed(2)} (Score: ${m.score})`)
      .join('\n');

    const text = `Pay standard rewards based on the following weighted engagement scores:\n${lines}\nTotal Pool: $${pool.toFixed(2)}. Please execute these transfers via PayBox.`;
    setPrompt(text);
  }

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-md mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold mb-1">Check your X circle</h1>
      <p className="text-sm text-zinc-500 mb-6">Last 7 days · ranked by engagement</p>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">X handle</label>
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace('@', ''))}
            placeholder="erthxn"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D5CFF]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Circle size</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Reward pool ($)</label>
            <input
              type="number"
              value={pool}
              onChange={(e) => setPool(Number(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0D5CFF]"
            />
          </div>
        </div>

        <button
          onClick={run}
          className="w-full bg-[#0D5CFF] text-white text-sm font-medium py-3 rounded-xl"
        >
          Analyze & generate prompt
        </button>
      </div>

      {members.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium mb-3">Ranked circle</h2>
          <div className="space-y-2">
            {members.map((m, i) => (
              <div key={m.handle} className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm">
                <div>
                  <span className="text-zinc-500 mr-2">{i + 1}</span>
                  @{m.handle}
                  <span className="ml-2 text-xs text-zinc-500">{m.type}</span>
                </div>
                <div className="text-right">
                  <div className="text-[#0D5CFF]">${m.amount.toFixed(2)}</div>
                  <div className="text-xs text-zinc-500">Score {m.score}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-medium">PayBox prompt</h2>
              <button onClick={copy} className="text-xs text-[#0D5CFF]">
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="text-xs text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-xl p-4 whitespace-pre-wrap">
              {prompt}
            </pre>
          </div>
        </div>
      )}

      <p className="mt-8 text-xs text-zinc-600 text-center">
        Demo data until X API is connected. Real ranking coming next.
      </p>
    </div>
  );
}

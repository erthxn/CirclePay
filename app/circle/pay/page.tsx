'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef, Suspense } from 'react';
import html2canvas from 'html2canvas';

type Member = {
  handle: string;
  score: number;
  amount: number;
  hue: number;
};

const MOCK_HANDLES = [
  'matchayuma', 'hollyboysol', 'AiFlippa', 'gotto_', 'needsignal',
  'ZheaOnAir', 'weprasee', 'prxfecy0x', 'solana_dev', 'web3builder',
];

function PayPageInner() {
  const params = useSearchParams();
  const handle = params.get('handle') || 'user';
  const count = Math.min(25, Math.max(5, Number(params.get('count')) || 5));
  const pool = Number(params.get('pool')) || 20;

  const [members, setMembers] = useState<Member[]>([]);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [accent, setAccent] = useState('#0D5CFF');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid'>('gradient');
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = Array.from({ length: count }, (_, i) => ({
      handle: MOCK_HANDLES[i % MOCK_HANDLES.length],
      score: Math.max(20, 100 - i * 10),
      amount: 0,
      hue: (i * 37) % 360,
    }));
    const total = raw.reduce((s, m) => s + m.score, 0) || 1;
    const weighted = raw.map((m) => ({
      ...m,
      amount: Number(((m.score / total) * pool).toFixed(2)),
    }));
    setMembers(weighted);

    const lines = weighted.map((m) => `- @${m.handle}: $${m.amount.toFixed(2)}`).join('\n');
    setPrompt(
      `Send rewards via PayBox to these X handles:\n${lines}\n\nTotal: $${pool.toFixed(2)}. Execute the transfers.`
    );
  }, [count, pool]);

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function download() {
    if (!visualRef.current) return;
    try {
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `circlepay-${handle}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Download failed. Try screenshot instead.');
    }
  }

  const colors = ['#0D5CFF', '#111827', '#7C3AED', '#059669', '#DC2626'];

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">@{handle} · ${pool} pool</p>

      {/* Visual Circle */}
      <div
        ref={visualRef}
        className="relative mx-auto w-full max-w-sm aspect-square rounded-3xl overflow-hidden"
        style={{
          background:
            bgStyle === 'gradient'
              ? `linear-gradient(135deg, ${accent}22, ${accent}55, #f59e0b33)`
              : accent + '22',
        }}
      >
        {/* Concentric rings */}
        <div className="absolute inset-8 rounded-full border border-white/30" />
        <div className="absolute inset-16 rounded-full border border-white/20" />

        {/* Center avatar placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: accent }}
          >
            @{handle.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Orbiting members */}
        {members.map((m, i) => {
          const angle = (i / members.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 38 + (i % 3) * 6;
          const x = 50 + Math.cos(angle) * radius;
          const y = 50 + Math.sin(angle) * radius;
          return (
            <div
              key={i}
              className="absolute w-10 h-10 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-bold text-white"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                background: `hsl(${m.hue}, 70%, 50%)`,
              }}
              title={`@${m.handle}`}
            >
              {m.handle.slice(0, 2).toUpperCase()}
            </div>
          );
        })}

        {/* Bottom branding */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <div className="bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-xl">
            <div className="font-semibold">@{handle}</div>
            <div className="opacity-70">X circle</div>
          </div>
          <div className="bg-black/70 text-white text-[10px] px-3 py-1.5 rounded-xl">
            circlepay.fun
          </div>
        </div>
      </div>

      {/* Style controls */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className="w-7 h-7 rounded-full border-2 border-white shadow"
              style={{ background: c }}
            />
          ))}
        </div>
        <button
          onClick={() => setBgStyle(bgStyle === 'gradient' ? 'solid' : 'gradient')}
          className="text-xs font-medium text-[var(--accent)]"
        >
          {bgStyle === 'gradient' ? 'Solid' : 'Gradient'}
        </button>
      </div>

      <button
        onClick={download}
        className="mt-4 w-full py-3 text-sm font-medium text-white rounded-full"
        style={{ background: 'var(--accent)' }}
      >
        Download PNG
      </button>

      {/* Ranked list */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Ranked circle</h2>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={i} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
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
      <div className="mt-6">
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

      <p className="mt-6 text-xs text-center text-[var(--text-muted)]">
        Powered by PayBox · Not affiliated with PayBox
      </p>
    </div>
  );
}

export default function PayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--text-muted)]">Loading circle…</div>}>
      <PayPageInner />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import html2canvas from 'html2canvas';

type Member = {
  handle: string;
  score: number;
  amount: number;
  hue: number;
};

function PayPageInner() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [accent, setAccent] = useState('#0D5CFF');
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-sm text-[var(--text-muted)]">No result found. Go back and analyze.</div>;
  }

  const { members = [], prompt = '', handle = '', pool = 0 } = data;
  const withHue: Member[] = members.map((m: any, i: number) => ({
    ...m,
    hue: (i * 47) % 360,
  }));

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
    } catch {
      alert('Download failed. Try a screenshot.');
    }
  }

  function formatMoney(n: number) {
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const colors = ['#0D5CFF', '#111827', '#7C3AED', '#059669', '#DC2626'];

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">@{handle} · ${formatMoney(Number(pool))} pool</p>

      {/* Visual */}
      <div
        ref={visualRef}
        className="relative mx-auto w-full max-w-sm aspect-square rounded-3xl overflow-hidden"
        style={{
          background: `radial-gradient(circle at 50% 45%, ${accent}18, #0f172a 70%)`,
        }}
      >
        {/* Connecting lines via SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {withHue.map((m, i) => {
            const angle = (i / Math.max(withHue.length, 1)) * Math.PI * 2 - Math.PI / 2;
            const r = 36;
            const x = 50 + Math.cos(angle) * r;
            const y = 50 + Math.sin(angle) * r;
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x}
                y2={y}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>

        {/* Center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center text-white text-sm font-bold shadow-lg"
            style={{ background: accent }}
          >
            @{handle.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Members with price */}
        {withHue.map((m, i) => {
          const angle = (i / Math.max(withHue.length, 1)) * Math.PI * 2 - Math.PI / 2;
          const r = 36;
          const x = 50 + Math.cos(angle) * r;
          const y = 50 + Math.sin(angle) * r;
          return (
            <div
              key={i}
              className="absolute flex flex-col items-center"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div
                className="w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow"
                style={{ background: `hsl(${m.hue}, 65%, 48%)` }}
              >
                {m.handle.slice(0, 2).toUpperCase()}
              </div>
              <div className="mt-0.5 text-[8px] font-medium text-white/90 bg-black/40 px-1 rounded">
                ${m.amount.toFixed(0)}
              </div>
            </div>
          );
        })}

        {/* Clean branding, no black boxes */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-between px-4 text-[10px] text-white/80 font-medium">
          <span>@{handle}</span>
          <span>circlepay.fun</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setAccent(c)}
              className="w-6 h-6 rounded-full border-2 border-white/50"
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={download}
          className="py-3 text-sm font-medium text-white rounded-full"
          style={{ background: 'var(--accent)' }}
        >
          Download PNG
        </button>
        <button
          onClick={copy}
          className="py-3 text-sm font-medium rounded-full border border-[var(--accent)] text-[var(--accent)]"
        >
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>

      <div className="mt-5 neu-raised p-4 text-center">
        <p className="text-sm font-medium text-[var(--text)]">Send this prompt to your AI agent</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Connected to PayBox (Claude, Grok, or ChatGPT)</p>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Ranked circle</h2>
        <div className="space-y-2">
          {withHue.map((m, i) => (
            <div key={i} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
              <div className="text-[var(--text)]">
                <span className="text-[var(--text-muted)] mr-2">{i + 1}.</span>
                @{m.handle}
              </div>
              <div className="font-medium text-[var(--accent)]">${formatMoney(m.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
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
    <Suspense fallback={<div className="p-8 text-center text-sm">Loading…</div>}>
      <PayPageInner />
    </Suspense>
  );
}

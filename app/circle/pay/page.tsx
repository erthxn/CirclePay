'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import html2canvas from 'html2canvas';

type Member = {
  handle: string;
  score: number;
  amount: number;
  pfp?: string;
};

function PayPageInner() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [accent, setAccent] = useState('#0D5CFF');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid'>('gradient');
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-sm text-[var(--text-muted)]">No result. Analyze again.</div>;
  }

  const { members = [], prompt = '', handle = '', pool = 0, centerPfp } = data;

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
      alert('Download failed. Try screenshot.');
    }
  }

  function formatMoney(n: number) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const colors = ['#0D5CFF', '#111827', '#7C3AED', '#059669', '#DC2626'];

  return (
    <div className="max-w-md mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">@{handle} · ${formatMoney(Number(pool))} pool</p>

      <div
        ref={visualRef}
        className="relative mx-auto w-full max-w-sm aspect-square rounded-3xl overflow-hidden"
        style={{
          background:
            bgStyle === 'gradient'
              ? `linear-gradient(135deg, ${accent}22, ${accent}66, #f59e0b33)`
              : accent + '33',
        }}
      >
        <div className="absolute inset-[18%] rounded-full border border-white/25" />
        <div className="absolute inset-[30%] rounded-full border border-white/15" />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {members.map((_: any, i: number) => {
            if (i === members.length - 1) return null;
            const a1 = (i / members.length) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / members.length) * Math.PI * 2 - Math.PI / 2;
            const r = 36;
            const x1 = 50 + Math.cos(a1) * r;
            const y1 = 50 + Math.sin(a1) * r;
            const x2 = 50 + Math.cos(a2) * r;
            const y2 = 50 + Math.sin(a2) * r;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} Q 50 50 ${x2} ${y2}`}
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.6"
              />
            );
          })}
        </svg>

        {/* Center — real PFP if available */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-zinc-800">
            {centerPfp ? (
              <img src={centerPfp} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ background: accent }}>
                @{handle.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Members — prices outside so they don't cover */}
        {members.map((m: Member, i: number) => {
          const angle = (i / Math.max(members.length, 1)) * Math.PI * 2 - Math.PI / 2;
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
                zIndex: 2,
              }}
            >
              <div className="w-10 h-10 rounded-full border-2 border-white shadow overflow-hidden bg-zinc-700">
                {m.pfp ? (
                  <img src={m.pfp} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-white">
                    {m.handle.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-1 text-[9px] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                ${m.amount.toFixed(2)}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-3 left-0 right-0 flex justify-between px-4 text-[10px] text-white/90 font-medium">
          <span>@{handle}</span>
          <span>circlepay.fun</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {colors.map((c) => (
            <button key={c} onClick={() => setAccent(c)} className="w-6 h-6 rounded-full border-2 border-white/40" style={{ background: c }} />
          ))}
        </div>
        <button onClick={() => setBgStyle(bgStyle === 'gradient' ? 'solid' : 'gradient')} className="text-xs font-medium text-[var(--accent)]">
          {bgStyle === 'gradient' ? 'Solid' : 'Gradient'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={download} className="py-3 text-sm font-medium text-white rounded-full" style={{ background: 'var(--accent)' }}>
          Download PNG
        </button>
        <button onClick={copy} className="py-3 text-sm font-medium rounded-full border border-[var(--accent)] text-[var(--accent)]">
          {copied ? 'Copied' : 'Copy prompt'}
        </button>
      </div>

      <div className="mt-5 neu-raised p-4 text-center">
        <p className="text-sm font-medium text-[var(--text)]">Send this prompt to your AI agent</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">Connected to PayBox</p>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Ranked circle</h2>
        <div className="space-y-2">
          {members.map((m: Member, i: number) => (
            <div key={i} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex items-center gap-2 text-[var(--text)]">
                <span className="text-[var(--text-muted)]">{i + 1}.</span>
                {m.pfp && <img src={m.pfp} alt="" className="w-6 h-6 rounded-full object-cover" />}
                @{m.handle}
              </div>
              <div className="font-medium text-[var(--accent)]">${formatMoney(m.amount)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <pre className="neu-pressed text-xs text-[var(--text)] p-4 whitespace-pre-wrap">{prompt}</pre>
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

'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import html2canvas from 'html2canvas';

type Member = {
  handle: string;
  score: number;
  amount: number;
  pfp?: string;
};

type StyleId = 'glass' | 'skeuo' | 'brutal' | 'minimal' | 'hand' | 'flat';

const STYLES: { id: StyleId; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'skeuo', label: 'Skeuo' },
  { id: 'brutal', label: 'Brutal' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'hand', label: 'Hand' },
  { id: 'flat', label: 'Flat' },
];

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

function cardBg(style: StyleId, accent: string, solid: boolean) {
  if (solid) return hexToRgba(accent, 0.18);
  switch (style) {
    case 'glass':
      return `linear-gradient(145deg, ${hexToRgba(accent, 0.22)}, ${hexToRgba(accent, 0.08)})`;
    case 'skeuo':
      return `linear-gradient(160deg, ${hexToRgba(accent, 0.16)}, #f4f6f8)`;
    case 'brutal':
      return accent;
    case 'minimal':
      return '#f7f7f8';
    case 'hand':
      return '#fff8ee';
    case 'flat':
    default:
      return hexToRgba(accent, 0.14);
  }
}

function PayPageInner() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [accent, setAccent] = useState('#0D5CFF');
  const [bgStyle, setBgStyle] = useState<'gradient' | 'solid'>('gradient');
  const [styleId, setStyleId] = useState<StyleId>('glass');
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
    const saved = localStorage.getItem('cp_style') as StyleId | null;
    if (saved) setStyleId(saved);
  }, []);

  function setStyle(id: StyleId) {
    setStyleId(id);
    localStorage.setItem('cp_style', id);
  }

  if (!data) {
    return <div className="p-8 text-center text-sm text-[var(--text-muted)]">No result. Analyze again.</div>;
  }

  const { members = [], prompt = '', handle = '', pool = 0, centerPfp, emptyReason, message } = data;

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function download() {
    if (!visualRef.current) return;
    try {
      const node = visualRef.current;
      const bg = cardBg(styleId, accent, bgStyle === 'solid');
      const prev = node.style.background;
      node.style.background = bg;

      const canvas = await html2canvas(node, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        logging: false,
      });

      node.style.background = prev;

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

  const colors = [
    { hex: '#0D5CFF', name: 'Blue' },
    { hex: '#23212C', name: 'Cosmic' },
    { hex: '#36255C', name: 'Violet' },
    { hex: '#D2C3F6', name: 'Lavender' },
    { hex: '#F1FEC8', name: 'Vanilla' },
  ];

  const isEmpty = emptyReason || !members.length;
  const cardClass = {
    glass: 'backdrop-blur-md border border-white/40',
    skeuo: 'shadow-[8px_8px_16px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.8)]',
    brutal: 'border-4 border-black rounded-none',
    minimal: 'border border-zinc-200',
    hand: 'border-2 border-dashed border-zinc-400',
    flat: 'border border-transparent',
  }[styleId];

  return (
    <div className="max-w-5xl mx-auto px-5 py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
          <p className="text-sm text-[var(--text-muted)] mb-4">@{handle} · ${formatMoney(Number(pool))} pool</p>

          <div className="mb-4 flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-2.5 py-1 text-[11px] rounded-full ${
                  styleId === s.id
                    ? 'bg-[var(--accent)] text-white'
                    : 'neu-btn text-[var(--text-muted)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {isEmpty ? (
            <div className="neu-raised p-8 text-center">
              <p className="font-medium text-[var(--text)]">
                {emptyReason === 'not_found' ? 'Account not found' : 'No recent activity'}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                {message || 'No interactions in the last 7 days.'}
              </p>
            </div>
          ) : (
            <>
              <div
                ref={visualRef}
                className={`relative mx-auto w-full max-w-sm aspect-square overflow-hidden ${cardClass}`}
                style={{
                  background: cardBg(styleId, accent, bgStyle === 'solid'),
                  borderRadius: styleId === 'brutal' ? 0 : 28,
                }}
              >
                <div className="absolute inset-[20%] rounded-full border border-white/40" />
                <div className="absolute inset-[32%] rounded-full border border-white/25" />

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                  {members.map((_: any, i: number) => {
                    if (i === members.length - 1) return null;
                    const a1 = (i / members.length) * Math.PI * 2 - Math.PI / 2;
                    const a2 = ((i + 1) / members.length) * Math.PI * 2 - Math.PI / 2;
                    const r = 34;
                    const x1 = 50 + Math.cos(a1) * r;
                    const y1 = 50 + Math.sin(a1) * r;
                    const x2 = 50 + Math.cos(a2) * r;
                    const y2 = 50 + Math.sin(a2) * r;
                    return (
                      <path
                        key={i}
                        d={`M ${x1} ${y1} Q 50 50 ${x2} ${y2}`}
                        fill="none"
                        stroke="rgba(255,255,255,0.55)"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[4.5rem] h-[4.5rem] rounded-full border-[3px] border-white shadow-md overflow-hidden bg-white">
                    {centerPfp ? (
                      <img src={centerPfp} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ background: accent }}>
                        @{handle.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {members.map((m: Member, i: number) => {
                  const angle = (i / Math.max(members.length, 1)) * Math.PI * 2 - Math.PI / 2;
                  const r = 34;
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
                      <div className="w-11 h-11 rounded-full border-2 border-white shadow overflow-hidden bg-white">
                        {m.pfp ? (
                          <img src={m.pfp} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: accent }}>
                            {m.handle.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-[10px] font-semibold text-white bg-black/70 px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                        ${m.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}

                <div className="absolute bottom-4 right-4 flex flex-col items-end text-[11px] text-white font-medium leading-tight drop-shadow">
                  <span>@{handle}</span>
                  <span className="opacity-80 text-[10px]">circlepay.fun</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setAccent(c.hex)}
                      title={c.name}
                      className="w-6 h-6 rounded-full border-2 border-white/40"
                      style={{ background: c.hex }}
                    />
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
            </>
          )}
        </div>

        {!isEmpty && (
          <div className="mt-8 lg:mt-0">
            <h2 className="text-sm font-semibold mb-3 text-[var(--text)]">Ranked circle</h2>
            <div className="space-y-2">
              {members.map((m: Member, i: number) => (
                <div key={i} className="neu-raised flex items-center justify-between px-4 py-3 text-sm">
                  <div className="flex items-center gap-2 text-[var(--text)]">
                    <span className="text-[var(--text-muted)]">{i + 1}.</span>
                    {m.pfp && <img src={m.pfp} alt="" className="w-6 h-6 rounded-full object-cover" crossOrigin="anonymous" />}
                    @{m.handle}
                  </div>
                  <div className="font-medium text-[var(--accent)]">${formatMoney(m.amount)}</div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <pre className="neu-pressed text-xs text-[var(--text)] p-4 whitespace-pre-wrap">{prompt}</pre>
            </div>

            <p className="mt-6 text-xs text-center text-[var(--text-muted)]">
              Powered by PayBox · Not affiliated with PayBox
            </p>
          </div>
        )}
      </div>
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

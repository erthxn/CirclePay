'use client';

import { useEffect, useState, useRef, Suspense, memo } from 'react';
import html2canvas from 'html2canvas';

type Member = { handle: string; score: number; amount: number; pfp?: string };
type Style = 'orbit' | 'spokes' | 'constellation' | 'halo' | 'bold' | 'radar';
type Mark = 'paybox' | 'migma' | 'solana' | 'none';
type Grad = 'steel' | 'moon' | 'navy' | 'gold' | 'dusk' | 'ink';

const STYLES: { id: Style; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'spokes', label: 'Spokes' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'halo', label: 'Halo' },
  { id: 'bold', label: 'Bold' },
  { id: 'radar', label: 'Radar' },
];

const GRADS: { id: Grad; name: string; css: string; solid: string }[] = [
  { id: 'steel', name: 'Steel', css: 'linear-gradient(145deg, #e8eaed 0%, #9ca3af 45%, #4b5563 100%)', solid: '#9ca3af' },
  { id: 'moon', name: 'Moon', css: 'linear-gradient(145deg, #7C3AED 0%, #4C1D95 55%, #1E1B4B 100%)', solid: '#4C1D95' },
  { id: 'navy', name: 'Navy', css: 'linear-gradient(160deg, #1e3a8a 0%, #0D5CFF 45%, #1e1b4b 100%)', solid: '#1e3a8a' },
  { id: 'gold', name: 'Gold', css: 'linear-gradient(145deg, #f5e6b8 0%, #d4a017 40%, #8a6a12 100%)', solid: '#d4a017' },
  { id: 'dusk', name: 'Dusk', css: 'linear-gradient(160deg, #312e81 0%, #7c3aed 40%, #db2777 100%)', solid: '#7c3aed' },
  { id: 'ink', name: 'Ink', css: 'linear-gradient(160deg, #111111 0%, #1f2937 50%, #0b0b0d 100%)', solid: '#111111' },
];

const MARKS: { id: Mark; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'migma', name: 'Migma' },
  { id: 'solana', name: 'Solana' },
  { id: 'none', name: 'None' },
];

const Avatar = memo(function Avatar({ src, letter, size }: { src?: string; letter: string; size: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', background: '#1a1d24', flexShrink: 0 }}>
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} crossOrigin="anonymous" />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: size * 0.34, fontWeight: 700 }}>
          {letter}
        </div>
      )}
    </div>
  );
});

function PayBoxMark() {
  return (
    <svg viewBox="90 90 220 220" width="26" height="26" style={{ opacity: 0.9, transform: 'rotate(-16deg)', display: 'block' }}>
      <g fill="#ffffff">
        <path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z" />
        <path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z" />
        <path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z" />
      </g>
    </svg>
  );
}

function MigmaMark() {
  return (
    <svg viewBox="0 0 360 360" width="26" height="26" style={{ opacity: 0.92, transform: 'rotate(-8deg)', display: 'block' }}>
      <polygon points="92,99 180,149 268,99 268,268 92,268" fill="#ffffff" />
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg viewBox="70 80 260 240" width="26" height="26" style={{ opacity: 0.95, transform: 'rotate(-16deg)', display: 'block' }}>
      <defs>
        <linearGradient id="solg" x1="320" y1="90" x2="80" y2="310">
          <stop offset="0" stopColor="#14F195" />
          <stop offset="1" stopColor="#9945FF" />
        </linearGradient>
      </defs>
      <g fill="url(#solg)">
        <path d="M130 92 H312 Q324 92 316 102 L272 144 Q268 148 262 148 H88 Q76 148 84 138 L124 96 Q127 92 130 92 Z" />
        <path d="M88 172 H262 Q268 172 272 176 L316 218 Q324 228 312 228 H130 Q127 228 124 224 L84 182 Q76 172 88 172 Z" />
        <path d="M130 252 H312 Q324 252 316 262 L272 304 Q268 308 262 308 H88 Q76 308 84 298 L124 256 Q127 252 130 252 Z" />
      </g>
    </svg>
  );
}

function PayPageInner() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<Style>('orbit');
  const [grad, setGrad] = useState<Grad>('steel');
  const [mark, setMark] = useState<Mark>('paybox');
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
  }, []);

  if (!data) {
    return <div className="p-8 text-center text-sm text-[var(--text-muted)]">No result. Analyze again.</div>;
  }

  const { members = [], prompt = '', handle = '', pool = 0, centerPfp, emptyReason, message } = data;
  const active = GRADS.find((g) => g.id === grad) || GRADS[0];

  function copy() {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function download() {
    if (!visualRef.current) return;
    try {
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: active.solid,
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          const el = doc.querySelector('[data-card]') as HTMLElement | null;
          if (el) {
            el.style.background = active.css;
            el.style.borderRadius = '28px';
            el.style.overflow = 'hidden';
          }
        },
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

  function cycleMark() {
    const i = MARKS.findIndex((m) => m.id === mark);
    setMark(MARKS[(i + 1) % MARKS.length].id);
  }

  const isEmpty = emptyReason || !members.length;
  const n = members.length;
  const bold = style === 'bold';
  const tile = bold ? (n <= 5 ? 56 : n <= 7 ? 48 : 40) : n <= 5 ? 50 : n <= 7 ? 44 : n <= 10 ? 38 : 32;
  const pillH = 16;
  const gap = 4;
  const pillW = tile + 6;
  const nodeW = Math.max(tile, pillW);
  const nodeH = tile + gap + pillH;
  const r = n <= 5 ? 28 : n <= 7 ? 30 : 32;

  return (
    <div className="max-w-5xl mx-auto px-5 py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
          <p className="text-sm text-[var(--text-muted)] mb-4">@{handle} · ${formatMoney(Number(pool))} pool</p>

          {isEmpty ? (
            <div className="neu-raised p-8 text-center">
              <p className="font-medium text-[var(--text)]">{emptyReason === 'not_found' ? 'Account not found' : 'No recent activity'}</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">{message || 'No interactions in the last 7 days.'}</p>
            </div>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button key={s.id} onClick={() => setStyle(s.id)} className={`px-2.5 py-1 text-[11px] rounded-full ${style === s.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                {GRADS.map((g) => (
                  <button key={g.id} onClick={() => setGrad(g.id)} className={`px-2.5 py-1 text-[11px] rounded-full ${grad === g.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
                    {g.name}
                  </button>
                ))}
              </div>

              <div ref={visualRef} data-card className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden" style={{ background: active.css, borderRadius: 28 }}>
                {style === 'orbit' && (
                  <>
                    <div style={{ position: 'absolute', inset: '20%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', inset: '32%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.3 }} />
                  </>
                )}
                {style === 'halo' && <div style={{ position: 'absolute', inset: '16%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 68%)' }} />}
                {style === 'bold' && <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', border: '3px solid #fff', opacity: 0.7 }} />}
                {style === 'radar' && (
                  <>
                    <div style={{ position: 'absolute', inset: '22%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.45 }} />
                    <div style={{ position: 'absolute', inset: '34%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.28 }} />
                  </>
                )}

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 100 100">
                  {style === 'orbit' && members.map((_: any, i: number) => {
                    if (i === n - 1) return null;
                    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
                    return <path key={i} d={`M ${50+Math.cos(a1)*r} ${50+Math.sin(a1)*r} Q 50 50 ${50+Math.cos(a2)*r} ${50+Math.sin(a2)*r}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="0.7" />;
                  })}
                  {style === 'spokes' && members.map((_: any, i: number) => {
                    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                    return <line key={i} x1="50" y1="50" x2={50+Math.cos(a)*(r+2)} y2={50+Math.sin(a)*(r+2)} stroke="#fff" strokeWidth={bold ? 2.2 : 1.2} />;
                  })}
                  {style === 'constellation' && members.map((_: any, i: number) => {
                    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const a2 = ((i + 2) / n) * Math.PI * 2 - Math.PI / 2;
                    return <line key={i} x1={50+Math.cos(a1)*r} y1={50+Math.sin(a1)*r} x2={50+Math.cos(a2)*r} y2={50+Math.sin(a2)*r} stroke="#fff" strokeWidth="0.65" />;
                  })}
                  {style === 'radar' && (
                    <>
                      <circle cx="50" cy="50" r="28" fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="0.4" />
                      <line x1="50" y1="22" x2="50" y2="78" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.35" />
                      <line x1="22" y1="50" x2="78" y2="50" stroke="#fff" strokeOpacity="0.22" strokeWidth="0.35" />
                    </>
                  )}
                </svg>

                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <Avatar src={centerPfp} letter={handle.slice(0, 1).toUpperCase()} size={bold ? 64 : n <= 5 ? 58 : 52} />
                </div>

                {members.map((m: Member, i: number) => {
                  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                  const x = 50 + Math.cos(a) * r;
                  const y = 50 + Math.sin(a) * r;
                  return (
                    <div
                      key={m.handle}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        width: nodeW,
                        height: nodeH,
                        marginLeft: -(nodeW / 2),
                        marginTop: -(tile / 2),
                        zIndex: 20,
                      }}
                    >
                      <div style={{ position: 'absolute', left: '50%', top: 0, marginLeft: -(tile / 2) }}>
                        <Avatar src={m.pfp} letter={m.handle.slice(0, 1).toUpperCase()} size={tile} />
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: tile + gap,
                          marginLeft: -(pillW / 2),
                          width: pillW,
                          height: pillH,
                          fontSize: 9,
                          fontWeight: 600,
                          lineHeight: `${pillH}px`,
                          borderRadius: 999,
                          background: '#fff',
                          color: '#111',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ${m.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}

                <div style={{ position: 'absolute', bottom: 10, right: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}>
                  {mark === 'paybox' && <PayBoxMark />}
                  {mark === 'migma' && <MigmaMark />}
                  {mark === 'solana' && <SolanaMark />}
                  <div style={{ textAlign: 'center', fontSize: 10, lineHeight: 1.1, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.45)', marginTop: 2 }}>
                    <div>@{handle}</div>
                    <div style={{ opacity: 0.85 }}>circlepay.fyi</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end">
                <button onClick={cycleMark} className="text-xs font-medium text-[var(--accent)]">
                  {mark === 'paybox' ? 'PayBox' : mark === 'migma' ? 'Migma' : mark === 'solana' ? 'Solana' : 'None'}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <button onClick={download} className="py-3 text-sm font-medium text-white rounded-full" style={{ background: 'var(--accent)' }}>Download PNG</button>
                <button onClick={copy} className="py-3 text-sm font-medium rounded-full border border-[var(--accent)] text-[var(--accent)]">{copied ? 'Copied' : 'Copy prompt'}</button>
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
            <p className="mt-6 text-xs text-center text-[var(--text-muted)]">Powered by PayBox · Not affiliated with PayBox</p>
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

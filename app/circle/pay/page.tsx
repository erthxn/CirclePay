'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import html2canvas from 'html2canvas';

type Member = {
  handle: string;
  score: number;
  amount: number;
  pfp?: string;
};

const STEEL = 'linear-gradient(145deg, #e8eaed 0%, #9ca3af 45%, #4b5563 100%)';

function PayBoxMark() {
  return (
    <svg viewBox="0 0 400 400" width="52" height="52" style={{ opacity: 0.85, transform: 'rotate(-16deg)' }}>
      <g fill="#ffffff">
        <path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z" />
        <path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z" />
        <path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z" />
      </g>
    </svg>
  );
}

function PayPageInner() {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
  }, []);

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
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: '#9ca3af',
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          const el = doc.querySelector('[data-card]') as HTMLElement | null;
          if (el) {
            el.style.background = STEEL;
            el.style.borderRadius = '28px';
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

  const isEmpty = emptyReason || !members.length;
  const n = members.length;
  const tile = n <= 5 ? 50 : n <= 7 ? 44 : n <= 10 ? 38 : 32;
  const r = n <= 5 ? 30 : 32;

  return (
    <div className="max-w-5xl mx-auto px-5 py-6 lg:py-10">
      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:items-start">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Your circle</h1>
          <p className="text-sm text-[var(--text-muted)] mb-6">@{handle} · ${formatMoney(Number(pool))} pool</p>

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
                data-card
                className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden"
                style={{ background: STEEL, borderRadius: 28 }}
              >
                <div style={{ position: 'absolute', inset: '20%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.5 }} />
                <div style={{ position: 'absolute', inset: '32%', borderRadius: '50%', border: '1px solid #fff', opacity: 0.3 }} />

                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
                  {members.map((_: any, i: number) => {
                    if (i === n - 1) return null;
                    const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
                    const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
                    return (
                      <path
                        key={i}
                        d={`M ${50 + Math.cos(a1) * r} ${50 + Math.sin(a1) * r} Q 50 50 ${50 + Math.cos(a2) * r} ${50 + Math.sin(a2) * r}`}
                        fill="none"
                        stroke="#fff"
                        strokeOpacity="0.55"
                        strokeWidth="0.7"
                      />
                    );
                  })}
                </svg>

                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <div style={{ width: n <= 5 ? 60 : 54, height: n <= 5 ? 60 : 54, borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', background: '#0D5CFF' }}>
                    {centerPfp ? (
                      <img src={centerPfp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        @{handle.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {members.map((m: Member, i: number) => {
                  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                  const x = 50 + Math.cos(a) * r;
                  const y = 50 + Math.sin(a) * r;
                  return (
                    <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
                      <div style={{ width: tile, height: tile, borderRadius: '50%', border: '2px solid #fff', overflow: 'hidden', background: '#0D5CFF' }}>
                        {m.pfp ? (
                          <img src={m.pfp} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} crossOrigin="anonymous" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                            {m.handle.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: 2, fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: '#fff', color: '#111', whiteSpace: 'nowrap' }}>
                        ${m.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })}

                <div style={{ position: 'absolute', bottom: 8, right: 10, display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 30 }}>
                  <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.15, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
                    <div>@{handle}</div>
                    <div style={{ opacity: 0.85 }}>circlepay.fun</div>
                  </div>
                  <PayBoxMark />
                </div>
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

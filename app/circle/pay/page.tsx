'use client';

import { useEffect, useState, useRef, Suspense, memo, useMemo, useDeferredValue } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import type { BgCard } from '@/lib/studio/types';
import { parseBgCards } from '@/lib/studio/parse';
import bgCardsJson from '@/public/data/bg_cards.json';

type Member = { handle: string; score: number; amount: number; pfp?: string };
type Style = 'orbit' | 'spokes' | 'constellation' | 'halo' | 'bold' | 'radar';
type Mark = 'paybox' | 'migma' | 'solana' | 'none';

const STYLES: { id: Style; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'spokes', label: 'Spokes' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'halo', label: 'Halo' },
  { id: 'bold', label: 'Bold' },
  { id: 'radar', label: 'Radar' },
];

const MARKS: { id: Mark; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'migma', name: 'Migma' },
  { id: 'solana', name: 'Solana' },
  { id: 'none', name: 'None' },
];

// All 200 premium bg cards (parsed at module load — safe because bg_cards.json is local & static)
const ALL_BG_CARDS: BgCard[] = parseBgCards(bgCardsJson);

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
    <svg viewBox="90 90 220 220" width="34" height="34" style={{ opacity: 0.9, transform: 'rotate(-16deg)', display: 'block' }}>
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
    <svg viewBox="0 0 360 360" width="44" height="44" style={{ opacity: 0.95, display: 'block' }}>
      <polygon points="92,99 180,149 268,99 268,268 92,268" fill="#ffffff" />
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg viewBox="70 80 260 240" width="34" height="34" style={{ opacity: 0.95, transform: 'rotate(-16deg)', display: 'block' }}>
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [style, setStyle] = useState<Style>('orbit');
  const [mark, setMark] = useState<Mark>('paybox');
  const [selectedBgId, setSelectedBgId] = useState<string>(ALL_BG_CARDS[0]?.id ?? '');
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [bgSearch, setBgSearch] = useState('');
  const visualRef = useRef<HTMLDivElement>(null);

  // Hydrate from sessionStorage (the analyze result) + URL (the picked bg card)
  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
    const b = searchParams.get('b');
    if (b && ALL_BG_CARDS.some((c) => c.id === b)) setSelectedBgId(b);
  }, [searchParams]);

  const selectedBg = useMemo(
    () => ALL_BG_CARDS.find((c) => c.id === selectedBgId) ?? ALL_BG_CARDS[0],
    [selectedBgId],
  );

  const deferredSearch = useDeferredValue(bgSearch);
  const filteredBgCards = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return ALL_BG_CARDS;
    return ALL_BG_CARDS.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.subcategory.toLowerCase().includes(q) ||
      (c.pattern ?? '').toLowerCase().includes(q),
    );
  }, [deferredSearch]);

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
    if (!visualRef.current || !selectedBg) return;
    try {
      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: selectedBg.solid_color,
        scale: 3,
        useCORS: true,
        logging: false,
        onclone: (doc) => {
          const el = doc.querySelector('[data-card]') as HTMLElement | null;
          if (el) {
            el.style.background = selectedBg.gradient_css;
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

  function pickBg(id: string) {
    setSelectedBgId(id);
    setBgPickerOpen(false);
    // Update URL so the pick survives refresh / share
    const url = new URL(window.location.href);
    url.searchParams.set('b', id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  const isEmpty = emptyReason || !members.length;
  const n = members.length;
  const bold = style === 'bold';
  const tile = bold ? (n <= 5 ? 56 : n <= 7 ? 48 : 40) : n <= 5 ? 50 : n <= 7 ? 44 : n <= 10 ? 38 : 32;
  const pillH = 18;
  const gap = 5;
  const pillW = tile + 8;
  const r = n <= 5 ? 30 : n <= 7 ? 32 : 34;

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
              {/* Style + Mark row */}
              <div className="mb-3 flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`studio-tap px-2.5 py-1 text-[11px] rounded-full ${style === s.id ? 'bg-[var(--accent)] text-white studio-glow-accent' : 'neu-btn text-[var(--text)]'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* BG card picker trigger */}
              <div className="mb-3">
                <button
                  onClick={() => setBgPickerOpen(true)}
                  className="studio-tap w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-full neu-btn text-[var(--text)] studio-magnetic"
                >
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    style={{ background: selectedBg.gradient_css, boxShadow: '0 0 0 2px #fff inset, 0 2px 6px rgba(0,0,0,0.15)' }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-[var(--text)] text-[11px]">{selectedBg?.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{selectedBg?.category}{selectedBg?.pattern ? ` · ${selectedBg.pattern}` : ''}</div>
                  </div>
                  <span className="text-[var(--accent)] text-[11px] font-medium">Browse ↓</span>
                </button>
              </div>

              {/* The visual card — uses the selected premium bg card gradient */}
              <div ref={visualRef} data-card className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden" style={{ background: selectedBg.gradient_css, borderRadius: 28 }}>
                {/* Optional: render the bg pattern overlay inline (for some patterns only) */}
                {selectedBg?.pattern === 'radial-glow' || selectedBg?.pattern === 'halo-glow' ? (
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 68%)' }} />
                ) : null}
                {selectedBg?.pattern === 'vignette' ? (
                  <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.4))' }} />
                ) : null}

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
                        width: pillW,
                        marginLeft: -(pillW / 2),
                        marginTop: -(tile / 2),
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ width: tile, height: tile }}>
                        <Avatar src={m.pfp} letter={m.handle.slice(0, 1).toUpperCase()} size={tile} />
                      </div>
                      <div
                        style={{
                          marginTop: gap,
                          width: pillW,
                          height: pillH,
                          fontSize: 10,
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

                <div style={{ position: 'absolute', bottom: 6, right: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 30 }}>
                  {mark === 'paybox' && <PayBoxMark />}
                  {mark === 'migma' && <MigmaMark />}
                  {mark === 'solana' && <SolanaMark />}
                  <div style={{ textAlign: 'center', fontSize: 10, lineHeight: 1.15, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.5)', marginTop: 2 }}>
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
                <button onClick={download} className="studio-tap py-3 text-sm font-medium text-white rounded-full studio-fab" style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.3)' }}>Download PNG</button>
                <button onClick={copy} className="studio-tap py-3 text-sm font-medium rounded-full border border-[var(--accent)] text-[var(--accent)] studio-fab">{copied ? 'Copied' : 'Copy prompt'}</button>
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

      {/* BG card picker modal — full-screen on mobile, side sheet on desktop */}
      {bgPickerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            style={{ animation: 'studio-fade-up 0.2s ease-out' }}
            onClick={() => setBgPickerOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-full sm:w-[480px] max-w-[92vw] p-6 flex flex-col"
            style={{
              background: 'var(--bg)',
              boxShadow: '-12px 0 32px rgba(0,0,0,0.12)',
              animation: 'studio-slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[var(--text)]">Pick a background</h3>
              <button
                onClick={() => setBgPickerOpen(false)}
                className="studio-tap neu-btn w-9 h-9 flex items-center justify-center text-lg text-[var(--text-muted)]"
                aria-label="Close"
              >×</button>
            </div>
            <input
              type="text"
              value={bgSearch}
              onChange={(e) => setBgSearch(e.target.value)}
              placeholder="Search 200 backgrounds…"
              className="neu-input w-full px-3 py-2.5 text-sm mb-3"
            />
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
              {Object.entries(
                filteredBgCards.reduce((acc, c) => {
                  if (!acc[c.category]) acc[c.category] = [];
                  acc[c.category].push(c);
                  return acc;
                }, {} as Record<string, BgCard[]>),
              ).map(([cat, list]) => (
                <div key={cat} className="mb-5">
                  <p className="text-[11px] text-[var(--text-muted)] mb-2 sticky top-0 bg-[var(--bg)] py-1">{cat}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => pickBg(c.id)}
                        className="studio-tap relative aspect-square rounded-lg overflow-hidden transition-transform active:scale-95"
                        style={{
                          background: c.gradient_css,
                          boxShadow: selectedBgId === c.id ? '0 0 0 2px var(--accent)' : '0 1px 4px rgba(0,0,0,0.1)',
                        }}
                        aria-label={`Pick ${c.name}`}
                      >
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="text-[9px] text-white font-medium leading-tight truncate">{c.name}</div>
                        </div>
                        {selectedBgId === c.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
                            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {filteredBgCards.length === 0 && (
                <p className="text-center text-sm text-[var(--text-muted)] py-12">No backgrounds match “{bgSearch}”.</p>
              )}
            </div>
          </div>
        </div>
      )}
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

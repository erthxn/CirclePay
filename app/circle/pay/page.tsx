'use client';

import { useEffect, useState, useRef, Suspense, memo, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import type { BgCard, Connector, Customization } from '@/lib/studio/types';
import { parseBgCards, parseConnectors } from '@/lib/studio/parse';
import { renderBgPattern, renderBgPatternDefs, renderSvgDefs, buildConnectorOverlay } from '@/lib/studio/builders';
import bgCardsJson from '@/public/data/bg_cards.json';
import connectorsJson from '@/public/data/connectors.json';
import BgPickerModal from '@/components/studio/BgPickerModal';

type Member = { handle: string; score: number; amount: number; pfp?: string };
type Mark = 'paybox' | 'migma' | 'solana' | 'none';

const ALL_BG_CARDS: BgCard[] = parseBgCards(bgCardsJson);
const ALL_CONNECTORS: Connector[] = parseConnectors(connectorsJson);

// Map old style ids to new connector ids for backward compat
const STYLE_TO_CONN: Record<string, string> = {
  'orbit': 'curve-001',
  'spokes': 'solid-002',
  'constellation': 'curve-002',
  'halo': 'solid-005',
  'bold': 'solid-003',
  'radar': 'curve-004',
};

const MARKS: { id: Mark; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'migma', name: 'Migma' },
  { id: 'solana', name: 'Solana' },
  { id: 'none', name: 'None' },
];

// Member positions in 100x100 viewBox
function makeMemberPositions(n: number) {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = n <= 5 ? 30 : n <= 7 ? 32 : 34;
    return {
      letter: LETTERS[i] ?? '?',
      x: 50 + Math.cos(a) * r,
      y: 50 + Math.sin(a) * r,
      a,
      hue: Math.round((i * 360 / n) % 360),
    };
  });
}

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
  const [mark, setMark] = useState<Mark>('paybox');
  const [selectedBgId, setSelectedBgId] = useState<string>(ALL_BG_CARDS[0]?.id ?? '');
  const [selectedConnId, setSelectedConnId] = useState<string>('solid-002'); // default to medium solid
  const [bgPickerOpen, setBgPickerOpen] = useState(false);
  const [connPickerOpen, setConnPickerOpen] = useState(false);
  const [bgSearch, setBgSearch] = useState('');
  const visualRef = useRef<HTMLDivElement>(null);

  // Hydrate from sessionStorage + URL params
  useEffect(() => {
    const raw = sessionStorage.getItem('circleResult');
    if (raw) setData(JSON.parse(raw));
    const b = searchParams.get('b');
    if (b && ALL_BG_CARDS.some((c) => c.id === b)) setSelectedBgId(b);
    const n = searchParams.get('n');
    if (n && ALL_CONNECTORS.some((c) => c.id === n)) setSelectedConnId(n);
    // Backward-compat: old style= URL
    const s = searchParams.get('style');
    if (s && STYLE_TO_CONN[s]) setSelectedConnId(STYLE_TO_CONN[s]);
    const m = searchParams.get('m');
    if (m && ['paybox', 'migma', 'solana', 'none'].includes(m)) setMark(m as Mark);
  }, [searchParams]);

  const selectedBg = useMemo(
    () => ALL_BG_CARDS.find((c) => c.id === selectedBgId) ?? ALL_BG_CARDS[0],
    [selectedBgId],
  );
  const selectedConn = useMemo(
    () => ALL_CONNECTORS.find((c) => c.id === selectedConnId) ?? ALL_CONNECTORS[0],
    [selectedConnId],
  );

  // Build the connector overlay SVG using the imported buildConnectorOverlay
  // MUST be called BEFORE any early return (Rules of Hooks)
  const connectorOverlaySvg = useMemo(() => {
    if (!selectedConn || !data) return '';
    const n = (data.members ?? []).length;
    const members100 = makeMemberPositions(n).map((p, i) => ({
      ...p,
      letter: data.members[i]?.handle?.[0]?.toUpperCase() ?? '?',
      hue: p.hue,
      amount: data.members[i]?.amount ?? 0,
    }));
    const custom: Customization = {
      gradientStops: selectedBg?.gradient_stops ?? [],
      gradientAngle: selectedBg?.gradient_angle ?? 145,
      strokeWidth: selectedConn.stroke_width,
      strokeOpacity: selectedConn.stroke_opacity,
      dashArray: selectedConn.stroke_dasharray ?? '',
      mark: mark,
      memberCount: (n <= 5 ? 5 : n <= 7 ? 7 : 10) as 5 | 7 | 10,
      filterEnabled: !!selectedConn.filter,
      strokeOverride: selectedConn.stroke?.startsWith('url(') ? null : selectedConn.stroke,
    };
    return buildConnectorOverlay(selectedConn, custom, members100 as any);
  }, [selectedConn, selectedBg, mark, data]);

  if (!data) {
    // No analyze result — show preview + bg picker + analyze CTA
    return (
      <div className="max-w-md mx-auto px-5 py-8 text-center">
        <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Preview your card</h1>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Pick a background and connector, then analyze your circle to drop real members onto this card.
        </p>

        {/* Preview with selected bg + connector */}
        <div
          ref={visualRef}
          data-card
          className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden mb-5"
          style={{ background: selectedBg?.gradient_css ?? '#0a0a0f', borderRadius: 28 }}
        >
          {selectedBg?.pattern && (
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 w-full h-full pointer-events-none"
              dangerouslySetInnerHTML={{ __html: renderBgPatternDefs(selectedBg.pattern, 'preview') + renderBgPattern(selectedBg.pattern, 'preview') }}
            />
          )}
          <div className="absolute bottom-3 left-3 right-3 text-left">
            <div className="text-[11px] text-white/70 font-medium">background</div>
            <div className="text-sm text-white font-semibold">{selectedBg?.name}</div>
            <div className="text-[10px] text-white/60">{selectedBg?.category}{selectedBg?.pattern ? ` · ${selectedBg.pattern}` : ''}</div>
          </div>
        </div>

        {/* Bg picker trigger */}
        <button
          onClick={() => setBgPickerOpen(true)}
          className="studio-tap w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-full neu-btn text-[var(--text)] studio-magnetic mb-3"
        >
          <div
            className="w-7 h-7 rounded-full flex-shrink-0"
            style={{ background: selectedBg?.gradient_css ?? '#0a0a0f', boxShadow: '0 0 0 2px #fff inset, 0 2px 6px rgba(0,0,0,0.15)' }}
          />
          <div className="flex-1 text-left">
            <div className="font-medium text-[var(--text)] text-[11px]">{selectedBg?.name}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{selectedBg?.category}</div>
          </div>
          <span className="text-[var(--accent)] text-[11px] font-medium">Browse ↓</span>
        </button>

        {/* Connector picker trigger */}
        <button
          onClick={() => setConnPickerOpen(true)}
          className="studio-tap w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-full neu-btn text-[var(--text)] studio-magnetic mb-3"
        >
          <img
            src={`/previews/connectors/${selectedConn?.id}.svg`}
            alt=""
            width={28}
            height={28}
            className="w-7 h-7 rounded flex-shrink-0"
          />
          <div className="flex-1 text-left">
            <div className="font-medium text-[var(--text)] text-[11px]">{selectedConn?.name}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{selectedConn?.category}</div>
          </div>
          <span className="text-[var(--accent)] text-[11px] font-medium">Browse ↓</span>
        </button>

        <a
          href="/circle"
          className="studio-tap block w-full py-3.5 text-sm font-medium rounded-full text-white text-center studio-fab"
          style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.3)' }}
        >
          Analyze your X circle →
        </a>

        {bgPickerOpen && (
          <BgPickerModal
            cards={ALL_BG_CARDS}
            selectedId={selectedBgId}
            onPick={(id) => {
              setSelectedBgId(id);
              setBgPickerOpen(false);
              const url = new URL(window.location.href);
              url.searchParams.set('b', id);
              router.replace(url.pathname + url.search, { scroll: false });
            }}
            onClose={() => setBgPickerOpen(false)}
            search={bgSearch}
            onSearch={setBgSearch}
          />
        )}
      </div>
    );
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
      // Lock exact pixel dimensions from the live element so html2canvas
      // doesn't drift on sub-pixel rounding from % + negative-margin layout.
      const liveRect = visualRef.current.getBoundingClientRect();
      const cardW = Math.round(liveRect.width);
      const cardH = Math.round(liveRect.height);

      const canvas = await html2canvas(visualRef.current, {
        backgroundColor: selectedBg.solid_color,
        scale: 3,
        useCORS: true,
        logging: false,
        width: cardW,
        height: cardH,
        windowWidth: cardW,
        windowHeight: cardH,
        onclone: (doc) => {
          const el = doc.querySelector('[data-card]') as HTMLElement | null;
          if (!el) return;

          // Force exact pixel dimensions (removes aspect-ratio ambiguity)
          el.style.width = `${cardW}px`;
          el.style.height = `${cardH}px`;
          el.style.background = selectedBg.gradient_css;
          el.style.borderRadius = '28px';
          el.style.overflow = 'hidden';

          // Convert every member group from % + negative-margin to
          // absolute pixel left/top. This eliminates sub-pixel drift
          // when html2canvas rasterizes at scale 3.
          const memberEls = el.querySelectorAll('[data-member]');
          memberEls.forEach((node) => {
            const mem = node as HTMLElement;
            const x = parseFloat(mem.getAttribute('data-x') || '50');
            const y = parseFloat(mem.getAttribute('data-y') || '50');
            const tile = parseFloat(mem.getAttribute('data-tile') || '50');
            const pillW = parseFloat(mem.getAttribute('data-pillw') || '58');

            const leftPx = (x / 100) * cardW;
            const topPx = (y / 100) * cardH;

            mem.style.left = `${leftPx}px`;
            mem.style.top = `${topPx}px`;
            mem.style.marginLeft = `${-pillW / 2}px`;
            mem.style.marginTop = `${-tile / 2}px`;
            mem.style.width = `${pillW}px`;
          });

          // Force crisp text on amount pills: system font stack,
          // tabular numbers, antialiased, geometric-precision rendering.
          const pills = el.querySelectorAll('[data-pill]');
          pills.forEach((node) => {
            const pill = node as HTMLElement;
            pill.style.fontFamily =
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
            pill.style.fontFeatureSettings = '"tnum" 1';
            pill.style.setProperty('-webkit-font-smoothing', 'antialiased');
            pill.style.setProperty('-moz-osx-font-smoothing', 'grayscale');
            pill.style.textRendering = 'geometricPrecision';
          });
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
    const url = new URL(window.location.href);
    url.searchParams.set('b', id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  function pickConn(id: string) {
    setSelectedConnId(id);
    setConnPickerOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.set('n', id);
    router.replace(url.pathname + url.search, { scroll: false });
  }

  const isEmpty = emptyReason || !members.length;
  const n = members.length;
  const memberPositions = makeMemberPositions(n);
  const r = n <= 5 ? 30 : n <= 7 ? 32 : 34;
  const bold = selectedConnId === 'solid-003';  // "bold" connector
  const tile = bold ? (n <= 5 ? 56 : n <= 7 ? 48 : 40) : n <= 5 ? 50 : n <= 7 ? 44 : n <= 10 ? 38 : 32;
  const pillH = 18;
  const gap = 5;
  const pillW = tile + 8;

  // (connectorOverlaySvg is computed above, before the early return — Rules of Hooks)

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
              {/* BG picker trigger */}
              <div className="mb-3">
                <button
                  onClick={() => setBgPickerOpen(true)}
                  className="studio-tap w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-full neu-btn text-[var(--text)] studio-magnetic"
                >
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    style={{ background: selectedBg?.gradient_css ?? '#0a0a0f', boxShadow: '0 0 0 2px #fff inset, 0 2px 6px rgba(0,0,0,0.15)' }}
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-[var(--text)] text-[11px]">{selectedBg?.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{selectedBg?.category}{selectedBg?.pattern ? ` · ${selectedBg.pattern}` : ''}</div>
                  </div>
                  <span className="text-[var(--accent)] text-[11px] font-medium">Browse ↓</span>
                </button>
              </div>

              {/* Connector picker trigger */}
              <div className="mb-3">
                <button
                  onClick={() => setConnPickerOpen(true)}
                  className="studio-tap w-full flex items-center gap-3 px-3 py-2.5 text-[12px] rounded-full neu-btn text-[var(--text)] studio-magnetic"
                >
                  <img
                    src={`/previews/connectors/${selectedConn?.id}.svg`}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded flex-shrink-0"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-[var(--text)] text-[11px]">{selectedConn?.name}</div>
                    <div className="text-[10px] text-[var(--text-muted)]">{selectedConn?.category}</div>
                  </div>
                  <span className="text-[var(--accent)] text-[11px] font-medium">Browse ↓</span>
                </button>
              </div>

              {/* The visual card with selected bg + connector */}
              <div ref={visualRef} data-card className="relative mx-auto w-full max-w-sm aspect-square overflow-hidden" style={{ background: selectedBg?.gradient_css ?? '#0a0a0f', borderRadius: 28 }}>
                {/* BG pattern overlay */}
                {selectedBg?.pattern && (
                  <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full pointer-events-none" dangerouslySetInnerHTML={{ __html: `${renderBgPatternDefs(selectedBg.pattern, 'live')}${renderBgPattern(selectedBg.pattern, 'live')}` }} />
                )}

                {/* Connector overlay */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 w-full h-full pointer-events-none" dangerouslySetInnerHTML={{ __html: `${renderSvgDefs()}${connectorOverlaySvg}` }} />

                {/* Center avatar */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <Avatar src={centerPfp} letter={handle.slice(0, 1).toUpperCase()} size={n <= 5 ? 58 : 52} />
                </div>

                {/* Member avatars + price pills */}
                {members.map((m: Member, i: number) => {
                  const pos = memberPositions[i];
                  if (!pos) return null;
                  return (
                    <div
                      key={m.handle}
                      data-member={i}
                      data-x={pos.x}
                      data-y={pos.y}
                      data-tile={tile}
                      data-pillw={pillW}
                      style={{
                        position: 'absolute',
                        left: `${pos.x}%`,
                        top: `${pos.y}%`,
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
                        data-pill
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

                {/* Mark + brand text */}
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

              {/* Open in Studio */}
              <a
                href={`/studio?b=${selectedBgId}&n=${selectedConnId}&m=${mark}`}
                className="studio-tap mt-3 block w-full py-3 text-sm font-medium rounded-full text-white text-center studio-fab"
                style={{ background: 'linear-gradient(135deg, var(--accent), #0B4FE0)', boxShadow: '0 6px 16px rgba(13,92,255,0.25)' }}
              >
                Open in Studio →
              </a>

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

      {/* Bg picker modal */}
      {bgPickerOpen && (
        <BgPickerModal
          cards={ALL_BG_CARDS}
          selectedId={selectedBgId}
          onPick={pickBg}
          onClose={() => setBgPickerOpen(false)}
          search={bgSearch}
          onSearch={setBgSearch}
        />
      )}

      {/* Connector picker modal */}
      {connPickerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            style={{ animation: 'studio-fade-up 0.2s ease-out' }}
            onClick={() => setConnPickerOpen(false)}
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
              <h3 className="text-base font-semibold text-[var(--text)]">Pick a connector</h3>
              <button
                onClick={() => setConnPickerOpen(false)}
                className="studio-tap neu-btn w-9 h-9 flex items-center justify-center text-lg text-[var(--text-muted)]"
                aria-label="Close"
              >×</button>
            </div>
            <div className="flex-1 overflow-y-auto -mr-2 pr-2">
              {Object.entries(
                ALL_CONNECTORS.reduce((acc, c) => {
                  if (!acc[c.category]) acc[c.category] = [];
                  acc[c.category].push(c);
                  return acc;
                }, {} as Record<string, Connector[]>),
              ).map(([cat, list]) => (
                <div key={cat} className="mb-5">
                  <p className="text-[11px] text-[var(--text-muted)] mb-2 sticky top-0 bg-[var(--bg)] py-1">{cat}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => pickConn(c.id)}
                        className="studio-tap relative aspect-square rounded-lg overflow-hidden transition-transform active:scale-95"
                        style={{
                          boxShadow: selectedConnId === c.id ? '0 0 0 2px var(--accent)' : '0 1px 4px rgba(0,0,0,0.1)',
                        }}
                        aria-label={`Pick ${c.name}`}
                      >
                        <img
                          src={`/previews/connectors/${c.id}.svg`}
                          alt={c.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                          <div className="text-[9px] text-white font-medium leading-tight truncate">{c.name}</div>
                        </div>
                        {selectedConnId === c.id && (
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

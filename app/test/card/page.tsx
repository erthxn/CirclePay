'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type Style = 'orbit' | 'spokes' | 'constellation' | 'halo' | 'bold' | 'radar';
type Mark = 'paybox' | 'solana' | 'none';
type Grad = 'moon' | 'navy' | 'gold' | 'dusk' | 'steel' | 'ink';

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
  { id: 'solana', name: 'Solana' },
  { id: 'none', name: 'None' },
];

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LINE = '#ffffff';

function makeMembers(n: number) {
  return POOL.slice(0, n).map((letter, i) => ({
    letter,
    amount: Math.round((20 - i * (15 / n)) * 100) / 100,
    hue: (i * 360) / n,
  }));
}

function Tile({ letter, hue, size = 48 }: { letter: string; hue: number; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 700,
        background: `linear-gradient(145deg, hsl(${hue},72%,58%), hsl(${hue},62%,42%))`,
        boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
        border: '2px solid #fff',
      }}
    >
      {letter}
    </div>
  );
}

function PayBoxMark() {
  return (
    <svg viewBox="0 0 400 400" width="56" height="56" style={{ opacity: 0.85, transform: 'rotate(-16deg)' }}>
      <g fill="#ffffff">
        <path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z" />
        <path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z" />
        <path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z" />
      </g>
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg viewBox="0 0 400 400" width="56" height="56" style={{ opacity: 0.95, transform: 'rotate(-16deg)' }}>
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

export default function TestCardPage() {
  const [style, setStyle] = useState<Style>('orbit');
  const [count, setCount] = useState(5);
  const [grad, setGrad] = useState<Grad>('steel');
  const [mark, setMark] = useState<Mark>('paybox');
  const [hiddenS, setHiddenS] = useState<Style[]>([]);
  const [hiddenG, setHiddenG] = useState<Grad[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const members = makeMembers(count);
  const visible = STYLES.filter((s) => !hiddenS.includes(s.id));
  const visibleG = GRADS.filter((g) => !hiddenG.includes(g.id));
  const active = GRADS.find((g) => g.id === grad) || GRADS[0];

  async function download() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: active.solid,
      scale: 3,
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        const el = doc.querySelector('[data-card]') as HTMLElement | null;
        if (el) {
          el.style.background = active.css;
          el.style.borderRadius = '28px';
        }
      },
    });
    const link = document.createElement('a');
    link.download = `circlepay-${style}-${count}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function killStyle(id: Style) {
    setHiddenS((h) => [...h, id]);
    if (style === id) {
      const next = visible.find((s) => s.id !== id);
      if (next) setStyle(next.id);
    }
  }

  function killGrad(id: Grad) {
    setHiddenG((h) => [...h, id]);
    if (grad === id) {
      const next = visibleG.find((g) => g.id !== id);
      if (next) setGrad(next.id);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">Card studio</h1>
        {(hiddenS.length > 0 || hiddenG.length > 0) && (
          <button onClick={() => { setHiddenS([]); setHiddenG([]); setStyle('orbit'); setGrad('steel'); }} className="text-xs text-[var(--accent)]">
            Restore all
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-5">Pick, eliminate, download · no API</p>

      <div className="mb-3">
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Style</p>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((s) => (
            <button key={s.id} onClick={() => setStyle(s.id)} className={`px-2.5 py-1 text-[11px] rounded-full ${style === s.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] text-[var(--text-muted)]">Size</p>
        {[5, 7, 10, 15].map((n) => (
          <button key={n} onClick={() => setCount(n)} className={`px-2.5 py-1 text-[11px] rounded-full ${count === n ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
            {n}
          </button>
        ))}
      </div>

      <div className="mb-3">
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Card</p>
        <div className="flex flex-wrap gap-1.5">
          {visibleG.map((g) => (
            <button key={g.id} onClick={() => setGrad(g.id)} className={`px-2.5 py-1 text-[11px] rounded-full ${grad === g.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-2">
        <p className="text-[11px] text-[var(--text-muted)]">Mark</p>
        {MARKS.map((m) => (
          <button key={m.id} onClick={() => setMark(m.id)} className={`px-2.5 py-1 text-[11px] rounded-full ${mark === m.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}>
            {m.name}
          </button>
        ))}
      </div>

      <div ref={ref} data-card className="mx-auto w-full max-w-sm aspect-square relative overflow-hidden" style={{ background: active.css, borderRadius: 28 }}>
        <Card style={style} members={members} mark={mark} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button onClick={download} className="py-3 text-sm font-medium text-white rounded-full" style={{ background: 'var(--accent)' }}>Download</button>
        <button onClick={() => killStyle(style)} className="py-3 text-sm font-medium rounded-full border border-red-400 text-red-500">Drop style</button>
        <button onClick={() => killGrad(grad)} className="py-3 text-sm font-medium rounded-full border border-red-400 text-red-500">Drop card</button>
      </div>

      <p className="mt-3 text-xs text-center text-[var(--text-muted)]">{visible.length} styles · {visibleG.length} cards · @erthxn</p>
    </div>
  );
}

type M = { letter: string; amount: number; hue: number };

function Card({ style, members, mark }: { style: Style; members: M[]; mark: Mark }) {
  const n = members.length;
  const bold = style === 'bold';
  const tileSize = bold ? (n <= 5 ? 56 : n <= 7 ? 48 : 40) : n <= 5 ? 50 : n <= 7 ? 44 : n <= 10 ? 38 : 32;
  const r = n <= 5 ? 30 : n <= 7 ? 30 : 32;
  const sw = bold ? 2.2 : 0.7;

  const brand = (
    <div style={{ position: 'absolute', bottom: 8, right: 10, display: 'flex', alignItems: 'flex-end', gap: 6, zIndex: 30 }}>
      <div style={{ textAlign: 'right', fontSize: 10, lineHeight: 1.15, color: '#ffffff', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
        <div>@erthxn</div>
        <div style={{ opacity: 0.85 }}>circlepay.fun</div>
      </div>
      {mark === 'paybox' && <PayBoxMark />}
      {mark === 'solana' && <SolanaMark />}
    </div>
  );

  const price = (amount: number) => (
    <div style={{ marginTop: 2, fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: '#ffffff', color: '#111', whiteSpace: 'nowrap' }}>
      ${amount.toFixed(2)}
    </div>
  );

  const nodes = (radius: number, size = tileSize) =>
    members.map((m, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(a) * radius;
      const y = 50 + Math.sin(a) * radius;
      return (
        <div key={i} style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
          <Tile letter={m.letter} hue={m.hue} size={size} />
          {price(m.amount)}
        </div>
      );
    });

  const center = (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
      <Tile letter="@" hue={210} size={bold ? 68 : n <= 5 ? 60 : 54} />
    </div>
  );

  if (style === 'orbit') {
    return (
      <>
        <div style={{ position: 'absolute', inset: '20%', borderRadius: '50%', border: `1px solid ${LINE}`, opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: '32%', borderRadius: '50%', border: `1px solid ${LINE}`, opacity: 0.3 }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          {members.map((_, i) => {
            if (i === n - 1) return null;
            const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            return <path key={i} d={`M ${50+Math.cos(a1)*r} ${50+Math.sin(a1)*r} Q 50 50 ${50+Math.cos(a2)*r} ${50+Math.sin(a2)*r}`} fill="none" stroke={LINE} strokeOpacity="0.55" strokeWidth={sw} />;
          })}
        </svg>
        {center}
        {nodes(r)}
        {brand}
      </>
    );
  }

  if (style === 'spokes') {
    return (
      <>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          {members.map((_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1="50" y1="50" x2={50+Math.cos(a)*(r+4)} y2={50+Math.sin(a)*(r+4)} stroke={LINE} strokeWidth={bold ? 2.4 : 1.3} />;
          })}
        </svg>
        {center}
        {nodes(r)}
        {brand}
      </>
    );
  }

  if (style === 'constellation') {
    return (
      <>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          {members.map((_, i) => {
            const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 2) / n) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1={50+Math.cos(a1)*r} y1={50+Math.sin(a1)*r} x2={50+Math.cos(a2)*r} y2={50+Math.sin(a2)*r} stroke={LINE} strokeWidth={bold ? 1.4 : 0.65} />;
          })}
        </svg>
        {center}
        {nodes(r)}
        {brand}
      </>
    );
  }

  if (style === 'halo') {
    return (
      <>
        <div style={{ position: 'absolute', inset: '16%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.22), transparent 68%)' }} />
        {center}
        {nodes(r)}
        {brand}
      </>
    );
  }

  if (style === 'radar') {
    const innerN = n === 5 ? 2 : Math.max(2, Math.floor(n / 3));
    const outer = members.slice(innerN);
    const inner = members.slice(0, innerN);
    return (
      <>
        <div style={{ position: 'absolute', inset: '22%', borderRadius: '50%', border: `1px solid ${LINE}`, opacity: 0.45 }} />
        <div style={{ position: 'absolute', inset: '34%', borderRadius: '50%', border: `1px solid ${LINE}`, opacity: 0.28 }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="30" fill="none" stroke={LINE} strokeOpacity="0.25" strokeWidth="0.4" />
          <line x1="50" y1="20" x2="50" y2="80" stroke={LINE} strokeOpacity="0.22" strokeWidth="0.35" />
          <line x1="20" y1="50" x2="80" y2="50" stroke={LINE} strokeOpacity="0.22" strokeWidth="0.35" />
        </svg>
        {center}
        {inner.map((m, i) => {
          const a = (i / Math.max(inner.length, 1)) * Math.PI * 2 - Math.PI / 2;
          return (
            <div key={m.letter} style={{ position: 'absolute', left: `${50+Math.cos(a)*18}%`, top: `${50+Math.sin(a)*18}%`, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
              <Tile letter={m.letter} hue={m.hue} size={tileSize - 8} />
              {price(m.amount)}
            </div>
          );
        })}
        {outer.map((m, i) => {
          const a = (i / Math.max(outer.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.5;
          return (
            <div key={m.letter} style={{ position: 'absolute', left: `${50+Math.cos(a)*r}%`, top: `${50+Math.sin(a)*r}%`, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
              <Tile letter={m.letter} hue={m.hue} size={tileSize} />
              {price(m.amount)}
            </div>
          );
        })}
        {brand}
      </>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', inset: '18%', borderRadius: '50%', border: `3px solid ${LINE}`, opacity: 0.7 }} />
      {center}
      {nodes(r)}
      {brand}
    </>
  );
}

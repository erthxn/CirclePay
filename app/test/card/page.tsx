'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type Style = 'orbit' | 'spokes' | 'constellation' | 'halo' | 'frame' | 'bold' | 'radar';

const STYLES: { id: Style; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'spokes', label: 'Spokes' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'halo', label: 'Halo' },
  { id: 'frame', label: 'Frame' },
  { id: 'bold', label: 'Bold' },
  { id: 'radar', label: 'Radar' },
];

const COLORS = [
  { name: 'Blue', hex: '#0D5CFF' },
  { name: 'Black', hex: '#111111' },
];

type BgId = 'paybox' | 'solana' | 'plain';
const BGS: { id: BgId; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'solana', name: 'Solana' },
  { id: 'plain', name: 'Plain' },
];

const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

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
      className="rounded-full overflow-hidden flex items-center justify-center text-white font-bold shadow"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(145deg, hsl(${hue},72%,58%), hsl(${hue},62%,42%))`,
      }}
    >
      {letter}
    </div>
  );
}

function PayBoxMark() {
  return (
    <svg viewBox="0 0 400 400" className="w-[78%] h-[78%]" style={{ opacity: 0.14 }}>
      <g fill="#0D5CFF">
        <path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z" />
        <path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z" />
        <path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z" />
      </g>
    </svg>
  );
}

function SolanaMark() {
  return (
    <svg viewBox="0 0 400 400" className="w-[78%] h-[78%]" style={{ opacity: 0.18 }}>
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
  const [accent, setAccent] = useState('#0D5CFF');
  const [bg, setBg] = useState<BgId>('paybox');
  const [hidden, setHidden] = useState<Style[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const members = makeMembers(count);
  const visible = STYLES.filter((s) => !hidden.includes(s.id));

  async function download() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: '#f7f8fa',
      scale: 3,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `circlepay-${style}-${count}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function kill(id: Style) {
    setHidden((h) => [...h, id]);
    if (style === id && visible.length > 1) {
      const next = visible.find((s) => s.id !== id);
      if (next) setStyle(next.id);
    }
  }

  const cardBg =
    bg === 'solana'
      ? 'linear-gradient(145deg, #f4fbf8 0%, #f7f8fa 45%, #f3eef8 100%)'
      : bg === 'plain'
      ? 'linear-gradient(160deg, #ffffff 0%, #eef2f8 100%)'
      : 'linear-gradient(160deg, #f7f9fc 0%, #e8eef8 50%, #f4f7fb 100%)';

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[var(--text)]">Card studio</h1>
        {hidden.length > 0 && (
          <button onClick={() => { setHidden([]); setStyle('orbit'); }} className="text-xs text-[var(--accent)]">
            Restore all
          </button>
        )}
      </div>
      <p className="text-sm text-[var(--text-muted)] mb-5">Pick, eliminate, download · no API</p>

      <div className="mb-3">
        <p className="text-[11px] text-[var(--text-muted)] mb-1.5">Style</p>
        <div className="flex flex-wrap gap-1.5">
          {visible.map((s) => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`px-2.5 py-1 text-[11px] rounded-full ${
                style === s.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] text-[var(--text-muted)]">Size</p>
        {[5, 7, 10, 15].map((n) => (
          <button
            key={n}
            onClick={() => setCount(n)}
            className={`px-2.5 py-1 text-[11px] rounded-full ${
              count === n ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <p className="text-[11px] text-[var(--text-muted)]">Color</p>
        {COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => setAccent(c.hex)}
            title={c.name}
            className="w-6 h-6 rounded-full border-2"
            style={{ background: c.hex, borderColor: accent === c.hex ? '#0D5CFF' : '#ddd' }}
          />
        ))}
      </div>

      <div className="mb-5 flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-[var(--text-muted)]">Bg</p>
        {BGS.map((b) => (
          <button
            key={b.id}
            onClick={() => setBg(b.id)}
            className={`px-2.5 py-1 text-[11px] rounded-full ${
              bg === b.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div
        ref={ref}
        className="mx-auto w-full max-w-sm aspect-square relative overflow-hidden rounded-[28px]"
        style={{ background: cardBg }}
      >
        {bg !== 'plain' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {bg === 'paybox' ? <PayBoxMark /> : <SolanaMark />}
          </div>
        )}
        <Card style={style} members={members} accent={accent} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={download} className="py-3 text-sm font-medium text-white rounded-full" style={{ background: 'var(--accent)' }}>
          Download PNG
        </button>
        <button onClick={() => kill(style)} className="py-3 text-sm font-medium rounded-full border border-red-400 text-red-500">
          Eliminate
        </button>
      </div>

      <p className="mt-3 text-xs text-center text-[var(--text-muted)]">
        {visible.length} left · @erthxn · circlepay.fun
      </p>
    </div>
  );
}

type M = { letter: string; amount: number; hue: number };

function Card({ style, members, accent }: { style: Style; members: M[]; accent: string }) {
  const n = members.length;
  const tileSize = n <= 5 ? 52 : n <= 7 ? 46 : n <= 10 ? 40 : 34;
  const line = accent;

  const brand = (
    <div className="absolute bottom-3 right-3 text-right text-[10px] leading-tight text-[#1a1d24] z-30">
      <div>@erthxn</div>
      <div className="opacity-70">circlepay.fun</div>
    </div>
  );

  const price = (amount: number) => (
    <div className="mt-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ background: accent, color: '#fff' }}>
      ${amount.toFixed(2)}
    </div>
  );

  const nodes = (r: number, size = tileSize) =>
    members.map((m, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const x = 50 + Math.cos(a) * r;
      const y = 50 + Math.sin(a) * r;
      return (
        <div key={i} className="absolute flex flex-col items-center z-20" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
          <Tile letter={m.letter} hue={m.hue} size={size} />
          {price(m.amount)}
        </div>
      );
    });

  const center = (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <Tile letter="@" hue={210} size={n <= 5 ? 64 : 56} />
    </div>
  );

  if (style === 'orbit') {
    return (
      <>
        <div className="absolute inset-[18%] rounded-full border" style={{ borderColor: line, opacity: 0.4 }} />
        <div className="absolute inset-[30%] rounded-full border" style={{ borderColor: line, opacity: 0.25 }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            if (i === n - 1) return null;
            const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const r = 34;
            return <path key={i} d={`M ${50+Math.cos(a1)*r} ${50+Math.sin(a1)*r} Q 50 50 ${50+Math.cos(a2)*r} ${50+Math.sin(a2)*r}`} fill="none" stroke={line} strokeOpacity="0.5" strokeWidth="0.7" />;
          })}
        </svg>
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'spokes') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1="50" y1="50" x2={50+Math.cos(a)*40} y2={50+Math.sin(a)*40} stroke={line} strokeWidth="1.2" />;
          })}
        </svg>
        {center}
        {nodes(36)}
        {brand}
      </>
    );
  }

  if (style === 'constellation') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 2) / n) * Math.PI * 2 - Math.PI / 2;
            const r = 34;
            return <line key={i} x1={50+Math.cos(a1)*r} y1={50+Math.sin(a1)*r} x2={50+Math.cos(a2)*r} y2={50+Math.sin(a2)*r} stroke={line} strokeWidth="0.6" />;
          })}
        </svg>
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'halo') {
    return (
      <>
        <div className="absolute inset-[14%] rounded-full" style={{ background: `radial-gradient(circle, ${accent}30, transparent 68%)` }} />
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'frame') {
    return (
      <>
        <div className="absolute inset-3 rounded-2xl border-2" style={{ borderColor: line }} />
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'bold') {
    return (
      <>
        <div className="absolute inset-0" style={{ background: accent }} />
        {center}
        {nodes(34)}
        <div className="absolute bottom-3 right-3 text-right text-[10px] leading-tight text-white z-30">
          <div>@erthxn</div>
          <div className="opacity-70">circlepay.fun</div>
        </div>
      </>
    );
  }

  const innerN = n === 5 ? 2 : Math.max(2, Math.floor(n / 3));
  const outer = members.slice(innerN);
  const inner = members.slice(0, innerN);
  return (
    <>
      <div className="absolute inset-[20%] rounded-full border" style={{ borderColor: line, opacity: 0.4 }} />
      <div className="absolute inset-[34%] rounded-full border" style={{ borderColor: line, opacity: 0.25 }} />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="32" fill="none" stroke={line} strokeOpacity="0.2" strokeWidth="0.4" />
        <line x1="50" y1="18" x2="50" y2="82" stroke={line} strokeOpacity="0.18" strokeWidth="0.35" />
        <line x1="18" y1="50" x2="82" y2="50" stroke={line} strokeOpacity="0.18" strokeWidth="0.35" />
      </svg>
      {center}
      {inner.map((m, i) => {
        const a = (i / Math.max(inner.length, 1)) * Math.PI * 2 - Math.PI / 2;
        return (
          <div key={m.letter} className="absolute flex flex-col items-center z-20" style={{ left: `${50+Math.cos(a)*20}%`, top: `${50+Math.sin(a)*20}%`, transform: 'translate(-50%,-50%)' }}>
            <Tile letter={m.letter} hue={m.hue} size={tileSize - 8} />
            {price(m.amount)}
          </div>
        );
      })}
      {outer.map((m, i) => {
        const a = (i / Math.max(outer.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.5;
        return (
          <div key={m.letter} className="absolute flex flex-col items-center z-20" style={{ left: `${50+Math.cos(a)*36}%`, top: `${50+Math.sin(a)*36}%`, transform: 'translate(-50%,-50%)' }}>
            <Tile letter={m.letter} hue={m.hue} size={tileSize} />
            {price(m.amount)}
          </div>
        );
      })}
      {brand}
    </>
  );
}

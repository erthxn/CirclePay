'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type Style =
  | 'orbit' | 'network' | 'petal' | 'glow' | 'hud'
  | 'rings' | 'spokes' | 'constellation' | 'grid' | 'wave'
  | 'stack' | 'halo' | 'compass' | 'dots' | 'frame'
  | 'minimal' | 'bold' | 'soft' | 'dual' | 'pulse';

const STYLES: { id: Style; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'network', label: 'Network' },
  { id: 'petal', label: 'Petal' },
  { id: 'glow', label: 'Glow' },
  { id: 'hud', label: 'HUD' },
  { id: 'rings', label: 'Rings' },
  { id: 'spokes', label: 'Spokes' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'grid', label: 'Grid' },
  { id: 'wave', label: 'Wave' },
  { id: 'stack', label: 'Stack' },
  { id: 'halo', label: 'Halo' },
  { id: 'compass', label: 'Compass' },
  { id: 'dots', label: 'Dots' },
  { id: 'frame', label: 'Frame' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'bold', label: 'Bold' },
  { id: 'soft', label: 'Soft' },
  { id: 'dual', label: 'Dual' },
  { id: 'pulse', label: 'Pulse' },
];

const COLORS = [
  { name: 'Blue', hex: '#0D5CFF' },
  { name: 'Cosmic', hex: '#23212C' },
  { name: 'Violet', hex: '#36255C' },
  { name: 'Cyan', hex: '#22d3ee' },
  { name: 'Ink', hex: '#111111' },
];

const BGS = [
  { name: 'Light', value: 'linear-gradient(145deg, #eef2f8, #f7f8fa)' },
  { name: 'Cream', value: '#f4f1eb' },
  { name: 'Gray', value: '#e8eaed' },
  { name: 'Dark', value: '#1a1d24' },
  { name: 'Black', value: '#000000' },
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

export default function TestCardPage() {
  const [style, setStyle] = useState<Style>('orbit');
  const [count, setCount] = useState(5);
  const [accent, setAccent] = useState('#0D5CFF');
  const [bg, setBg] = useState(BGS[0].value);
  const [hidden, setHidden] = useState<Style[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  const members = makeMembers(count);
  const visible = STYLES.filter((s) => !hidden.includes(s.id));

  async function download() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: null,
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
            style={{ background: c.hex, borderColor: accent === c.hex ? '#fff' : 'transparent' }}
          />
        ))}
      </div>

      <div className="mb-5 flex items-center gap-2 flex-wrap">
        <p className="text-[11px] text-[var(--text-muted)]">Bg</p>
        {BGS.map((b) => (
          <button
            key={b.name}
            onClick={() => setBg(b.value)}
            className={`px-2.5 py-1 text-[11px] rounded-full ${
              bg === b.value ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div
        ref={ref}
        className="mx-auto w-full max-w-sm aspect-square relative overflow-hidden rounded-[28px]"
        style={{ background: bg }}
      >
        <Card style={style} members={members} accent={accent} dark={bg === '#000000' || bg === '#1a1d24'} />
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

function Card({ style, members, accent, dark }: { style: Style; members: M[]; accent: string; dark: boolean }) {
  const n = members.length;
  const tileSize = n <= 5 ? 52 : n <= 7 ? 46 : n <= 10 ? 40 : 34;

  const brand = (
    <div className={`absolute bottom-3 right-3 text-right text-[10px] leading-tight ${dark ? 'text-white' : 'text-[#1a1d24]'}`}>
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
        <div className="absolute inset-[18%] rounded-full border" style={{ borderColor: accent + '55' }} />
        <div className="absolute inset-[30%] rounded-full border" style={{ borderColor: accent + '33' }} />
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            if (i === n - 1) return null;
            const a1 = (i / n) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const r = 34;
            return <path key={i} d={`M ${50+Math.cos(a1)*r} ${50+Math.sin(a1)*r} Q 50 50 ${50+Math.cos(a2)*r} ${50+Math.sin(a2)*r}`} fill="none" stroke={accent} strokeOpacity="0.35" strokeWidth="0.5" />;
          })}
        </svg>
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'network') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            const a = (i / n) * Math.PI * 2 - Math.PI / 2;
            return <line key={i} x1="50" y1="50" x2={50+Math.cos(a)*32} y2={50+Math.sin(a)*32} stroke={accent} strokeWidth="0.5" />;
          })}
        </svg>
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'petal') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {members.map((_, i) => {
            const s = (i / n) * Math.PI * 2 - Math.PI / 2;
            const e = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
            const r = 40;
            return (
              <path
                key={i}
                d={`M 50 50 L ${50+Math.cos(s)*r} ${50+Math.sin(s)*r} A ${r} ${r} 0 0 1 ${50+Math.cos(e)*r} ${50+Math.sin(e)*r} Z`}
                fill={accent}
                fillOpacity={0.15 + (i % 3) * 0.15}
                stroke={accent}
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
        {center}
        {nodes(28)}
        {brand}
      </>
    );
  }

  if (style === 'glow') {
    return (
      <>
        <div className="absolute inset-[12%] rounded-full border-[5px]" style={{ borderColor: accent, boxShadow: `0 0 22px ${accent}` }} />
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'hud') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" fill="none" stroke={accent} strokeWidth="0.4" />
          <circle cx="50" cy="50" r="32" fill="none" stroke={accent} strokeWidth="0.3" strokeDasharray="1.4 1.4" />
          <circle cx="50" cy="50" r="16" fill="none" stroke={accent} strokeWidth="0.3" />
        </svg>
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'rings') {
    return (
      <>
        {[18, 28, 38].map((r) => (
          <div key={r} className="absolute rounded-full border" style={{ inset: `${50 - r}%`, borderColor: accent + '40' }} />
        ))}
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
            return <line key={i} x1="50" y1="50" x2={50+Math.cos(a)*40} y2={50+Math.sin(a)*40} stroke={accent} strokeWidth="1.2" />;
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
            return <line key={i} x1={50+Math.cos(a1)*r} y1={50+Math.sin(a1)*r} x2={50+Math.cos(a2)*r} y2={50+Math.sin(a2)*r} stroke={accent} strokeWidth="0.35" />;
          })}
        </svg>
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'grid') {
    const cols = Math.ceil(Math.sqrt(n));
    return (
      <>
        <div className="absolute inset-6 grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {members.map((m) => (
            <div key={m.letter} className="flex flex-col items-center justify-center">
              <Tile letter={m.letter} hue={m.hue} size={tileSize - 4} />
              {price(m.amount)}
            </div>
          ))}
        </div>
        {brand}
      </>
    );
  }

  if (style === 'wave') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <path d="M 0 55 Q 25 40 50 55 T 100 55" fill="none" stroke={accent} strokeWidth="0.6" />
          <path d="M 0 65 Q 25 50 50 65 T 100 65" fill="none" stroke={accent} strokeWidth="0.4" opacity="0.5" />
        </svg>
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'stack') {
    return (
      <>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          {members.slice(0, Math.min(n, 8)).map((m) => (
            <div key={m.letter} className="flex items-center gap-2">
              <Tile letter={m.letter} hue={m.hue} size={32} />
              {price(m.amount)}
            </div>
          ))}
        </div>
        {brand}
      </>
    );
  }

  if (style === 'halo') {
    return (
      <>
        <div className="absolute inset-[16%] rounded-full" style={{ background: `radial-gradient(circle, ${accent}33, transparent 70%)` }} />
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'compass') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <polygon points="50,12 54,46 50,50 46,46" fill={accent} />
          <polygon points="50,88 54,54 50,50 46,54" fill={accent} opacity="0.5" />
          <circle cx="50" cy="50" r="36" fill="none" stroke={accent} strokeWidth="0.4" />
        </svg>
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'dots') {
    return (
      <>
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {Array.from({ length: 40 }).map((_, i) => (
            <circle key={i} cx={10 + (i * 17) % 80} cy={10 + (i * 23) % 80} r="0.6" fill={accent} opacity="0.4" />
          ))}
        </svg>
        {center}
        {nodes(34)}
        {brand}
      </>
    );
  }

  if (style === 'frame') {
    return (
      <>
        <div className="absolute inset-3 rounded-2xl border-2" style={{ borderColor: accent }} />
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'minimal') {
    return (
      <>
        {center}
        {nodes(36)}
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
        <div className="absolute bottom-3 right-3 text-right text-[10px] leading-tight text-white">
          <div>@erthxn</div>
          <div className="opacity-70">circlepay.fun</div>
        </div>
      </>
    );
  }

  if (style === 'soft') {
    return (
      <>
        <div className="absolute inset-4 rounded-3xl" style={{ background: accent + '18' }} />
        {center}
        {nodes(32)}
        {brand}
      </>
    );
  }

  if (style === 'dual') {
    // 5 looks best: 2 inner, 3 outer. Otherwise split evenly.
    const innerN = n === 5 ? 2 : Math.floor(n / 2);
    const outer = members.slice(innerN);
    const inner = members.slice(0, innerN);
    return (
      <>
        <div className="absolute inset-[22%] rounded-full border" style={{ borderColor: accent + '40' }} />
        <div className="absolute inset-[36%] rounded-full border" style={{ borderColor: accent + '25' }} />
        {center}
        {inner.map((m, i) => {
          const a = (i / Math.max(inner.length, 1)) * Math.PI * 2 - Math.PI / 2;
          return (
            <div key={m.letter} className="absolute flex flex-col items-center z-20" style={{ left: `${50+Math.cos(a)*20}%`, top: `${50+Math.sin(a)*20}%`, transform: 'translate(-50%,-50%)' }}>
              <Tile letter={m.letter} hue={m.hue} size={tileSize - 6} />
              {price(m.amount)}
            </div>
          );
        })}
        {outer.map((m, i) => {
          const a = (i / Math.max(outer.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.4;
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

  return (
    <>
      <div className="absolute inset-[22%] rounded-full border-2 animate-pulse" style={{ borderColor: accent }} />
      <div className="absolute inset-[34%] rounded-full border animate-pulse" style={{ borderColor: accent, animationDelay: '0.3s' }} />
      {center}
      {nodes(36)}
      {brand}
    </>
  );
}

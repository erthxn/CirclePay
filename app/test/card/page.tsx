'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

type Style = 'orbit' | 'network' | 'petal' | 'glow' | 'spark' | 'hud';

const STYLES: { id: Style; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'network', label: 'Network' },
  { id: 'petal', label: 'Petal' },
  { id: 'glow', label: 'Glow ring' },
  { id: 'spark', label: 'Spark' },
  { id: 'hud', label: 'HUD' },
];

const MEMBERS = [
  { handle: 'alpha', amount: 12.4, hue: 210 },
  { handle: 'beta', amount: 8.2, hue: 280 },
  { handle: 'gamma', amount: 6.1, hue: 160 },
  { handle: 'delta', amount: 4.8, hue: 30 },
  { handle: 'echo', amount: 3.5, hue: 340 },
];

function ph(hue: number, letter: string) {
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
      style={{ background: `linear-gradient(145deg, hsl(${hue},70%,55%), hsl(${hue},60%,40%))` }}
    >
      {letter}
    </div>
  );
}

export default function TestCardPage() {
  const [style, setStyle] = useState<Style>('orbit');
  const ref = useRef<HTMLDivElement>(null);

  async function download() {
    if (!ref.current) return;
    const canvas = await html2canvas(ref.current, {
      backgroundColor: null,
      scale: 3,
      useCORS: true,
      logging: false,
    });
    const link = document.createElement('a');
    link.download = `circlepay-test-${style}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-6">
      <h1 className="text-2xl font-bold mb-1 text-[var(--text)]">Card lab</h1>
      <p className="text-sm text-[var(--text-muted)] mb-5">Test designs · no API</p>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {STYLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setStyle(s.id)}
            className={`px-3 py-1.5 text-xs rounded-full ${
              style === s.id ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div ref={ref} className="mx-auto w-full max-w-sm aspect-square relative">
        {style === 'orbit' && <Orbit />}
        {style === 'network' && <Network />}
        {style === 'petal' && <Petal />}
        {style === 'glow' && <Glow />}
        {style === 'spark' && <Spark />}
        {style === 'hud' && <Hud />}
      </div>

      <button
        onClick={download}
        className="mt-5 w-full py-3 text-sm font-medium text-white rounded-full"
        style={{ background: 'var(--accent)' }}
      >
        Download PNG
      </button>
      <p className="mt-3 text-xs text-center text-[var(--text-muted)]">@erthxn · circlepay.fun</p>
    </div>
  );
}

function Orbit() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden" style={{ background: 'linear-gradient(145deg, #dbe6ff, #f7f8fa)' }}>
      <div className="absolute inset-[18%] rounded-full border border-white/50" />
      <div className="absolute inset-[30%] rounded-full border border-white/30" />
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {MEMBERS.map((_, i) => {
          if (i === MEMBERS.length - 1) return null;
          const a1 = (i / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
          const a2 = ((i + 1) / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
          const r = 34;
          return (
            <path
              key={i}
              d={`M ${50 + Math.cos(a1) * r} ${50 + Math.sin(a1) * r} Q 50 50 ${50 + Math.cos(a2) * r} ${50 + Math.sin(a2) * r}`}
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
      <Center label="ER" hue={220} />
      {MEMBERS.map((m, i) => (
        <Node key={i} i={i} n={MEMBERS.length} r={34}>
          <div className="w-11 h-11 rounded-full border-2 border-white overflow-hidden shadow">{ph(m.hue, m.handle[0].toUpperCase())}</div>
          <div className="mt-1 text-[10px] font-semibold text-white bg-black/70 px-2 py-0.5 rounded-full">${m.amount.toFixed(2)}</div>
        </Node>
      ))}
      <Brand light />
    </div>
  );
}

function Network() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden" style={{ background: 'linear-gradient(180deg, #d8d8d8, #c4c4c4)' }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {MEMBERS.map((_, i) => {
          const a = (i / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
          const r = 32;
          return (
            <line
              key={i}
              x1="50"
              y1="50"
              x2={50 + Math.cos(a) * r}
              y2={50 + Math.sin(a) * r}
              stroke="#111"
              strokeWidth="0.6"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-black text-white flex flex-col items-center justify-center shadow-lg">
          <span className="text-xs font-bold tracking-wider">CIRCLE</span>
          <span className="text-[9px] opacity-70">PAY</span>
        </div>
      </div>
      {MEMBERS.map((m, i) => (
        <Node key={i} i={i} n={MEMBERS.length} r={32}>
          <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-medium shadow">
            ${m.amount.toFixed(0)}
          </div>
        </Node>
      ))}
      <Brand dark />
    </div>
  );
}

function Petal() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-[#111]">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {MEMBERS.map((m, i) => {
          const start = (i / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
          const end = ((i + 1) / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
          const r = 38;
          const x1 = 50 + Math.cos(start) * r;
          const y1 = 50 + Math.sin(start) * r;
          const x2 = 50 + Math.cos(end) * r;
          const y2 = 50 + Math.sin(end) * r;
          const light = i % 2 === 0;
          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={light ? '#f2f2f2' : '#3a3a3a'}
              stroke="#111"
              strokeWidth="0.8"
            />
          );
        })}
        <circle cx="50" cy="50" r="10" fill="#111" />
      </svg>
      {MEMBERS.map((m, i) => {
        const a = ((i + 0.5) / MEMBERS.length) * Math.PI * 2 - Math.PI / 2;
        const r = 26;
        return (
          <div
            key={i}
            className="absolute text-[10px] font-medium"
            style={{
              left: `${50 + Math.cos(a) * r}%`,
              top: `${50 + Math.sin(a) * r}%`,
              transform: 'translate(-50%, -50%)',
              color: i % 2 === 0 ? '#222' : '#eee',
            }}
          >
            ${m.amount.toFixed(0)}
          </div>
        );
      })}
      <Brand light />
    </div>
  );
}

function Glow() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden" style={{ background: '#1a1d28' }}>
      <div className="absolute inset-[14%] rounded-full border-[6px] border-[#22d3ee]/80" style={{ boxShadow: '0 0 24px #22d3ee, inset 0 0 20px rgba(34,211,238,0.25)' }} />
      <div className="absolute inset-[18%] rounded-full border border-white/10" />
      <Center label="ER" hue={190} />
      {MEMBERS.map((m, i) => (
        <Node key={i} i={i} n={MEMBERS.length} r={34}>
          <div className="w-11 h-11 rounded-full border-2 border-[#22d3ee] overflow-hidden" style={{ boxShadow: '0 0 10px #22d3ee' }}>
            {ph(m.hue, m.handle[0].toUpperCase())}
          </div>
          <div className="mt-1 text-[10px] font-semibold text-[#22d3ee]">${m.amount.toFixed(2)}</div>
        </Node>
      ))}
      <Brand light />
    </div>
  );
}

function Spark() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-black">
      <svg className="absolute inset-[10%] w-[80%] h-[80%]" viewBox="0 0 100 100">
        <path
          d="M50 4 L58 28 L50 22 L42 28 Z M96 50 L72 58 L78 50 L72 42 Z M50 96 L42 72 L50 78 L58 72 Z M4 50 L28 42 L22 50 L28 58 Z M82 18 L68 36 L74 28 L64 32 Z M82 82 L64 68 L74 72 L68 64 Z M18 82 L32 64 L26 72 L36 68 Z M18 18 L36 32 L26 28 L32 36 Z"
          fill="none"
          stroke="white"
          strokeWidth="1.2"
        />
        <circle cx="50" cy="50" r="28" fill="none" stroke="white" strokeWidth="0.4" opacity="0.4" />
      </svg>
      <Center label="ER" hue={0} dark />
      {MEMBERS.map((m, i) => (
        <Node key={i} i={i} n={MEMBERS.length} r={32}>
          <div className="w-10 h-10 rounded-full border border-white overflow-hidden">{ph(m.hue, m.handle[0].toUpperCase())}</div>
        </Node>
      ))}
      <Brand light />
    </div>
  );
}

function Hud() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-black text-white">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="white" strokeWidth="0.3" strokeDasharray="1.5 1.5" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="white" strokeWidth="0.3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
          const a = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={50 + Math.cos(a) * 38}
              y1={50 + Math.sin(a) * 38}
              x2={50 + Math.cos(a) * 42}
              y2={50 + Math.sin(a) * 42}
              stroke="white"
              strokeWidth="0.4"
            />
          );
        })}
      </svg>
      <Center label="ER" hue={0} dark />
      {MEMBERS.map((m, i) => (
        <Node key={i} i={i} n={MEMBERS.length} r={32}>
          <div className="w-8 h-8 rounded-full border border-white overflow-hidden">{ph(m.hue, m.handle[0].toUpperCase())}</div>
          <div className="mt-0.5 text-[8px] font-mono text-white/80">${m.amount.toFixed(0)}</div>
        </Node>
      ))}
      <div className="absolute top-3 left-3 text-[8px] font-mono opacity-60">CIRCLE / SCAN</div>
      <Brand light />
    </div>
  );
}

function Center({ label, hue, dark }: { label: string; hue: number; dark?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${dark ? 'border-white' : 'border-white'} shadow-md`}>
        {ph(hue, label)}
      </div>
    </div>
  );
}

function Node({
  i,
  n,
  r,
  children,
}: {
  i: number;
  n: number;
  r: number;
  children: React.ReactNode;
}) {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  const x = 50 + Math.cos(a) * r;
  const y = 50 + Math.sin(a) * r;
  return (
    <div
      className="absolute flex flex-col items-center z-20"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
    >
      {children}
    </div>
  );
}

function Brand({ light, dark }: { light?: boolean; dark?: boolean }) {
  return (
    <div
      className={`absolute bottom-3 right-3 text-right text-[10px] leading-tight ${
        light ? 'text-white' : dark ? 'text-black' : 'text-[var(--text)]'
      }`}
    >
      <div>@erthxn</div>
      <div className="opacity-70">circlepay.fun</div>
    </div>
  );
}

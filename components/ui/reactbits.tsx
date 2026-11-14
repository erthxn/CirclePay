'use client';
// React Bits style components (Squares, GradientText, BlurText, StarBorder, SpotlightCard), after reactbits.dev (MIT + Commons Clause).
import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Squares({ speed = 0.4, squareSize = 44, border = '#2a2400', hoverFill = '#2a2400' }: { speed?: number; squareSize?: number; border?: string; hoverFill?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  React.useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0, ox = 0, oy = 0, hover: { x: number; y: number } | null = null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    addEventListener('resize', resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sx = Math.floor(ox / squareSize) * squareSize, sy = Math.floor(oy / squareSize) * squareSize;
      for (let x = sx; x < canvas.width + squareSize; x += squareSize) {
        for (let y = sy; y < canvas.height + squareSize; y += squareSize) {
          const px = x - (ox % squareSize), py = y - (oy % squareSize);
          if (hover && Math.floor((hover.x + (ox % squareSize)) / squareSize) === Math.floor((x - sx) / squareSize) && Math.floor((hover.y + (oy % squareSize)) / squareSize) === Math.floor((y - sy) / squareSize)) {
            ctx.fillStyle = hoverFill; ctx.fillRect(px, py, squareSize, squareSize);
          }
          ctx.strokeStyle = border; ctx.strokeRect(px, py, squareSize, squareSize);
        }
      }
      const g = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.hypot(canvas.width, canvas.height) / 2);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, '#000');
      ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    const tick = () => { if (!reduce) { ox = (ox - speed + squareSize) % squareSize; oy = (oy - speed + squareSize) % squareSize; } draw(); raf = requestAnimationFrame(tick); };
    tick();
    const move = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); hover = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    addEventListener('mousemove', move);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('mousemove', move); };
  }, [speed, squareSize, border, hoverFill]);
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}

export function GradientText({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn('inline-block bg-clip-text text-transparent [animation:gradient-x_5s_ease_infinite]', className)}
      style={{ backgroundImage: 'linear-gradient(90deg,#FFD400,#fff3a3,#FFD400,#ffb800,#FFD400)', backgroundSize: '300% 100%' }}
    >
      {children}
    </span>
  );
}

export function BlurText({ text, className, delay = 90 }: { text: string; className?: string; delay?: number }) {
  return (
    <span className={cn('flex flex-wrap justify-center gap-x-[0.28em]', className)} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ filter: 'blur(10px)', opacity: 0, y: -24 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: (i * delay) / 1000, ease: 'easeOut' }}
          className="inline-block"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

export function StarBorder({ children, className, color = '#FFD400', ...props }: React.ComponentProps<'button'> & { color?: string }) {
  return (
    <button className={cn('relative inline-block overflow-hidden rounded-[20px] py-px', className)} {...props}>
      <div className="absolute right-[-250%] bottom-[-11px] z-0 h-1/2 w-[300%] animate-[star-bottom_4s_linear_infinite_alternate] rounded-full opacity-70" style={{ background: `radial-gradient(circle, ${color}, transparent 10%)` }} />
      <div className="absolute top-[-10px] left-[-250%] z-0 h-1/2 w-[300%] animate-[star-top_4s_linear_infinite_alternate] rounded-full opacity-70" style={{ background: `radial-gradient(circle, ${color}, transparent 10%)` }} />
      <div className="relative z-[1] rounded-[20px] border border-zinc-800 bg-gradient-to-b from-black to-zinc-900 px-6 py-3 text-center text-base font-semibold text-[#FFD400]">{children}</div>
    </button>
  );
}

export function SpotlightCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const [o, setO] = React.useState(0);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); setPos({ x: e.clientX - r.left, y: e.clientY - r.top }); }}
      onMouseEnter={() => setO(0.6)}
      onMouseLeave={() => setO(0)}
      className={cn('relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 p-7', className)}
    >
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-500" style={{ opacity: o, background: `radial-gradient(circle at ${pos.x}px ${pos.y}px, rgba(255,212,0,0.22), transparent 80%)` }} />
      <div className="relative">{children}</div>
    </div>
  );
}

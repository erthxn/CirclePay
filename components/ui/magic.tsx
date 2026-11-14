'use client';
// Magic UI components (BlurFade, ShimmerButton, BorderBeam, DotPattern), adapted from magicui.design (MIT).
import * as React from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

export function BlurFade({ children, className, delay = 0, duration = 0.5, blur = '8px', yOffset = 8 }: { children: React.ReactNode; className?: string; delay?: number; duration?: number; blur?: string; yOffset?: number }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true, margin: '-30px' });
  return (
    <motion.div
      ref={ref}
      initial={{ y: yOffset, opacity: 0, filter: `blur(${blur})` }}
      animate={inView ? { y: 0, opacity: 1, filter: 'blur(0px)' } : undefined}
      transition={{ delay: 0.04 + delay, duration, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ShimmerButton({ children, className, ...props }: React.ComponentProps<'button'>) {
  return (
    <button
      className={cn('group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden rounded-full border border-black/10 px-6 py-3 whitespace-nowrap text-black [background:#FFD400] transition-transform duration-300 ease-in-out active:translate-y-px', className)}
      style={{ ['--spread' as string]: '90deg', ['--shimmer-color' as string]: '#fff', ['--cut' as string]: '0.1em' }}
      {...props}
    >
      <div className="@container-[size] absolute inset-0 -z-30 overflow-visible blur-[2px]">
        <div className="absolute inset-0 h-[100cqh] animate-[shimmer-slide_3s_ease-in-out_infinite_alternate] aspect-[1] rounded-none [mask:none]">
          <div className="absolute -inset-full w-auto rotate-0 animate-[spin-around_6s_linear_infinite] [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      <span className="relative z-10 text-sm font-semibold">{children}</span>
      <div className="absolute inset-(--cut) -z-20 rounded-full [background:#FFD400]" />
    </button>
  );
}

export function BorderBeam({ size = 90, duration = 7, delay = 0, colorFrom = '#FFD400', colorTo = '#fff3a3', className }: { size?: number; duration?: number; delay?: number; colorFrom?: string; colorTo?: string; className?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn('absolute aspect-square bg-gradient-to-l from-[var(--color-from)] via-[var(--color-to)] to-transparent', className)}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ['--color-from' as string]: colorFrom, ['--color-to' as string]: colorTo }}
        initial={{ offsetDistance: '0%' }}
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ repeat: Infinity, ease: 'linear', duration, delay: -delay }}
      />
    </div>
  );
}

export function DotPattern({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]', className)}
      style={{ backgroundImage: 'radial-gradient(rgba(160,120,0,0.30) 1px, transparent 1.2px)', backgroundSize: '22px 22px' }}
    />
  );
}

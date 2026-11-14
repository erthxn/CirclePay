'use client';
// Aceternity UI components (Spotlight, BackgroundBeams), adapted from ui.aceternity.com.
import * as React from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function Spotlight({ className, fill = '#FFD400' }: { className?: string; fill?: string }) {
  return (
    <svg
      className={cn('pointer-events-none absolute z-[1] h-[169%] w-[138%] animate-[spotlight_2s_ease_.75s_1_forwards] opacity-0 lg:w-[84%]', className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#spot-filter)">
        <ellipse cx="1924.71" cy="273.501" rx="1924.71" ry="273.501" transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)" fill={fill} fillOpacity="0.45" />
      </g>
      <defs>
        <filter id="spot-filter" x="0.860352" y="0.838989" width="3785.16" height="2840.26" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

const PATHS = Array.from({ length: 22 }, (_, i) => {
  const o = i * 14;
  return `M-${380 - o} -${189 + i * 6}C-${380 - o} -${189 + i * 6} -${312 - o} ${216 - i * 6} ${152 - o} ${343 - i * 3}C${616 - o} ${470 + i * 4} ${684 - o * 0.2} ${875 - i * 6} ${684 - o * 0.2} ${875 - i * 6}`;
});

export function BackgroundBeams({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 z-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]', className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 696 316" fill="none" preserveAspectRatio="xMidYMin slice" xmlns="http://www.w3.org/2000/svg">
        {PATHS.map((d, i) => (
          <path key={'b' + i} d={d} stroke="rgba(180,130,0,0.14)" strokeWidth="0.5" transform="translate(350 0)" />
        ))}
        <g transform="translate(350 0)">
          {PATHS.map((d, i) => (
            <path key={'a' + i} d={d} stroke={`url(#beam-${i})`} strokeOpacity="0.5" strokeWidth="0.6" />
          ))}
        </g>
        <defs>
          {PATHS.map((_, i) => (
            <motion.linearGradient
              key={i}
              id={`beam-${i}`}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
              animate={{ x1: ['0%', '100%'], x2: ['0%', '95%'], y1: ['0%', '100%'], y2: ['0%', `${93 + (i % 5) * 2}%`] }}
              transition={{ duration: 8 + (i % 7), ease: 'easeInOut', repeat: Infinity, delay: (i % 9) * 0.6 }}
            >
              <stop stopColor="#FFD400" stopOpacity="0" />
              <stop stopColor="#d4a900" />
              <stop offset="32.5%" stopColor="#FFD400" />
              <stop offset="100%" stopColor="#FFD400" stopOpacity="0" />
            </motion.linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}

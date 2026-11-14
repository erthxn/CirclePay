'use client';
import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { arcSvg, cleanHandle, grokUrl } from '@/lib/arc';
import { VARIANTS } from '@/components/content';

export function useCircle() {
  const [raw, setRaw] = useState('');
  const handle = cleanHandle(raw);
  const id = useId().replace(/[^a-z0-9]/gi, '');
  const svg = useMemo(() => arcSvg(handle, 'cp' + id), [handle, id]);
  const submit = (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    if (typeof window !== 'undefined') window.open(grokUrl(handle), '_blank', 'noopener,noreferrer');
  };
  return { raw, setRaw, handle, svg, submit };
}

/** The Arc card, rendered by the spec's reference renderer (static final frame). */
export function ArcPreview({ svg, className = '' }: { svg: string; className?: string }) {
  return (
    <div
      className={'arc-preview ' + className}
      role="img"
      aria-label="Example CirclePay circle card"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="190 370 1560 1260" className={className} fill="currentColor" aria-hidden="true">
      <path d="M1400 795 H1106 A355 355 0 1 0 1085 1230 H1390 A615 615 0 1 1 1400 795 Z" />
      <rect x="997" y="855" width="740" height="152" rx="76" />
      <rect x="1242" y="1057" width="352" height="120" rx="60" />
    </svg>
  );
}

/** Black tile with the yellow mark (same as logo.svg), readable on light backgrounds. */
export function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <span className={'inline-flex shrink-0 items-center justify-center rounded-[28%] bg-[#0a0a0a] ' + className}>
      <Mark className="size-[68%] text-[#FFD400]" />
    </span>
  );
}

/** Tiny fixed route switcher shown on every variant. */
export function Switcher({ current }: { current: string }) {
  return (
    <nav
      aria-label="Styles"
      className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 text-xs shadow-sm backdrop-blur"
    >
      <Link href="/" className="rounded-full px-3 py-1.5 text-black/60 hover:text-black">All</Link>
      {VARIANTS.map((v) => (
        <Link
          key={v.key}
          href={'/' + v.key}
          aria-label={v.name}
          aria-current={v.key === current ? 'page' : undefined}
          className={
            'rounded-full px-3 py-1.5 font-medium uppercase ' +
            (v.key === current ? 'bg-[#FFD400] text-black' : 'text-black/60 hover:text-black')
          }
        >
          {v.key}
        </Link>
      ))}
    </nav>
  );
}

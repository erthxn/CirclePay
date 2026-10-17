'use client';

import { memo, useState, useCallback } from 'react';
import type { BgCard } from '@/lib/studio/types';
import { useStudioSelector, useDispatch, useLazyMount } from './useStudioState';

interface Props {
  bgCard: BgCard;
  /** When true, clicking the tile selects it as the bg card. When false, no selection (just preview). */
  selectable?: boolean;
}

/**
 * BG card tile — pure background design (no member tiles, no connectors).
 * Lazy-mount via IntersectionObserver, lazy-load PNG.
 */
const BgCardTile = memo(function BgCardTile({ bgCard, selectable = true }: Props) {
  const selectedId = useStudioSelector((s) => s.selectedBgCardId);
  const dispatch = useDispatch();
  const { ref, mounted } = useLazyMount<HTMLButtonElement>('300px 0px');
  const [loaded, setLoaded] = useState(false);

  const selected = selectable && selectedId === bgCard.id;
  const select = useCallback(() => {
    if (selectable) dispatch({ type: 'SELECT_BG_CARD', bgCardId: bgCard.id });
  }, [dispatch, bgCard.id, selectable]);

  return (
    <button
      ref={ref}
      onClick={select}
      className="studio-tap relative w-full aspect-square rounded-xl overflow-hidden transition-transform active:scale-95"
      style={{
        willChange: mounted ? 'transform' : undefined,
        transform: mounted ? 'translateZ(0)' : undefined,
        boxShadow: selected ? '0 0 0 3px var(--accent), 0 4px 12px rgba(13,92,255,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
      }}
      aria-label={`Select ${bgCard.name} background`}
      aria-pressed={selected}
    >
      <img
        src={`/previews/bg_cards/${bgCard.id}.png`}
        alt={bgCard.name}
        loading="lazy"
        decoding="async"
        width={400}
        height={400}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-dark)]">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--bg)] border-t-[var(--accent)] animate-spin" />
        </div>
      )}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
          <div className="text-[10px] text-white font-medium leading-tight line-clamp-1">{bgCard.name}</div>
          <div className="text-[8px] text-white/70 leading-tight">{bgCard.pattern ?? 'pure'}</div>
        </div>
      )}
      {selected && (
        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
});

export default BgCardTile;

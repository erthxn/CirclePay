'use client';

import { memo, useState, useCallback } from 'react';
import type { Card } from '@/lib/studio/types';
import { useDispatch, useLazyMount } from './useStudioState';

interface Props {
  card: Card;
  /** Selected card id, passed down from the gallery so each tile doesn't
   *  subscribe to the store individually (otherwise 250 tiles each
   *  re-render on every selection change — the cause of bug #3). */
  selectedId: string | null;
}

/**
 * Single gallery tile. Renders a PNG thumbnail with native lazy loading,
 * only mounts interactive overlay (select button + active ring) when scrolled into view.
 */
const CardTile = memo(function CardTile({ card, selectedId }: Props) {
  const dispatch = useDispatch();
  const { ref, mounted } = useLazyMount<HTMLButtonElement>('300px 0px');
  const [imgLoaded, setImgLoaded] = useState(false);

  const selected = selectedId === card.id;
  const select = useCallback(() => dispatch({ type: 'SELECT_CARD', cardId: card.id }), [dispatch, card.id]);

  return (
    <button
      ref={ref}
      onClick={select}
      data-card-tile={card.id}
      className="studio-tap relative w-full aspect-square rounded-xl overflow-hidden bg-[var(--bg-dark)] transition-transform active:scale-95"
      style={{
        willChange: mounted ? 'transform' : undefined,
        transform: mounted ? 'translateZ(0)' : undefined,
        boxShadow: selected ? '0 0 0 3px var(--accent), 0 4px 12px rgba(13,92,255,0.25)' : undefined,
      }}
      aria-label={`Select ${card.name}`}
      aria-pressed={selected}
    >
      {/* Lazy-loaded PNG thumbnail */}
      <img
        src={`/previews/cards/${card.id}.png`}
        alt={card.name}
        loading="lazy"
        decoding="async"
        width={400}
        height={400}
        onLoad={() => setImgLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!imgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--text-muted)]">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-dark)] border-t-[var(--accent)] animate-spin" />
        </div>
      )}
      {/* Name label - only render after tile is in view */}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
          <div className="text-[10px] text-white font-medium leading-tight line-clamp-1">{card.name}</div>
          <div className="text-[8px] text-white/70 leading-tight">{card.subcategory}</div>
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

export default CardTile;

'use client';

import { memo, useState, useCallback } from 'react';
import type { Connector } from '@/lib/studio/types';
import { useDispatch, useLazyMount } from './useStudioState';

interface Props {
  connector: Connector;
  selectedId: string | null;
}

const ConnectorTile = memo(function ConnectorTile({ connector, selectedId }: Props) {
  const dispatch = useDispatch();
  const { ref, mounted } = useLazyMount<HTMLButtonElement>('300px 0px');
  const [loaded, setLoaded] = useState(false);
  const selected = selectedId === connector.id;
  const select = useCallback(() => dispatch({ type: 'SELECT_CONNECTOR', id: connector.id }), [dispatch, connector.id]);

  return (
    <button
      ref={ref}
      onClick={select}
      className="studio-tap relative w-full aspect-square rounded-xl overflow-hidden transition-transform active:scale-95"
      style={{
        willChange: mounted ? 'transform' : undefined,
        transform: mounted ? 'translateZ(0)' : undefined,
        boxShadow: selected
          ? '0 0 0 3px var(--accent), 0 4px 12px rgba(13,92,255,0.25)'
          : '0 0 0 1px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        background: '#0F0F1A',
      }}
      aria-label={`Select ${connector.name} connector`}
      aria-pressed={selected}
    >
      <img
        src={`/previews/connectors/${connector.id}.svg`}
        alt={connector.name}
        loading="lazy"
        decoding="async"
        width={100}
        height={100}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-dark)]">
          <div className="w-6 h-6 rounded-full border-2 border-[var(--bg)] border-t-[var(--accent)] animate-spin" />
        </div>
      )}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
          <div className="text-[9px] text-white font-medium leading-tight line-clamp-1">{connector.name}</div>
        </div>
      )}
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
            <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  );
});

export default ConnectorTile;

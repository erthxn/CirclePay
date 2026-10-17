'use client';

import { memo, useState, useCallback, useMemo, useDeferredValue } from 'react';
import type { Connector } from '@/lib/studio/types';
import { useStudioSelector, useDispatch, useLazyMount } from './useStudioState';

interface TileProps {
  conn: Connector;
  selectedId: string | null;
}

const ConnectorTile = memo(function ConnectorTile({ conn, selectedId }: TileProps) {
  const dispatch = useDispatch();
  const { ref, mounted } = useLazyMount<HTMLButtonElement>('300px 0px');
  const [loaded, setLoaded] = useState(false);
  const selected = selectedId === conn.id;
  const select = useCallback(() => dispatch({ type: 'SELECT_CONNECTOR', connectorId: conn.id }), [dispatch, conn.id]);

  return (
    <button
      ref={ref}
      onClick={select}
      className="studio-tap relative w-full aspect-square rounded-xl overflow-hidden bg-[#1A1A2E] transition-transform active:scale-95"
      style={{
        willChange: mounted ? 'transform' : undefined,
        transform: mounted ? 'translateZ(0)' : undefined,
        boxShadow: selected ? '0 0 0 3px var(--accent), 0 4px 12px rgba(13,92,255,0.25)' : undefined,
      }}
      aria-label={`Select ${conn.name} connector`}
      aria-pressed={selected}
    >
      <img
        src={`/previews/connectors/${conn.id}.png`}
        alt={conn.name}
        loading="lazy"
        decoding="async"
        width={400}
        height={400}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
        </div>
      )}
      {mounted && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
          <div className="text-[10px] text-white font-medium leading-tight line-clamp-1">{conn.name}</div>
          <div className="text-[8px] text-white/70 leading-tight">{conn.subcategory}</div>
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

const ConnectorPicker = memo(function ConnectorPicker() {
  const connectors = useStudioSelector((s) => s.connectors);
  const rawFilter = useStudioSelector((s) => s.galleryFilter);
  const selectedConnectorId = useStudioSelector((s) => s.selectedConnectorId);
  const activeCategory = useStudioSelector((s) => s.activeCategory);
  const deferredFilter = useDeferredValue(rawFilter);
  const dispatch = useDispatch();
  const setActiveCategory = useCallback((cat: string | null) => dispatch({ type: 'SET_ACTIVE_CATEGORY', category: cat }), [dispatch]);

  const grouped = useMemo(() => {
    const q = deferredFilter.trim().toLowerCase();
    const filtered = q
      ? connectors.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.subcategory.toLowerCase().includes(q) ||
            c.tags.some((t: string) => t.toLowerCase().includes(q)),
        )
      : connectors;
    const map = new Map<string, typeof connectors>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [connectors, deferredFilter]);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button
          onClick={() => setActiveCategory(null)}
          className={`studio-tap px-2.5 py-1 text-[11px] rounded-full ${activeCategory === null ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
        >
          All
        </button>
        {grouped.map(([cat, list]) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`studio-tap px-2.5 py-1 text-[11px] rounded-full ${activeCategory === cat ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
          >
            {cat} ({list.length})
          </button>
        ))}
      </div>
      {grouped
        .filter(([cat]) => activeCategory === null || activeCategory === cat)
        .map(([cat, list]) => (
          <section key={cat} className="mb-6">
            <h4 className="text-[11px] text-[var(--text-muted)] mb-2 px-1">{cat}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {list.map((c) => (
                <ConnectorTile key={c.id} conn={c} selectedId={selectedConnectorId} />
              ))}
            </div>
          </section>
        ))}
    </div>
  );
});

export default ConnectorPicker;

'use client';

import { memo, useMemo, useDeferredValue, useCallback } from 'react';
import { useStudioSelector, useDispatch } from './useStudioState';
import ConnectorTile from './ConnectorTile';

const ConnectorGallery = memo(function ConnectorGallery() {
  const connectors = useStudioSelector((s) => s.connectors);
  const rawFilter = useStudioSelector((s) => s.galleryFilter);
  const selectedConnId = useStudioSelector((s) => s.selectedConnId);
  const activeCategory = useStudioSelector((s) => s.activeConnCategory);
  const dispatch = useDispatch();
  const deferredFilter = useDeferredValue(rawFilter);
  const setCategory = useCallback((c: string | null) => dispatch({ type: 'SET_CONN_CATEGORY', category: c }), [dispatch]);

  const grouped = useMemo(() => {
    const q = deferredFilter.trim().toLowerCase();
    const filtered = q
      ? connectors.filter((c) =>
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
      {/* Category chips - horizontal scroll on mobile */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          onClick={() => setCategory(null)}
          className={`studio-tap px-2 py-1 text-[10px] rounded-full ${activeCategory === null ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
        >
          All
        </button>
        {grouped.map(([cat]) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`studio-tap px-2 py-1 text-[10px] rounded-full ${activeCategory === cat ? 'bg-[var(--accent)] text-white' : 'neu-btn text-[var(--text)]'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      {grouped.map(([cat, list]) => {
        if (activeCategory && activeCategory !== cat) return null;
        return (
          <section key={cat} className="mb-4">
            <p className="text-[10px] text-[var(--text-muted)] mb-1.5 px-1">{cat}</p>
            <div className="grid grid-cols-2 gap-1.5">
              {list.map((c) => (
                <ConnectorTile key={c.id} connector={c} selectedId={selectedConnId} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});

export default ConnectorGallery;

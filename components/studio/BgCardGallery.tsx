'use client';

import { memo, useMemo, useDeferredValue } from 'react';
import { useStudioSelector } from './useStudioState';
import BgCardTile from './BgCardTile';

interface Props {
  onSelectClose?: () => void; // for mobile modal use
}

const BgCardGallery = memo(function BgCardGallery({ onSelectClose }: Props) {
  const bgCards = useStudioSelector((s) => s.bgCards);
  const rawFilter = useStudioSelector((s) => s.galleryFilter);
  const selectedBgId = useStudioSelector((s) => s.selectedBgId);
  const activeCategory = useStudioSelector((s) => s.activeBgCategory);
  const deferredFilter = useDeferredValue(rawFilter);

  const grouped = useMemo(() => {
    const q = deferredFilter.trim().toLowerCase();
    const filtered = q
      ? bgCards.filter((c) =>
          c.name.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          (c.pattern ?? '').toLowerCase().includes(q) ||
          c.tags.some((t: string) => t.toLowerCase().includes(q)),
        )
      : bgCards;
    const map = new Map<string, typeof bgCards>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [bgCards, deferredFilter]);

  if (grouped.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        No backgrounds match “{deferredFilter}”.
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([cat, list]) => {
        if (activeCategory && activeCategory !== cat) return null;
        return (
          <section key={cat} className="mb-5">
            <p className="text-[11px] text-[var(--text-muted)] mb-2 px-1 sticky top-0 bg-[var(--bg)] py-1 z-10">{cat}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {list.map((c) => (
                <BgCardTile key={c.id} bgCard={c} selectedId={selectedBgId} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});

export default BgCardGallery;

'use client';

import { memo, useMemo, useDeferredValue } from 'react';
import type { BgCard } from '@/lib/studio/types';
import { useStudioSelector } from './useStudioState';
import BgCardTile from './BgCardTile';

interface Props {
  selectable?: boolean;
}

/**
 * BG card gallery — groups 200 bg cards by category.
 * Subscribes to selectedBgCardId ONCE (parent gallery) and passes it down as prop
 * — fixes the 200-tile re-render lag (bug #3).
 */
const BgCardGallery = memo(function BgCardGallery({ selectable = true }: Props) {
  const bgCards = useStudioSelector((s) => s.bgCards);
  const rawFilter = useStudioSelector((s) => s.galleryFilter);
  const selectedBgCardId = useStudioSelector((s) => s.selectedBgCardId);
  const deferredFilter = useDeferredValue(rawFilter);

  const grouped = useMemo(() => {
    const q = deferredFilter.trim().toLowerCase();
    const filtered = q
      ? bgCards.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.subcategory.toLowerCase().includes(q) ||
            c.tags.some((t: string) => t.toLowerCase().includes(q)) ||
            (c.pattern ?? '').toLowerCase().includes(q),
        )
      : bgCards;
    const map = new Map<string, BgCard[]>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [bgCards, deferredFilter]);

  if (grouped.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        No background cards match “{deferredFilter}”.
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([cat, list]) => (
        <section key={cat} className="mb-8">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h3 className="text-sm font-semibold text-[var(--text)]">{cat}</h3>
            <span className="text-[10px] text-[var(--text-muted)]">{list.length} designs</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            {list.map((c) => (
              <BgCardTile key={c.id} bgCard={c} selectedId={selectable ? selectedBgCardId : null} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
});

export default BgCardGallery;

'use client';

import { memo, useMemo, useDeferredValue } from 'react';
import { useStudioSelector } from './useStudioState';
import CategorySection from './CategorySection';

/**
 * CardGallery groups cards by category and renders each category as a section.
 * Filter input is deferred via useDeferredValue to keep typing responsive.
 *
 * Note: the gallery subscribes to selectedCardId ONCE and passes it down as
 * a prop to each CardTile — this is the fix for the mobile lag (bug #3).
 * Previously each of the 250 tiles subscribed to selectedCardId individually,
 * causing 250 re-renders on every selection change.
 */
const CardGallery = memo(function CardGallery() {
  const cards = useStudioSelector((s) => s.cards);
  const rawFilter = useStudioSelector((s) => s.galleryFilter);
  const selectedCardId = useStudioSelector((s) => s.selectedCardId);
  const deferredFilter = useDeferredValue(rawFilter);

  const grouped = useMemo(() => {
    const q = deferredFilter.trim().toLowerCase();
    const filtered = q
      ? cards.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q) ||
            c.subcategory.toLowerCase().includes(q) ||
            c.tags.some((t: string) => t.toLowerCase().includes(q)),
        )
      : cards;
    const map = new Map<string, typeof cards>();
    for (const c of filtered) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [cards, deferredFilter]);

  if (grouped.length === 0) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] text-sm">
        No cards match “{deferredFilter}”.
      </div>
    );
  }

  return (
    <div>
      {grouped.map(([cat, list]) => (
        <CategorySection key={cat} category={cat} cards={list} selectedId={selectedCardId} />
      ))}
    </div>
  );
});

export default CardGallery;

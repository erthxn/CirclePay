'use client';

import { memo, useMemo } from 'react';
import type { Card } from '@/lib/studio/types';
import CardTile from './CardTile';

interface Props {
  category: string;
  cards: Card[];
}

const CategorySection = memo(function CategorySection({ category, cards }: Props) {
  const sorted = useMemo(() => cards.slice().sort((a, b) => a.name.localeCompare(b.name)), [cards]);
  return (
    <section id={`cat-${category.replace(/\s+/g, '-').toLowerCase()}`} className="mb-8">
      <div className="flex items-baseline justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-[var(--text)]">{category}</h3>
        <span className="text-[10px] text-[var(--text-muted)]">{cards.length} designs</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
        {sorted.map((c) => (
          <CardTile key={c.id} card={c} />
        ))}
      </div>
    </section>
  );
});

export default CategorySection;

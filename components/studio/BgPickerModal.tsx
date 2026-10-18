'use client';

import type { BgCard } from '@/lib/studio/types';

interface Props {
  cards: BgCard[];
  selectedId: string;
  onPick: (id: string) => void;
  onClose: () => void;
  search: string;
  onSearch: (q: string) => void;
}

export default function BgPickerModal({ cards, selectedId, onPick, onClose, search, onSearch }: Props) {
  // Filter cards by search
  const filtered = search.trim()
    ? cards.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        (c.pattern ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : cards;

  // Group by category
  const grouped = filtered.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, BgCard[]>);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ animation: 'studio-fade-up 0.2s ease-out' }}
        onClick={onClose}
      />
      <div
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] max-w-[92vw] p-6 flex flex-col"
        style={{
          background: 'var(--bg)',
          boxShadow: '-12px 0 32px rgba(0,0,0,0.12)',
          animation: 'studio-slide-in-right 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-[var(--text)]">Pick a background</h3>
          <button
            onClick={onClose}
            className="studio-tap neu-btn w-9 h-9 flex items-center justify-center text-lg text-[var(--text-muted)]"
            aria-label="Close"
          >×</button>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search 150 backgrounds…"
          className="neu-input w-full px-3 py-2.5 text-sm mb-3"
        />
        <div className="flex-1 overflow-y-auto -mr-2 pr-2">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat} className="mb-5">
              <p className="text-[11px] text-[var(--text-muted)] mb-2 sticky top-0 bg-[var(--bg)] py-1">{cat}</p>
              <div className="grid grid-cols-3 gap-2">
                {list.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onPick(c.id)}
                    className="studio-tap relative aspect-square rounded-lg overflow-hidden transition-transform active:scale-95"
                    style={{
                      boxShadow: selectedId === c.id ? '0 0 0 2px var(--accent)' : '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                    aria-label={`Pick ${c.name}`}
                  >
                    <img
                      src={`/previews/bg_cards/${c.id}.svg`}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 px-1.5 py-0.5 bg-gradient-to-t from-black/60 to-transparent">
                      <div className="text-[9px] text-white font-medium leading-tight truncate">{c.name}</div>
                    </div>
                    {selectedId === c.id && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
                        <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-[var(--text-muted)] py-12">No backgrounds match “{search}”.</p>
          )}
        </div>
      </div>
    </div>
  );
}

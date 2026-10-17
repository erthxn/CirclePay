import type { Metadata } from 'next';
import StudioClient from '@/components/studio/StudioClient';
import StudioNav from '@/components/studio/StudioNav';
import { parseCards, parseConnectors, parseBgCards } from '@/lib/studio/parse';
import cardsJson from '@/public/data/cards.json';
import connectorsJson from '@/public/data/connectors.json';
import bgCardsJson from '@/public/data/bg_cards.json';

export const metadata: Metadata = {
  title: 'CirclePay Studio — Templates',
  description: 'Pre-built combinations: card + background + connector, ready to use.',
};

export const dynamic = 'force-static';

export default function TemplatesPage() {
  const cards = parseCards(cardsJson);
  const connectors = parseConnectors(connectorsJson);
  const bgCards = parseBgCards(bgCardsJson);
  return (
    <>
      <div className="px-4 sm:px-5 max-w-7xl mx-auto mb-5">
        <h1
          className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight"
          style={{ animation: 'studio-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          Templates
        </h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
          Pre-built combinations: card + background + connector, ready to use as a starting point.
        </p>
      </div>
      <div className="px-4 sm:px-5 max-w-7xl mx-auto">
        <StudioNav />
      </div>
      <TemplatesGallery cards={cards} bgCards={bgCards} connectors={connectors} />
    </>
  );
}

function TemplatesGallery({ cards, bgCards, connectors }: { cards: any[]; bgCards: any[]; connectors: any[] }) {
  // Curated combinations — pick 12 standout templates
  const templates = [
    { name: 'Midnight Orbit', card: cards[0], bg: bgCards[100], conn: connectors[2] },
    { name: 'Neon Halo', card: cards[60], bg: bgCards[80], conn: connectors[20] },
    { name: 'Golden Constellation', card: cards[10], bg: bgCards[44], conn: connectors[5] },
    { name: 'Aurora Spokes', card: cards[120], bg: bgCards[40], conn: connectors[1] },
    { name: 'Cosmic Radar', card: cards[180], bg: bgCards[42], conn: connectors[3] },
    { name: 'Glass Neural', card: cards[30], bg: bgCards[140], conn: connectors[60] },
    { name: 'Diamond Lattice', card: cards[200], bg: bgCards[160], conn: connectors[50] },
    { name: 'Holographic Filigree', card: cards[225], bg: bgCards[150], conn: connectors[40] },
    { name: 'Vintage Orbit', card: cards[240], bg: bgCards[24], conn: connectors[10] },
    { name: 'Pastel Ribbon', card: cards[160], bg: bgCards[120], conn: connectors[55] },
    { name: 'Carbon Steel', card: cards[80], bg: bgCards[5], conn: connectors[70] },
    { name: 'Coral Wave', card: cards[100], bg: bgCards[1], conn: connectors[63] },
  ];
  return (
    <div className="px-4 sm:px-5 max-w-7xl mx-auto mt-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t, i) => (
          <a
            key={i}
            href={`/studio/custom?c=${t.card.id}&b=${t.bg.id}&n=${t.conn.id}`}
            className="studio-tap group block neu-raised rounded-2xl overflow-hidden transition-transform hover:scale-[1.02]"
            style={{ animation: `studio-fade-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.05}s both` }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2">
                <img
                  src={`/previews/bg_cards/${t.bg.id}.png`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <img
                  src={`/previews/cards/${t.card.id}.png`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover mix-blend-screen opacity-80"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{t.name}</span>
                <span className="text-[10px] text-white/70 group-hover:text-white transition-colors">Use →</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

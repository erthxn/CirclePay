import type { Metadata } from 'next';
import StudioClient from '@/components/studio/StudioClient';
import StudioNav from '@/components/studio/StudioNav';
import { parseCards, parseConnectors, parseBgCards } from '@/lib/studio/parse';
import cardsJson from '@/public/data/cards.json';
import connectorsJson from '@/public/data/connectors.json';
import bgCardsJson from '@/public/data/bg_cards.json';

export const metadata: Metadata = {
  title: 'CirclePay Studio — Custom Editor',
  description: 'Customize your card design with full control: gradient stops, stroke, marks, members.',
};

export const dynamic = 'force-static';

export default function CustomPage() {
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
          Custom
        </h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">
          Pick a card + background + connector on the left, then tweak everything on the right.
        </p>
      </div>
      <div className="px-4 sm:px-5 max-w-7xl mx-auto">
        <StudioNav />
      </div>
      <div className="mt-5">
        <StudioClient
          cards={cards}
          connectors={connectors}
          bgCards={bgCards}
          activeLibrary="cards"
          showEditor
        />
      </div>
    </>
  );
}

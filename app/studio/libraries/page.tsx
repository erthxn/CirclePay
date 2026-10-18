import type { Metadata } from 'next';
import Link from 'next/link';
import StudioClient from '@/components/studio/StudioClient';
import StudioNav from '@/components/studio/StudioNav';
import { parseCards, parseConnectors, parseBgCards } from '@/lib/studio/parse';
import cardsJson from '@/public/data/cards.json';
import connectorsJson from '@/public/data/connectors.json';
import bgCardsJson from '@/public/data/bg_cards.json';
import { LibrariesTabs } from '@/components/studio/LibraryTabs';

export const metadata: Metadata = {
  title: 'CirclePay Studio — Libraries',
  description: 'Browse 250 card designs, 200 background designs, and 100 connector wires.',
};

// CRITICAL: this page MUST be dynamic — it reads `searchParams.type` at runtime
// to switch between the cards/bg/connectors library. With force-static, the
// searchParams are captured at build time and the bg tab never renders.
// (Bug found via agent-browser testing against the deployed site.)
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: { type?: string };
}

export default function LibrariesPage({ searchParams }: PageProps) {
  const type = (searchParams.type === 'bg' || searchParams.type === 'connectors') ? searchParams.type : 'cards';
  const cards = parseCards(cardsJson);
  const connectors = parseConnectors(connectorsJson);
  const bgCards = parseBgCards(bgCardsJson);

  const subtitles: Record<string, string> = {
    cards: 'Browse 250 premium card designs (gradient + layout + mark)',
    bg: 'Browse 200 premium background designs (no member tiles — pure bg)',
    connectors: 'Browse 100 connector wire designs',
  };

  return (
    <>
      <div className="px-4 sm:px-5 max-w-7xl mx-auto mb-5">
        <h1
          className="text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight"
          style={{ animation: 'studio-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          Libraries
        </h1>
        <p className="text-[12px] text-[var(--text-muted)] mt-0.5">{subtitles[type]}</p>
      </div>
      <div className="px-4 sm:px-5 max-w-7xl mx-auto">
        <StudioNav />
        <LibrariesTabs active={type} />
      </div>
      <div className="mt-5">
        <StudioClient
          cards={cards}
          connectors={connectors}
          bgCards={bgCards}
          activeLibrary={type as 'cards' | 'bg' | 'connectors'}
        />
      </div>
    </>
  );
}

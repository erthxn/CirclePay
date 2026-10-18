import type { Metadata } from 'next';
import StudioClient from '@/components/studio/StudioClient';
import StudioNav from '@/components/studio/StudioNav';
import { parseBgCards, parseConnectors } from '@/lib/studio/parse';
import bgCardsJson from '@/public/data/bg_cards.json';
import connectorsJson from '@/public/data/connectors.json';

export const metadata: Metadata = {
  title: 'CirclePay Studio — Premium Card Designer',
  description: '150 premium backgrounds + 100 unique connectors + full customization.',
};

// CRITICAL: must be dynamic so searchParams work at runtime
export const dynamic = 'force-dynamic';

export default function StudioPage() {
  const bgCards = parseBgCards(bgCardsJson);
  const connectors = parseConnectors(connectorsJson);
  return (
    <>
      <div className="px-4 sm:px-5 max-w-[1400px] mx-auto mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight" style={{ animation: 'studio-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)' }}>
          Studio
        </h1>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
          150 premium backgrounds · 100 unique connectors · full customization
        </p>
      </div>
      <StudioNav />
      <div className="mt-4">
        <StudioClient bgCards={bgCards} connectors={connectors} />
      </div>
    </>
  );
}

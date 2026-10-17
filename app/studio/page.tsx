import type { Metadata } from 'next';
import StudioClient from '@/components/studio/StudioClient';
import { parseCards, parseConnectors } from '@/lib/studio/parse';
import cardsJson from '@/public/data/cards.json';
import connectorsJson from '@/public/data/connectors.json';

export const metadata: Metadata = {
  title: 'CirclePay Studio — Premium Card Designer',
  description: 'Design premium CirclePay cards: 250 card designs, 100 connector wires, full customization.',
};

export const dynamic = 'force-static';

export default function StudioPage() {
  const cards = parseCards(cardsJson);
  const connectors = parseConnectors(connectorsJson);
  return <StudioClient cards={cards} connectors={connectors} />;
}

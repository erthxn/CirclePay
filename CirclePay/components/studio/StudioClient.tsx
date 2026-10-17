'use client';

import { useRef, useState, useCallback, useEffect, useDeferredValue } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Card, Connector } from '@/lib/studio/types';
import { initStore, useStudioSelector, useDispatch, useReducedMotion } from './useStudioState';
import { buildSolidColor } from '@/lib/studio/builders';
import { encodeStateToQuery } from '@/lib/studio/store';

import LivePreview from './LivePreview';
import CustomizationPanel from './CustomizationPanel';
import CardGallery from './CardGallery';
import ConnectorPicker from './ConnectorPicker';
import DownloadButton from './DownloadButton';

interface Props {
  cards: Card[];
  connectors: Connector[];
}

export default function StudioClient({ cards, connectors }: Props) {
  // Initialize the store exactly once on the client.
  const initialized = useRef(false);
  if (!initialized.current) {
    initStore(cards, connectors);
    initialized.current = true;
  }

  const reducedMotion = useReducedMotion();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate from URL once on mount (before paint)
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const c = searchParams.get('c');
    const n = searchParams.get('n');
    if (c) dispatch({ type: 'SELECT_CARD', cardId: c });
    if (n) dispatch({ type: 'SELECT_CONNECTOR', connectorId: n });
    // customization is harder to hydrate since SELECT_CARD resets it;
    // for v1 we accept the URL hydration for card+connector only.
  }, [searchParams, dispatch]);

  // Subscribe to store for re-render
  const selectedCardId = useStudioSelector((s) => s.selectedCardId);
  const selectedConnectorId = useStudioSelector((s) => s.selectedConnectorId);
  const customization = useStudioSelector((s) => s.customization);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;
  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId) ?? null;
  const solidColor = selectedCard?.solid_color ?? buildSolidColor(customization.gradientStops);

  // Defer URL updates on customization changes (debounced via useDeferredValue)
  const deferredCustom = useDeferredValue(customization);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!hydrated.current) return;
    const qs = encodeStateToQuery({
      selectedCardId,
      selectedConnectorId,
      customization: deferredCustom,
      galleryFilter: '',
      activeCategory: null,
      cards,
      connectors,
    });
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [deferredCustom, selectedCardId, selectedConnectorId, router, pathname, cards, connectors]);

  // Filter input state for the gallery
  const filter = useStudioSelector((s) => s.galleryFilter);
  const setFilter = useCallback((q: string) => dispatch({ type: 'SET_GALLERY_FILTER', query: q }), [dispatch]);

  const previewRef = useRef<HTMLDivElement>(null);

  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }, []);

  // Scroll positioning of the live preview — sticky on desktop, normal on mobile
  return (
    <div className="px-4 sm:px-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-baseline justify-between mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Studio</h1>
        <span className="text-[11px] text-[var(--text-muted)]">
          {cards.length} cards · {connectors.length} connectors
        </span>
      </div>

      {/* Filter */}
      <div className="mb-5">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search designs, categories, tags…"
          className="neu-input w-full px-4 py-3 text-sm"
          aria-label="Search designs"
        />
      </div>

      {/* 3-column on xl: gallery | preview+panel | connectors */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Gallery - left column */}
        <div className="xl:col-span-7 order-1">
          <div className="mb-3">
            <h2 className="text-sm font-semibold text-[var(--text)] mb-1">Cards</h2>
            <p className="text-[11px] text-[var(--text-muted)]">Tap to select. Scroll to load more.</p>
          </div>
          <CardGallery />
        </div>

        {/* Live preview + customization - middle column */}
        <div className="xl:col-span-5 order-2 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-col gap-4">
            <div className="p-4 neu-raised rounded-2xl">
              <LivePreview
                ref={previewRef}
                card={selectedCard}
                connector={selectedConnector}
                customization={customization}
                reducedMotion={reducedMotion}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <DownloadButton targetRef={previewRef} solidColor={solidColor} filename={selectedCard?.id ?? 'circlepay'} />
                <button
                  onClick={share}
                  className="studio-tap py-3.5 text-sm font-medium rounded-full neu-btn text-[var(--text)]"
                >
                  {copied ? 'Copied!' : 'Share link'}
                </button>
              </div>
              {selectedCard && (
                <p className="mt-2 text-[11px] text-[var(--text-muted)] text-center">
                  {selectedCard.name} · {selectedCard.category}
                </p>
              )}
            </div>

            <CustomizationPanel />

            <div className="p-4 neu-raised rounded-2xl">
              <h2 className="text-sm font-semibold text-[var(--text)] mb-3">Connectors</h2>
              <ConnectorPicker />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

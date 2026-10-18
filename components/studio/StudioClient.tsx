'use client';

import { useRef, useState, useCallback, useEffect, useDeferredValue } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { Card, Connector, BgCard } from '@/lib/studio/types';
import { initStore, useStudioSelector, useDispatch, useReducedMotion } from './useStudioState';
import { buildSolidColor } from '@/lib/studio/builders';
import { encodeStateToQuery } from '@/lib/studio/store';

import LivePreview from './LivePreview';
import CustomizationPanel from './CustomizationPanel';
import CardGallery from './CardGallery';
import BgCardGallery from './BgCardGallery';
import ConnectorPicker from './ConnectorPicker';
import DownloadButton from './DownloadButton';

interface Props {
  cards: Card[];
  connectors: Connector[];
  bgCards: BgCard[];
  /** Which library tab is active. Drives which gallery is shown. */
  activeLibrary: 'cards' | 'bg' | 'connectors';
  /** Whether to show the editor (customization panel) alongside the preview. */
  showEditor?: boolean;
}

export default function StudioClient({ cards, connectors, bgCards, activeLibrary, showEditor = false }: Props) {
  const initialized = useRef(false);
  if (!initialized.current) {
    initStore(cards, connectors, bgCards);
    initialized.current = true;
  }

  const reducedMotion = useReducedMotion();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate from URL once on mount
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const c = searchParams.get('c');
    const n = searchParams.get('n');
    const b = searchParams.get('b');
    if (c) dispatch({ type: 'SELECT_CARD', cardId: c });
    if (n) dispatch({ type: 'SELECT_CONNECTOR', connectorId: n });
    if (b) dispatch({ type: 'SELECT_BG_CARD', bgCardId: b });
  }, [searchParams, dispatch]);

  const selectedCardId = useStudioSelector((s) => s.selectedCardId);
  const selectedConnectorId = useStudioSelector((s) => s.selectedConnectorId);
  const selectedBgCardId = useStudioSelector((s) => s.selectedBgCardId);
  const customization = useStudioSelector((s) => s.customization);

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;
  const selectedConnector = connectors.find((c) => c.id === selectedConnectorId) ?? null;
  const selectedBgCard = bgCards.find((c) => c.id === selectedBgCardId) ?? null;
  const solidColor = selectedBgCard?.solid_color ?? selectedCard?.solid_color ?? buildSolidColor(customization.gradientStops);

  // Debounced URL sync — PRESERVES the `type` query param so the
  // active library tab (cards | bg | connectors) survives state changes.
  // Without this, switching to bg library was immediately undone because
  // the URL sync overwrote `?type=bg` with the encoded state (bug found via agent-browser).
  const deferredCustom = useDeferredValue(customization);
  useEffect(() => {
    if (!hydrated.current) return;
    const qs = encodeStateToQuery({
      selectedCardId,
      selectedConnectorId,
      selectedBgCardId,
      customization: deferredCustom,
      galleryFilter: '',
      activeCategory: null,
      activeTab: 'libraries',
      activeLibrary: 'cards',
      editorView: 'edit',
      cards,
      connectors,
      bgCards,
    });
    // Preserve the `type` param (used by /studio/libraries to pick which gallery).
    const typeParam = searchParams.get('type');
    const finalQs = typeParam
      ? `${qs}${qs ? '&' : ''}type=${typeParam}`
      : qs;
    const url = finalQs ? `${pathname}?${finalQs}` : pathname;
    router.replace(url, { scroll: false });
  }, [deferredCustom, selectedCardId, selectedConnectorId, selectedBgCardId, router, pathname, searchParams, cards, connectors, bgCards]);

  const filter = useStudioSelector((s) => s.galleryFilter);
  const setFilter = useCallback((q: string) => dispatch({ type: 'SET_GALLERY_FILTER', query: q }), [dispatch]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);

  return (
    <div className="px-4 sm:px-5 max-w-7xl mx-auto">
      {/* Filter */}
      <div className="mb-5">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={
            activeLibrary === 'cards'
              ? 'Search card designs…'
              : activeLibrary === 'bg'
              ? 'Search backgrounds…'
              : 'Search connectors…'
          }
          className="neu-input w-full px-4 py-3 text-sm"
          aria-label="Search"
        />
      </div>

      {/* Two-pane layout: gallery | preview+panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Gallery - left column */}
        <div className="xl:col-span-7 order-2 xl:order-1">
          {activeLibrary === 'cards' && <CardGallery />}
          {activeLibrary === 'bg' && <BgCardGallery />}
          {activeLibrary === 'connectors' && <ConnectorPicker />}
        </div>

        {/* Live preview + (optional) customization - right column */}
        <div className="xl:col-span-5 order-1 xl:order-2 xl:sticky xl:top-24 xl:self-start">
          <div className="flex flex-col gap-4">
            <div className="p-4 neu-raised rounded-2xl">
              <LivePreview
                ref={previewRef}
                card={selectedCard}
                connector={selectedConnector}
                customization={customization}
                bgCard={selectedBgCard}
                reducedMotion={reducedMotion}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <DownloadButton
                  targetRef={previewRef}
                  solidColor={solidColor}
                  filename={
                    selectedBgCard?.id ?? selectedCard?.id ?? 'circlepay'
                  }
                />
                <button
                  onClick={share}
                  className="studio-tap py-3.5 text-sm font-medium rounded-full neu-btn text-[var(--text)]"
                >
                  {copied ? 'Copied!' : 'Share link'}
                </button>
              </div>

              {/* Use in circle — apply this bg + connector to /circle/pay (bug #5 fix) */}
              <a
                href={`/circle/pay?b=${selectedBgCard?.id ?? ''}${selectedCard ? `&c=${selectedCard.id}` : ''}${selectedConnector ? `&n=${selectedConnector.id}` : ''}`}
                className="studio-tap mt-2 block w-full py-3 text-sm font-medium rounded-full text-white text-center studio-fab"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover, #0B4FE0))', boxShadow: '0 6px 16px rgba(13,92,255,0.25)' }}
              >
                Use in your circle →
              </a>

              {(selectedCard || selectedBgCard) && (
                <p className="mt-2 text-[11px] text-[var(--text-muted)] text-center">
                  {selectedBgCard?.name ?? selectedCard?.name}
                  {selectedCard && selectedBgCard ? ` · ${selectedCard.category}` : ''}
                </p>
              )}
            </div>

            {showEditor && <CustomizationPanel />}
          </div>
        </div>
      </div>
    </div>
  );
}

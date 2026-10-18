'use client';

import { useRef, useState, useCallback, useEffect, useDeferredValue } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { BgCard, Connector } from '@/lib/studio/types';
import { initStore, useStudioSelector, useDispatch, useReducedMotion } from './useStudioState';
import { buildSolidColor } from '@/lib/studio/builders';
import { encodeStateToQuery } from '@/lib/studio/store';

import LivePreview from './LivePreview';
import CustomizationPanel from './CustomizationPanel';
import BgCardGallery from './BgCardGallery';
import ConnectorGallery from './ConnectorGallery';
import DownloadButton from './DownloadButton';

interface Props {
  bgCards: BgCard[];
  connectors: Connector[];
}

export default function StudioClient({ bgCards, connectors }: Props) {
  const initialized = useRef(false);
  if (!initialized.current) {
    initStore(bgCards, connectors);
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
    const b = searchParams.get('b');
    const n = searchParams.get('n');
    if (b) dispatch({ type: 'SELECT_BG', id: b });
    if (n) dispatch({ type: 'SELECT_CONNECTOR', id: n });
  }, [searchParams, dispatch]);

  const selectedBgId = useStudioSelector((s) => s.selectedBgId);
  const selectedConnId = useStudioSelector((s) => s.selectedConnId);
  const customization = useStudioSelector((s) => s.customization);
  const filter = useStudioSelector((s) => s.galleryFilter);
  const setFilter = useCallback((q: string) => dispatch({ type: 'SET_GALLERY_FILTER', query: q }), [dispatch]);

  const selectedBg = bgCards.find((c) => c.id === selectedBgId) ?? null;
  const selectedConn = connectors.find((c) => c.id === selectedConnId) ?? null;
  const solidColor = selectedBg?.solid_color ?? buildSolidColor(customization.gradientStops);

  // Debounced URL sync
  const deferredCustom = useDeferredValue(customization);
  useEffect(() => {
    if (!hydrated.current) return;
    const qs = encodeStateToQuery({
      selectedBgId, selectedConnId, customization: deferredCustom,
      galleryFilter: '', activeBgCategory: null, activeConnCategory: null,
      bgCards, connectors,
    });
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [deferredCustom, selectedBgId, selectedConnId, router, pathname, bgCards, connectors]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [mobileTab, setMobileTab] = useState<'bg' | 'preview' | 'conn'>('preview');
  const share = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }, []);

  return (
    <div className="px-4 sm:px-5 max-w-[1400px] mx-auto">
      {/* Mobile tab switcher */}
      <div className="sm:hidden grid grid-cols-3 gap-1 mb-3 p-1 neu-raised rounded-2xl">
        {[
          { id: 'bg' as const, label: 'Backgrounds' },
          { id: 'preview' as const, label: 'Preview' },
          { id: 'conn' as const, label: 'Connectors' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setMobileTab(t.id)}
            className="studio-tap py-2 text-[11px] font-medium rounded-xl transition-colors"
            style={{
              color: mobileTab === t.id ? '#fff' : 'var(--text-muted)',
              background: mobileTab === t.id ? 'var(--accent)' : 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile search (only on gallery panes) */}
      <div className="mb-3 sm:hidden">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={mobileTab === 'bg' ? 'Search backgrounds…' : mobileTab === 'conn' ? 'Search connectors…' : 'Search…'}
          className="neu-input w-full px-3 py-2 text-sm"
          aria-label="Search"
        />
      </div>

      {/* 3-pane desktop layout */}
      <div className="hidden sm:grid sm:grid-cols-12 sm:gap-4 lg:gap-5">
        {/* LEFT pane: bg cards */}
        <aside className="sm:col-span-4 lg:col-span-3 sm:sticky sm:top-24 sm:self-start sm:max-h-[calc(100vh-7rem)] sm:overflow-y-auto sm:pr-2">
          <div className="mb-3">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search backgrounds…"
              className="neu-input w-full px-3 py-2 text-sm"
            />
          </div>
          <BgCardGallery />
        </aside>

        {/* MIDDLE pane: preview + customization */}
        <main className="sm:col-span-5 lg:col-span-6 sm:sticky sm:top-24 sm:self-start">
          <div className="flex flex-col gap-4">
            <div className="p-4 neu-raised rounded-2xl">
              <LivePreview
                ref={previewRef}
                bgCard={selectedBg}
                connector={selectedConn}
                customization={customization}
                reducedMotion={reducedMotion}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <DownloadButton targetRef={previewRef} solidColor={solidColor} filename={selectedBg?.id ?? 'circlepay'} />
                <button onClick={share} className="studio-tap py-3 text-sm font-medium rounded-full neu-btn text-[var(--text)]">{copied ? 'Copied!' : 'Share link'}</button>
              </div>
              <a
                href={`/circle/pay?b=${selectedBgId ?? ''}${selectedConnId ? `&n=${selectedConnId}` : ''}${customization.mark !== 'paybox' ? `&m=${customization.mark}` : ''}`}
                className="studio-tap mt-2 block w-full py-2.5 text-xs font-medium rounded-full text-white text-center"
                style={{ background: 'var(--accent)' }}
              >
                Use in your circle →
              </a>
              {(selectedBg || selectedConn) && (
                <p className="mt-2 text-[10px] text-[var(--text-muted)] text-center">
                  {selectedBg?.name}{selectedConn ? ` · ${selectedConn.name}` : ''}
                </p>
              )}
            </div>
            <CustomizationPanel />
          </div>
        </main>

        {/* RIGHT pane: connectors shelf nav */}
        <aside className="sm:col-span-3 sm:sticky sm:top-24 sm:self-start sm:max-h-[calc(100vh-7rem)] sm:overflow-y-auto sm:pl-2">
          <ConnectorGallery />
        </aside>
      </div>

      {/* Mobile: single pane based on selected tab */}
      <div className="sm:hidden">
        {mobileTab === 'bg' && <BgCardGallery />}
        {mobileTab === 'preview' && (
          <div className="flex flex-col gap-3">
            <div className="p-3 neu-raised rounded-2xl">
              <LivePreview
                ref={previewRef}
                bgCard={selectedBg}
                connector={selectedConn}
                customization={customization}
                reducedMotion={reducedMotion}
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <DownloadButton targetRef={previewRef} solidColor={solidColor} filename={selectedBg?.id ?? 'circlepay'} />
                <button onClick={share} className="studio-tap py-2.5 text-xs font-medium rounded-full neu-btn text-[var(--text)]">{copied ? 'Copied!' : 'Share'}</button>
              </div>
              <a
                href={`/circle/pay?b=${selectedBgId ?? ''}${selectedConnId ? `&n=${selectedConnId}` : ''}`}
                className="studio-tap mt-2 block w-full py-2.5 text-xs font-medium rounded-full text-white text-center"
                style={{ background: 'var(--accent)' }}
              >
                Use in your circle →
              </a>
            </div>
            <CustomizationPanel />
          </div>
        )}
        {mobileTab === 'conn' && <ConnectorGallery />}
      </div>
    </div>
  );
}

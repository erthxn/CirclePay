'use client';

import { useSyncExternalStore, useRef, useEffect, useState, useCallback } from 'react';
import { createStore, customizationFromCard } from '@/lib/studio/store';
import type { Card, Connector, BgCard, StudioState, StudioAction } from '@/lib/studio/types';

// Singleton store — created lazily on the client
let storeInstance: ReturnType<typeof createStore> | null = null;

export function initStore(cards: Card[], connectors: Connector[], bgCards: BgCard[] = []): void {
  if (!storeInstance) {
    storeInstance = createStore(cards as any, connectors as any, bgCards as any);
  }
}

export function getStore() {
  return storeInstance!;
}

export function useStudioSelector<T>(selector: (s: StudioState) => T): T {
  const store = getStore();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

export function useDispatch() {
  const store = getStore();
  return useCallback((action: StudioAction) => store.dispatch(action), [store]);
}

// --- IntersectionObserver-based lazy mount hook ---

export function useLazyMount<T extends HTMLElement = HTMLDivElement>(
  rootMargin: string = '200px 0px',
) {
  const ref = useRef<T | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setMounted(true);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return { ref, mounted };
}

// --- prefers-reduced-motion hook ---

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// --- helpers ---

export { customizationFromCard };

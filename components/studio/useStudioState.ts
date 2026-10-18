'use client';

import { useSyncExternalStore, useRef, useEffect, useState, useCallback } from 'react';
import { createStore } from '@/lib/studio/store';
import type { BgCard, Connector, StudioState, StudioAction } from '@/lib/studio/types';

let storeInstance: ReturnType<typeof createStore> | null = null;

export function initStore(bgCards: BgCard[], connectors: Connector[]): void {
  if (!storeInstance) {
    storeInstance = createStore(bgCards as any, connectors as any);
  }
}

export function getStore() {
  if (!storeInstance) throw new Error('Studio store not initialized');
  return storeInstance;
}

export function useStudioSelector<T>(selector: (s: StudioState) => T): T {
  const store = getStore();
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const getSnapshot = useCallback(() => selectorRef.current(store.getState()), [store]);
  const getServerSnapshot = useCallback(() => selectorRef.current(store.getState()), [store]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
}

export function useDispatch() {
  const store = getStore();
  return useCallback((action: StudioAction) => store.dispatch(action), [store]);
}

export function useLazyMount<T extends HTMLElement = HTMLDivElement>(rootMargin = '200px 0px') {
  const ref = useRef<T | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setMounted(true); return; }
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

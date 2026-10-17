'use client';

import { useSyncExternalStore, useRef, useEffect, useState, useCallback, useMemo } from 'react';
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
  if (!storeInstance) {
    throw new Error('Studio store not initialized — call initStore first');
  }
  return storeInstance;
}

/**
 * useStudioSelector — subscribes to the studio store and returns a slice.
 *
 * Important: useSyncExternalStore's getSnapshot must return a STABLE value
 * (Object.is comparison with previous). Our store now produces a new top-level
 * state reference on every change, so selecting primitive slices (strings,
 * numbers) is safe. Selecting nested objects/arrays also works because the
 * reducer now produces NEW references for any changed nested object.
 *
 * For selector results that may produce a new reference each call (e.g. a
 * freshly-derived array via .filter), use `useStudioSelectorWithMemo` instead.
 */
export function useStudioSelector<T>(selector: (s: StudioState) => T): T {
  const store = getStore();
  // Stable snapshot fn — closes over selector & store. If the selector changes
  // each render (e.g. inline arrow), useSyncExternalStore may re-run; that's
  // fine because the snapshot is cheap and Object.is guards re-renders.
  const selectorRef = useRef(selector);
  selectorRef.current = selector;

  const getSnapshot = useCallback(() => selectorRef.current(store.getState()), [store]);
  const getServerSnapshot = useCallback(() => selectorRef.current(store.getState()), [store]);

  return useSyncExternalStore(store.subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Like useStudioSelector, but memoizes the selector result so that even if the
 * selector returns a freshly-built array/object each call, we don't re-render
 * the consumer unless the deep contents change.
 *
 * Use this for selectors that derive collections (e.g. filtered card lists).
 */
export function useStudioSelectorWithMemo<T>(
  selector: (s: StudioState) => T,
  isEqual: (a: T, b: T) => boolean = Object.is,
): T {
  const store = getStore();
  const selectorRef = useRef(selector);
  selectorRef.current = selector;
  const lastValueRef = useRef<T | undefined>(undefined);
  const [, forceRerender] = useState(0);

  // Initial value
  if (lastValueRef.current === undefined) {
    lastValueRef.current = selectorRef.current(store.getState());
  }

  useEffect(() => {
    const check = () => {
      const next = selectorRef.current(store.getState());
      if (lastValueRef.current === undefined || !isEqual(lastValueRef.current, next)) {
        lastValueRef.current = next;
        forceRerender((n) => n + 1);
      }
    };
    const unsubscribe = store.subscribe(check);
    return () => { unsubscribe(); };
  }, [store, isEqual]);

  return lastValueRef.current as T;
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

// Pure-JS external store for the Studio.
// No React imports here — keeps the store testable & framework-agnostic.
// React integration is via useSyncExternalStore in useStudioState.ts.

import { DEFAULT_CUSTOMIZATION, type StudioState, type StudioAction } from './types';

type Listener = () => void;

export function createStore(initialCards: any[] = [], initialConnectors: any[] = []) {
  const state: StudioState = {
    selectedCardId: initialCards[0]?.id ?? null,
    selectedConnectorId: initialConnectors[0]?.id ?? null,
    customization: { ...DEFAULT_CUSTOMIZATION },
    galleryFilter: '',
    activeCategory: null,
    cards: initialCards,
    connectors: initialConnectors,
  };

  // When we have a selected card, sync the customization defaults from it
  if (state.selectedCardId) {
    const card = initialCards.find((c) => c.id === state.selectedCardId);
    if (card) {
      state.customization = customizationFromCard(card);
    }
  }
  if (state.selectedConnectorId) {
    const conn = initialConnectors.find((c) => c.id === state.selectedConnectorId);
    if (conn) {
      state.customization.strokeWidth = conn.stroke_width;
      state.customization.strokeOpacity = conn.stroke_opacity;
      state.customization.dashArray = conn.stroke_dasharray || '';
      state.customization.filterEnabled = !!conn.filter;
      state.customization.strokeOverride = conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke;
    }
  }

  const listeners = new Set<Listener>();
  let dispatchDepth = 0;
  let pendingNotify = false;

  function notify() {
    if (dispatchDepth > 0) {
      pendingNotify = true;
      return;
    }
    listeners.forEach((l) => l());
  }

  function dispatch(action: StudioAction) {
    dispatchDepth++;
    try {
      reducer(state, action);
    } finally {
      dispatchDepth--;
      if (dispatchDepth === 0 && pendingNotify) {
        pendingNotify = false;
        listeners.forEach((l) => l());
      } else if (dispatchDepth === 0) {
        listeners.forEach((l) => l());
      }
    }
  }

  return {
    getState: () => state,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatch,
  };
}

// Helpers
export function customizationFromCard(card: any) {
  return {
    ...DEFAULT_CUSTOMIZATION,
    gradientStops: Array.isArray(card?.gradient_stops)
      ? card.gradient_stops.map((s: any) => {
          if (Array.isArray(s)) return { color: s[0], offset: typeof s[1] === 'number' ? s[1] : parseFloat(s[1]) };
          return s;
        })
      : DEFAULT_CUSTOMIZATION.gradientStops,
    gradientAngle: card?.gradient_angle ?? DEFAULT_CUSTOMIZATION.gradientAngle,
    mark: card?.mark ?? DEFAULT_CUSTOMIZATION.mark,
    memberCount: card?.n ?? DEFAULT_CUSTOMIZATION.memberCount,
  };
}

function reducer(state: StudioState, action: StudioAction): void {
  switch (action.type) {
    case 'SELECT_CARD': {
      state.selectedCardId = action.cardId;
      const card = state.cards.find((c) => c.id === action.cardId);
      if (card) {
        state.customization = customizationFromCard(card);
      }
      break;
    }
    case 'SELECT_CONNECTOR': {
      state.selectedConnectorId = action.connectorId;
      const conn = state.connectors.find((c) => c.id === action.connectorId);
      if (conn) {
        state.customization.strokeWidth = conn.stroke_width;
        state.customization.strokeOpacity = conn.stroke_opacity;
        state.customization.dashArray = conn.stroke_dasharray || '';
        state.customization.filterEnabled = !!conn.filter;
        state.customization.strokeOverride = conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke;
      }
      break;
    }
    case 'SET_GRADIENT_STOP': {
      const stops = state.customization.gradientStops.slice();
      if (stops[action.index]) {
        stops[action.index] = { ...stops[action.index], color: action.color };
      }
      state.customization.gradientStops = stops;
      break;
    }
    case 'ADD_GRADIENT_STOP': {
      const stops = state.customization.gradientStops.slice();
      const last = stops[stops.length - 1] ?? { color: '#000000', offset: 100 };
      const newOffset = Math.min(95, last.offset - 5);
      stops.push({ color: '#ffffff', offset: newOffset });
      stops.sort((a, b) => a.offset - b.offset);
      state.customization.gradientStops = stops;
      break;
    }
    case 'REMOVE_GRADIENT_STOP': {
      if (state.customization.gradientStops.length <= 2) break;
      const stops = state.customization.gradientStops.slice();
      stops.splice(action.index, 1);
      state.customization.gradientStops = stops;
      break;
    }
    case 'SET_GRADIENT_ANGLE': {
      state.customization.gradientAngle = action.angle;
      break;
    }
    case 'SET_STROKE_WIDTH': {
      state.customization.strokeWidth = action.width;
      break;
    }
    case 'SET_STROKE_OPACITY': {
      state.customization.strokeOpacity = action.opacity;
      break;
    }
    case 'SET_DASH_ARRAY': {
      state.customization.dashArray = action.dash;
      break;
    }
    case 'SET_MARK': {
      state.customization.mark = action.mark;
      break;
    }
    case 'SET_MEMBER_COUNT': {
      state.customization.memberCount = action.count;
      break;
    }
    case 'TOGGLE_FILTER': {
      state.customization.filterEnabled = !state.customization.filterEnabled;
      break;
    }
    case 'SET_STROKE_OVERRIDE': {
      state.customization.strokeOverride = action.color;
      break;
    }
    case 'SET_GALLERY_FILTER': {
      state.galleryFilter = action.query;
      break;
    }
    case 'SET_ACTIVE_CATEGORY': {
      state.activeCategory = action.category;
      break;
    }
    case 'RESET_CUSTOMIZATION': {
      state.customization = { ...DEFAULT_CUSTOMIZATION };
      const card = state.cards.find((c) => c.id === state.selectedCardId);
      if (card) state.customization = customizationFromCard(card);
      const conn = state.connectors.find((c) => c.id === state.selectedConnectorId);
      if (conn) {
        state.customization.strokeWidth = conn.stroke_width;
        state.customization.strokeOpacity = conn.stroke_opacity;
        state.customization.dashArray = conn.stroke_dasharray || '';
        state.customization.filterEnabled = !!conn.filter;
        state.customization.strokeOverride = conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke;
      }
      break;
    }
    case 'HYDRATE': {
      Object.assign(state, action.state);
      break;
    }
    default: break;
  }
}

// Encode/decode the studio state to/from URL query params
export function encodeStateToQuery(state: StudioState): string {
  const params = new URLSearchParams();
  if (state.selectedCardId) params.set('c', state.selectedCardId);
  if (state.selectedConnectorId) params.set('n', state.selectedConnectorId);
  const stops = state.customization.gradientStops
    .map((s) => `${s.color.replace('#', '')}.${s.offset}`)
    .join(',');
  if (stops) params.set('s', stops);
  if (state.customization.gradientAngle !== 145) params.set('a', String(state.customization.gradientAngle));
  if (state.customization.strokeWidth !== 1.2) params.set('w', String(state.customization.strokeWidth));
  if (state.customization.strokeOpacity !== 0.75) params.set('o', String(state.customization.strokeOpacity));
  if (state.customization.dashArray) params.set('d', state.customization.dashArray);
  if (state.customization.mark !== 'paybox') params.set('m', state.customization.mark);
  if (state.customization.memberCount !== 5) params.set('mc', String(state.customization.memberCount));
  if (!state.customization.filterEnabled) params.set('f', '0');
  if (state.customization.strokeOverride) params.set('sc', state.customization.strokeOverride.replace('#', ''));
  return params.toString();
}

export function decodeQueryToActions(query: URLSearchParams): Partial<StudioState> {
  const result: Partial<StudioState> = {};
  const c = query.get('c');
  if (c) result.selectedCardId = c;
  const n = query.get('n');
  if (n) result.selectedConnectorId = n;
  return result;
}

export function decodeQueryToCustomization(query: URLSearchParams): Partial<{ customization: any }> {
  const customization: any = {};
  const s = query.get('s');
  if (s) {
    customization.gradientStops = s.split(',').map((pair) => {
      const [color, offset] = pair.split('.');
      return { color: `#${color}`, offset: parseFloat(offset) };
    });
  }
  const a = query.get('a');
  if (a) customization.gradientAngle = parseFloat(a);
  const w = query.get('w');
  if (w) customization.strokeWidth = parseFloat(w);
  const o = query.get('o');
  if (o) customization.strokeOpacity = parseFloat(o);
  const d = query.get('d');
  if (d) customization.dashArray = d;
  const m = query.get('m');
  if (m) customization.mark = m;
  const mc = query.get('mc');
  if (mc) customization.memberCount = parseInt(mc, 10);
  const f = query.get('f');
  if (f === '0') customization.filterEnabled = false;
  const sc = query.get('sc');
  if (sc) customization.strokeOverride = `#${sc}`;
  return Object.keys(customization).length ? { customization } : {};
}

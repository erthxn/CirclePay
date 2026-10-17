// Pure-JS external store for the Studio.
// CRITICAL: All state updates MUST be immutable — replace the state object
// (and any nested object/array that changed) with a new reference on every
// dispatch. useSyncExternalStore uses Object.is on getSnapshot's return value
// to decide whether to re-render, so mutating in place would silently break
// re-renders (this was the root cause of bugs #1, #3, #4 in v2).

import { DEFAULT_CUSTOMIZATION, type StudioState, type StudioAction, type BgCard, type Customization, type CardMark, type MemberCount } from './types';

type Listener = () => void;

export function createStore(
  initialCards: any[] = [],
  initialConnectors: any[] = [],
  initialBgCards: any[] = [],
) {
  // Build initial customization from defaults + first card + first connector.
  let state: StudioState = {
    selectedCardId: initialCards[0]?.id ?? null,
    selectedConnectorId: initialConnectors[0]?.id ?? null,
    selectedBgCardId: null,  // start null so the user's bg pick is reflected properly
    customization: { ...DEFAULT_CUSTOMIZATION },
    galleryFilter: '',
    activeCategory: null,
    activeTab: 'libraries',
    activeLibrary: 'cards',
    editorView: 'edit',
    cards: initialCards,
    connectors: initialConnectors,
    bgCards: initialBgCards,
  };

  // Sync defaults from the initial card (without dispatching)
  if (state.selectedCardId) {
    const card = initialCards.find((c) => c.id === state.selectedCardId);
    if (card) {
      state = { ...state, customization: customizationFromCard(card) };
    }
  }
  if (state.selectedConnectorId) {
    const conn = initialConnectors.find((c) => c.id === state.selectedConnectorId);
    if (conn) {
      state = {
        ...state,
        customization: {
          ...state.customization,
          strokeWidth: conn.stroke_width,
          strokeOpacity: conn.stroke_opacity,
          dashArray: conn.stroke_dasharray || '',
          filterEnabled: !!conn.filter,
          strokeOverride: conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke,
        },
      };
    }
  }

  const listeners = new Set<Listener>();

  function getState(): StudioState {
    return state;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }

  function dispatch(action: StudioAction) {
    const next = reducer(state, action);
    // Only notify if the new state is referentially different
    if (next !== state) {
      state = next;
      listeners.forEach((l) => l());
    }
  }

  return { getState, subscribe, dispatch };
}

// Helpers
export function customizationFromCard(card: any): Customization {
  return {
    ...DEFAULT_CUSTOMIZATION,
    gradientStops: Array.isArray(card?.gradient_stops)
      ? card.gradient_stops.map((s: any) => {
          if (Array.isArray(s)) {
            return { color: s[0], offset: typeof s[1] === 'number' ? s[1] : parseFloat(s[1]) };
          }
          return s;
        })
      : DEFAULT_CUSTOMIZATION.gradientStops,
    gradientAngle: card?.gradient_angle ?? DEFAULT_CUSTOMIZATION.gradientAngle,
    mark: (card?.mark as CardMark) ?? DEFAULT_CUSTOMIZATION.mark,
    memberCount: (card?.n as MemberCount) ?? DEFAULT_CUSTOMIZATION.memberCount,
  };
}

/**
 * Reducer — PURE function. Returns the SAME state reference if nothing
 * changed, or a NEW state reference if anything changed. Never mutates.
 */
function reducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SELECT_CARD': {
      if (state.selectedCardId === action.cardId) return state;
      const card = state.cards.find((c) => c.id === action.cardId);
      if (!card) return state;
      return {
        ...state,
        selectedCardId: action.cardId,
        customization: customizationFromCard(card),
      };
    }

    case 'SELECT_CONNECTOR': {
      if (state.selectedConnectorId === action.connectorId) return state;
      const conn = state.connectors.find((c) => c.id === action.connectorId);
      if (!conn) return state;
      return {
        ...state,
        selectedConnectorId: action.connectorId,
        customization: {
          ...state.customization,
          strokeWidth: conn.stroke_width,
          strokeOpacity: conn.stroke_opacity,
          dashArray: conn.stroke_dasharray || '',
          filterEnabled: !!conn.filter,
          strokeOverride: conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke,
        },
      };
    }

    case 'SELECT_BG_CARD': {
      if (state.selectedBgCardId === action.bgCardId) return state;
      const bg = state.bgCards.find((c: BgCard) => c.id === action.bgCardId);
      if (!bg) return state;
      return {
        ...state,
        selectedBgCardId: action.bgCardId,
        // CRITICAL: rebuild customization with NEW gradientStops array reference
        // so that LivePreview's useMemo sees a different dependency.
        customization: {
          ...state.customization,
          gradientStops: bg.gradient_stops.map((s) => ({ ...s })),
          gradientAngle: bg.gradient_angle,
        },
      };
    }

    case 'SET_GRADIENT_STOP': {
      const stops = state.customization.gradientStops;
      if (!stops[action.index]) return state;
      const newStops = stops.map((s, i) =>
        i === action.index ? { ...s, color: action.color } : s,
      );
      return {
        ...state,
        customization: { ...state.customization, gradientStops: newStops },
      };
    }

    case 'ADD_GRADIENT_STOP': {
      const stops = state.customization.gradientStops;
      const last = stops[stops.length - 1] ?? { color: '#000000', offset: 100 };
      const newOffset = Math.min(95, last.offset - 5);
      const newStops = [...stops, { color: '#ffffff', offset: newOffset }].sort(
        (a, b) => a.offset - b.offset,
      );
      return {
        ...state,
        customization: { ...state.customization, gradientStops: newStops },
      };
    }

    case 'REMOVE_GRADIENT_STOP': {
      if (state.customization.gradientStops.length <= 2) return state;
      const newStops = state.customization.gradientStops.filter((_, i) => i !== action.index);
      return {
        ...state,
        customization: { ...state.customization, gradientStops: newStops },
      };
    }

    case 'SET_GRADIENT_ANGLE': {
      if (state.customization.gradientAngle === action.angle) return state;
      return {
        ...state,
        customization: { ...state.customization, gradientAngle: action.angle },
      };
    }

    case 'SET_STROKE_WIDTH': {
      if (state.customization.strokeWidth === action.width) return state;
      return {
        ...state,
        customization: { ...state.customization, strokeWidth: action.width },
      };
    }

    case 'SET_STROKE_OPACITY': {
      if (state.customization.strokeOpacity === action.opacity) return state;
      return {
        ...state,
        customization: { ...state.customization, strokeOpacity: action.opacity },
      };
    }

    case 'SET_DASH_ARRAY': {
      if (state.customization.dashArray === action.dash) return state;
      return {
        ...state,
        customization: { ...state.customization, dashArray: action.dash },
      };
    }

    case 'SET_MARK': {
      if (state.customization.mark === action.mark) return state;
      return {
        ...state,
        customization: { ...state.customization, mark: action.mark },
      };
    }

    case 'SET_MEMBER_COUNT': {
      if (state.customization.memberCount === action.count) return state;
      return {
        ...state,
        customization: { ...state.customization, memberCount: action.count },
      };
    }

    case 'TOGGLE_FILTER': {
      return {
        ...state,
        customization: { ...state.customization, filterEnabled: !state.customization.filterEnabled },
      };
    }

    case 'SET_STROKE_OVERRIDE': {
      if (state.customization.strokeOverride === action.color) return state;
      return {
        ...state,
        customization: { ...state.customization, strokeOverride: action.color },
      };
    }

    case 'SET_GALLERY_FILTER': {
      if (state.galleryFilter === action.query) return state;
      return { ...state, galleryFilter: action.query };
    }

    case 'SET_ACTIVE_CATEGORY': {
      if (state.activeCategory === action.category) return state;
      return { ...state, activeCategory: action.category };
    }

    case 'SET_ACTIVE_TAB': {
      if (state.activeTab === action.tab) return state;
      return { ...state, activeTab: action.tab };
    }

    case 'SET_ACTIVE_LIBRARY': {
      if (state.activeLibrary === action.library) return state;
      return { ...state, activeLibrary: action.library };
    }

    case 'SET_EDITOR_VIEW': {
      if (state.editorView === action.view) return state;
      return { ...state, editorView: action.view };
    }

    case 'RESET_CUSTOMIZATION': {
      let custom: Customization = { ...DEFAULT_CUSTOMIZATION };
      const card = state.cards.find((c) => c.id === state.selectedCardId);
      if (card) custom = customizationFromCard(card);
      const conn = state.connectors.find((c) => c.id === state.selectedConnectorId);
      if (conn) {
        custom = {
          ...custom,
          strokeWidth: conn.stroke_width,
          strokeOpacity: conn.stroke_opacity,
          dashArray: conn.stroke_dasharray || '',
          filterEnabled: !!conn.filter,
          strokeOverride: conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke,
        };
      }
      return { ...state, customization: custom };
    }

    case 'LOAD_FROM_CARD': {
      return {
        ...state,
        selectedCardId: action.card.id,
        customization: customizationFromCard(action.card),
      };
    }

    case 'LOAD_FROM_BG_CARD': {
      return {
        ...state,
        selectedBgCardId: action.bgCard.id,
        customization: {
          ...state.customization,
          gradientStops: action.bgCard.gradient_stops.map((s) => ({ ...s })),
          gradientAngle: action.bgCard.gradient_angle,
        },
      };
    }

    case 'LOAD_FROM_CONNECTOR': {
      return {
        ...state,
        selectedConnectorId: action.connector.id,
        customization: {
          ...state.customization,
          strokeWidth: action.connector.stroke_width,
          strokeOpacity: action.connector.stroke_opacity,
          dashArray: action.connector.stroke_dasharray || '',
          filterEnabled: !!action.connector.filter,
          strokeOverride: action.connector.stroke?.startsWith('url(') ? '#ffffff' : action.connector.stroke,
        },
      };
    }

    case 'HYDRATE': {
      return { ...state, ...action.state };
    }

    default:
      return state;
  }
}

// Encode/decode the studio state to/from URL query params
export function encodeStateToQuery(state: StudioState): string {
  const params = new URLSearchParams();
  if (state.selectedCardId) params.set('c', state.selectedCardId);
  if (state.selectedConnectorId) params.set('n', state.selectedConnectorId);
  if (state.selectedBgCardId) params.set('b', state.selectedBgCardId);
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

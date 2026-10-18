// Pure-JS external store for the Studio. All updates IMMUTABLE (v2.2 lesson).

import { DEFAULT_CUSTOMIZATION, type StudioState, type StudioAction, type BgCard, type Customization, type Mark, type MemberCount } from './types';

type Listener = () => void;

export function createStore(initialBgCards: any[] = [], initialConnectors: any[] = []) {
  let state: StudioState = {
    selectedBgId: initialBgCards[0]?.id ?? null,
    selectedConnId: initialConnectors[0]?.id ?? null,
    customization: { ...DEFAULT_CUSTOMIZATION },
    galleryFilter: '',
    activeBgCategory: null,
    activeConnCategory: null,
    bgCards: initialBgCards,
    connectors: initialConnectors,
  };

  // Sync defaults from initial selections
  if (state.selectedBgId) {
    const bg = initialBgCards.find((c: BgCard) => c.id === state.selectedBgId);
    if (bg) {
      state = {
        ...state,
        customization: {
          ...state.customization,
          gradientStops: bg.gradient_stops.map((s: any) => ({ ...s })),
          gradientAngle: bg.gradient_angle,
        },
      };
    }
  }
  if (state.selectedConnId) {
    const conn = initialConnectors.find((c: any) => c.id === state.selectedConnId);
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

  function getState() { return state; }
  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }
  function dispatch(action: StudioAction) {
    const next = reducer(state, action);
    if (next !== state) {
      state = next;
      listeners.forEach((l) => l());
    }
  }
  return { getState, subscribe, dispatch };
}

function customizationFromBg(bg: BgCard): Partial<Customization> {
  return {
    gradientStops: bg.gradient_stops.map((s: any) => ({ ...s })),
    gradientAngle: bg.gradient_angle,
  };
}

function reducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case 'SELECT_BG': {
      if (state.selectedBgId === action.id) return state;
      const bg = state.bgCards.find((c: BgCard) => c.id === action.id);
      if (!bg) return state;
      return { ...state, selectedBgId: action.id, customization: { ...state.customization, ...customizationFromBg(bg) } };
    }
    case 'SELECT_CONNECTOR': {
      if (state.selectedConnId === action.id) return state;
      const conn = state.connectors.find((c) => c.id === action.id);
      if (!conn) return state;
      return {
        ...state,
        selectedConnId: action.id,
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
    case 'SET_GRADIENT_STOP': {
      const stops = state.customization.gradientStops;
      if (!stops[action.index]) return state;
      const newStops = stops.map((s, i) => i === action.index ? { ...s, color: action.color } : s);
      return { ...state, customization: { ...state.customization, gradientStops: newStops } };
    }
    case 'ADD_GRADIENT_STOP': {
      const stops = state.customization.gradientStops;
      const last = stops[stops.length - 1] ?? { color: '#000000', offset: 100 };
      const newOffset = Math.min(95, last.offset - 5);
      const newStops = [...stops, { color: '#ffffff', offset: newOffset }].sort((a, b) => a.offset - b.offset);
      return { ...state, customization: { ...state.customization, gradientStops: newStops } };
    }
    case 'REMOVE_GRADIENT_STOP': {
      if (state.customization.gradientStops.length <= 2) return state;
      const newStops = state.customization.gradientStops.filter((_, i) => i !== action.index);
      return { ...state, customization: { ...state.customization, gradientStops: newStops } };
    }
    case 'SET_GRADIENT_ANGLE': {
      if (state.customization.gradientAngle === action.angle) return state;
      return { ...state, customization: { ...state.customization, gradientAngle: action.angle } };
    }
    case 'SET_STROKE_WIDTH': {
      if (state.customization.strokeWidth === action.width) return state;
      return { ...state, customization: { ...state.customization, strokeWidth: action.width } };
    }
    case 'SET_STROKE_OPACITY': {
      if (state.customization.strokeOpacity === action.opacity) return state;
      return { ...state, customization: { ...state.customization, strokeOpacity: action.opacity } };
    }
    case 'SET_DASH_ARRAY': {
      if (state.customization.dashArray === action.dash) return state;
      return { ...state, customization: { ...state.customization, dashArray: action.dash } };
    }
    case 'SET_MARK': {
      if (state.customization.mark === action.mark) return state;
      return { ...state, customization: { ...state.customization, mark: action.mark } };
    }
    case 'SET_MEMBER_COUNT': {
      if (state.customization.memberCount === action.count) return state;
      return { ...state, customization: { ...state.customization, memberCount: action.count } };
    }
    case 'TOGGLE_FILTER': {
      return { ...state, customization: { ...state.customization, filterEnabled: !state.customization.filterEnabled } };
    }
    case 'SET_STROKE_OVERRIDE': {
      if (state.customization.strokeOverride === action.color) return state;
      return { ...state, customization: { ...state.customization, strokeOverride: action.color } };
    }
    case 'SET_GALLERY_FILTER': {
      if (state.galleryFilter === action.query) return state;
      return { ...state, galleryFilter: action.query };
    }
    case 'SET_BG_CATEGORY': {
      if (state.activeBgCategory === action.category) return state;
      return { ...state, activeBgCategory: action.category };
    }
    case 'SET_CONN_CATEGORY': {
      if (state.activeConnCategory === action.category) return state;
      return { ...state, activeConnCategory: action.category };
    }
    case 'RESET_CUSTOMIZATION': {
      let custom: Customization = { ...DEFAULT_CUSTOMIZATION };
      const bg = state.bgCards.find((c: BgCard) => c.id === state.selectedBgId);
      if (bg) Object.assign(custom, customizationFromBg(bg));
      const conn = state.connectors.find((c) => c.id === state.selectedConnId);
      if (conn) {
        Object.assign(custom, {
          strokeWidth: conn.stroke_width,
          strokeOpacity: conn.stroke_opacity,
          dashArray: conn.stroke_dasharray || '',
          filterEnabled: !!conn.filter,
          strokeOverride: conn.stroke?.startsWith('url(') ? '#ffffff' : conn.stroke,
        });
      }
      return { ...state, customization: custom };
    }
    case 'HYDRATE': {
      return { ...state, ...action.state };
    }
    default:
      return state;
  }
}

// URL encode/decode
export function encodeStateToQuery(state: StudioState): string {
  const p = new URLSearchParams();
  if (state.selectedBgId) p.set('b', state.selectedBgId);
  if (state.selectedConnId) p.set('n', state.selectedConnId);
  if (state.customization.mark !== 'paybox') p.set('m', state.customization.mark);
  if (state.customization.memberCount !== 5) p.set('s', String(state.customization.memberCount));
  if (state.customization.gradientAngle !== 145) p.set('a', String(state.customization.gradientAngle));
  if (state.customization.strokeWidth !== 1.2) p.set('w', String(state.customization.strokeWidth));
  if (state.customization.strokeOpacity !== 0.75) p.set('o', String(state.customization.strokeOpacity));
  if (state.customization.dashArray) p.set('d', state.customization.dashArray);
  if (!state.customization.filterEnabled) p.set('f', '0');
  if (state.customization.strokeOverride) p.set('sc', state.customization.strokeOverride.replace('#', ''));
  return p.toString();
}

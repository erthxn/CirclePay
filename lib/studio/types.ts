// Type definitions for CirclePay v3 design system.

export interface GradientStop {
  color: string;   // hex like "#4D68EB"
  offset: number;  // 0–100
}

export interface BgCard {
  id: string;
  name: string;
  category: string;
  pattern: string | null;
  gradient_angle: number;
  gradient_stops: GradientStop[];
  gradient_css: string;
  solid_color: string;
  text_color: string;
  tags: string[];
  preview_svg: string;
}

export interface Connector {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  stroke: string;
  stroke_width: number;
  stroke_opacity: number;
  stroke_dasharray: string;
  filter: string | null;
  description: string;
  tags: string[];
  preview_svg: string;
}

export type Mark = 'paybox' | 'migma' | 'solana' | 'none';
export type MemberCount = 5 | 7 | 10;

export interface Customization {
  gradientStops: GradientStop[];
  gradientAngle: number;
  strokeWidth: number;
  strokeOpacity: number;
  dashArray: string;
  mark: Mark;
  memberCount: MemberCount;
  filterEnabled: boolean;
  strokeOverride: string | null;
}

export interface StudioState {
  selectedBgId: string | null;
  selectedConnId: string | null;
  customization: Customization;
  galleryFilter: string;
  activeBgCategory: string | null;
  activeConnCategory: string | null;
  bgCards: BgCard[];
  connectors: Connector[];
}

export type StudioAction =
  | { type: 'SELECT_BG'; id: string }
  | { type: 'SELECT_CONNECTOR'; id: string }
  | { type: 'SET_GRADIENT_STOP'; index: number; color: string }
  | { type: 'ADD_GRADIENT_STOP' }
  | { type: 'REMOVE_GRADIENT_STOP'; index: number }
  | { type: 'SET_GRADIENT_ANGLE'; angle: number }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_STROKE_OPACITY'; opacity: number }
  | { type: 'SET_DASH_ARRAY'; dash: string }
  | { type: 'SET_MARK'; mark: Mark }
  | { type: 'SET_MEMBER_COUNT'; count: MemberCount }
  | { type: 'TOGGLE_FILTER' }
  | { type: 'SET_STROKE_OVERRIDE'; color: string | null }
  | { type: 'SET_GALLERY_FILTER'; query: string }
  | { type: 'SET_BG_CATEGORY'; category: string | null }
  | { type: 'SET_CONN_CATEGORY'; category: string | null }
  | { type: 'RESET_CUSTOMIZATION' }
  | { type: 'HYDRATE'; state: Partial<StudioState> };

export const DEFAULT_CUSTOMIZATION: Customization = {
  gradientStops: [
    { color: '#1e3a8a', offset: 0 },
    { color: '#0D5CFF', offset: 45 },
    { color: '#1e1b4b', offset: 100 },
  ],
  gradientAngle: 160,
  strokeWidth: 1.2,
  strokeOpacity: 0.75,
  dashArray: '',
  mark: 'paybox',
  memberCount: 5,
  filterEnabled: true,
  strokeOverride: '#ffffff',
};

export const MARKS: { id: Mark; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'migma', name: 'Migma' },
  { id: 'solana', name: 'Solana' },
  { id: 'none', name: 'None' },
];

export const MEMBER_COUNTS: MemberCount[] = [5, 7, 10];

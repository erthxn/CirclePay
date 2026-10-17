// Type definitions for the CirclePay Studio design system.
// These mirror the JSON schemas in /public/data/cards.json and /public/data/connectors.json.

export type CardStyle =
  | 'orbit' | 'spokes' | 'constellation' | 'halo' | 'bold' | 'radar'
  | 'neural' | 'quantum' | 'filigree' | 'halo-glow' | 'ribbon'
  | 'diamond' | 'starburst' | 'lattice';

export type CardMark = 'paybox' | 'solana' | 'none' | 'circlepay' | 'diamond' | 'crown';

export type MemberCount = 5 | 7 | 10;

export interface GradientStop {
  color: string;   // hex like "#FF6B35"
  offset: number;  // 0–100
}

export interface Card {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  style: CardStyle;
  mark: CardMark;
  n: MemberCount;
  gradient_angle: number;
  gradient_stops: GradientStop[];
  gradient_css: string;
  solid_color: string;
  tags: string[];
  preview_svg: string;
  preview_png: string;
}

export type ConnectorCategory =
  | 'Solid Lines' | 'Dashed Patterns' | 'Glowing Neon'
  | 'Gradient Strokes' | 'Decorative' | 'Curved Flowing'
  | 'Energy Flow' | 'Twin & Braided' | 'Textured Metallic'
  | 'Organic Natural';

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
  tags: string[];
  description: string;
  preview_svg: string;
  preview_png: string;
}

export interface Customization {
  gradientStops: GradientStop[];
  gradientAngle: number;
  strokeWidth: number;
  strokeOpacity: number;
  dashArray: string;
  mark: CardMark;
  memberCount: MemberCount;
  filterEnabled: boolean;
  strokeOverride: string | null;  // when user picks a custom stroke color
}

export interface BgCard {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  pattern: string | null;  // null | "grain" | "dot-grid" | etc.
  gradient_angle: number;
  gradient_stops: GradientStop[];
  gradient_css: string;
  solid_color: string;
  tags: string[];
  preview_svg: string;
  preview_png: string;
}

export interface StudioState {
  selectedCardId: string | null;
  selectedConnectorId: string | null;
  selectedBgCardId: string | null;
  customization: Customization;
  galleryFilter: string;
  activeCategory: string | null;
  activeTab: 'libraries' | 'templates' | 'custom' | 'preview';
  activeLibrary: 'cards' | 'bg' | 'connectors';
  editorView: 'edit' | 'preview';
  cards: Card[];
  connectors: Connector[];
  bgCards: BgCard[];
}

export type StudioAction =
  | { type: 'SELECT_CARD'; cardId: string }
  | { type: 'SELECT_CONNECTOR'; connectorId: string }
  | { type: 'SELECT_BG_CARD'; bgCardId: string }
  | { type: 'SET_GRADIENT_STOP'; index: number; color: string }
  | { type: 'ADD_GRADIENT_STOP' }
  | { type: 'REMOVE_GRADIENT_STOP'; index: number }
  | { type: 'SET_GRADIENT_ANGLE'; angle: number }
  | { type: 'SET_STROKE_WIDTH'; width: number }
  | { type: 'SET_STROKE_OPACITY'; opacity: number }
  | { type: 'SET_DASH_ARRAY'; dash: string }
  | { type: 'SET_MARK'; mark: CardMark }
  | { type: 'SET_MEMBER_COUNT'; count: MemberCount }
  | { type: 'TOGGLE_FILTER' }
  | { type: 'SET_STROKE_OVERRIDE'; color: string | null }
  | { type: 'SET_GALLERY_FILTER'; query: string }
  | { type: 'SET_ACTIVE_CATEGORY'; category: string | null }
  | { type: 'SET_ACTIVE_TAB'; tab: 'libraries' | 'templates' | 'custom' | 'preview' }
  | { type: 'SET_ACTIVE_LIBRARY'; library: 'cards' | 'bg' | 'connectors' }
  | { type: 'SET_EDITOR_VIEW'; view: 'edit' | 'preview' }
  | { type: 'RESET_CUSTOMIZATION' }
  | { type: 'LOAD_FROM_CARD'; card: Card }
  | { type: 'LOAD_FROM_BG_CARD'; bgCard: BgCard }
  | { type: 'LOAD_FROM_CONNECTOR'; connector: Connector }
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

export const CARD_STYLES: { id: CardStyle; label: string }[] = [
  { id: 'orbit', label: 'Orbit' },
  { id: 'spokes', label: 'Spokes' },
  { id: 'constellation', label: 'Constellation' },
  { id: 'halo', label: 'Halo' },
  { id: 'bold', label: 'Bold' },
  { id: 'radar', label: 'Radar' },
  { id: 'neural', label: 'Neural' },
  { id: 'quantum', label: 'Quantum' },
  { id: 'filigree', label: 'Filigree' },
  { id: 'halo-glow', label: 'Halo Glow' },
  { id: 'ribbon', label: 'Ribbon' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'starburst', label: 'Starburst' },
  { id: 'lattice', label: 'Lattice' },
];

export const CARD_MARKS: { id: CardMark; name: string }[] = [
  { id: 'paybox', name: 'PayBox' },
  { id: 'solana', name: 'Solana' },
  { id: 'circlepay', name: 'CirclePay' },
  { id: 'diamond', name: 'Diamond' },
  { id: 'crown', name: 'Crown' },
  { id: 'none', name: 'None' },
];

export const MEMBER_COUNTS: MemberCount[] = [5, 7, 10];

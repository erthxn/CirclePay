// Runtime-safe parsers for the cards/connectors/bg_cards JSON.
// Provide defaults and strip unknown fields so the rest of the
// app can trust the shape.

import type { Card, Connector, BgCard, GradientStop, CardStyle, CardMark, MemberCount } from './types';

const VALID_STYLES: CardStyle[] = [
  'orbit', 'spokes', 'constellation', 'halo', 'bold', 'radar',
  'neural', 'quantum', 'filigree', 'halo-glow', 'ribbon',
  'diamond', 'starburst', 'lattice',
];

const VALID_MARKS: CardMark[] = ['paybox', 'solana', 'none', 'circlepay', 'diamond', 'crown'];

function asStyle(v: unknown): CardStyle {
  return VALID_STYLES.includes(v as CardStyle) ? (v as CardStyle) : 'orbit';
}

function asMark(v: unknown): CardMark {
  return VALID_MARKS.includes(v as CardMark) ? (v as CardMark) : 'paybox';
}

function asMemberCount(v: unknown): MemberCount {
  const n = typeof v === 'number' ? v : 5;
  if (n === 5 || n === 7 || n === 10) return n;
  return 5;
}

function asStops(raw: unknown): GradientStop[] {
  if (!Array.isArray(raw)) {
    return [{ color: '#1e3a8a', offset: 0 }, { color: '#0D5CFF', offset: 45 }, { color: '#1e1b4b', offset: 100 }];
  }
  return raw
    .map((s: unknown) => {
      if (Array.isArray(s) && s.length >= 2) {
        // JSON serialized as [color, offset] tuples
        const [color, offset] = s as [unknown, unknown];
        if (typeof color === 'string' && (typeof offset === 'number' || typeof offset === 'string')) {
          return { color, offset: typeof offset === 'string' ? parseFloat(offset) : offset };
        }
      }
      if (s && typeof s === 'object' && 'color' in (s as object) && 'offset' in (s as object)) {
        const obj = s as { color: unknown; offset: unknown };
        if (typeof obj.color === 'string' && (typeof obj.offset === 'number' || typeof obj.offset === 'string')) {
          return { color: obj.color, offset: typeof obj.offset === 'string' ? parseFloat(obj.offset) : obj.offset };
        }
      }
      return null;
    })
    .filter((s): s is GradientStop => s !== null);
}

export function parseCard(raw: unknown): Card {
  const r = (raw ?? {}) as Record<string, unknown>;
  const stops = asStops(r.gradient_stops);
  return {
    id: typeof r.id === 'string' ? r.id : 'unknown',
    name: typeof r.name === 'string' ? r.name : 'Untitled',
    category: typeof r.category === 'string' ? r.category : 'Uncategorized',
    subcategory: typeof r.subcategory === 'string' ? r.subcategory : '',
    style: asStyle(r.style),
    mark: asMark(r.mark),
    n: asMemberCount(r.n),
    gradient_angle: typeof r.gradient_angle === 'number' ? r.gradient_angle : 145,
    gradient_stops: stops,
    gradient_css: typeof r.gradient_css === 'string' ? r.gradient_css : '',
    solid_color: typeof r.solid_color === 'string' ? r.solid_color : '#1a1d24',
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    preview_svg: typeof r.preview_svg === 'string' ? r.preview_svg : '',
    preview_png: typeof r.preview_png === 'string' ? r.preview_png : '',
  };
}

export function parseConnector(raw: unknown): Connector {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === 'string' ? r.id : 'unknown',
    name: typeof r.name === 'string' ? r.name : 'Untitled',
    category: typeof r.category === 'string' ? r.category : 'Uncategorized',
    subcategory: typeof r.subcategory === 'string' ? r.subcategory : '',
    stroke: typeof r.stroke === 'string' ? r.stroke : '#ffffff',
    stroke_width: typeof r.stroke_width === 'number' ? r.stroke_width : 1.0,
    stroke_opacity: typeof r.stroke_opacity === 'number' ? r.stroke_opacity : 0.7,
    stroke_dasharray: typeof r.stroke_dasharray === 'string' ? r.stroke_dasharray : '',
    filter: r.filter === null || typeof r.filter === 'string' ? r.filter as string | null : null,
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    description: typeof r.description === 'string' ? r.description : '',
    preview_svg: typeof r.preview_svg === 'string' ? r.preview_svg : '',
    preview_png: typeof r.preview_png === 'string' ? r.preview_png : '',
  };
}

export function parseCards(raw: unknown): Card[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as { cards?: unknown };
  if (!Array.isArray(obj.cards)) return [];
  return obj.cards.map(parseCard);
}

export function parseBgCard(raw: unknown): BgCard {
  const r = (raw ?? {}) as Record<string, unknown>;
  const stops = asStops(r.gradient_stops);
  return {
    id: typeof r.id === 'string' ? r.id : 'unknown',
    name: typeof r.name === 'string' ? r.name : 'Untitled',
    category: typeof r.category === 'string' ? r.category : 'Uncategorized',
    subcategory: typeof r.subcategory === 'string' ? r.subcategory : '',
    pattern: r.pattern === null || typeof r.pattern === 'string' ? (r.pattern as string | null) : null,
    gradient_angle: typeof r.gradient_angle === 'number' ? r.gradient_angle : 145,
    gradient_stops: stops,
    gradient_css: typeof r.gradient_css === 'string' ? r.gradient_css : '',
    solid_color: typeof r.solid_color === 'string' ? r.solid_color : '#1a1d24',
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    preview_svg: typeof r.preview_svg === 'string' ? r.preview_svg : '',
    preview_png: typeof r.preview_png === 'string' ? r.preview_png : '',
  };
}

export function parseBgCards(raw: unknown): BgCard[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as { cards?: unknown };
  if (!Array.isArray(obj.cards)) return [];
  return obj.cards.map(parseBgCard);
}

export function parseConnectors(raw: unknown): Connector[] {
  if (!raw || typeof raw !== 'object') return [];
  const obj = raw as { connectors?: unknown };
  if (!Array.isArray(obj.connectors)) return [];
  return obj.connectors.map(parseConnector);
}

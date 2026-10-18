// Runtime-safe parsers for the bg_cards.json and connectors.json data files.

import type { BgCard, Connector, GradientStop } from './types';

function asStops(raw: unknown): GradientStop[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s) => {
    // Handle both tuple form [color, offset] and dict form {color, offset}
    if (Array.isArray(s) && s.length >= 2) {
      return { color: String(s[0]), offset: Number(s[1]) };
    }
    if (s && typeof s === 'object') {
      const obj = s as { color?: unknown; offset?: unknown };
      if (typeof obj.color === 'string' && (typeof obj.offset === 'number' || typeof obj.offset === 'string')) {
        return { color: obj.color, offset: Number(obj.offset) };
      }
    }
    return { color: '#000000', offset: 0 };
  });
}

export function parseBgCard(raw: unknown): BgCard {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof r.id === 'string' ? r.id : 'unknown',
    name: typeof r.name === 'string' ? r.name : 'Untitled',
    category: typeof r.category === 'string' ? r.category : 'Uncategorized',
    pattern: r.pattern === null || typeof r.pattern === 'string' ? (r.pattern as string | null) : null,
    gradient_angle: typeof r.gradient_angle === 'number' ? r.gradient_angle : 145,
    gradient_stops: asStops(r.gradient_stops),
    gradient_css: typeof r.gradient_css === 'string' ? r.gradient_css : '',
    solid_color: typeof r.solid_color === 'string' ? r.solid_color : '#0a0a0f',
    text_color: typeof r.text_color === 'string' ? r.text_color : '#FFFFFF',
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    preview_svg: typeof r.preview_svg === 'string' ? r.preview_svg : '',
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
    stroke_opacity: typeof r.stroke_opacity === 'number' ? r.stroke_opacity : 0.75,
    stroke_dasharray: typeof r.stroke_dasharray === 'string' ? r.stroke_dasharray : '',
    filter: r.filter === null || typeof r.filter === 'string' ? (r.filter as string | null) : null,
    description: typeof r.description === 'string' ? r.description : '',
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    preview_svg: typeof r.preview_svg === 'string' ? r.preview_svg : '',
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

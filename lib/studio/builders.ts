// Pure SVG/CSS string builders for bg-cards, connectors, marks, and pattern overlays.

import type { GradientStop, Connector, Customization, BgCard, Mark } from './types';

export function buildGradientCss(stops: GradientStop[], angle: number): string {
  if (!stops.length) return '#0a0a0f';
  const parts = stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `${s.color} ${Math.round(s.offset)}%`)
    .join(', ');
  return `linear-gradient(${Math.round(angle)}deg, ${parts})`;
}

export function buildSolidColor(stops: GradientStop[]): string {
  if (!stops.length) return '#0a0a0f';
  const sorted = stops.slice().sort((a, b) => a.offset - b.offset);
  return sorted[sorted.length - 1].color;
}

// Member positions for a circle of N members around center (50,50) in 100x100 viewBox
export function makeMembers(n: number) {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = 30;
    return {
      letter: LETTERS[i] ?? '?',
      amount: Math.round((20 - i * (15 / n)) * 100) / 100,
      hue: Math.round((i * 360 / n) % 360),
      x: 50 + Math.cos(a) * r,
      y: 50 + Math.sin(a) * r,
      a,
    };
  });
}

// ---- SVG defs (gradients + glow filters used by connectors) ----

export function renderSvgDefs(): string {
  return `<defs>
    <linearGradient id="grad-sheen" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#888"/><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#888"/></linearGradient>
    <linearGradient id="grad-copper" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#7A3F1D"/><stop offset="0.5" stop-color="#FFD8B5"/><stop offset="1" stop-color="#7A3F1D"/></linearGradient>
    <linearGradient id="grad-gold-wire" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#7A5800"/><stop offset="0.5" stop-color="#FFF6B0"/><stop offset="1" stop-color="#7A5800"/></linearGradient>
    <linearGradient id="grad-patina" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#3A5F5E"/><stop offset="0.5" stop-color="#7CB7B6"/><stop offset="1" stop-color="#3A5F5E"/></linearGradient>
    <linearGradient id="grad-sunset" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF6B35"/><stop offset="1" stop-color="#FFD700"/></linearGradient>
    <linearGradient id="grad-ocean" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#0077B6"/><stop offset="1" stop-color="#90E0EF"/></linearGradient>
    <linearGradient id="grad-fire" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF0000"/><stop offset="1" stop-color="#FFD700"/></linearGradient>
    <linearGradient id="grad-rainbow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF0000"/><stop offset="0.33" stop-color="#FFFF00"/><stop offset="0.66" stop-color="#00FF00"/><stop offset="1" stop-color="#9D4EDD"/></linearGradient>
    <linearGradient id="grad-aurora" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#00F5D4"/><stop offset="0.5" stop-color="#00BBF9"/><stop offset="1" stop-color="#9B5DE5"/></linearGradient>
    <linearGradient id="grad-cosmic" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#10002B"/><stop offset="0.5" stop-color="#9D4EDD"/><stop offset="1" stop-color="#FF61DC"/></linearGradient>
    <linearGradient id="grad-forest" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#0F5132"/><stop offset="1" stop-color="#6EE7B7"/></linearGradient>
    <linearGradient id="grad-desert" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#E8C39E"/><stop offset="1" stop-color="#6B4423"/></linearGradient>
    <linearGradient id="grad-candy" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF1493"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
    <linearGradient id="grad-steel" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#2B2D33"/><stop offset="1" stop-color="#6B7280"/></linearGradient>
    <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-magenta" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-lime" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
}

// ---- Brand mark renderers (PayBox, Migma, Solana, None) ----

export function renderMark(mark: Mark, mid: string): string {
  if (mark === 'paybox') {
    return `<g transform="translate(80 80) rotate(-16) scale(0.04)" opacity="0.85" fill="#ffffff"><path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z"/><path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z"/><path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z"/></g>`;
  }
  if (mark === 'migma') {
    return `<g transform="translate(75 75) scale(0.11)" opacity="0.95"><polygon points="92,99 180,149 268,99 268,268 92,268" fill="#ffffff"/></g>`;
  }
  if (mark === 'solana') {
    return `<defs><linearGradient id="sol-${mid}" x1="320" y1="90" x2="80" y2="310"><stop offset="0" stop-color="#14F195"/><stop offset="1" stop-color="#9945FF"/></linearGradient></defs><g transform="translate(78 78) rotate(-16) scale(0.035)" fill="url(#sol-${mid})"><path d="M130 92 H312 Q324 92 316 102 L272 144 Q268 148 262 148 H88 Q76 148 84 138 L124 96 Q127 92 130 92 Z"/><path d="M88 172 H262 Q268 172 272 176 L316 218 Q324 228 312 228 H130 Q127 228 124 224 L84 182 Q76 172 88 172 Z"/><path d="M130 252 H312 Q324 252 316 262 L272 304 Q268 308 262 308 H88 Q76 308 84 298 L124 256 Q127 252 130 252 Z"/></g>`;
  }
  return '';
}

// ---- Connector stroke builders ----
// Each connector id maps to a pure function (cx, cy, m, c) → SVG snippet.
// m = {x, y, a, letter, hue, amount} (member position)
// c = {stroke, opacity, strokeOverride} (customization-aware style)

interface Member {
  x: number; y: number; a: number;
  letter: string; hue: number; amount: number;
}

interface ConnStyle {
  stroke: string; opacity: number; strokeOverride: string | null;
}

function effectiveStroke(c: ConnStyle, fallback: string): string {
  return c.strokeOverride ?? fallback;
}

function dashAttr(c: Customization, conn: Connector): string {
  if (c.dashArray) return ` stroke-dasharray="${c.dashArray}"`;
  if (conn.stroke_dasharray) return ` stroke-dasharray="${conn.stroke_dasharray}"`;
  return '';
}

function filterAttr(c: Customization, conn: Connector): string {
  if (c.filterEnabled && conn.filter) return ` filter="url(#${conn.filter})"`;
  return '';
}

// RENDERERS — one function per connector id (must match gen_v3.py 1:1)

const RENDERERS: Record<string, (cx: number, cy: number, m: Member, c: ConnStyle) => string> = {
  // --- 1. Solid Lines (10) ---
  'solid-001': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.6" stroke-opacity="${c.opacity}"/>`,
  'solid-002': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}"/>`,
  'solid-003': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.0" stroke-opacity="${c.opacity}"/>`,
  'solid-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity * 0.4}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`,
  'solid-005': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.3" stroke-opacity="${c.opacity}" stroke-linecap="round"/>`,
  'solid-006': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.5" stroke-opacity="${c.opacity}" stroke-linecap="square"/>`,
  'solid-007': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    return `<line x1="${(cx+nx).toFixed(2)}" y1="${(cy+ny).toFixed(2)}" x2="${(m.x+nx).toFixed(2)}" y2="${(m.y+ny).toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/><line x1="${(cx-nx).toFixed(2)}" y1="${(cy-ny).toFixed(2)}" x2="${(m.x-nx).toFixed(2)}" y2="${(m.y-ny).toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
  },
  'solid-008': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = '';
    for (const off of [-1.5, 0, 1.5]) {
      out += `<line x1="${(cx+nx*off).toFixed(2)}" y1="${(cy+ny*off).toFixed(2)}" x2="${(m.x+nx*off).toFixed(2)}" y2="${(m.y+ny*off).toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.6" stroke-opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'solid-009': (cx, cy, m, c) => `<line x1="${cx+0.3}" y1="${cy+0.3}" x2="${(m.x+0.3).toFixed(2)}" y2="${(m.y+0.3).toFixed(2)}" stroke="#000" stroke-width="1.5" stroke-opacity="0.5"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}"/>`,
  'solid-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.5" stroke-opacity="0.5"/>`,

  // --- 2. Dashed Patterns (10) ---
  'dashed-001': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.6" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-dasharray="0.1 5"/>`,
  'dashed-002': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="3 3"/>`,
  'dashed-003': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="8 4"/>`,
  'dashed-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="6 3 0.1 3"/>`,
  'dashed-005': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.4" stroke-opacity="${c.opacity}" stroke-dasharray="6 2 0.1 2 0.1 2 0.1 2 6 4"/>`,
  'dashed-006': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity*0.5}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.4" stroke-opacity="${c.opacity}" stroke-dasharray="0.1 8" stroke-linecap="round"/>`,
  'dashed-007': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.6" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-dasharray="0.1 4"/>`,
  'dashed-008': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="8 3 0.1 3 0.1 3"/>`,
  'dashed-009': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="8 2 3 2"/>`,
  'dashed-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}" stroke-dasharray="2 2 6 2"/>`,

  // --- 3. Curved Flowing (10) ---
  'curve-001': (cx, cy, m, c) => {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const ox = Math.cos(m.a + Math.PI/2) * 7.5, oy = Math.sin(m.a + Math.PI/2) * 7.5;
    return `<path d="M ${cx} ${cy} Q ${(mx+ox).toFixed(2)} ${(my+oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-002': (cx, cy, m, c) => {
    const ox = Math.cos(m.a + Math.PI/2) * 9, oy = Math.sin(m.a + Math.PI/2) * 9;
    return `<path d="M ${cx} ${cy} C ${(cx+ox).toFixed(2)} ${(cy+oy).toFixed(2)} ${(m.x-ox).toFixed(2)} ${(m.y-oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-003': (cx, cy, m, c) => {
    const pts: [number, number][] = [];
    for (let t = 0; t < 20; t++) {
      const frac = t / 19;
      const ang = m.a + frac * Math.PI * 1.5;
      const radius = 30 * frac;
      pts.push([cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius]);
    }
    const d = `M ${cx} ${cy} ` + pts.map(p => `L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-004': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 2;
      pts.push([bx + nx * wave, by + ny * wave]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-005': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts1: [number, number][] = [], pts2: [number, number][] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 2) * 1.5;
      pts1.push([bx + nx * (wave + 0.75), by + ny * (wave + 0.75)]);
      pts2.push([bx + nx * (wave - 0.75), by + ny * (wave - 0.75)]);
    }
    const d1 = 'M ' + pts1.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    const d2 = 'M ' + pts2.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d1}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity*0.7}"/><path d="${d2}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity*0.7}"/>`;
  },
  'curve-006': (cx, cy, m, c) => {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const ox = Math.cos(m.a + Math.PI/2) * 7, oy = Math.sin(m.a + Math.PI/2) * 7;
    return `<path d="M ${cx} ${cy} Q ${(mx+ox).toFixed(2)} ${(my+oy).toFixed(2)} ${(mx-ox).toFixed(2)} ${(my-oy).toFixed(2)} Q ${(mx+ox*0.5).toFixed(2)} ${(my+oy*0.5).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.9" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-007': (cx, cy, m, c) => {
    const pts: [number, number][] = [];
    for (let t = 0; t < 24; t++) {
      const frac = t / 23;
      const ang = m.a - frac * Math.PI * 2.2;
      const radius = 30 * frac;
      pts.push([cx + Math.cos(ang) * radius, cy + Math.sin(ang) * radius]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-008': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const sign = i % 2 === 0 ? 1 : -1;
      pts.push([bx + nx * 1.25 * sign, by + ny * 1.25 * sign]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.9" stroke-opacity="${c.opacity}"/>`;
  },
  'curve-009': (cx, cy, m, c) => {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const ox = Math.cos(m.a + Math.PI/2) * 7, oy = Math.sin(m.a + Math.PI/2) * 7;
    let out = `<path d="M ${cx} ${cy} Q ${(mx+ox).toFixed(2)} ${(my+oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity*0.7}"/>`;
    for (let i = 1; i <= 3; i++) {
      const t = i / 4;
      const bx = cx + (m.x - cx) * t + ox * Math.sin(t * Math.PI);
      const by = cy + (m.y - cy) * t + oy * Math.sin(t * Math.PI);
      out += `<circle cx="${bx.toFixed(2)}" cy="${(by + 1.5).toFixed(2)}" r="0.5" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.8}"/>`;
    }
    return out;
  },
  'curve-010': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const arc = 4 * Math.sin(t * Math.PI);
      pts.push([bx + nx * arc, by + ny * arc]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
  },

  // --- 4. Glowing Neon (10) - use connector.stroke as the color, override optional ---
  'neon-001': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#00FFFF')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-cyan)"/>`,
  'neon-002': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#FF00FF')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-magenta)"/>`,
  'neon-003': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#00FF66')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-green)"/>`,
  'neon-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#FFD700')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-gold)"/>`,
  'neon-005': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#B026FF')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-purple)"/>`,
  'neon-006': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#FF6B00')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-orange)"/>`,
  'neon-007': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#FF1744')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-red)"/>`,
  'neon-008': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#00B0FF')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-blue)"/>`,
  'neon-009': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#FF1493')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-pink)"/>`,
  'neon-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#CCFF00')}" stroke-width="1.4" stroke-opacity="${c.opacity}" filter="url(#glow-lime)"/>`,

  // --- 5. Gradient Strokes (10) - use url(#grad-X) ---
  'gradient-001': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-sunset)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-002': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-ocean)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-003': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-fire)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-rainbow)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-005': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-aurora)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-006': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-cosmic)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-007': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-forest)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-008': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-desert)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-009': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-candy)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,
  'gradient-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-steel)" stroke-width="1.6" stroke-opacity="${c.opacity}"/>`,

  // --- 6. Decorative (10) ---
  'deco-001': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="3" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-dasharray="0.1 6"/>`,
  'deco-002': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="4" stroke-opacity="${c.opacity*0.4}" stroke-linecap="round" stroke-dasharray="0.1 7"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="3" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-dasharray="0.1 7"/>`,
  'deco-003': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity*0.5}"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const px = cx + dx * t, py = cy + dy * t;
      out += `<path d="M ${px.toFixed(2)} ${(py-0.75).toFixed(2)} L ${(px+0.75).toFixed(2)} ${py.toFixed(2)} L ${px.toFixed(2)} ${(py+0.75).toFixed(2)} L ${(px-0.75).toFixed(2)} ${py.toFixed(2)} Z" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'deco-004': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity*0.5}"/>`;
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const px = cx + dx * t, py = cy + dy * t;
      let pts = '';
      for (let i = 0; i < 10; i++) {
        const ang = -Math.PI/2 + i * Math.PI / 5;
        const rr = i % 2 === 0 ? 0.75 : 0.3;
        pts += `${(px + rr * Math.cos(ang)).toFixed(2)} ${(py + rr * Math.sin(ang)).toFixed(2)} `;
      }
      out += `<polygon points="${pts.trim()}" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'deco-005': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity*0.5}"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const px = cx + dx * t, py = cy + dy * t;
      out += `<polygon points="${px.toFixed(2)},${(py-1).toFixed(2)} ${(px+0.75).toFixed(2)},${py.toFixed(2)} ${px.toFixed(2)},${(py+1).toFixed(2)} ${(px-0.75).toFixed(2)},${py.toFixed(2)}" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'deco-006': (cx, cy, m, c) => {
    const ang = m.a;
    const bx = m.x - Math.cos(ang) * 4.5, by = m.y - Math.sin(ang) * 4.5;
    return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity*0.7}"/><path d="M ${m.x.toFixed(2)} ${m.y.toFixed(2)} L ${(bx - Math.cos(ang+2.4)*2).toFixed(2)} ${(by - Math.sin(ang+2.4)*2).toFixed(2)} L ${(bx - Math.cos(ang-2.4)*2).toFixed(2)} ${(by - Math.sin(ang-2.4)*2).toFixed(2)} Z" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
  },
  'deco-007': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      const r = 0.3 + i * 0.1;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="${r.toFixed(2)}" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'deco-008': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity*0.4}"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      const ang = m.a;
      const p1 = [bx - Math.cos(ang)*0.75 - Math.cos(ang+Math.PI/2)*0.75, by - Math.sin(ang)*0.75 - Math.sin(ang+Math.PI/2)*0.75];
      const p2 = [bx + Math.cos(ang)*0.75, by + Math.sin(ang)*0.75];
      const p3 = [bx - Math.cos(ang)*0.75 + Math.cos(ang+Math.PI/2)*0.75, by - Math.sin(ang)*0.75 + Math.sin(ang+Math.PI/2)*0.75];
      out += `<path d="M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} L ${p3[0].toFixed(2)} ${p3[1].toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return out;
  },
  'deco-009': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity*0.5}"/>`;
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      const px = cx + dx * t, py = cy + dy * t;
      if (k % 2 === 0) {
        out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="0.6" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
      } else {
        out += `<rect x="${(px-0.6).toFixed(2)}" y="${(py-0.6).toFixed(2)}" width="1.2" height="1.2" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}" transform="rotate(45 ${px.toFixed(2)} ${py.toFixed(2)})"/>`;
      }
    }
    return out;
  },
  'deco-010': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.3" stroke-opacity="${c.opacity*0.3}"/>`;
    for (let k = 2; k < 5; k++) {
      const t = k / 5;
      const px = cx + dx * t, py = cy + dy * t;
      for (let p = 0; p < 6; p++) {
        const ang = p * Math.PI / 3;
        const lx = px + Math.cos(ang) * 1.0, ly = py + Math.sin(ang) * 1.0;
        out += `<ellipse cx="${((px+lx)/2).toFixed(2)}" cy="${((py+ly)/2).toFixed(2)}" rx="0.6" ry="0.3" transform="rotate(${(math_degrees(ang)).toFixed(2)} ${((px+lx)/2).toFixed(2)} ${((py+ly)/2).toFixed(2)})" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.7}"/>`;
      }
      out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="0.4" fill="#FFD700" opacity="${c.opacity}"/>`;
    }
    return out;
  },

  // --- 7. Energy Flow (10) ---
  'energy-001': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const offset = (i === 0 || i === steps) ? 0 : (i % 2 === 0 ? 2.5 : -2.5);
      pts.push([bx + nx * offset, by + ny * offset]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#FFE066')}" stroke-width="1.5" stroke-opacity="${c.opacity}" stroke-linejoin="round" filter="url(#glow-gold)"/>`;
  },
  'energy-002': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let i = 1; i < 8; i++) {
      const t = i / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      const r = 0.5 + i * 0.25;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="${r.toFixed(2)}" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'energy-003': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity*0.4}"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      const ang = m.a;
      const p1 = [bx - Math.cos(ang)*0.75 - Math.cos(ang+Math.PI/2)*0.75, by - Math.sin(ang)*0.75 - Math.sin(ang+Math.PI/2)*0.75];
      const p2 = [bx + Math.cos(ang)*0.75, by + Math.sin(ang)*0.75];
      const p3 = [bx - Math.cos(ang)*0.75 + Math.cos(ang+Math.PI/2)*0.75, by - Math.sin(ang)*0.75 + Math.sin(ang+Math.PI/2)*0.75];
      out += `<path d="M ${p1[0].toFixed(2)} ${p1[1].toFixed(2)} L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)} L ${p3[0].toFixed(2)} ${p3[1].toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return out;
  },
  'energy-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#FF0040" stroke-width="0.75" stroke-opacity="0.3"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#FF0040" stroke-width="0.4" stroke-opacity="0.7"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.12" stroke-opacity="${c.opacity}"/>`,
  'energy-005': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const offset = (i === 0 || i === steps) ? 0 : (i % 2 === 0 ? 2 : -2);
      pts.push([bx + nx * offset, by + ny * offset]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#FFD700')}" stroke-width="1.4" stroke-opacity="${c.opacity}" stroke-linejoin="round" filter="url(#glow-gold)"/>`;
  },
  'energy-006': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const bx = cx + dx * t, by = cy + dy * t;
      const ox = (i * 7) % 5 - 2;
      const oy = (i * 11) % 5 - 2;
      out += `<rect x="${(bx+ox*0.1-0.15).toFixed(2)}" y="${(by+oy*0.1-0.15).toFixed(2)}" width="0.3" height="0.3" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'energy-007': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 4) * 1.5;
      pts.push([bx + nx * wave, by + ny * wave]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#00FFFF')}" stroke-width="1.0" stroke-opacity="${c.opacity}" filter="url(#glow-cyan)"/>`;
  },
  'energy-008': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = ((t * 4) % 1 - 0.5) * 4;
      pts.push([bx + nx * wave, by + ny * wave]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
  },
  'energy-009': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.floor(t * 4) % 2 === 0 ? 1.5 : -1.5;
      pts.push([bx + nx * wave, by + ny * wave]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
  },
  'energy-010': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="${(1 + k*0.3).toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity*0.8}"/>`;
    }
    return out;
  },

  // --- 8. Twin & Braided (10) ---
  'twin-001': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts1: [number, number][] = [], pts2: [number, number][] = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 4) * 1.25;
      pts1.push([bx + nx * wave, by + ny * wave]);
      pts2.push([bx - nx * wave, by - ny * wave]);
    }
    const d1 = 'M ' + pts1.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    const d2 = 'M ' + pts2.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d1}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/><path d="${d2}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
  },
  'twin-002': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = '';
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps, t2 = (i + 1) / steps;
      const o1 = i % 2 === 0 ? 1 : -1, o2 = i % 2 === 0 ? -1 : 1;
      const x1 = cx + dx * t1 + nx * o1, y1 = cy + dy * t1 + ny * o1;
      const x2 = cx + dx * t2 + nx * o2, y2 = cy + dy * t2 + ny * o2;
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'twin-003': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity*0.5}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<line x1="${(bx-nx*0.5).toFixed(2)}" y1="${(by-ny*0.5).toFixed(2)}" x2="${(bx+nx*0.5).toFixed(2)}" y2="${(by+ny*0.5).toFixed(2)}" stroke="#000" stroke-width="0.2" stroke-opacity="0.5"/>`;
    }
    return out;
  },
  'twin-004': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts1: [number, number][] = [], pts2: [number, number][] = [];
    let rungs = '';
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 1.5;
      pts1.push([bx + nx * wave, by + ny * wave]);
      pts2.push([bx - nx * wave, by - ny * wave]);
      if (i % 3 === 0) {
        rungs += `<line x1="${pts1[pts1.length-1][0].toFixed(2)}" y1="${pts1[pts1.length-1][1].toFixed(2)}" x2="${pts2[pts2.length-1][0].toFixed(2)}" y2="${pts2[pts2.length-1][1].toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.2" stroke-opacity="${c.opacity*0.5}"/>`;
      }
    }
    const d1 = 'M ' + pts1.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    const d2 = 'M ' + pts2.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    return `<path d="${d1}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/><path d="${d2}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>${rungs}`;
  },
  'twin-005': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = '';
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps, t2 = (i + 1) / steps;
      let x1 = cx + dx * t1, y1 = cy + dy * t1;
      let x2 = cx + dx * t2, y2 = cy + dy * t2;
      if (i % 2 === 0) { x1 += nx * 0.5; y1 += ny * 0.5; x2 += nx * 0.5; y2 += ny * 0.5; }
      else { x1 -= nx * 0.5; y1 -= ny * 0.5; x2 -= nx * 0.5; y2 -= ny * 0.5; }
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity}" stroke-linecap="round"/>`;
    }
    return out;
  },
  'twin-006': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity*0.4}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity*0.85}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.3" stroke-opacity="${c.opacity}"/>`,
  'twin-007': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = '';
    const steps = 8;
    for (let strand = 0; strand < 3; strand++) {
      const offsetPhase = strand * 2 * Math.PI / 3;
      for (let i = 0; i < steps; i++) {
        const t1 = i / steps, t2 = (i + 1) / steps;
        const o1 = Math.sin(t1 * Math.PI * 2 + offsetPhase) * 1.2;
        const o2 = Math.sin(t2 * Math.PI * 2 + offsetPhase) * 1.2;
        const x1 = cx + dx * t1 + nx * o1, y1 = cy + dy * t1 + ny * o1;
        const x2 = cx + dx * t2 + nx * o2, y2 = cy + dy * t2 + ny * o2;
        out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
      }
    }
    return out;
  },
  'twin-008': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let k = 1; k < 8; k++) {
      const t = k / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.8" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity}"/>`;
    }
    return out;
  },
  'twin-009': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<ellipse cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" rx="1.0" ry="0.5" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity}" transform="rotate(${math_degrees(m.a).toFixed(2)} ${bx.toFixed(2)} ${by.toFixed(2)})"/>`;
    }
    return out;
  },
  'twin-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="3" stroke-opacity="${c.opacity}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.3" stroke-opacity="${c.opacity*0.8}"/>`,

  // --- 9. Textured Metallic (10) ---
  'texture-001': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity*0.6}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = -2; k <= 2; k++) {
      out += `<line x1="${(cx+nx*k*0.075).toFixed(2)}" y1="${(cy+ny*k*0.075).toFixed(2)}" x2="${(m.x+nx*k*0.075).toFixed(2)}" y2="${(m.y+ny*k*0.075).toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.15" stroke-opacity="${c.opacity*0.3}"/>`;
    }
    return out;
  },
  'texture-002': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let i = 0; i < 10; i++) {
      const t1 = i / 10, t2 = (i + 1) / 10;
      const x1 = cx + dx * t1, y1 = cy + dy * t1;
      const x2 = cx + dx * t2, y2 = cy + dy * t2;
      const color = i % 2 === 0 ? '#1A1A1A' : '#3A3A3A';
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="2.5" stroke-opacity="${c.opacity*0.8}"/>`;
    }
    return out;
  },
  'texture-003': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#888" stroke-width="2.5" stroke-opacity="${c.opacity*0.7}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.5" stroke-opacity="${c.opacity}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#bbb" stroke-width="1.2" stroke-opacity="${c.opacity*0.5}"/>`,
  'texture-004': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-copper)" stroke-width="2.5" stroke-opacity="${c.opacity}"/>`,
  'texture-005': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-gold-wire)" stroke-width="2.5" stroke-opacity="${c.opacity}"/>`,
  'texture-006': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2" stroke-opacity="${c.opacity*0.6}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<line x1="${(bx-nx*0.5).toFixed(2)}" y1="${(by-ny*0.5).toFixed(2)}" x2="${(bx+nx*0.5).toFixed(2)}" y2="${(by+ny*0.5).toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.2" stroke-opacity="${c.opacity*0.4}"/>`;
    }
    return out;
  },
  'texture-007': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#C9CCD1" stroke-width="2.5" stroke-opacity="${c.opacity*0.8}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#3A3D40" stroke-width="1" stroke-opacity="${c.opacity*0.5}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.3" stroke-opacity="${c.opacity*0.6}"/>`,
  'texture-008': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#4A4E59" stroke-width="2.5" stroke-opacity="${c.opacity*0.7}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#2B2D33" stroke-width="1" stroke-opacity="${c.opacity}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#6B7280" stroke-width="0.4" stroke-opacity="${c.opacity*0.5}"/>`,
  'texture-009': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-patina)" stroke-width="2.5" stroke-opacity="${c.opacity}"/>`,
  'texture-010': (cx, cy, m, c) => `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#3D3D3D" stroke-width="2.5" stroke-opacity="${c.opacity*0.8}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#7A1F1F" stroke-width="0.8" stroke-opacity="${c.opacity*0.4}"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#0A0A0A" stroke-width="1.5" stroke-opacity="${c.opacity*0.4}"/>`,

  // --- 10. Organic Natural (10) ---
  'organic-001': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const pts: [number, number][] = [];
    const steps = 16;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 1.0;
      pts.push([bx + nx * wave, by + ny * wave]);
    }
    const d = 'M ' + pts.map(p => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L ');
    let out = `<path d="${d}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.2" stroke-opacity="${c.opacity}"/>`;
    for (let k = 0; k < steps; k += 4) {
      const t = k / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 1.0;
      const finalBx = bx + nx * wave, finalBy = by + ny * wave;
      const sign = k % 8 === 0 ? 1 : -1;
      const lx = finalBx + nx * sign * 2, ly = finalBy + ny * sign * 2;
      out += `<ellipse cx="${((finalBx+lx)/2).toFixed(2)}" cy="${((finalBy+ly)/2).toFixed(2)}" rx="1" ry="0.5" transform="rotate(${math_degrees(Math.atan2(ly-finalBy, lx-finalBx)).toFixed(2)} ${((finalBx+lx)/2).toFixed(2)} ${((finalBy+ly)/2).toFixed(2)})" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.7}"/>`;
    }
    return out;
  },
  'organic-002': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.5" stroke-opacity="${c.opacity}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      const bx = cx + dx * t, by = cy + dy * t;
      for (const sign of [-1, 1]) {
        const bx2 = bx + nx * sign * 2.5, by2 = by + ny * sign * 2.5;
        out += `<line x1="${bx.toFixed(2)}" y1="${by.toFixed(2)}" x2="${bx2.toFixed(2)}" y2="${by2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity*0.7}"/>`;
      }
    }
    return out;
  },
  'organic-003': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = `<path d="M ${cx} ${cy} Q ${((cx+m.x)/2 + nx*1.5).toFixed(2)} ${((cy+m.y)/2 + ny*1.5).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.4" stroke-opacity="${c.opacity}"/>`;
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      const bx = cx + dx * t, by = cy + dy * t;
      for (const sign of [-1, 1]) {
        const bx2 = bx + nx * sign * 2 * (1 - t), by2 = by + ny * sign * 2 * (1 - t);
        out += `<line x1="${bx.toFixed(2)}" y1="${by.toFixed(2)}" x2="${bx2.toFixed(2)}" y2="${by2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.5" stroke-opacity="${c.opacity*0.6}"/>`;
      }
    }
    return out;
  },
  'organic-004': (cx, cy, m, c) => {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    let out = `<path d="M ${cx} ${cy} Q ${(mx + nx*1).toFixed(2)} ${(my + ny*1).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
    const leaf_x = mx + nx * 2, leaf_y = my + ny * 2;
    out += `<ellipse cx="${leaf_x.toFixed(2)}" cy="${leaf_y.toFixed(2)}" rx="1.5" ry="0.7" transform="rotate(${math_degrees(Math.atan2(ny, nx)).toFixed(2)} ${leaf_x.toFixed(2)} ${leaf_y.toFixed(2)})" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.7}"/>`;
    return out;
  },
  'organic-005': (cx, cy, m, c) => {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    let out = `<path d="M ${cx} ${cy} Q ${(mx + 3).toFixed(2)} ${(my + 3).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity*0.7}"/>`;
    out += `<circle cx="${m.x.toFixed(2)}" cy="${(m.y+2).toFixed(2)}" r="0.8" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity}"/>`;
    return out;
  },
  'organic-006': (cx, cy, m, c) => {
    let out = `<path d="M ${cx} ${cy} Q ${((cx+m.x)/2).toFixed(2)} ${((cy+m.y)/2).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.0" stroke-opacity="${c.opacity}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      for (const sign of [-1, 1]) {
        const bx2 = bx + nx * sign * (1.5 + (1-t) * 1), by2 = by + ny * sign * (1.5 + (1-t) * 1);
        out += `<line x1="${bx.toFixed(2)}" y1="${by.toFixed(2)}" x2="${bx2.toFixed(2)}" y2="${by2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.4" stroke-opacity="${c.opacity*0.6}"/>`;
      }
    }
    return out;
  },
  'organic-007': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="2.5" stroke-opacity="${c.opacity*0.6}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<line x1="${(bx-nx*0.6).toFixed(2)}" y1="${(by-ny*0.6).toFixed(2)}" x2="${(bx+nx*0.6).toFixed(2)}" y2="${(by+ny*0.6).toFixed(2)}" stroke="#000" stroke-width="0.15" stroke-opacity="0.4"/>`;
    }
    return out;
  },
  'organic-008': (cx, cy, m, c) => {
    let out = `<path d="M ${cx} ${cy} Q ${((cx+m.x)/2 + 1).toFixed(2)} ${((cy+m.y)/2 - 1).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${effectiveStroke(c, '#fff')}" stroke-width="1.5" stroke-opacity="${c.opacity}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    for (let k = 1; k < 6; k++) {
      const t = k / 6;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.5" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.7}"/>`;
    }
    return out;
  },
  'organic-009': (cx, cy, m, c) => {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.8" stroke-opacity="${c.opacity}"/>`;
    const dx = m.x - cx, dy = m.y - cy;
    const len = Math.sqrt(dx*dx + dy*dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let k = 1; k < 10; k++) {
      const t = k / 10;
      const bx = cx + dx * t, by = cy + dy * t;
      const size = 0.8 + (1-t) * 0.7;
      for (const sign of [-1, 1]) {
        const bx2 = bx + nx * sign * size, by2 = by + ny * sign * size;
        out += `<line x1="${bx.toFixed(2)}" y1="${by.toFixed(2)}" x2="${bx2.toFixed(2)}" y2="${by2.toFixed(2)}" stroke="${effectiveStroke(c, '#fff')}" stroke-width="0.3" stroke-opacity="${c.opacity*0.6}"/>`;
      }
    }
    return out;
  },
  'organic-010': (cx, cy, m, c) => {
    const dx = m.x - cx, dy = m.y - cy;
    let out = '';
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      for (let p = 0; p < 6; p++) {
        const ang = p * Math.PI / 3;
        const px = bx + Math.cos(ang) * 0.75, py = by + Math.sin(ang) * 0.75;
        out += `<ellipse cx="${((bx+px)/2).toFixed(2)}" cy="${((by+py)/2).toFixed(2)}" rx="0.5" ry="0.25" transform="rotate(${math_degrees(ang).toFixed(2)} ${((bx+px)/2).toFixed(2)} ${((by+py)/2).toFixed(2)})" fill="${effectiveStroke(c, '#fff')}" opacity="${c.opacity*0.7}"/>`;
      }
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.3" fill="#FFD700" opacity="${c.opacity*0.9}"/>`;
    }
    return out;
  },
};

function math_degrees(rad: number): number {
  return rad * 180 / Math.PI;
}

// ---- Build the full connector overlay SVG snippet for a card ----

export function buildConnectorOverlay(conn: Connector, custom: Customization, members: ReturnType<typeof makeMembers>): string {
  const fn = RENDERERS[conn.id];
  if (!fn) return '';
  const cx = 50, cy = 50;
  const style: ConnStyle = {
    stroke: conn.stroke,
    opacity: custom.strokeOpacity,
    strokeOverride: custom.strokeOverride,
  };
  return members.map(m => fn(cx, cy, m, style)).join('');
}

// ---- BG pattern overlay renderer ----

export function renderBgPattern(pattern: string | null, mid: string): string {
  if (!pattern) return '';
  if (pattern === 'grain') return `<rect x="0" y="0" width="100" height="100" filter="url(#grain-${mid})" opacity="0.5"/>`;
  if (pattern === 'dot-grid') {
    let out = '<g fill="#ffffff" opacity="0.08">';
    for (let x = 5; x < 100; x += 8) for (let y = 5; y < 100; y += 8) out += `<circle cx="${x}" cy="${y}" r="0.35"/>`;
    return out + '</g>';
  }
  if (pattern === 'line-grid') {
    let out = '<g stroke="#ffffff" stroke-width="0.1" opacity="0.06">';
    for (let x = 0; x <= 100; x += 6) out += `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`;
    for (let y = 0; y <= 100; y += 6) out += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
    return out + '</g>';
  }
  if (pattern === 'radial-glow' || pattern === 'halo-glow') return `<rect x="0" y="0" width="100" height="100" fill="url(#rg-${mid})"/>`;
  if (pattern === 'vignette') return `<rect x="0" y="0" width="100" height="100" fill="url(#rg-${mid})"/>`;
  if (pattern === 'diagonal-stripes') {
    let out = '<g stroke="#ffffff" stroke-width="0.3" opacity="0.05">';
    for (let i = -100; i < 200; i += 12) out += `<line x1="${i}" y1="0" x2="${i+100}" y2="100"/>`;
    return out + '</g>';
  }
  if (pattern === 'hex-pattern') {
    let out = '<g fill="none" stroke="#ffffff" stroke-width="0.1" opacity="0.1">';
    for (let y = 0; y < 110; y += 10) {
      const off = (Math.floor(y / 10) % 2) ? 5 : 0;
      for (let x = -5 + off; x < 110; x += 12) {
        let pts = '';
        for (let i = 0; i < 6; i++) {
          const a = i * Math.PI / 3;
          pts += `${(x + 4.5 * Math.cos(a)).toFixed(2)} ${(y + 4.5 * Math.sin(a)).toFixed(2)} `;
        }
        out += `<polygon points="${pts.trim()}"/>`;
      }
    }
    return out + '</g>';
  }
  if (pattern === 'topographic') {
    let out = '<g fill="none" stroke="#ffffff" stroke-width="0.1" opacity="0.12">';
    for (let r = 5; r < 70; r += 7) out += `<ellipse cx="50" cy="50" rx="${r}" ry="${r * 0.7}" transform="rotate(15 50 50)"/>`;
    return out + '</g>';
  }
  if (pattern === 'stars') {
    // Deterministic seed from mid
    let seed = 0;
    for (let i = 0; i < mid.length; i++) seed = (seed * 31 + mid.charCodeAt(i)) & 0x7FFFFFFF;
    let out = '<g fill="#ffffff">';
    for (let i = 0; i < 40; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const x = 5 + (seed % 90);
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const y = 5 + (seed % 90);
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const r = 0.2 + (seed % 100) / 100;
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const o = 0.3 + (seed % 60) / 100;
      out += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" opacity="${o.toFixed(2)}"/>`;
    }
    return out + '</g>';
  }
  if (pattern === 'bokeh') {
    let seed = 0;
    for (let i = 0; i < mid.length; i++) seed = (seed * 31 + mid.charCodeAt(i)) & 0x7FFFFFFF;
    let out = '<g>';
    for (let i = 0; i < 8; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const cx = 15 + (seed % 70);
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const cy = 15 + (seed % 70);
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const r = 8 + (seed % 12);
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const o = 0.05 + (seed % 13) / 100;
      out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${o.toFixed(2)}"/>`;
    }
    return out + '</g>';
  }
  if (pattern === 'wave-lines') {
    let out = '<g fill="none" stroke="#ffffff" stroke-width="0.15" opacity="0.12">';
    for (let y = 0; y < 105; y += 5) {
      let d = `M 0 ${y}`;
      for (let x = 0; x < 101; x += 5) {
        const offset = (Math.floor(x / 5) % 2 === 0 ? 1.5 : -1.5);
        d += ` Q ${x+2.5} ${y+offset} ${x+5} ${y}`;
      }
      out += `<path d="${d}"/>`;
    }
    return out + '</g>';
  }
  if (pattern === 'brushed-metal') {
    let out = '<g stroke="#ffffff" stroke-width="0.04" opacity="0.05">';
    for (let y = 0; y <= 100; y += 1) out += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
    let seed = 0;
    for (let i = 0; i < mid.length; i++) seed = (seed * 31 + mid.charCodeAt(i)) & 0x7FFFFFFF;
    out += '<g stroke="#ffffff" stroke-width="0.1" opacity="0.1">';
    for (let i = 0; i < 20; i++) {
      seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF;
      const y = seed % 100;
      out += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
    }
    return out + '</g></g>';
  }
  return '';
}

export function renderBgPatternDefs(pattern: string | null, mid: string): string {
  if (!pattern) return '';
  if (pattern === 'radial-glow' || pattern === 'halo-glow') {
    return `<radialGradient id="rg-${mid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/><stop offset="100%" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
  }
  if (pattern === 'vignette') {
    return `<radialGradient id="rg-${mid}" cx="50%" cy="50%" r="65%"><stop offset="60%" stop-color="#000000" stop-opacity="0"/><stop offset="100%" stop-color="#000000" stop-opacity="0.4"/></radialGradient>`;
  }
  if (pattern === 'grain') {
    return `<filter id="grain-${mid}" x="0%" y="0%" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/></filter>`;
  }
  return '';
}

// Pure string builders for gradient CSS and connector SVG paths.
// All functions are side-effect free and unit-testable.

import type { GradientStop, Connector, Customization, CardStyle, CardMark } from './types';

export function buildGradientCss(stops: GradientStop[], angle: number): string {
  if (!stops.length) return '#1a1d24';
  const parts = stops
    .slice()
    .sort((a, b) => a.offset - b.offset)
    .map((s) => `${s.color} ${Math.round(s.offset)}`)
    .join(', ');
  return `linear-gradient(${Math.round(angle)}deg, ${parts})`;
}

export function buildSolidColor(stops: GradientStop[]): string {
  if (!stops.length) return '#1a1d24';
  const sorted = stops.slice().sort((a, b) => a.offset - b.offset);
  return sorted[sorted.length - 1].color;
}

// ---- Connector SVG path builders ----
// All paths render inside a 100×100 viewBox centered at (50, 50)
// and connect (50,50) to one of N member positions.

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface Member {
  letter: string;
  amount: number;
  hue: number;
  x: number;  // SVG coordinate (0-100)
  y: number;
  a: number;  // angle in radians (from center)
}

export function makeMembers(n: number): Member[] {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    const r = 30;  // SVG units in 100x100 viewBox
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

// Build the SVG snippet for ONE connector stroke between center and member m
export function buildConnectorStroke(
  conn: Connector,
  custom: Customization,
  cx: number,
  cy: number,
  m: Member,
  filterId: string | null,
): string {
  const stroke = custom.strokeOverride ?? conn.stroke;
  const sw = custom.strokeWidth;
  const opacity = custom.strokeOpacity;
  const dashAttr = custom.dashArray ? ` stroke-dasharray="${custom.dashArray}"` : '';
  const filterAttr = custom.filterEnabled && filterId ? ` filter="url(#${filterId})"` : '';
  const linecap = custom.dashArray.includes('0.1') ? ' stroke-linecap="round"' : '';

  // Different categories render different paths
  const cat = conn.category;

  if (cat === 'Solid Lines') {
    return buildSolidLine(conn, custom, cx, cy, m, stroke, sw, opacity, dashAttr, filterAttr, linecap);
  }
  if (cat === 'Dashed Patterns') {
    return buildDashedLine(conn, custom, cx, cy, m, stroke, sw, opacity, dashAttr, filterAttr, linecap);
  }
  if (cat === 'Glowing Neon') {
    return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr}${dashAttr}/>`;
  }
  if (cat === 'Gradient Strokes') {
    return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${conn.stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (cat === 'Decorative') {
    return buildDecorative(conn, custom, cx, cy, m, stroke, sw, opacity, filterAttr);
  }
  if (cat === 'Curved Flowing') {
    return buildCurved(conn, custom, cx, cy, m, stroke, sw, opacity, filterAttr);
  }
  if (cat === 'Energy Flow') {
    return buildEnergy(conn, custom, cx, cy, m, stroke, sw, opacity, filterAttr);
  }
  if (cat === 'Twin & Braided') {
    return buildTwin(conn, custom, cx, cy, m, stroke, sw, opacity, filterAttr);
  }
  if (cat === 'Textured Metallic') {
    return buildTextured(conn, custom, cx, cy, m, stroke, sw, opacity);
  }
  if (cat === 'Organic Natural') {
    return buildOrganic(conn, custom, cx, cy, m, stroke, sw, opacity);
  }

  // Fallback: simple line
  return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildSolidLine(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, dashAttr: string, filterAttr: string, linecap: string) {
  const sub = conn.subcategory;
  const x1 = cx, y1 = cy, x2 = m.x.toFixed(2), y2 = m.y.toFixed(2);
  if (sub === 'Thin') return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.6" stroke-opacity="0.7"/>`;
  if (sub === 'Medium') return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Thick') return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2" stroke-opacity="0.8"/>`;
  if (sub === 'Tapered') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw * 1.8}" stroke-opacity="0.4"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1" stroke-opacity="0.9"/>`;
  }
  if (sub === 'Curved' || sub === 'Arc') {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const ox = Math.cos(m.a + Math.PI / 2) * 7.5;
    const oy = Math.sin(m.a + Math.PI / 2) * 7.5;
    return `<path d="M ${x1} ${y1} Q ${(mx + ox).toFixed(2)} ${(my + oy).toFixed(2)} ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'S-Curve') {
    const ox = Math.cos(m.a + Math.PI / 2) * 9;
    const oy = Math.sin(m.a + Math.PI / 2) * 9;
    return `<path d="M ${x1} ${y1} C ${(cx + ox).toFixed(2)} ${(cy + oy).toFixed(2)} ${(m.x - ox).toFixed(2)} ${(m.y - oy).toFixed(2)} ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Round Caps') return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
  if (sub === 'Square Caps') return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.8" stroke-linecap="square"/>`;
  if (sub === 'Twin') {
    const ox = Math.cos(m.a + Math.PI / 2) * 1, oy = Math.sin(m.a + Math.PI / 2) * 1;
    return `<line x1="${(cx + ox).toFixed(2)}" y1="${(cy + oy).toFixed(2)}" x2="${(m.x + ox).toFixed(2)}" y2="${(m.y + oy).toFixed(2)}" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.7"/><line x1="${(cx - ox).toFixed(2)}" y1="${(cy - oy).toFixed(2)}" x2="${(m.x - ox).toFixed(2)}" y2="${(m.y - oy).toFixed(2)}" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.7"/>`;
  }
  if (sub === 'Triple') {
    let out = '';
    for (const off of [-1.5, 0, 1.5]) {
      const ox = Math.cos(m.a + Math.PI / 2) * off, oy = Math.sin(m.a + Math.PI / 2) * off;
      out += `<line x1="${(cx + ox).toFixed(2)}" y1="${(cy + oy).toFixed(2)}" x2="${(m.x + ox).toFixed(2)}" y2="${(m.y + oy).toFixed(2)}" stroke="${stroke}" stroke-width="0.6" stroke-opacity="0.6"/>`;
    }
    return out;
  }
  if (sub === 'Shadowed') return `<line x1="${cx + 0.3}" y1="${cy + 0.3}" x2="${(m.x + 0.3).toFixed(2)}" y2="${(m.y + 0.3).toFixed(2)}" stroke="#000" stroke-width="1.5" stroke-opacity="0.5"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Outlined') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.5" stroke-opacity="0.9"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.5"/>`;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildDashedLine(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, dashAttr: string, filterAttr: string, linecap: string) {
  const sub = conn.subcategory;
  const x1 = cx, y1 = cy, x2 = m.x.toFixed(2), y2 = m.y.toFixed(2);
  const patternMap: Record<string, string> = {
    'Dotted': '0.1 5',
    'Short Dash': '3 3',
    'Long Dash': '8 4',
    'Dash-Dot': '6 3 0.1 3',
    'Dash-Dot-Dot': '8 3 0.1 3 0.1 3',
    'Irregular': '4 2 8 3 2 4',
    'Chain': '2 2',
    'Railway': '0.1 8',
    'Morse': '6 2 0.1 2 0.1 2 0.1 2 6 4',
    'Gradient': '1 1 4 1 8 1 4 1',
  };
  const pattern = custom.dashArray || patternMap[sub] || '3 3';
  const isDotted = pattern.startsWith('0.1');
  const cap = isDotted ? ' stroke-linecap="round"' : '';
  if (sub === 'Dotted Curve' || sub === 'Dash Curve') {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const ox = Math.cos(m.a + Math.PI / 2) * 6;
    const oy = Math.sin(m.a + Math.PI / 2) * 6;
    return `<path d="M ${x1} ${y1} Q ${(mx + ox).toFixed(2)} ${(my + oy).toFixed(2)} ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-dasharray="${pattern}"${cap}/>`;
  }
  if (sub === 'Railway') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.5"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="2.4" stroke-opacity="0.7" stroke-dasharray="0.1 8" stroke-linecap="round"/>`;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-dasharray="${pattern}"${cap}/>`;
}

function buildDecorative(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, filterAttr: string) {
  const sub = conn.subcategory;
  const x1 = cx, y1 = cy, x2 = m.x.toFixed(2), y2 = m.y.toFixed(2);
  const dx = (m.x - cx), dy = (m.y - cy);
  if (sub === 'Beaded') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="3" stroke-opacity="0.9" stroke-linecap="round" stroke-dasharray="0.1 6"/>`;
  }
  if (sub === 'Pearl') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="4" stroke-opacity="0.4" stroke-linecap="round" stroke-dasharray="0.1 7"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="3" stroke-opacity="0.95" stroke-linecap="round" stroke-dasharray="0.1 7"/>`;
  }
  if (sub === 'Diamond') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 5; k++) {
      const px = cx + dx * k / 5, py = cy + dy * k / 5;
      out += `<path d="M ${px.toFixed(2)} ${(py - 0.75).toFixed(2)} L ${(px + 0.75).toFixed(2)} ${py.toFixed(2)} L ${px.toFixed(2)} ${(py + 0.75).toFixed(2)} L ${(px - 0.75).toFixed(2)} ${py.toFixed(2)} Z" fill="${stroke}" opacity="0.9"/>`;
    }
    return out;
  }
  if (sub === 'Star') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 6; k++) {
      const px = cx + dx * k / 6, py = cy + dy * k / 6;
      let pts = '';
      for (let i = 0; i < 10; i++) {
        const ang = -Math.PI / 2 + i * Math.PI / 5;
        const rr = i % 2 === 0 ? 0.75 : 0.3;
        pts += `${(px + rr * Math.cos(ang)).toFixed(2)} ${(py + rr * Math.sin(ang)).toFixed(2)} `;
      }
      out += `<polygon points="${pts.trim()}" fill="${stroke}" opacity="0.9"/>`;
    }
    return out;
  }
  if (sub === 'Crystal') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 5; k++) {
      const px = cx + dx * k / 5, py = cy + dy * k / 5;
      out += `<polygon points="${px.toFixed(2)},${(py - 1).toFixed(2)} ${(px + 0.75).toFixed(2)},${py.toFixed(2)} ${px.toFixed(2)},${(py + 1).toFixed(2)} ${(px - 0.75).toFixed(2)},${py.toFixed(2)}" fill="${stroke}" opacity="0.85" stroke="${stroke}" stroke-width="0.4"/>`;
    }
    return out;
  }
  if (sub === 'Arrow') {
    const ang = m.a;
    const bx = m.x - Math.cos(ang) * 4.5, by = m.y - Math.sin(ang) * 4.5;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="0.6"/><path d="M ${x2} ${y2} L ${(bx - Math.cos(ang + 2.4) * 2).toFixed(2)} ${(by - Math.sin(ang + 2.4) * 2).toFixed(2)} L ${(bx - Math.cos(ang - 2.4) * 2).toFixed(2)} ${(by - Math.sin(ang - 2.4) * 2).toFixed(2)} Z" fill="${stroke}" opacity="0.85"/>`;
  }
  if (sub === 'Triangle') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.3"/>`;
    for (let k = 1; k < 4; k++) {
      const px = cx + dx * k / 4, py = cy + dy * k / 4;
      out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="0.6" fill="${stroke}" opacity="0.9"/>`;
    }
    return out;
  }
  if (sub === 'Jewel') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 7; k++) {
      const px = cx + dx * k / 7, py = cy + dy * k / 7;
      if (k % 2 === 0) {
        out += `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="0.6" fill="${stroke}" opacity="0.9"/>`;
      } else {
        out += `<rect x="${(px - 0.6).toFixed(2)}" y="${(py - 0.6).toFixed(2)}" width="1.2" height="1.2" fill="${stroke}" opacity="0.9" transform="rotate(45 ${px.toFixed(2)} ${py.toFixed(2)})"/>`;
      }
    }
    return out;
  }
  if (sub === 'Drop') {
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="5" stroke-opacity="0.95" stroke-linecap="round" stroke-dasharray="0.1 10"/>`;
  }
  if (sub === 'Diamond Pair') {
    let out = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 5; k++) {
      const px = cx + dx * k / 5, py = cy + dy * k / 5;
      out += `<path d="M ${px.toFixed(2)} ${(py - 0.75).toFixed(2)} L ${(px + 0.5).toFixed(2)} ${py.toFixed(2)} L ${px.toFixed(2)} ${(py + 0.75).toFixed(2)} L ${(px - 0.5).toFixed(2)} ${py.toFixed(2)} Z" fill="${stroke}" opacity="0.85"/><circle cx="${(px + 1.25).toFixed(2)}" cy="${(py + 0.5).toFixed(2)}" r="0.25" fill="${stroke}" opacity="0.6"/>`;
    }
    return out;
  }
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildCurved(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, filterAttr: string) {
  const sub = conn.subcategory;
  const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
  const ox = Math.cos(m.a + Math.PI / 2) * 7.5, oy = Math.sin(m.a + Math.PI / 2) * 7.5;
  if (sub === 'Arc') return `<path d="M ${cx} ${cy} Q ${(mx + ox).toFixed(2)} ${(my + oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Bezier') return `<path d="M ${cx} ${cy} C ${(cx + ox).toFixed(2)} ${(cy + oy).toFixed(2)} ${(m.x - ox).toFixed(2)} ${(m.y - oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Wave') {
    const dx = m.x - cx, dy = m.y - cy;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length, ny = dx / length;
    let d = `M ${cx} ${cy}`;
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 2;
      d += ` L ${(bx + nx * wave).toFixed(2)} ${(by + ny * wave).toFixed(2)}`;
    }
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Ribbon') {
    const dx = m.x - cx, dy = m.y - cy;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length, ny = dx / length;
    let d1 = `M ${cx} ${cy}`, d2 = `M ${cx} ${cy}`;
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 2) * 1.5;
      d1 += ` L ${(bx + nx * (wave + 0.75)).toFixed(2)} ${(by + ny * (wave + 0.75)).toFixed(2)}`;
      d2 += ` L ${(bx + nx * (wave - 0.75)).toFixed(2)} ${(by + ny * (wave - 0.75)).toFixed(2)}`;
    }
    return `<path d="${d1}" fill="none" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.7"/><path d="${d2}" fill="none" stroke="${stroke}" stroke-width="0.8" stroke-opacity="0.7"/>`;
  }
  if (sub === 'Loop') {
    return `<path d="M ${cx} ${cy} Q ${(mx + ox).toFixed(2)} ${(my + oy).toFixed(2)} ${(mx - ox).toFixed(2)} ${(my - oy).toFixed(2)} Q ${(mx + ox * 0.5).toFixed(2)} ${(my + oy * 0.5).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Zigzag') {
    const dx = m.x - cx, dy = m.y - cy;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length, ny = dx / length;
    let d = `M ${cx} ${cy}`;
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const sign = i % 2 === 0 ? 1 : -1;
      d += ` L ${(bx + nx * 1.25 * sign).toFixed(2)} ${(by + ny * 1.25 * sign).toFixed(2)}`;
    }
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  // Spiral, Swirl, Curl, Drip fallback to arc
  return `<path d="M ${cx} ${cy} Q ${(mx + ox).toFixed(2)} ${(my + oy).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildEnergy(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, filterAttr: string) {
  const sub = conn.subcategory;
  const dx = m.x - cx, dy = m.y - cy;
  const length = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / length, ny = dx / length;
  if (sub === 'Lightning' || sub === 'Voltage') {
    let d = `M ${cx} ${cy}`;
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const offset = (i % 2 === 0 ? 2.5 : -2.5);
      if (i === steps) {
        d += ` L ${m.x.toFixed(2)} ${m.y.toFixed(2)}`;
      } else {
        d += ` L ${(bx + nx * offset).toFixed(2)} ${(by + ny * offset).toFixed(2)}`;
      }
    }
    return `<path d="${d}" fill="none" stroke="${sub === 'Lightning' ? '#FFE066' : '#FFD700'}" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr} stroke-linejoin="round"/>`;
  }
  if (sub === 'Pulse' || sub === 'Burst') {
    let out = '';
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="${sub === 'Burst' ? (1 + k * 0.4) : (0.5 + k * 0.25)}" fill="none" stroke="${stroke}" stroke-width="0.4" stroke-opacity="${(0.9 - k * 0.1).toFixed(2)}"/>`;
    }
    return out;
  }
  if (sub === 'Flow') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.4" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      const ang = m.a;
      out += `<path d="M ${(bx - Math.cos(ang) * 0.75 - Math.cos(ang + Math.PI / 2) * 0.75).toFixed(2)} ${(by - Math.sin(ang) * 0.75 - Math.sin(ang + Math.PI / 2) * 0.75).toFixed(2)} L ${(bx + Math.cos(ang) * 0.75).toFixed(2)} ${(by + Math.sin(ang) * 0.75).toFixed(2)} L ${(bx - Math.cos(ang) * 0.75 + Math.cos(ang + Math.PI / 2) * 0.75).toFixed(2)} ${(by - Math.sin(ang) * 0.75 + Math.sin(ang + Math.PI / 2) * 0.75).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    return out;
  }
  if (sub === 'Stream') {
    let out = '';
    for (let k = 0; k < 5; k++) {
      const t1 = k / 5, t2 = (k + 1) / 5;
      const x1 = cx + dx * t1, y1 = cy + dy * t1;
      const x2 = cx + dx * t2, y2 = cy + dy * t2;
      const w = (0.625 - k * 0.1).toFixed(2);
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${w}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
    }
    return out;
  }
  if (sub === 'Plasma') {
    let d = `M ${cx} ${cy}`;
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 4) * 1.25;
      d += ` L ${(bx + nx * wave).toFixed(2)} ${(by + ny * wave).toFixed(2)}`;
    }
    return `<path d="${d}" fill="none" stroke="#FF61DC" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr}/>`;
  }
  if (sub === 'Electric') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#00FFFF" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr}/>`;
  if (sub === 'Laser') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#FF0040" stroke-width="0.75" stroke-opacity="0.3"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#FF0040" stroke-width="0.4" stroke-opacity="0.7"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.12" stroke-opacity="0.95"/>`;
  if (sub === 'Data') {
    let out = '';
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const bx = cx + dx * t, by = cy + dy * t;
      const ox = (i * 7) % 5 - 2, oy = (i * 11) % 5 - 2;
      out += `<rect x="${(bx + ox * 0.25 - 0.25).toFixed(2)}" y="${(by + oy * 0.25 - 0.25).toFixed(2)}" width="0.5" height="0.5" fill="${stroke}" opacity="0.85"/>`;
    }
    return out;
  }
  return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildTwin(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number, filterAttr: string) {
  const sub = conn.subcategory;
  const dx = m.x - cx, dy = m.y - cy;
  const length = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / length, ny = dx / length;
  if (sub === 'Braid') {
    let d1 = `M ${cx} ${cy}`, d2 = `M ${cx} ${cy}`;
    const steps = 14;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 4) * 1.25;
      d1 += ` L ${(bx + nx * wave).toFixed(2)} ${(by + ny * wave).toFixed(2)}`;
      d2 += ` L ${(bx - nx * wave).toFixed(2)} ${(by - ny * wave).toFixed(2)}`;
    }
    return `<path d="${d1}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/><path d="${d2}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Twisted') {
    let out = '';
    const steps = 8;
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps, t2 = (i + 1) / steps;
      const o1 = i % 2 === 0 ? 1 : -1, o2 = i % 2 === 0 ? -1 : 1;
      const x1 = cx + dx * t1 + nx * o1, y1 = cy + dy * t1 + ny * o1;
      const x2 = cx + dx * t2 + nx * o2, y2 = cy + dy * t2 + ny * o2;
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
    }
    return out;
  }
  if (sub === 'Rope') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.75" stroke-opacity="0.7"/>`;
    for (let k = 0; k < 8; k++) {
      const t = k / 8;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<line x1="${(bx - nx * 0.5).toFixed(2)}" y1="${(by - ny * 0.5).toFixed(2)}" x2="${(bx + nx * 0.5).toFixed(2)}" y2="${(by + ny * 0.5).toFixed(2)}" stroke="#000" stroke-width="0.15" stroke-opacity="0.4"/>`;
    }
    return out;
  }
  if (sub === 'Parallel') {
    const ox = Math.cos(m.a + Math.PI / 2) * 0.75, oy = Math.sin(m.a + Math.PI / 2) * 0.75;
    const mx = (cx + m.x) / 2 + ox, my = (cy + m.y) / 2 + oy;
    return `<path d="M ${(cx + ox).toFixed(2)} ${(cy + oy).toFixed(2)} Q ${mx.toFixed(2)} ${my.toFixed(2)} ${(m.x + ox).toFixed(2)} ${(m.y + oy).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/><path d="M ${(cx - ox).toFixed(2)} ${(cy - oy).toFixed(2)} Q ${(mx - 2 * ox).toFixed(2)} ${(my - 2 * oy).toFixed(2)} ${(m.x - ox).toFixed(2)} ${(m.y - oy).toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Helix') {
    let d1 = `M ${cx} ${cy}`, d2 = `M ${cx} ${cy}`;
    let rungs = '';
    const steps = 20;
    const pts1: [number, number][] = [], pts2: [number, number][] = [];
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 1.5;
      const p1: [number, number] = [bx + nx * wave, by + ny * wave];
      const p2: [number, number] = [bx - nx * wave, by - ny * wave];
      pts1.push(p1); pts2.push(p2);
      d1 += ` L ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
      d2 += ` L ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
    }
    for (let i = 0; i < steps; i += 3) {
      rungs += `<line x1="${pts1[i][0].toFixed(2)}" y1="${pts1[i][1].toFixed(2)}" x2="${pts2[i][0].toFixed(2)}" y2="${pts2[i][1].toFixed(2)}" stroke="${stroke}" stroke-width="0.1" stroke-opacity="0.5"/>`;
    }
    return `<path d="${d1}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/><path d="${d2}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>${rungs}`;
  }
  if (sub === 'Cable') {
    return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="1" stroke-opacity="0.4"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="0.85"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.12" stroke-opacity="0.95"/>`;
  }
  if (sub === 'Woven') {
    let out = '';
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      const t1 = i / steps, t2 = (i + 1) / steps;
      let x1 = cx + dx * t1, y1 = cy + dy * t1;
      let x2 = cx + dx * t2, y2 = cy + dy * t2;
      if (i % 2 === 0) { x1 += nx * 0.5; y1 += ny * 0.5; x2 += nx * 0.5; y2 += ny * 0.5; }
      else { x1 -= nx * 0.5; y1 -= ny * 0.5; x2 -= nx * 0.5; y2 -= ny * 0.5; }
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${stroke}" stroke-width="0.5" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
    }
    return out;
  }
  if (sub === 'Glow Twin') {
    const ox = Math.cos(m.a + Math.PI / 2) * 0.75, oy = Math.sin(m.a + Math.PI / 2) * 0.75;
    return `<line x1="${(cx + ox).toFixed(2)}" y1="${(cy + oy).toFixed(2)}" x2="${(m.x + ox).toFixed(2)}" y2="${(m.y + oy).toFixed(2)}" stroke="#00FFFF" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr}/><line x1="${(cx - ox).toFixed(2)}" y1="${(cy - oy).toFixed(2)}" x2="${(m.x - ox).toFixed(2)}" y2="${(m.y - oy).toFixed(2)}" stroke="#00FFFF" stroke-width="${sw}" stroke-opacity="${opacity}"${filterAttr}/>`;
  }
  return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildTextured(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number) {
  const sub = conn.subcategory;
  const dx = m.x - cx, dy = m.y - cy;
  if (sub === 'Sheen') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-sheen)" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Brushed') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.75" stroke-opacity="0.6"/>`;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length, ny = dx / length;
    for (let k = -2; k <= 2; k++) {
      out += `<line x1="${(cx + nx * k * 0.075).toFixed(2)}" y1="${(cy + ny * k * 0.075).toFixed(2)}" x2="${(m.x + nx * k * 0.075).toFixed(2)}" y2="${(m.y + ny * k * 0.075).toFixed(2)}" stroke="${stroke}" stroke-width="0.08" stroke-opacity="0.4"/>`;
    }
    return out;
  }
  if (sub === 'Carbon') {
    let out = '';
    for (let i = 0; i < 10; i++) {
      const t1 = i / 10, t2 = (i + 1) / 10;
      const x1 = cx + dx * t1, y1 = cy + dy * t1;
      const x2 = cx + dx * t2, y2 = cy + dy * t2;
      const color = i % 2 === 0 ? '#1a1a1a' : '#3a3a3a';
      out += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${color}" stroke-width="0.75" stroke-opacity="0.8"/>`;
    }
    return out;
  }
  if (sub === 'Wire') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.75" stroke-opacity="0.6"/>`;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / length, ny = dx / length;
    for (let k = 0; k < 12; k++) {
      const t = k / 12;
      const bx = cx + dx * t, by = cy + dy * t;
      const ox = nx * Math.sin(t * Math.PI * 6) * 0.04;
      const oy = ny * Math.sin(t * Math.PI * 6) * 0.04;
      out += `<circle cx="${(bx + ox).toFixed(2)}" cy="${(by + oy).toFixed(2)}" r="0.2" fill="#fff" opacity="0.8"/>`;
    }
    return out;
  }
  if (sub === 'Chrome') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#888" stroke-width="0.75" stroke-opacity="0.7"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#fff" stroke-width="0.2" stroke-opacity="0.95"/><line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="#bbb" stroke-width="0.4" stroke-opacity="0.5"/>`;
  if (sub === 'Copper') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-copper)" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Gold') return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="url(#grad-gold-wire)" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  if (sub === 'Riveted') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.625" stroke-opacity="0.6"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.5" fill="#fff" opacity="0.95"/><circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.25" fill="#666" opacity="0.7"/>`;
    }
    return out;
  }
  return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

function buildOrganic(conn: Connector, custom: Customization, cx: number, cy: number, m: Member, stroke: string, sw: number, opacity: number) {
  const sub = conn.subcategory;
  const dx = m.x - cx, dy = m.y - cy;
  const length = Math.sqrt(dx * dx + dy * dy);
  const nx = -dy / length, ny = dx / length;
  if (sub === 'Vine' || sub === 'Branch' || sub === 'Root' || sub === 'Vein') {
    let d = `M ${cx} ${cy}`;
    const steps = 12;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 3) * 1;
      d += ` L ${(bx + nx * wave).toFixed(2)} ${(by + ny * wave).toFixed(2)}`;
    }
    let out = `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
    // Add side branches
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      for (const sign of [-1, 1]) {
        const bx2 = bx + nx * sign * 1.5 * (1 - t * 0.5);
        const by2 = by + ny * sign * 1.5 * (1 - t * 0.5);
        out += `<line x1="${bx.toFixed(2)}" y1="${by.toFixed(2)}" x2="${bx2.toFixed(2)}" y2="${by2.toFixed(2)}" stroke="${stroke}" stroke-width="${(sw * 0.5).toFixed(2)}" stroke-opacity="${(opacity * 0.7).toFixed(2)}"/>`;
      }
    }
    return out;
  }
  if (sub === 'Leaf' || sub === 'Stem') {
    const mx = (cx + m.x) / 2, my = (cy + m.y) / 2;
    const lx = mx + nx * 2, ly = my + ny * 2;
    const ang = Math.atan2(ny, nx) * 180 / Math.PI;
    return `<path d="M ${cx} ${cy} Q ${mx.toFixed(2)} ${my.toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/><ellipse cx="${lx.toFixed(2)}" cy="${ly.toFixed(2)}" rx="1.25" ry="0.6" transform="rotate(${ang.toFixed(2)} ${lx.toFixed(2)} ${ly.toFixed(2)})" fill="${stroke}" opacity="0.7"/>`;
  }
  if (sub === 'Droplet' || sub === 'Drop') {
    return `<path d="M ${cx} ${cy} Q ${(cx + dx / 2 + 3).toFixed(2)} ${(cy + dy / 2 + 3).toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/><circle cx="${m.x.toFixed(2)}" cy="${(m.y + 2).toFixed(2)}" r="0.75" fill="${stroke}" opacity="0.9"/>`;
  }
  if (sub === 'Flow') {
    let d = `M ${cx} ${cy}`;
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const bx = cx + dx * t, by = cy + dy * t;
      const wave = Math.sin(t * Math.PI * 5) * 0.5 + Math.sin(t * Math.PI * 2) * 0.75;
      d += ` L ${(bx + nx * wave).toFixed(2)} ${(by + ny * wave).toFixed(2)}`;
    }
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
  }
  if (sub === 'Petal') {
    let out = `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="0.3" stroke-opacity="0.4"/>`;
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const bx = cx + dx * t, by = cy + dy * t;
      for (let p = 0; p < 6; p++) {
        const ang = p * Math.PI / 3;
        const px = bx + Math.cos(ang) * 0.75, py = by + Math.sin(ang) * 0.75;
        out += `<ellipse cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" rx="0.6" ry="0.4" transform="rotate(${(ang * 180 / Math.PI).toFixed(2)} ${px.toFixed(2)} ${py.toFixed(2)})" fill="${stroke}" opacity="0.7"/>`;
      }
      out += `<circle cx="${bx.toFixed(2)}" cy="${by.toFixed(2)}" r="0.4" fill="#FFD700" opacity="0.9"/>`;
    }
    return out;
  }
  return `<line x1="${cx}" y1="${cy}" x2="${m.x.toFixed(2)}" y2="${m.y.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;
}

// ---- Brand mark renderers ----

export function renderMark(mark: CardMark, mid: string): string {
  if (mark === 'paybox') {
    return `<g transform="translate(80 80) rotate(-16) scale(0.04)" opacity="0.85" fill="#ffffff"><path d="M108 148 L190 95 L190 165 Q188 190 172 208 L108 242 Z"/><path d="M297 148 L210 95 L210 165 Q212 190 228 208 L297 242 Z"/><path d="M112 255 Q190 225 200 212 Q210 225 290 255 L205 305 Q200 308 195 305 Z"/></g>`;
  }
  if (mark === 'solana') {
    return `<defs><linearGradient id="sol-${mid}" x1="320" y1="90" x2="80" y2="310"><stop offset="0" stop-color="#14F195"/><stop offset="1" stop-color="#9945FF"/></linearGradient></defs><g transform="translate(78 78) rotate(-16) scale(0.035)" fill="url(#sol-${mid})"><path d="M130 92 H312 Q324 92 316 102 L272 144 Q268 148 262 148 H88 Q76 148 84 138 L124 96 Q127 92 130 92 Z"/><path d="M88 172 H262 Q268 172 272 176 L316 218 Q324 228 312 228 H130 Q127 228 124 224 L84 182 Q76 172 88 172 Z"/><path d="M130 252 H312 Q324 252 316 262 L272 304 Q268 308 262 308 H88 Q76 308 84 298 L124 256 Q127 252 130 252 Z"/></g>`;
  }
  if (mark === 'diamond') {
    return `<g transform="translate(82 82)" opacity="0.85"><path d="M0 -2.5 L2.5 0 L0 4.5 L-2.5 0 Z" fill="#fff" stroke="#fff" stroke-width="0.12"/><path d="M-2.5 0 L2.5 0" stroke="#fff" stroke-width="0.15" opacity="0.5"/><path d="M0 -2.5 L0 4.5" stroke="#fff" stroke-width="0.1" opacity="0.5"/></g>`;
  }
  if (mark === 'crown') {
    return `<g transform="translate(80 81) scale(0.18)" fill="#FFD700" stroke="#B8860B" stroke-width="0.15"><path d="M-14 6 L-14 -6 L-7 0 L0 -10 L7 0 L14 -6 L14 6 Z"/><rect x="-14" y="6" width="28" height="4" rx="1"/><circle cx="-14" cy="-6" r="2" fill="#FF0000"/><circle cx="0" cy="-10" r="2" fill="#FF0000"/><circle cx="14" cy="-6" r="2" fill="#FF0000"/></g>`;
  }
  if (mark === 'circlepay') {
    return `<g transform="translate(82 82)" opacity="0.9"><circle cx="0" cy="0" r="3.5" fill="none" stroke="#fff" stroke-width="0.5"/><circle cx="0" cy="0" r="1.5" fill="#fff"/><path d="M-1.75 -1.75 L-3 -3" stroke="#fff" stroke-width="0.5" stroke-linecap="round"/><path d="M1.75 -1.75 L3 -3" stroke="#fff" stroke-width="0.5" stroke-linecap="round"/><path d="M0 3.5 L0 5" stroke="#fff" stroke-width="0.5" stroke-linecap="round"/></g>`;
  }
  return '';  // none
}

// ---- SVG filter defs used by glow/neon connectors ----

// ---- BG card pattern overlay renderer ----
// Renders the SVG overlay for a bg card pattern (dots, grid, grain, etc.)
export function renderBgPattern(pattern: string | null, mid: string): string {
  if (!pattern) return '';
  // All overlays render in 100x100 viewBox
  if (pattern === 'dot-grid') {
    let out = '<g fill="#ffffff" opacity="0.08">';
    for (let x = 5; x < 100; x += 7.5) {
      for (let y = 5; y < 100; y += 7.5) {
        out += `<circle cx="${x}" cy="${y}" r="0.3"/>`;
      }
    }
    return out + '</g>';
  }
  if (pattern === 'line-grid') {
    let out = '<g stroke="#ffffff" stroke-width="0.12" opacity="0.06">';
    for (let x = 0; x <= 100; x += 6.25) out += `<line x1="${x}" y1="0" x2="${x}" y2="100"/>`;
    for (let y = 0; y <= 100; y += 6.25) out += `<line x1="0" y1="${y}" x2="100" y2="${y}"/>`;
    return out + '</g>';
  }
  if (pattern === 'radial-glow' || pattern === 'halo-glow') {
    return `<circle cx="50" cy="50" r="50" fill="url(#rg-${mid})"/>`;
  }
  if (pattern === 'diagonal-stripes') {
    let out = '<g stroke="#ffffff" stroke-width="0.4" opacity="0.05">';
    for (let i = -100; i < 200; i += 10) out += `<line x1="${i}" y1="0" x2="${i+100}" y2="100"/>`;
    return out + '</g>';
  }
  if (pattern === 'circuit-pattern') {
    let out = '<g stroke="#ffffff" stroke-width="0.15" fill="none" opacity="0.15">';
    const paths = [
      "M 12.5 20 L 30 20 L 37.5 27.5 L 55 27.5",
      "M 20 50 L 20 62.5 L 32.5 75 L 50 75",
      "M 80 12.5 L 80 32.5 L 67.5 45 L 67.5 62.5",
      "M 87.5 62.5 L 75 62.5 L 70 67.5",
      "M 25 87.5 L 50 87.5 L 57.5 80",
    ];
    for (const p of paths) out += `<path d="${p}"/>`;
    const dots = [[30,20],[55,27.5],[20,62.5],[50,75],[80,32.5],[67.5,45],[75,62.5],[50,87.5]];
    for (const [x, y] of dots) out += `<circle cx="${x}" cy="${y}" r="0.6" fill="#ffffff" opacity="0.5"/>`;
    return out + '</g>';
  }
  if (pattern === 'hex-pattern') {
    let out = '<g fill="none" stroke="#ffffff" stroke-width="0.12" opacity="0.1">';
    for (let y = 0; y < 110; y += 8.75) {
      const offset = (Math.floor(y / 8.75) % 2) ? 5 : 0;
      for (let x = -5 + offset; x < 110; x += 10) {
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
    for (let r = 5; r < 70; r += 6.25) {
      out += `<ellipse cx="50" cy="50" rx="${r}" ry="${r * 0.7}" transform="rotate(15 50 50)"/>`;
    }
    return out + '</g>';
  }
  if (pattern === 'vignette') {
    return `<circle cx="50" cy="50" r="65" fill="url(#rg-${mid})"/>`;
  }
  if (pattern === 'stars') {
    let out = '<g fill="#ffffff">';
    const pts = [
      [10,15,0.5,0.6],[25,8,0.8,0.5],[40,20,0.4,0.7],[55,12,0.6,0.8],[70,18,0.5,0.6],
      [85,5,0.7,0.5],[15,35,0.4,0.6],[35,45,0.5,0.7],[60,40,0.6,0.8],[80,55,0.4,0.6],
      [5,55,0.5,0.5],[20,65,0.7,0.6],[45,75,0.4,0.7],[65,80,0.6,0.8],[85,75,0.5,0.6],
      [12,90,0.4,0.5],[30,95,0.6,0.7],[50,88,0.5,0.6],[70,92,0.7,0.5],[90,95,0.4,0.8]
    ];
    for (const [x, y, r, o] of pts) out += `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}"/>`;
    return out + '</g>';
  }
  if (pattern === 'bokeh') {
    let out = '<g>';
    const circles = [
      [10,10,15,0.12],[30,50,12,0.15],[55,25,18,0.08],[80,60,14,0.13],
      [70,85,16,0.1],[25,75,13,0.14],[45,90,11,0.16],[90,15,17,0.09]
    ];
    for (const [x, y, r, o] of circles) out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${o}"/>`;
    return out + '</g>';
  }
  if (pattern === 'wave-lines') {
    let out = '<g fill="none" stroke="#ffffff" stroke-width="0.18" opacity="0.15">';
    for (let y = 0; y < 105; y += 4.5) {
      let d = `M 0 ${y}`;
      for (let x = 0; x < 101; x += 5) {
        d += ` Q ${x+2.5} ${y - 1.5 * (Math.floor(x/5) % 2 === 0 ? 1 : -1)} ${x+5} ${y}`;
      }
      out += `<path d="${d}"/>`;
    }
    return out + '</g>';
  }
  if (pattern === 'grain') {
    return `<rect x="0" y="0" width="100" height="100" filter="url(#grain-${mid})" opacity="0.5"/>`;
  }
  return '';
}

export function renderBgPatternDefs(pattern: string | null, mid: string): string {
  if (!pattern) return '';
  if (pattern === 'radial-glow' || pattern === 'halo-glow') {
    return `<radialGradient id="rg-${mid}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffffff" stop-opacity="0.25"/><stop offset="100" stop-color="#ffffff" stop-opacity="0"/></radialGradient>`;
  }
  if (pattern === 'vignette') {
    return `<radialGradient id="rg-${mid}" cx="50%" cy="50%" r="65%"><stop offset="60" stop-color="#000000" stop-opacity="0"/><stop offset="100" stop-color="#000000" stop-opacity="0.4"/></radialGradient>`;
  }
  if (pattern === 'grain') {
    return `<filter id="grain-${mid}"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0"/></filter>`;
  }
  return '';
}

// ---- SVG filter/gradient defs used by connectors and marks ----
export function renderSvgDefs(): string {
  return `<defs>
    <linearGradient id="grad-sheen" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#888"/><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#888"/></linearGradient>
    <linearGradient id="grad-copper" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#7A3F1D"/><stop offset="0.5" stop-color="#FFD8B5"/><stop offset="1" stop-color="#7A3F1D"/></linearGradient>
    <linearGradient id="grad-gold-wire" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#7A5800"/><stop offset="0.5" stop-color="#FFF6B0"/><stop offset="1" stop-color="#7A5800"/></linearGradient>
    <linearGradient id="grad-sunset" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF6B35"/><stop offset="1" stop-color="#FFD700"/></linearGradient>
    <linearGradient id="grad-ocean" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#0077B6"/><stop offset="1" stop-color="#90E0EF"/></linearGradient>
    <linearGradient id="grad-fire" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF0000"/><stop offset="1" stop-color="#FFD700"/></linearGradient>
    <linearGradient id="grad-forest" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#0F5132"/><stop offset="1" stop-color="#6EE7B7"/></linearGradient>
    <linearGradient id="grad-candy" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF1493"/><stop offset="1" stop-color="#7C3AED"/></linearGradient>
    <linearGradient id="grad-rainbow" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF0000"/><stop offset="0.33" stop-color="#FFFF00"/><stop offset="0.66" stop-color="#00FF00"/><stop offset="1" stop-color="#9D4EDD"/></linearGradient>
    <linearGradient id="grad-synthwave" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FF006E"/><stop offset="0.5" stop-color="#8338EC"/><stop offset="1" stop-color="#3A86FF"/></linearGradient>
    <linearGradient id="grad-aurora" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#00F5D4"/><stop offset="0.5" stop-color="#00BBF9"/><stop offset="1" stop-color="#9B5DE5"/></linearGradient>
    <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#FFF6B0"/><stop offset="0.5" stop-color="#E8C66B"/><stop offset="1" stop-color="#B8860B"/></linearGradient>
    <linearGradient id="grad-cosmic" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0" stop-color="#10002B"/><stop offset="0.5" stop-color="#9D4EDD"/><stop offset="1" stop-color="#FF61DC"/></linearGradient>
    <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-magenta" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-purple" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-orange" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-pink" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-lime" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glow-inner" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
}

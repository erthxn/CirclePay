// Legacy studio card (Spiral, Solid and every other line style except Arc).
// This is a straight port of the old LivePreview component. It uses the original
// builders.js unchanged, so these styles render exactly as they did before.
import {
  makeMembers, buildConnectorOverlay, renderMark, renderSvgDefs,
  buildGradientCss, renderBgPattern, renderBgPatternDefs,
} from './builders.js';

export function customizationFor(bg, conn, mark, memberCount) {
  return {
    gradientStops: bg.gradient_stops.map((s) => ({ ...s })),
    gradientAngle: bg.gradient_angle,
    strokeWidth: conn.stroke_width,
    strokeOpacity: conn.stroke_opacity,
    dashArray: conn.stroke_dasharray || '',
    mark,
    memberCount,
    filterEnabled: !!conn.filter,
    strokeOverride: conn.stroke && conn.stroke.startsWith('url(') ? '#ffffff' : conn.stroke,
  };
}

const FONT = '-apple-system, Arial, sans-serif';

export function renderLegacyCard(host, { bg, connector, mark = 'paybox', memberCount = 5, handle = 'yourhandle', date = '14/11/26' }) {
  const custom = customizationFor(bg, connector, mark, memberCount);
  const members = makeMembers(custom.memberCount);
  const gradientCss = buildGradientCss(custom.gradientStops, custom.gradientAngle);
  const bgPatternSvg = bg.pattern ? renderBgPattern(bg.pattern, 'live-bg') : '';
  const bgPatternDefs = bg.pattern ? renderBgPatternDefs(bg.pattern, 'live-bg') : '';
  const connectorSvg = buildConnectorOverlay(connector, custom, members);

  const tileSize = custom.memberCount <= 5 ? 9.5 : custom.memberCount <= 7 ? 8.5 : 7.5;
  const tilesSvg = members.map((m, i) => {
    const gid = `m${i}`;
    const price = m.amount.toFixed(2);
    return `
      <g transform="translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})">
        <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(${m.hue},72%,58%)"/>
          <stop offset="1" stop-color="hsl(${m.hue},62%,38%)"/>
        </linearGradient></defs>
        <circle r="${(tileSize / 2).toFixed(2)}" fill="url(#${gid})" stroke="#fff" stroke-width="0.5"/>
        <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${(tileSize * 0.4).toFixed(2)}" font-weight="700" fill="#fff" text-rendering="geometricPrecision">${m.letter}</text>
        <g transform="translate(0 ${(tileSize / 2 + 2.5).toFixed(2)})">
          <rect x="-4.5" y="0" width="9" height="2.75" rx="1.375" fill="#fff"/>
          <text x="0" y="1.375" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="1.75" font-weight="700" fill="#111" text-rendering="geometricPrecision">${price}</text>
        </g>
      </g>`;
  }).join('');

  const centerSize = custom.memberCount <= 5 ? 12 : 10.5;
  const centerSvg = `
    <g transform="translate(50 50)">
      <defs><linearGradient id="center-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="hsl(210,72%,58%)"/>
        <stop offset="1" stop-color="hsl(210,62%,38%)"/>
      </linearGradient></defs>
      <circle r="${(centerSize / 2).toFixed(2)}" fill="url(#center-grad)" stroke="#fff" stroke-width="0.5"/>
      <text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="${FONT}" font-size="${(centerSize * 0.42).toFixed(2)}" font-weight="700" fill="#fff" text-rendering="geometricPrecision">@</text>
    </g>`;

  host.innerHTML = `
    <div class="legacy-card" data-card style="background:${gradientCss}">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="legacy-svg" style="shape-rendering:geometricPrecision" text-rendering="geometricPrecision" role="img" aria-label="Example circle card with placeholder members">
        ${renderSvgDefs()}${bgPatternDefs}${bgPatternSvg}${connectorSvg}${centerSvg}${tilesSvg}${renderMark(custom.mark, 'live')}
      </svg>
      <div class="legacy-sig"><div class="h">@${handle}</div><div class="d">${date}</div></div>
    </div>`;
}

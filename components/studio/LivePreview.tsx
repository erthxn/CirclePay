'use client';

import { forwardRef, useMemo, memo, useEffect, useState } from 'react';
import type { BgCard, Connector, Customization, Mark } from '@/lib/studio/types';
import {
  makeMembers,
  buildConnectorOverlay,
  renderMark,
  renderSvgDefs,
  buildGradientCss,
  renderBgPattern,
  renderBgPatternDefs,
} from '@/lib/studio/builders';

interface Props {
  bgCard: BgCard | null;
  connector: Connector | null;
  customization: Customization;
  reducedMotion?: boolean;
}

/**
 * LivePreview — renders the active bg-card with the active connector overlay.
 * Inline SVG so html2canvas can read it at scale:3 for PNG export.
 *
 * CRITICAL FIXES baked in (from v2.2 lessons):
 * - gradientCss is built with `%` suffix on every offset (browser rejects otherwise)
 * - SVG element uses a `key` derived from customization + bgCard + connector ids
 *   so React fully remounts the SVG when any input changes — guaranteed visual refresh
 * - Pulse ring on every selection change for immediate visual feedback
 */
const LivePreview = memo(forwardRef<HTMLDivElement, Props>(function LivePreview(
  { bgCard, connector, customization, reducedMotion },
  ref,
) {
  const members = useMemo(() => makeMembers(customization.memberCount), [customization.memberCount]);
  const gradientCss = useMemo(
    () => buildGradientCss(customization.gradientStops, customization.gradientAngle),
    [customization.gradientStops, customization.gradientAngle],
  );
  const gradientKey = useMemo(
    () => customization.gradientStops.map(s => `${s.color}@${s.offset}`).join('|') + `|${customization.gradientAngle}`,
    [customization.gradientStops, customization.gradientAngle],
  );

  const bgPatternSvg = useMemo(() => bgCard?.pattern ? renderBgPattern(bgCard.pattern, 'live-bg') : '', [bgCard?.pattern, bgCard?.id]);
  const bgPatternDefs = useMemo(() => bgCard?.pattern ? renderBgPatternDefs(bgCard.pattern, 'live-bg') : '', [bgCard?.pattern, bgCard?.id]);

  const connectorSvg = useMemo(() => {
    if (!connector) return '';
    return buildConnectorOverlay(connector, customization, members);
  }, [connector, members, customization]);

  // SVG for member tiles
  const tilesSvg = useMemo(() => {
    const tileSize = customization.memberCount <= 5 ? 9.5 : customization.memberCount <= 7 ? 8.5 : 7.5;
    return members.map((m, i) => {
      const gid = `m${i}`;
      const price = m.amount.toFixed(2);
      return `
        <g transform="translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})">
          <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="hsl(${m.hue},72%,58%)"/>
            <stop offset="1" stop-color="hsl(${m.hue},62%,38%)"/>
          </linearGradient></defs>
          <circle r="${(tileSize / 2).toFixed(2)}" fill="url(#${gid})" stroke="#fff" stroke-width="0.5"/>
          <text x="0" y="${(tileSize * 0.12).toFixed(2)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${(tileSize * 0.4).toFixed(2)}" font-weight="700" fill="#fff">${m.letter}</text>
          <g transform="translate(0 ${(tileSize / 2 + 2.5).toFixed(2)})">
            <rect x="-4.5" y="0" width="9" height="2.75" rx="1.375" fill="#fff"/>
            <text x="0" y="2" text-anchor="middle" font-family="Arial, sans-serif" font-size="1.75" font-weight="700" fill="#111">${price}</text>
          </g>
        </g>`;
    }).join('');
  }, [members, customization.memberCount]);

  const centerSvg = useMemo(() => {
    const centerSize = customization.memberCount <= 5 ? 12 : 10.5;
    return `
      <g transform="translate(50 50)">
        <defs><linearGradient id="center-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(210,72%,58%)"/>
          <stop offset="1" stop-color="hsl(210,62%,38%)"/>
        </linearGradient></defs>
        <circle r="${(centerSize / 2).toFixed(2)}" fill="url(#center-grad)" stroke="#fff" stroke-width="0.5"/>
        <text x="0" y="${(centerSize * 0.12).toFixed(2)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${(centerSize * 0.42).toFixed(2)}" font-weight="700" fill="#fff">@</text>
      </g>`;
  }, [customization.memberCount]);

  const markSvg = useMemo(() => renderMark(customization.mark, 'live'), [customization.mark]);
  const defsSvg = useMemo(() => renderSvgDefs(), []);

  // Pulse ring feedback on selection change
  const [pulse, setPulse] = useState(0);
  useEffect(() => { setPulse(p => p + 1); }, [gradientKey, bgCard?.id, connector?.id, customization.mark]);

  if (!bgCard && !connector) {
    return (
      <div ref={ref} className="w-full aspect-square rounded-2xl bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] text-sm neu-pressed">
        Pick a background to preview
      </div>
    );
  }

  return (
    <div
      ref={ref}
      data-card
      className="w-full aspect-square relative overflow-hidden"
      style={{
        background: gradientCss,
        borderRadius: 28,
        willChange: reducedMotion ? undefined : 'transform',
        transform: reducedMotion ? undefined : 'translateZ(0)',
        transition: 'background 0.25s ease',
      }}
    >
      {!reducedMotion && (
        <div
          key={pulse}
          className="absolute inset-0 pointer-events-none rounded-[28px]"
          style={{
            boxShadow: '0 0 0 2px rgba(13,92,255,0.6) inset',
            animation: 'studio-preview-pulse 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards',
          }}
        />
      )}
      <svg
        key={`${gradientKey}::${bgCard?.id ?? 'none'}::${connector?.id ?? 'none'}::${customization.mark}::${customization.memberCount}`}
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        dangerouslySetInnerHTML={{
          __html: `
            ${defsSvg}
            ${bgPatternDefs}
            ${bgPatternSvg}
            ${connectorSvg}
            ${centerSvg}
            ${tilesSvg}
            ${markSvg}
          `,
        }}
      />
      <div className="absolute bottom-2 right-1.5 text-right" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>
        <div className="text-[10px] font-semibold text-white opacity-85">@erthxn</div>
        <div className="text-[9px] text-white opacity-75">circlepay.fyi</div>
      </div>
    </div>
  );
}));

export default LivePreview;

'use client';

import { forwardRef, useMemo, memo } from 'react';
import type { Card, Connector, Customization, BgCard } from '@/lib/studio/types';
import {
  makeMembers,
  buildConnectorStroke,
  renderMark,
  renderSvgDefs,
  buildGradientCss,
  renderBgPattern,
  renderBgPatternDefs,
} from '@/lib/studio/builders';

interface Props {
  card: Card | null;
  connector: Connector | null;
  customization: Customization;
  bgCard?: BgCard | null;
  reducedMotion?: boolean;
  /** When true, render only the background (no member tiles / connectors / marks) */
  backgroundOnly?: boolean;
}

/**
 * LivePreview renders the active card with the active connector overlay
 * and applies the user's customization. Uses inline SVG for crispness
 * and to honor html2canvas export at scale:3.
 */
const LivePreview = memo(forwardRef<HTMLDivElement, Props>(function LivePreview(
  { card, connector, customization, bgCard, reducedMotion, backgroundOnly },
  ref,
) {
  // members depend on memberCount
  const members = useMemo(() => makeMembers(customization.memberCount), [customization.memberCount]);

  // CSS gradient string for the card background
  const gradientCss = useMemo(
    () => buildGradientCss(customization.gradientStops, customization.gradientAngle),
    [customization.gradientStops, customization.gradientAngle],
  )

  // BG card pattern overlay (if a bg card is selected)
  const bgPatternSvg = useMemo(() => {
    if (!bgCard?.pattern) return '';
    return renderBgPattern(bgCard.pattern, 'live-bg');
  }, [bgCard]);

  const bgPatternDefs = useMemo(() => {
    if (!bgCard?.pattern) return '';
    return renderBgPatternDefs(bgCard.pattern, 'live-bg');
  }, [bgCard]);

  // Build the SVG snippet for the connector overlay
  const connectorSvg = useMemo(() => {
    if (!connector || backgroundOnly) return '';
    const filterId = connector.filter ?? null;
    const cx = 50, cy = 50;  // viewBox 0-100, center at 50,50
    return members
      .map((m) => buildConnectorStroke(connector, customization, cx, cy, m, filterId))
      .join('');
  }, [connector, members, customization, backgroundOnly]);

  // SVG for the member tiles (positioned in viewBox coordinates)
  const tilesSvg = useMemo(() => {
    if (backgroundOnly) return '';
    const tileSize = customization.memberCount <= 5 ? 9.5 : customization.memberCount <= 7 ? 8.5 : 7.5;
    return members
      .map((m, i) => {
        const gid = `m${i}`;
        const price = m.amount.toFixed(2);
        return `
          <g transform="translate(${m.x.toFixed(2)} ${m.y.toFixed(2)})">
            <defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="hsl(${m.hue},72%,58%)"/>
              <stop offset="1" stop-color="hsl(${m.hue},62%,38%)"/>
            </linearGradient></defs>
            <circle r="${(tileSize / 2).toFixed(2)}" fill="url(#${gid})" stroke="#fff" stroke-width="0.5"/>
            <text x="0" y="${(tileSize * 0.12).toFixed(2)}" text-anchor="middle"
                  font-family="DejaVu Sans, Arial, sans-serif" font-size="${(tileSize * 0.4).toFixed(2)}"
                  font-weight="700" fill="#fff">${m.letter}</text>
            <g transform="translate(0 ${(tileSize / 2 + 2.5).toFixed(2)})">
              <rect x="-4.5" y="0" width="9" height="2.75" rx="1.375" fill="#fff"/>
              <text x="0" y="2" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif"
                    font-size="1.75" font-weight="700" fill="#111">${price}</text>
            </g>
          </g>`;
      })
      .join('');
  }, [members, customization.memberCount, backgroundOnly]);

  const centerSvg = useMemo(() => {
    if (backgroundOnly) return '';
    const centerSize = customization.memberCount <= 5 ? 12 : 10.5;
    return `
      <g transform="translate(50 50)">
        <defs><linearGradient id="center-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="hsl(210,72%,58%)"/>
          <stop offset="1" stop-color="hsl(210,62%,38%)"/>
        </linearGradient></defs>
        <circle r="${(centerSize / 2).toFixed(2)}" fill="url(#center-grad)" stroke="#fff" stroke-width="0.5"/>
        <text x="0" y="${(centerSize * 0.12).toFixed(2)}" text-anchor="middle"
              font-family="DejaVu Sans, Arial, sans-serif" font-size="${(centerSize * 0.42).toFixed(2)}"
              font-weight="700" fill="#fff">@</text>
      </g>`;
  }, [customization.memberCount, backgroundOnly]);

  const markSvg = useMemo(
    () => (backgroundOnly ? '' : renderMark(customization.mark, 'live')),
    [customization.mark, backgroundOnly],
  );

  const defsSvg = useMemo(() => renderSvgDefs(), []);

  if (!card && !bgCard) {
    return (
      <div ref={ref} className="w-full aspect-square rounded-2xl bg-[var(--bg)] flex items-center justify-center text-[var(--text-muted)] text-sm neu-pressed">
        Pick a card to preview
      </div>
    );
  }

  // The card data-card attribute is what html2canvas targets via onclone
  return (
    <div
      ref={ref}
      data-card
      className="w-full aspect-square relative overflow-hidden"
      style={{
        background: gradientCss,
        borderRadius: 28,
        // hint GPU layer
        willChange: reducedMotion ? undefined : 'transform',
        transform: reducedMotion ? undefined : 'translateZ(0)',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 w-full h-full"
        // inline SVG to ensure html2canvas can read it
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
      <div
        className="absolute bottom-2 right-1.5 text-right"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
      >
        <div className="text-[10px] font-semibold text-white opacity-85">@erthxn</div>
        <div className="text-[9px] text-white opacity-75">circlepay.fun</div>
      </div>
    </div>
  );
}));

export default LivePreview;

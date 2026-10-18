'use client';

import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';

interface Props {
  targetRef: React.RefObject<HTMLDivElement>;
  solidColor: string;
  filename?: string;
}

export default function DownloadButton({ targetRef, solidColor, filename = 'circlepay' }: Props) {
  const [busy, setBusy] = useState(false);
  const download = useCallback(async () => {
    if (!targetRef.current) return;
    setBusy(true);
    try {
      const source = targetRef.current;
      const rect = source.getBoundingClientRect();
      const cardW = Math.round(rect.width);
      const cardH = Math.round(rect.height);

      const canvas = await html2canvas(source, {
        backgroundColor: solidColor,
        scale: 3,
        useCORS: true,
        logging: false,
        width: cardW,
        height: cardH,
        windowWidth: cardW,
        windowHeight: cardH,
        onclone: (_doc, cloned) => {
          const el = cloned.querySelector('[data-card]') as HTMLElement | null;
          if (el) {
            const bg = source.style.background;
            el.style.width = `${cardW}px`;
            el.style.height = `${cardH}px`;
            el.style.background = bg;
            el.style.borderRadius = '28px';
            el.style.overflow = 'hidden';
            el.style.position = 'relative';
            el.style.transform = 'none';
            el.style.willChange = 'auto';
          }
        },
      });
      const link = document.createElement('a');
      link.download = `${filename}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download failed:', e);
      alert('Download failed — please try again');
    } finally {
      setBusy(false);
    }
  }, [targetRef, solidColor, filename]);

  return (
    <button
      onClick={download}
      disabled={busy}
      className="studio-tap w-full py-3 text-sm font-semibold text-white rounded-full transition-opacity disabled:opacity-60"
      style={{ background: 'var(--accent)' }}
    >
      {busy ? 'Rendering…' : 'Download PNG'}
    </button>
  );
}

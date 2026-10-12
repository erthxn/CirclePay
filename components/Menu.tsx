'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { setTheme, type StyleId } from './ThemeProvider';

const STYLES: { id: StyleId; label: string }[] = [
  { id: 'glass', label: 'Glass' },
  { id: 'skeuo', label: 'Skeuo' },
  { id: 'brutal', label: 'Brutal' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'hand', label: 'Hand' },
  { id: 'flat', label: 'Flat' },
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<StyleId>('skeuo');

  useEffect(() => {
    const saved = (localStorage.getItem('cp_style') as StyleId) || 'skeuo';
    setStyle(saved);
  }, []);

  function pick(id: StyleId) {
    setStyle(id);
    setTheme(id);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="neu-btn p-3 text-[var(--text)]"
        aria-label="Open menu"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[88vw] p-6 flex flex-col"
            style={{ background: 'var(--bg)', boxShadow: '-12px 0 24px rgba(0,0,0,0.08)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-semibold text-[var(--text)]">Menu</span>
              <button onClick={() => setOpen(false)} className="neu-btn w-9 h-9 flex items-center justify-center text-lg text-[var(--text-muted)]">
                ×
              </button>
            </div>

            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/" onClick={() => setOpen(false)} className="neu-btn px-4 py-3 text-[var(--text)]">Home</Link>
              <Link href="/circle" onClick={() => setOpen(false)} className="neu-btn px-4 py-3 text-[var(--text)]">Check your X circle</Link>
              <Link href="/how-it-works" onClick={() => setOpen(false)} className="neu-btn px-4 py-3 text-[var(--text)]">How it works</Link>
              <Link href="/about" onClick={() => setOpen(false)} className="neu-btn px-4 py-3 text-[var(--text)]">About</Link>
              <a
                href="https://x.com/erthxn"
                target="_blank"
                rel="noopener noreferrer"
                className="neu-btn px-4 py-3 text-[var(--accent)] font-medium"
              >
                Builder ↗
              </a>
            </nav>

            <div className="mt-8">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-2">UI style</p>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => pick(s.id)}
                    className={`px-2.5 py-1 text-[11px] rounded-full ${
                      style === s.id
                        ? 'bg-[var(--accent)] text-white'
                        : 'neu-btn text-[var(--text-muted)]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto text-xs text-[var(--text-muted)] pt-8">
              CirclePay · circlepay.fun
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Menu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 -mr-2 text-zinc-300"
        aria-label="Open menu"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-zinc-950 border-l border-zinc-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium">Menu</span>
              <button onClick={() => setOpen(false)} className="text-zinc-400 text-lg">×</button>
            </div>

            <nav className="flex flex-col gap-5 text-sm">
              <Link href="/" onClick={() => setOpen(false)} className="text-zinc-200">Home</Link>
              <Link href="/circle" onClick={() => setOpen(false)} className="text-zinc-200">Check your X circle</Link>
              <Link href="/how-it-works" onClick={() => setOpen(false)} className="text-zinc-200">How it works</Link>
              <Link href="/about" onClick={() => setOpen(false)} className="text-zinc-200">About</Link>
              <a
                href="https://x.com/erthxn"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0D5CFF]"
              >
                Builder ↗
              </a>
            </nav>

            <div className="mt-auto text-xs text-zinc-600 pt-8">
              CirclePay · circlepay.fun
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ErrorInner() {
  const params = useSearchParams();
  const msg = params.get('msg') || 'Something went wrong while reading the circle.';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-5 text-center">
      <div className="neu-raised inline-flex items-center justify-center w-16 h-16 rounded-full mb-6">
        <span className="text-2xl text-red-500">!</span>
      </div>
      <h1 className="text-xl font-bold text-[var(--text)] mb-2">Could not read circle</h1>
      <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed max-w-xs">{msg}</p>
      <Link
        href="/circle"
        className="inline-block px-6 py-3 text-sm font-medium text-white rounded-full"
        style={{ background: 'var(--accent)' }}
      >
        Try again
      </Link>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <ErrorInner />
    </Suspense>
  );
}

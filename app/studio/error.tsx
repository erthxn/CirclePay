'use client';

import { useEffect } from 'react';

export default function StudioError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Studio error:', error);
  }, [error]);

  return (
    <div className="px-5 max-w-md mx-auto text-center py-16">
      <h2 className="text-lg font-semibold text-[var(--text)] mb-2">Studio failed to load</h2>
      <p className="text-sm text-[var(--text-muted)] mb-5">
        Something went wrong while rendering the studio. Your customization is preserved in the URL.
      </p>
      <button
        onClick={reset}
        className="studio-tap px-6 py-3 text-sm font-medium rounded-full text-white"
        style={{ background: 'var(--accent)' }}
      >
        Reload
      </button>
    </div>
  );
}

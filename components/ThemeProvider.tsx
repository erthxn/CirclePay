'use client';

import { useEffect, useState } from 'react';

export type StyleId = 'glass' | 'skeuo' | 'brutal' | 'minimal' | 'hand' | 'flat';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem('cp_style') as StyleId) || 'skeuo';
    document.documentElement.setAttribute('data-theme', saved);
    setReady(true);
  }, []);

  if (!ready) return <>{children}</>;
  return <>{children}</>;
}

export function setTheme(id: StyleId) {
  localStorage.setItem('cp_style', id);
  document.documentElement.setAttribute('data-theme', id);
}

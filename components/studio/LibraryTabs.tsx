'use client';

import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const TYPES = [
  { id: 'cards', label: 'Cards', count: '250', href: '/studio/libraries?type=cards' },
  { id: 'bg', label: 'Backgrounds', count: '200', href: '/studio/libraries?type=bg' },
  { id: 'connectors', label: 'Connectors', count: '100', href: '/studio/libraries?type=connectors' },
] as const;

export function LibrariesTabs({ active }: { active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const switchType = useCallback((type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', type);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  return (
    <div className="flex items-center gap-2 mb-1 p-1.5 neu-raised rounded-2xl">
      {TYPES.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => switchType(t.id)}
            className="studio-tap flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-xl transition-all duration-300"
            style={{
              color: isActive ? '#fff' : 'var(--text-muted)',
              background: isActive ? 'var(--accent)' : 'transparent',
              transform: isActive ? 'translateZ(0) scale(1.02)' : 'translateZ(0)',
              boxShadow: isActive ? '0 4px 12px rgba(13,92,255,0.25)' : 'none',
            }}
          >
            <span>{t.label}</span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--bg-dark)',
                color: isActive ? '#fff' : 'var(--text-muted)',
              }}
            >
              {t.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

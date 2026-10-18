'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'studio', label: 'Studio', href: '/studio' },
  { id: 'circle', label: 'Circle', href: '/circle' },
  { id: 'how', label: 'How', href: '/how-it-works' },
  { id: 'about', label: 'About', href: '/about' },
] as const;

export default function StudioNav() {
  const pathname = usePathname();
  return (
    <div className="px-4 sm:px-5 max-w-[1400px] mx-auto mb-2">
      <div className="flex items-center gap-1 p-1 neu-raised rounded-full overflow-x-auto studio-scroll-x">
        {TABS.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="studio-tap relative flex items-center px-3 py-2 text-[11px] font-medium rounded-full transition-colors whitespace-nowrap studio-magnetic"
              style={{
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'var(--accent)' : 'transparent',
                boxShadow: isActive ? '0 2px 8px rgba(13,92,255,0.25)' : 'none',
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

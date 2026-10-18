'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from './motion';

const TABS = [
  { id: 'libraries', label: 'Libraries', href: '/studio/libraries', icon: LibraryIcon },
  { id: 'templates', label: 'Templates', href: '/studio/templates', icon: TemplateIcon },
  { id: 'custom', label: 'Custom', href: '/studio/custom', icon: CustomIcon },
  { id: 'preview', label: 'Preview', href: '/studio/preview', icon: PreviewIcon },
] as const;

export default function StudioNav() {
  const pathname = usePathname();
  const activeTab = TABS.find((t) => pathname.startsWith(t.href))?.id ?? 'libraries';

  return (
    <div className="mb-5">
      {/* Desktop: full bar with morphing indicator */}
      <div className="hidden sm:flex relative items-center gap-1 p-1.5 neu-raised rounded-full">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="studio-tap relative flex items-center gap-2 px-4 py-2.5 text-[12px] font-medium rounded-full transition-colors duration-300"
              style={{
                color: isActive ? '#fff' : 'var(--text-muted)',
                zIndex: isActive ? 2 : 1,
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="studio-tab-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 32, mass: 0.5 }}
                />
              )}
              <tab.icon className="w-3.5 h-3.5 relative" />
              <span className="relative">{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Mobile: compact segmented control */}
      <div className="sm:hidden grid grid-cols-4 gap-1 p-1 neu-raised rounded-2xl">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="studio-tap relative flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium rounded-xl transition-colors duration-300"
              style={{
                color: isActive ? '#fff' : 'var(--text-muted)',
                background: isActive ? 'var(--accent)' : 'transparent',
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="3.5" height="12" rx="1" fill="currentColor" />
      <rect x="6.5" y="2" width="3.5" height="12" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="11" y="4" width="3" height="10" rx="1" fill="currentColor" opacity="0.5" />
    </svg>
  );
}
function TemplateIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function CustomIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
function PreviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none">
      <path d="M2 8s2.5-4.5 6-4.5S14 8 14 8s-2.5 4.5-6 4.5S2 8 2 8z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.8" fill="currentColor" />
    </svg>
  );
}

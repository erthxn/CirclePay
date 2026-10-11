import type { Metadata } from 'next';
import './globals.css';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu';

export const metadata: Metadata = {
  title: 'CirclePay',
  description: 'Reward your X circle with crypto via PayBox',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <nav
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 py-4 neu-raised"
          style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2">
            <Logo className="h-7 w-7" />
            <span className="font-semibold text-sm tracking-tight text-[var(--text)]">
              Circle<span className="text-[var(--accent)]">Pay</span>
            </span>
          </div>
          <Menu />
        </nav>

        <main className="pt-24 pb-12" style={{ paddingTop: 'calc(5.5rem + env(safe-area-inset-top))' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

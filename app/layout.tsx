import type { Metadata, Viewport } from 'next';
import './globals.css';
import Logo from '@/components/Logo';
import Menu from '@/components/Menu';

const OG_IMAGE = 'https://circlepay-theta.vercel.app/opengraph-image';

export const metadata: Metadata = {
  title: 'CirclePay',
  description: 'Reward your X circle with crypto via PayBox',
  metadataBase: new URL('https://circlepay-theta.vercel.app'),
  openGraph: {
    title: 'CirclePay',
    description: 'Reward your X circle with crypto via PayBox',
    url: 'https://circlepay.fun',
    siteName: 'CirclePay',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'CirclePay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CirclePay',
    description: 'Reward your X circle with crypto via PayBox',
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased relative">
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          <div className="curve curve-tr" />
          <div className="curve curve-br" />
          <div className="curve curve-bl" />
        </div>

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

        <main className="pt-24 pb-12 relative z-10" style={{ paddingTop: 'calc(5.5rem + env(safe-area-inset-top))' }}>
          {children}
        </main>
      </body>
    </html>
  );
}

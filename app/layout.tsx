import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://circlepay-theta.vercel.app'),
  title: 'CirclePay: see who showed up for you',
  description: 'Drop an X handle and see the people who showed up for you in the last 7 days, as a circle card.',
  icons: { icon: '/logo.svg' },
};
export const viewport: Viewport = { themeColor: '#fafafa' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="circlepay">
      <body>{children}</body>
    </html>
  );
}

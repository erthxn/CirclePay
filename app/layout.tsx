import type { Metadata } from 'next';
import './globals.css';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  title: 'CirclePay',
  description: 'Reward your X circle with crypto via PayBox',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen antialiased">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-zinc-800 bg-black/90 px-4 py-3 backdrop-blur">
          <Logo className="h-8 w-8 shrink-0" />
          <span className="text-lg font-semibold tracking-tight">
            Circle<span className="text-[#0D5CFF]">Pay</span>
          </span>
        </header>
        <main className="px-4 pb-10">{children}</main>
      </body>
    </html>
  );
}

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
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-black/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6" />
            <span className="font-semibold text-sm tracking-tight">
              Circle<span className="text-[#0D5CFF]">Pay</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400">
            <span>Overview</span>
            <span>How it works</span>
            <span>Rewards</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <span>↗</span>
          </div>
        </nav>

        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}

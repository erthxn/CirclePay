import type { Metadata } from 'next';
import './globals.css';
import Logo from '@/components/Logo';

export const metadata: Metadata = {
  title: 'CirclePay',
  description: 'Reward your X circle with crypto via PayBox',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen">
        <header className="p-6 flex items-center gap-4 border-b border-zinc-800">
          <Logo className="w-10 h-10" />
          <span className="text-xl font-semibold tracking-tight">
            Circle<span className="text-[#0D5CFF]">Pay</span>
          </span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

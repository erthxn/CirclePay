import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-5 text-center">
      <div className="relative mb-6">
        <div className="text-[5.2rem] sm:text-[7.5rem] font-black tracking-tighter leading-none text-[var(--accent)] select-none">
          CIRCLE
        </div>
        <p className="absolute inset-0 flex items-center justify-center text-sm sm:text-base font-semibold tracking-wider text-white/90 pointer-events-none drop-shadow-sm">
          PAY
        </p>
      </div>

      <p className="text-lg sm:text-xl font-medium text-[var(--text)] mb-10 max-w-xs">
        Reward your X Circle
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/circle"
          className="px-7 py-3.5 text-sm font-medium text-white rounded-full"
          style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.35)' }}
        >
          Check your X circle
        </Link>
        <Link
          href="/how-it-works"
          className="neu-btn px-7 py-3.5 text-sm font-medium text-[var(--text)]"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}

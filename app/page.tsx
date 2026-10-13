import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center px-5 text-center">
      <div className="mb-4">
        <span className="inline-block px-2.5 py-1 text-[10px] font-semibold tracking-wide rounded-full bg-[var(--accent)] text-white">
          cardv3 live
        </span>
      </div>

      <div className="relative mb-6">
        <div className="text-[5.2rem] sm:text-[7.5rem] font-black tracking-tighter leading-none text-[var(--accent)] select-none">
          CIRCLE
        </div>
      </div>

      <p className="text-lg sm:text-xl font-medium text-[var(--text)] mb-10 max-w-xs">
        Reward your X Circle
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link href="/circle" className="px-7 py-3.5 text-sm font-medium text-white rounded-full" style={{ background: 'var(--accent)', boxShadow: '0 8px 20px rgba(13,92,255,0.35)' }}>
          Check your X circle
        </Link>
        <Link href="/guides" className="neu-btn px-7 py-3.5 text-sm font-medium text-[var(--text)]">
          How to connect PayBox
        </Link>
      </div>

      <div className="mt-6 flex gap-4 text-xs text-[var(--text-muted)]">
        <Link href="/how-it-works" className="hover:text-[var(--text)]">How it works</Link>
        <Link href="/status" className="hover:text-[var(--text)]">Status</Link>
      </div>

      <div className="mt-10 flex gap-4 text-[11px] text-[var(--text-muted)]">
        <Link href="/terms" className="hover:text-[var(--text)]">Terms</Link>
        <Link href="/privacy" className="hover:text-[var(--text)]">Privacy</Link>
        <Link href="/disclaimer" className="hover:text-[var(--text)]">Disclaimer</Link>
      </div>
    </div>
  );
}

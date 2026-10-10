import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-5 text-center">
      <div className="relative mb-4">
        <div className="text-[5.5rem] sm:text-[8rem] font-black tracking-tighter leading-none text-[#0D5CFF] select-none">
          CIRCLE
        </div>
      </div>

      <p className="text-lg sm:text-xl text-zinc-300 mb-10 max-w-xs">
        Reward your X Circle
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <Link
          href="/circle"
          className="bg-[#0D5CFF] hover:bg-[#0B4FE0] text-white text-sm font-medium px-6 py-3 rounded-full transition text-center"
        >
          Check your X circle
        </Link>
        <Link
          href="/how-it-works"
          className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-medium px-6 py-3 rounded-full transition text-center"
        >
          How it works
        </Link>
      </div>
    </div>
  );
}

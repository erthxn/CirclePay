import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-5 text-center">
      <div className="mb-6">
        <Logo className="h-14 w-14 mx-auto" />
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-3">
        Circle<span className="text-[#0D5CFF]">Pay</span>
      </h1>

      <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-xs">
        Reward your circle.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-none sm:w-auto">
        <button className="bg-[#0D5CFF] hover:bg-[#0B4FE0] text-white text-sm font-medium px-6 py-3 rounded-full transition">
          Generate prompt
        </button>
        <button className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 text-sm font-medium px-6 py-3 rounded-full transition">
          How it works
        </button>
      </div>

      <div className="mt-20 sm:mt-28 relative w-full max-w-lg">
        <div className="text-[4.5rem] sm:text-[6.5rem] font-black tracking-tighter leading-none text-zinc-900 select-none">
          CIRCLE
        </div>
        <p className="absolute inset-0 flex items-center justify-center text-xs text-zinc-600">
          Analyze → Rank → Prompt
        </p>
      </div>
    </div>
  );
}

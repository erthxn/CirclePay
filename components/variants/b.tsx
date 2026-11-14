'use client';
import { COPY, LINKS } from '@/components/content';
import { ArcPreview, Logo, Switcher, useCircle } from '@/components/shared';
import { BlurFade, BorderBeam, DotPattern, ShimmerButton } from '@/components/ui/magic';

/** /b: Magic UI. Dot grid, blur-in, shimmer button, border beam. */
export default function VariantB() {
  const c = useCircle();
  return (
    <div className="relative min-h-screen bg-[#fafafa] pb-24 text-zinc-950">
      <DotPattern className="h-[640px]" />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold"><Logo className="size-7" /> CirclePay</div>
        <a className="text-sm text-zinc-600 hover:text-zinc-950" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
      </header>

      <main className="relative mx-auto max-w-5xl px-6">
        <section className="flex flex-col items-center py-12 text-center md:py-20">
          <BlurFade>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#FFD400] bg-[#FFD400]/20 px-3 py-1 text-xs font-medium text-amber-900">
              <span className="size-1.5 rounded-full bg-[#FFD400]" /> Open spec · MIT
            </span>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tighter text-balance sm:text-6xl">{COPY.title}</h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-5 max-w-lg text-base text-zinc-600">{COPY.lede}</p>
          </BlurFade>
          <BlurFade delay={0.3} className="w-full">
            <form onSubmit={c.submit} className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center rounded-full border border-zinc-200 bg-white px-4 shadow-sm focus-within:border-[#d4a900]">
                <span className="text-zinc-400">@</span>
                <input value={c.raw} onChange={(e) => c.setRaw(e.target.value)} placeholder={COPY.placeholder} aria-label="X handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 w-full min-w-0 bg-transparent px-2 text-base outline-none placeholder:text-zinc-400" />
              </div>
              <ShimmerButton type="submit" className="h-12 sm:w-auto">{COPY.cta}</ShimmerButton>
            </form>
            <p className="mt-3 text-xs text-zinc-500">{COPY.note}</p>
          </BlurFade>
          <BlurFade delay={0.4} className="mt-12 w-full max-w-[340px]">
            <div className="relative overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-1.5 shadow-xl shadow-zinc-300/50">
              <ArcPreview svg={c.svg} className="overflow-hidden rounded-[1.6rem]" />
              <BorderBeam size={120} duration={8} />
            </div>
            <p className="mt-3 text-xs text-zinc-500">Example card</p>
          </BlurFade>
        </section>

        <section className="py-12">
          <BlurFade><h2 className="mb-8 text-center text-2xl font-bold tracking-tight">How it works</h2></BlurFade>
          <div className="grid gap-4 md:grid-cols-3">
            {COPY.steps.map((s, i) => (
              <BlurFade key={s.n} delay={0.1 * i}>
                <div className="h-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex size-8 items-center justify-center rounded-full bg-[#FFD400] text-sm font-bold text-black">{s.n}</div>
                  <h3 className="font-semibold">{s.t}</h3>
                  <p className="mt-1.5 text-sm text-zinc-600">{s.d}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative mx-auto mt-8 flex max-w-5xl flex-col gap-2 border-t border-zinc-200 px-6 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
        <span>{COPY.footer}</span>
        <span className="flex gap-4">
          <a className="hover:text-zinc-950" href={LINKS.spec} target="_blank" rel="noopener noreferrer">Spec</a>
          <a className="hover:text-zinc-950" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>
      <Switcher current="b" />
    </div>
  );
}

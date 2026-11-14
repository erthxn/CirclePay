'use client';
import { COPY, LINKS } from '@/components/content';
import { ArcPreview, Mark, Switcher, useCircle } from '@/components/shared';
import { BlurText, GradientText, SpotlightCard, Squares, StarBorder } from '@/components/ui/reactbits';

/** /d: React Bits. Squares grid, blur text, animated gradient, star border CTA. */
export default function VariantD() {
  const c = useCircle();
  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black_55%,transparent)]"><Squares /></div>
        <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-semibold"><Mark className="size-6 text-[#FFD400]" /> CirclePay</div>
          <a className="text-sm text-neutral-400 hover:text-white" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </header>
        <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-14 pb-24 text-center md:pt-20">
          <h1 className="text-5xl font-black tracking-tighter md:text-7xl">
            <BlurText text="See who showed up" />
            <GradientText className="mt-1">for you.</GradientText>
          </h1>
          <p className="mt-6 max-w-lg text-base text-neutral-400">{COPY.lede}</p>
          <form onSubmit={c.submit} className="mt-9 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center rounded-[20px] border border-zinc-800 bg-black/80 px-4 focus-within:border-[#FFD400]">
              <span className="text-zinc-500">@</span>
              <input value={c.raw} onChange={(e) => c.setRaw(e.target.value)} placeholder={COPY.placeholder} aria-label="X handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-12 w-full min-w-0 bg-transparent px-2 text-base outline-none placeholder:text-zinc-600" />
            </div>
            <StarBorder type="submit">{COPY.cta}</StarBorder>
          </form>
          <p className="mt-3 text-xs text-neutral-500">{COPY.note}</p>
        </section>
      </div>

      <main className="mx-auto max-w-5xl px-6">
        <section className="flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[2rem] bg-gradient-to-b from-[#FFD400]/40 to-transparent p-px">
            <div className="rounded-[2rem] bg-black p-2"><ArcPreview svg={c.svg} className="overflow-hidden rounded-[1.6rem]" /></div>
          </div>
          <p className="mt-3 text-xs text-neutral-500">Example card</p>
        </section>

        <section className="py-20">
          <h2 className="mb-10 text-center text-3xl font-black tracking-tighter">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {COPY.steps.map((s) => (
              <SpotlightCard key={s.n}>
                <div className="text-5xl font-black text-[#FFD400]">{s.n}</div>
                <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
                <p className="mt-2 text-sm text-neutral-400">{s.d}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 border-t border-neutral-900 px-6 py-8 text-xs text-neutral-500 sm:flex-row sm:justify-between">
        <span>{COPY.footer}</span>
        <span className="flex gap-4">
          <a className="hover:text-white" href={LINKS.spec} target="_blank" rel="noopener noreferrer">Spec</a>
          <a className="hover:text-white" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>
      <Switcher current="d" />
    </div>
  );
}

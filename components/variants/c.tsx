'use client';
import { COPY, LINKS } from '@/components/content';
import { ArcPreview, Logo, Switcher, useCircle } from '@/components/shared';
import { BackgroundBeams, Spotlight } from '@/components/ui/aceternity';

/** /c: Aceternity UI. Spotlight + beams hero, gradient headline, hover-border button. */
export default function VariantC() {
  const c = useCircle();
  return (
    <div className="min-h-screen bg-[#fafafa] pb-24 text-zinc-950 antialiased">
      <div className="relative overflow-hidden">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" />
        <BackgroundBeams />
        <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2 font-semibold"><Logo className="size-7" /> CirclePay</div>
          <a className="text-sm text-neutral-600 hover:text-zinc-950" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </header>
        <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-6 pt-14 pb-20 text-center md:pt-24">
          <h1 className="bg-gradient-to-b from-neutral-950 to-neutral-600 bg-clip-text text-5xl font-bold tracking-tight text-balance text-transparent md:text-7xl">{COPY.title}</h1>
          <p className="mt-5 max-w-lg text-base font-normal text-neutral-600">{COPY.lede}</p>
          <form onSubmit={c.submit} className="mt-9 flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row">
            <div className="flex flex-1 items-center rounded-lg border border-neutral-200 bg-white px-3 shadow-sm focus-within:ring-2 focus-within:ring-[#FFD400]/70">
              <span className="text-neutral-400">@</span>
              <input value={c.raw} onChange={(e) => c.setRaw(e.target.value)} placeholder={COPY.placeholder} aria-label="X handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-11 w-full min-w-0 bg-transparent px-2 text-base outline-none placeholder:text-neutral-400" />
            </div>
            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#FFD400] px-5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(180,130,0,0.5),0_8px_24px_rgba(255,212,0,0.35)] transition hover:bg-[#FFE14D]">{COPY.cta}</button>
          </form>
          <p className="mt-3 text-xs text-neutral-500">{COPY.note}</p>
        </section>
      </div>

      <main className="mx-auto max-w-5xl px-6">
        <section className="flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-3xl border border-neutral-200 bg-white p-2 shadow-[0_20px_80px_-20px_rgba(255,212,0,0.55)]">
            <ArcPreview svg={c.svg} className="overflow-hidden rounded-[1.25rem]" />
          </div>
          <p className="mt-3 text-xs text-neutral-500">Example card</p>
        </section>

        <section className="py-20">
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {COPY.steps.map((s) => (
              <div key={s.n} className="group relative rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:border-[#d4a900]">
                <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(300px_circle_at_50%_0%,rgba(255,212,0,0.22),transparent)] opacity-0 transition group-hover:opacity-100" />
                <div className="relative">
                  <span className="text-sm font-semibold text-amber-700">0{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-5xl flex-col gap-2 border-t border-neutral-200 px-6 py-8 text-xs text-neutral-500 sm:flex-row sm:justify-between">
        <span>{COPY.footer}</span>
        <span className="flex gap-4">
          <a className="hover:text-zinc-950" href={LINKS.spec} target="_blank" rel="noopener noreferrer">Spec</a>
          <a className="hover:text-zinc-950" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>
      <Switcher current="c" />
    </div>
  );
}

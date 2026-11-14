'use client';
import { COPY, LINKS } from '@/components/content';
import { ArcPreview, Logo, Switcher, useCircle } from '@/components/shared';

/** /e: daisyUI. Plain component classes (navbar, hero, join, steps, card, footer) on a custom yellow-on-black theme. */
export default function VariantE() {
  const c = useCircle();
  return (
    <div data-theme="circlepay" className="min-h-screen bg-base-100 pb-24 text-base-content">
      <div className="navbar mx-auto max-w-5xl px-6">
        <div className="flex flex-1 items-center gap-2 text-lg font-bold"><Logo className="size-7" /> CirclePay</div>
        <a className="btn btn-ghost btn-sm" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
      </div>

      <main className="mx-auto max-w-5xl px-6">
        <div className="hero py-10 md:py-16">
          <div className="hero-content flex-col gap-12 p-0 lg:flex-row lg:gap-20">
            <div className="max-w-md text-center lg:text-left">
              <div className="badge badge-outline mb-4 border-[#FFD400] bg-[#FFD400]/20 text-amber-900">Open spec · MIT</div>
              <h1 className="text-4xl font-bold text-balance md:text-5xl">{COPY.title}</h1>
              <p className="py-5 opacity-70">{COPY.lede}</p>
              <form onSubmit={c.submit} className="join w-full">
                <label className="input join-item flex-1 items-center">
                  <span className="opacity-50">@</span>
                  <input value={c.raw} onChange={(e) => c.setRaw(e.target.value)} placeholder={COPY.placeholder} aria-label="X handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="min-w-0 grow" />
                </label>
                <button type="submit" className="btn btn-primary join-item">{COPY.cta}</button>
              </form>
              <p className="mt-3 text-xs opacity-50">{COPY.note}</p>
            </div>
            <div className="card w-full max-w-[340px] border border-base-300 bg-base-200 p-2">
              <ArcPreview svg={c.svg} className="overflow-hidden rounded-[1.1rem]" />
              <div className="badge badge-outline mx-auto my-2 border-base-300 text-xs opacity-70">Example card</div>
            </div>
          </div>
        </div>

        <section className="py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">How it works</h2>
          <ul className="steps steps-vertical w-full md:steps-horizontal">
            {COPY.steps.map((s) => (
              <li key={s.n} className="step step-primary">
                <div className="self-start px-3 text-left md:text-center">
                  <div className="font-semibold">{s.t}</div>
                  <div className="mt-1 text-sm opacity-60">{s.d}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer footer-horizontal mx-auto mt-8 max-w-5xl border-t border-base-300 px-6 py-8 text-xs opacity-70 sm:footer-center-none">
        <aside className="max-w-md"><p>{COPY.footer}</p></aside>
        <nav className="grid-flow-col gap-4 sm:place-self-center sm:justify-self-end">
          <a className="link link-hover" href={LINKS.spec} target="_blank" rel="noopener noreferrer">Spec</a>
          <a className="link link-hover" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </nav>
      </footer>
      <Switcher current="e" />
    </div>
  );
}

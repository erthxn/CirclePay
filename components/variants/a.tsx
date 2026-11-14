'use client';
import { COPY, LINKS } from '@/components/content';
import { ArcPreview, Logo, Switcher, useCircle } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/** /a: shadcn/ui. Zinc surfaces, hairline borders, restrained type. */
export default function VariantA() {
  const c = useCircle();
  return (
    <div className="min-h-screen bg-zinc-50 pb-24 text-zinc-950">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold tracking-tight">
          <Logo className="size-7" /> CirclePay
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-6">
        <section className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
          <div className="space-y-6">
            <Badge>Open spec · MIT</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">{COPY.title}</h1>
            <p className="max-w-md text-base text-zinc-600">{COPY.lede}</p>
            <form onSubmit={c.submit} className="flex max-w-md flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-zinc-400">@</span>
                <Input value={c.raw} onChange={(e) => c.setRaw(e.target.value)} placeholder={COPY.placeholder} aria-label="X handle" autoCapitalize="none" autoCorrect="off" spellCheck={false} className="h-10 pl-7" />
              </div>
              <Button type="submit" size="lg">{COPY.cta}</Button>
            </form>
            <p className="text-xs text-zinc-500">{COPY.note}</p>
          </div>
          <div className="mx-auto w-full max-w-[340px]">
            <Card className="gap-3 p-2 py-2">
              <ArcPreview svg={c.svg} className="overflow-hidden rounded-lg" />
            </Card>
            <p className="mt-3 text-center text-xs text-zinc-500">Example card</p>
          </div>
        </section>

        <section className="py-12">
          <h2 className="mb-6 text-sm font-medium text-zinc-600">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {COPY.steps.map((s) => (
              <Card key={s.n}>
                <CardHeader>
                  <div className="mb-2 flex size-7 items-center justify-center rounded-md border border-[#FFD400] bg-[#FFD400]/20 text-xs font-semibold text-zinc-900">{s.n}</div>
                  <CardTitle>{s.t}</CardTitle>
                  <CardDescription>{s.d}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-8 flex max-w-5xl flex-col gap-2 border-t border-zinc-200 px-6 py-8 text-xs text-zinc-500 sm:flex-row sm:justify-between">
        <span>{COPY.footer}</span>
        <span className="flex gap-4">
          <a className="hover:text-zinc-900" href={LINKS.spec} target="_blank" rel="noopener noreferrer">Spec</a>
          <a className="hover:text-zinc-900" href={LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
        </span>
      </footer>
      <Switcher current="a" />
    </div>
  );
}

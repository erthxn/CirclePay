import Link from 'next/link';
import { VARIANTS } from '@/components/content';
import { Logo } from '@/components/shared';

export default function Page() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <div className="flex items-center gap-3">
        <Logo className="size-10" />
        <h1 className="text-2xl font-semibold tracking-tight">CirclePay</h1>
      </div>
      <p className="mt-3 text-neutral-600">Five clean takes on one page. Pick a style.</p>
      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {VARIANTS.map((v) => (
          <li key={v.key}>
            <Link href={'/' + v.key} className="group flex items-center gap-4 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#FFD400] text-sm font-bold uppercase text-black">{v.key}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{v.name}</span>
                <span className="block text-sm text-neutral-600">{v.line}</span>
              </span>
              <span className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-900">→</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-xs text-neutral-500">Open spec · MIT · <a className="hover:text-neutral-900" href="https://github.com/erthxn/CirclePay" target="_blank" rel="noopener noreferrer">GitHub</a></p>
    </main>
  );
}

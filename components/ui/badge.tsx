import * as React from 'react';
import { cn } from '@/lib/utils';

function Badge({ className, ...props }: React.ComponentProps<'span'>) {
  return <span data-slot="badge" className={cn('inline-flex w-fit items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700', className)} {...props} />;
}
export { Badge };

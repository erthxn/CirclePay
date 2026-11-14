import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-zinc-200 bg-white px-3 py-1 text-base text-zinc-950 shadow-xs outline-none transition-[color,box-shadow] placeholder:text-zinc-400 focus-visible:border-[#d4a900] focus-visible:ring-[3px] focus-visible:ring-[#FFD400]/50 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}
export { Input };

import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1 text-base text-white shadow-xs outline-none transition-[color,box-shadow] placeholder:text-zinc-500 focus-visible:border-[#FFD400] focus-visible:ring-[3px] focus-visible:ring-[#FFD400]/30 md:text-sm',
        className,
      )}
      {...props}
    />
  );
}
export { Input };

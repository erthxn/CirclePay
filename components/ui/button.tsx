import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// shadcn/ui Button (new-york), themed yellow on black.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-[#FFD400]/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 'bg-[#FFD400] text-black shadow-xs hover:bg-[#FFD400]/90',
        outline: 'border border-zinc-800 bg-zinc-950 shadow-xs hover:bg-zinc-900 hover:text-white',
        ghost: 'hover:bg-zinc-900 hover:text-white',
      },
      size: { default: 'h-9 px-4 py-2', lg: 'h-10 rounded-md px-6', sm: 'h-8 rounded-md px-3' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
export { Button, buttonVariants };

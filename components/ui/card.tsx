import * as React from 'react';
import { cn } from '@/lib/utils';

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card" className={cn('flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950 py-5 text-white shadow-sm', className)} {...props} />;
}
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('grid gap-1.5 px-5', className)} {...props} />;
}
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('font-semibold leading-none', className)} {...props} />;
}
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-description" className={cn('text-sm text-zinc-400', className)} {...props} />;
}
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-5', className)} {...props} />;
}
export { Card, CardHeader, CardTitle, CardDescription, CardContent };

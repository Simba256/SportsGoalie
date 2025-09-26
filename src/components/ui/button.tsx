import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 focus-visible:ring-red-200',
        outline:
          'border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-blue-600 hover:text-blue-700 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 dark:bg-slate-800 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:border-blue-600',
        secondary:
          'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 border border-slate-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 dark:text-slate-300',
        ghost:
          'hover:bg-blue-50 hover:text-blue-600 transform hover:scale-105 active:scale-95 dark:hover:bg-blue-950 dark:hover:text-blue-400',
        link: 'text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline transform hover:scale-105 active:scale-95 dark:text-blue-400 dark:hover:text-blue-300',
        success: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95',
        premium: 'bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 animate-pulse hover:animate-none',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

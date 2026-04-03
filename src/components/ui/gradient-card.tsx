'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'relative flex flex-col justify-between h-full w-full overflow-hidden rounded-2xl p-8 shadow-sm transition-shadow duration-300 hover:shadow-xl',
  {
    variants: {
      gradient: {
        // Original variants
        orange: 'bg-gradient-to-br from-orange-100 to-amber-200/60',
        gray:   'bg-gradient-to-br from-slate-100 to-slate-200/60',
        purple: 'bg-gradient-to-br from-purple-100 to-violet-200/60',
        green:  'bg-gradient-to-br from-emerald-100 to-teal-200/60',
        // Extended for 7 Pillars
        red:    'bg-gradient-to-br from-red-100 to-rose-200/60',
        blue:   'bg-gradient-to-br from-blue-100 to-sky-200/60',
        lightBlue: 'bg-gradient-to-br from-sky-100 to-blue-200/60',
        darkBlue: 'bg-gradient-to-br from-slate-700 via-slate-800 to-blue-950',
        cyan:   'bg-gradient-to-br from-cyan-100 to-teal-200/60',
        pink:   'bg-gradient-to-br from-pink-100 to-fuchsia-200/60',
        amber:  'bg-gradient-to-br from-amber-100 to-yellow-200/60',
        dark:   'bg-gradient-to-br from-zinc-800 to-zinc-900',
      },
    },
    defaultVariants: {
      gradient: 'gray',
    },
  }
);

export interface GradientCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  badgeText: string;
  badgeColor: string;
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  imageUrl?: string;
  decorativeElement?: React.ReactNode;
}

const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  (
    {
      className,
      gradient,
      badgeText,
      badgeColor,
      title,
      description,
      ctaText,
      ctaHref,
      imageUrl,
      decorativeElement,
      ...props
    },
    ref
  ) => {
    const isDark = gradient === 'dark' || gradient === 'darkBlue';

    const cardAnimation = {
      rest:  { scale: 1, y: 0 },
      hover: { scale: 1.03, y: -6 },
    };

    const decorativeAnimation = {
      rest:  { scale: 1, rotate: 0, opacity: isDark ? 0.2 : 0.26 },
      hover: { scale: 1.15, rotate: 6, opacity: isDark ? 0.3 : 0.36 },
    };

    return (
      <motion.div
        variants={cardAnimation}
        initial="rest"
        whileHover="hover"
        animate="rest"
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-full"
        ref={ref}
      >
        <div className={cn(cardVariants({ gradient }), className)} {...props}>

          {/* Decorative background — image or element */}
          {imageUrl ? (
            <motion.img
              src={imageUrl}
              alt=""
              variants={decorativeAnimation}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -right-8 -bottom-8 w-2/3 pointer-events-none select-none"
            />
          ) : decorativeElement ? (
            <motion.div
              variants={decorativeAnimation}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="absolute -right-4 -bottom-4 pointer-events-none select-none"
            >
              {decorativeElement}
            </motion.div>
          ) : null}

          {/* Content */}
          <div className="z-10 flex flex-col h-full">
            {/* Badge */}
            <div
              className={cn(
                'mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase w-fit',
                isDark
                  ? 'bg-white/10 text-white/80'
                  : 'bg-white/60 text-gray-700 backdrop-blur-sm'
              )}
            >
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: badgeColor }}
              />
              {badgeText}
            </div>

            {/* Title & Description */}
            <div className="flex-grow">
              <h3
                className={cn(
                  'text-2xl font-extrabold mb-3 leading-tight',
                  isDark ? 'text-white' : 'text-gray-900'
                )}
              >
                {title}
              </h3>
              <p
                className={cn(
                  'text-sm leading-relaxed max-w-xs',
                  isDark ? 'text-white/70' : 'text-gray-600'
                )}
              >
                {description}
              </p>
            </div>

            {/* CTA */}
            <a
              href={ctaHref}
              className={cn(
                'group mt-6 inline-flex items-center gap-2 text-sm font-bold transition-all duration-200',
                isDark
                  ? 'text-white/90 hover:text-white'
                  : 'text-gray-900 hover:text-gray-700'
              )}
            >
              {ctaText}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </a>
          </div>
        </div>
      </motion.div>
    );
  }
);

GradientCard.displayName = 'GradientCard';

export { GradientCard, cardVariants };

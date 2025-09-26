'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'white' | 'dark';
}

export function Logo({ className, size = 'md', variant = 'default' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const getGradientId = () => {
    switch (variant) {
      case 'white':
        return 'logo-gradient-white';
      case 'dark':
        return 'logo-gradient-dark';
      default:
        return 'logo-gradient-default';
    }
  };

  return (
    <svg
      viewBox="0 0 32 32"
      className={cn(sizeClasses[size], className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Default gradient */}
        <linearGradient id="logo-gradient-default" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>

        {/* White variant */}
        <linearGradient id="logo-gradient-white" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F8FAFC" />
        </linearGradient>

        {/* Dark variant */}
        <linearGradient id="logo-gradient-dark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Accent gradient for details */}
        <linearGradient id="logo-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Main shield/goal shape */}
      <path
        d="M16 2L4 8v8c0 7.5 5.2 14.5 12 16 6.8-1.5 12-8.5 12-16V8L16 2z"
        fill={`url(#${getGradientId()})`}
        className="drop-shadow-sm"
      />

      {/* Goal posts */}
      <rect x="8" y="12" width="1.5" height="8" fill="url(#logo-accent)" />
      <rect x="22.5" y="12" width="1.5" height="8" fill="url(#logo-accent)" />
      <rect x="8" y="12" width="16" height="1.5" fill="url(#logo-accent)" />

      {/* Soccer ball */}
      <circle
        cx="16"
        cy="16"
        r="3"
        fill="white"
        stroke={variant === 'white' ? '#3B82F6' : 'white'}
        strokeWidth="0.5"
      />

      {/* Soccer ball pattern */}
      <polygon
        points="16,13.5 17.5,15.5 16,17.5 14.5,15.5"
        fill={variant === 'white' ? '#3B82F6' : '#3B82F6'}
        opacity="0.8"
      />

      {/* Smart/tech accent - brain/chip pattern */}
      <circle
        cx="22"
        cy="10"
        r="2"
        fill="url(#logo-accent)"
        opacity="0.9"
      />
      <rect x="21" y="9" width="2" height="0.5" fill="white" opacity="0.8" />
      <rect x="21" y="10" width="2" height="0.5" fill="white" opacity="0.8" />
      <rect x="21" y="11" width="2" height="0.5" fill="white" opacity="0.8" />
    </svg>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  return <Logo className={className} size="md" />;
}

export function LogoWithText({
  className,
  textClassName,
  size = 'md'
}: {
  className?: string;
  textClassName?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Logo size={size} />
      <span
        className={cn(
          'font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
          textSizes[size],
          textClassName
        )}
      >
        SmarterGoalie
      </span>
    </div>
  );
}
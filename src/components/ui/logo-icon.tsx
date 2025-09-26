'use client';

import { cn } from '@/lib/utils';

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 24 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={cn('', className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id="logo-accent-icon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EF4444" />
        </linearGradient>
      </defs>

      {/* Main shield/goal shape */}
      <path
        d="M16 2L4 8v8c0 7.5 5.2 14.5 12 16 6.8-1.5 12-8.5 12-16V8L16 2z"
        fill="url(#logo-gradient-icon)"
        className="drop-shadow-sm"
      />

      {/* Goal posts */}
      <rect x="8" y="12" width="1.5" height="8" fill="url(#logo-accent-icon)" />
      <rect x="22.5" y="12" width="1.5" height="8" fill="url(#logo-accent-icon)" />
      <rect x="8" y="12" width="16" height="1.5" fill="url(#logo-accent-icon)" />

      {/* Soccer ball */}
      <circle
        cx="16"
        cy="16"
        r="3"
        fill="white"
        stroke="white"
        strokeWidth="0.5"
      />

      {/* Soccer ball pattern */}
      <polygon
        points="16,13.5 17.5,15.5 16,17.5 14.5,15.5"
        fill="#3B82F6"
        opacity="0.8"
      />

      {/* Smart/tech accent */}
      <circle
        cx="22"
        cy="10"
        r="2"
        fill="url(#logo-accent-icon)"
        opacity="0.9"
      />
      <rect x="21" y="9" width="2" height="0.5" fill="white" opacity="0.8" />
      <rect x="21" y="10" width="2" height="0.5" fill="white" opacity="0.8" />
      <rect x="21" y="11" width="2" height="0.5" fill="white" opacity="0.8" />
    </svg>
  );
}
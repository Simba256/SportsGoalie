'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Full-screen immersive container for the onboarding flow.
 * Dark theme with ice-inspired styling.
 */
export function OnboardingContainer({ children, className }: OnboardingContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full',
        'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900',
        'text-white',
        'overflow-hidden',
        className
      )}
    >
      {/* Subtle ice/frost texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

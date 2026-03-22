'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface OnboardingContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Full-screen immersive container for the onboarding flow.
 * Clean light theme matching the dashboard.
 */
export function OnboardingContainer({ children, className }: OnboardingContainerProps) {
  return (
    <div
      className={cn(
        'min-h-screen w-full',
        'bg-gradient-to-br from-gray-50 via-white to-gray-50',
        'text-gray-900',
        'overflow-hidden',
        className
      )}
    >
      {/* Subtle decorative blurs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </div>
  );
}

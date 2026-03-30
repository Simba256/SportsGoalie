'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Component as BackgroundComponent } from '@/components/ui/background-components';

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
    <BackgroundComponent
      className={cn(
        'text-gray-900 overflow-hidden pt-20',
        className
      )}
    >
      <div className="min-h-screen flex flex-col">
        {children}
      </div>
    </BackgroundComponent>
  );
}

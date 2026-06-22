'use client';

import { ReactNode } from 'react';

interface OnboardingContainerProps {
  children: ReactNode;
}

export function OnboardingContainer({ children }: OnboardingContainerProps) {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      color: '#fff',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

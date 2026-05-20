'use client';

import { ReactNode } from 'react';

interface OnboardingContainerProps {
  children: ReactNode;
  className?: string;
}

export function OnboardingContainer({ children }: OnboardingContainerProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #000a1f 0%, #041530 40%, #071e42 100%)',
      color: '#fff',
      overflowX: 'hidden',
    }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '80px' }}>
        {children}
      </div>
    </div>
  );
}

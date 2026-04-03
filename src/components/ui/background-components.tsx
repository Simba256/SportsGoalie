'use client';

import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface BackgroundComponentProps {
  children?: ReactNode;
  className?: string;
}

export const Component = ({ children, className }: BackgroundComponentProps) => {
  const [count, setCount] = useState(0);

  void count;
  void setCount;

  return (
    <div className={cn('min-h-screen w-full relative bg-white', className)}>
      {/* Brand glow layer */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 22% 20%, rgba(239, 68, 68, 0.16) 0%, transparent 44%),
            radial-gradient(circle at 78% 82%, rgba(59, 130, 246, 0.14) 0%, transparent 46%),
            radial-gradient(circle at 50% 52%, rgba(15, 23, 42, 0.05) 0%, transparent 62%)
          `,
          mixBlendMode: 'multiply',
        }}
      />

      {/* Soft grid texture to match the site language */}
      <div
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(148, 163, 184, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148, 163, 184, 0.07) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Your Content/Components */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Component;

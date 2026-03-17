'use client';

import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  stackPosition = '20%',
}) => {
  const resolvedTop = typeof stackPosition === 'number' ? `${stackPosition}px` : stackPosition;
  const customProperties = {
    '--scroll-stack-gap': `${itemDistance}px`,
    '--scroll-stack-top': resolvedTop,
  } as CSSProperties;

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} style={customProperties}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;

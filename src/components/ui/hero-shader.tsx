'use client';

import type React from 'react';
import { useId } from 'react';
import { MeshGradient } from '@paper-design/shaders-react';
import { cn } from '@/lib/utils';

interface ShaderBackgroundProps {
  children: React.ReactNode;
  className?: string;
  /** Primary mesh colors — defaults to Smarter Goalie blues */
  colors?: string[];
  /** Overlay / wire-like mesh colors */
  overlayColors?: string[];
  backgroundColor?: string;
  speed?: number;
  overlaySpeed?: number;
}

const DEFAULT_COLORS = ['#000f28', '#0ea5e9', '#37b5ff', '#1850b4', '#60cdff'];
const DEFAULT_OVERLAY = ['#000f28', '#ffffff', '#37b5ff', '#0d2848'];

export function ShaderBackground({
  children,
  className,
  colors = DEFAULT_COLORS,
  overlayColors = DEFAULT_OVERLAY,
  backgroundColor = '#000f28',
  speed = 0.3,
  overlaySpeed = 0.2,
}: ShaderBackgroundProps) {
  const uid = useId().replace(/:/g, '');
  const glassId = `glass-effect-${uid}`;
  const gooeyId = `gooey-filter-${uid}`;

  return (
    <div
      className={cn('relative w-full min-h-[650px] overflow-hidden', className)}
      style={{ backgroundColor }}
      data-glass-filter={glassId}
      data-gooey-filter={gooeyId}
    >
      {/* SVG Filters — available to children via url(#id) */}
      <svg className="pointer-events-none absolute inset-0 h-0 w-0" aria-hidden>
        <defs>
          <filter id={glassId} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id={gooeyId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background shaders */}
      <MeshGradient
        className="absolute inset-0 h-full w-full"
        colors={colors}
        speed={speed}
        distortion={0.85}
        swirl={0.55}
        style={{ width: '100%', height: '100%' }}
      />
      <MeshGradient
        className="absolute inset-0 h-full w-full opacity-55"
        colors={overlayColors}
        speed={overlaySpeed}
        distortion={1}
        swirl={0.35}
        grainMixer={0.35}
        style={{ width: '100%', height: '100%' }}
      />

      <div className="relative z-10 flex w-full flex-1 flex-col justify-center">{children}</div>
    </div>
  );
}

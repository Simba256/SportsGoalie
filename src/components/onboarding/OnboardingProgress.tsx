'use client';

import {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarSlug, PILLARS } from '@/types';

interface OnboardingProgressProps {
  currentPillarIndex: number;
  completedPillars: PillarSlug[];
  className?: string;
}

const pillarIcons: Record<PillarSlug, LucideIcon> = {
  mindset: Brain,
  skating: Footprints,
  form: Shapes,
  positioning: Target,
  seven_point: Grid3X3,
  training: Dumbbell,
};

const pillarColors: Record<PillarSlug, string> = {
  mindset: 'text-purple-400 bg-purple-500/20',
  skating: 'text-blue-400 bg-blue-500/20',
  form: 'text-green-400 bg-green-500/20',
  positioning: 'text-orange-400 bg-orange-500/20',
  seven_point: 'text-red-400 bg-red-500/20',
  training: 'text-cyan-400 bg-cyan-500/20',
};

/**
 * Visual progress indicator showing the 6 pillars as icons.
 * Current pillar is highlighted, completed pillars show checkmarks.
 */
export function OnboardingProgress({
  currentPillarIndex,
  completedPillars,
  className,
}: OnboardingProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {PILLARS.map((pillar, index) => {
          const Icon = pillarIcons[pillar.slug];
          const isCompleted = completedPillars.includes(pillar.slug);
          const isCurrent = index === currentPillarIndex;
          const isPending = index > currentPillarIndex && !isCompleted;

          return (
            <div key={pillar.slug} className="flex items-center">
              {/* Pillar icon */}
              <div
                className={cn(
                  'relative flex items-center justify-center',
                  'w-10 h-10 sm:w-12 sm:h-12 rounded-full',
                  'transition-all duration-300',
                  isCompleted && 'bg-green-500/20 text-green-400 ring-2 ring-green-500/50',
                  isCurrent && cn(pillarColors[pillar.slug], 'ring-2 ring-white/30 scale-110'),
                  isPending && 'bg-slate-700/50 text-slate-500'
                )}
                title={pillar.name}
              >
                {isCompleted ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}

                {/* Current indicator pulse */}
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-white/20" />
                )}
              </div>

              {/* Connector line (except for last) */}
              {index < PILLARS.length - 1 && (
                <div
                  className={cn(
                    'w-4 sm:w-8 h-0.5 mx-1',
                    'transition-all duration-300',
                    index < currentPillarIndex
                      ? 'bg-green-500/50'
                      : 'bg-slate-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current pillar name */}
      <div className="text-center mt-4">
        <p className="text-sm text-slate-400">
          {currentPillarIndex < PILLARS.length
            ? `Pillar ${currentPillarIndex + 1} of ${PILLARS.length}`
            : 'Complete!'}
        </p>
        {currentPillarIndex < PILLARS.length && (
          <p className="text-lg font-semibold text-white mt-1">
            {PILLARS[currentPillarIndex].name}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PillarSlug, PillarInfo } from '@/types';

interface PillarIntroProps {
  pillar: PillarInfo;
  pillarIndex: number;
  questionCount: number;
  onContinue: () => void;
}

const pillarIcons: Record<PillarSlug, LucideIcon> = {
  mindset: Brain,
  skating: Footprints,
  form: Shapes,
  positioning: Target,
  seven_point: Grid3X3,
  training: Dumbbell,
};

const pillarColors: Record<PillarSlug, { bg: string; text: string; shadow: string }> = {
  mindset: {
    bg: 'from-purple-600 to-purple-400',
    text: 'text-purple-300',
    shadow: 'shadow-purple-500/30',
  },
  skating: {
    bg: 'from-blue-600 to-blue-400',
    text: 'text-blue-300',
    shadow: 'shadow-blue-500/30',
  },
  form: {
    bg: 'from-green-600 to-green-400',
    text: 'text-green-300',
    shadow: 'shadow-green-500/30',
  },
  positioning: {
    bg: 'from-orange-600 to-orange-400',
    text: 'text-orange-300',
    shadow: 'shadow-orange-500/30',
  },
  seven_point: {
    bg: 'from-red-600 to-red-400',
    text: 'text-red-300',
    shadow: 'shadow-red-500/30',
  },
  training: {
    bg: 'from-cyan-600 to-cyan-400',
    text: 'text-cyan-300',
    shadow: 'shadow-cyan-500/30',
  },
};

/**
 * Animated introduction screen for each pillar.
 * Shows before the pillar's questions begin.
 */
export function PillarIntro({
  pillar,
  pillarIndex,
  questionCount,
  onContinue,
}: PillarIntroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = pillarIcons[pillar.slug];
  const colors = pillarColors[pillar.slug];

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div
        className={cn(
          'max-w-lg w-full text-center transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        )}
      >
        {/* Pillar number badge */}
        <div className="mb-6">
          <span className="inline-block px-4 py-1 rounded-full bg-slate-800/80 text-slate-400 text-sm font-medium">
            Pillar {pillarIndex + 1} of 6
          </span>
        </div>

        {/* Icon */}
        <div
          className={cn(
            'inline-flex items-center justify-center w-28 h-28 rounded-2xl',
            'bg-gradient-to-br',
            colors.bg,
            'shadow-xl',
            colors.shadow,
            'mb-8'
          )}
        >
          <Icon className="w-14 h-14 text-white" />
        </div>

        {/* Pillar name */}
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          {pillar.name}
        </h2>

        {/* Description */}
        <p className={cn('text-lg mb-8', colors.text)}>
          {pillar.description}
        </p>

        {/* Question count */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-8">
          <p className="text-slate-400">
            <span className="text-white font-semibold">{questionCount} questions</span> about your {pillar.shortName.toLowerCase()} skills
          </p>
        </div>

        {/* Continue button */}
        <Button
          size="lg"
          onClick={onContinue}
          className={cn(
            'bg-gradient-to-r',
            colors.bg,
            'hover:opacity-90 text-white font-semibold px-8 py-6 text-lg rounded-xl',
            'shadow-lg',
            colors.shadow,
            'transition-all hover:scale-105'
          )}
        >
          Begin {pillar.shortName} Assessment
          <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import { GoalieCategorySlug, GOALIE_CATEGORIES } from '@/types';
import { cn } from '@/lib/utils';
import { Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen, Check, ClipboardList } from 'lucide-react';

interface OnboardingProgressProps {
  phase: 'intake' | 'bridge' | 'assessment' | 'profile' | 'completed';
  currentIntakeScreen?: number;
  totalIntakeScreens?: number;
  currentCategoryIndex?: number;
  currentQuestionIndex?: number;
  questionProgress?: { current: number; total: number };
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

const CATEGORY_COLORS: Record<string, string> = {
  feelings: 'text-purple-500 bg-purple-100',
  knowledge: 'text-blue-500 bg-blue-100',
  pre_game: 'text-cyan-500 bg-cyan-100',
  in_game: 'text-red-500 bg-red-100',
  post_game: 'text-green-500 bg-green-100',
  training: 'text-orange-500 bg-orange-100',
  learning: 'text-indigo-500 bg-indigo-100',
};

const CATEGORY_RING_COLORS: Record<string, string> = {
  feelings: 'ring-purple-400',
  knowledge: 'ring-blue-400',
  pre_game: 'ring-cyan-400',
  in_game: 'ring-red-400',
  post_game: 'ring-green-400',
  training: 'ring-orange-400',
  learning: 'ring-indigo-400',
};

export function OnboardingProgress({
  phase,
  currentIntakeScreen = 0,
  totalIntakeScreens = 4,
  currentCategoryIndex = 0,
  questionProgress,
}: OnboardingProgressProps) {
  const categoryOrder: GoalieCategorySlug[] = [
    'feelings',
    'knowledge',
    'pre_game',
    'in_game',
    'post_game',
    'training',
    'learning',
  ];

  const overallProgress = useMemo(() => {
    if (phase === 'completed' || phase === 'profile') return 100;

    const intakeProgress = phase === 'intake'
      ? (currentIntakeScreen / totalIntakeScreens) * 20
      : phase === 'bridge' || phase === 'assessment'
      ? 20
      : 0;

    const assessmentProgress = phase === 'assessment' && questionProgress
      ? (questionProgress.current / questionProgress.total) * 80
      : 0;

    return Math.round(intakeProgress + assessmentProgress);
  }, [phase, currentIntakeScreen, totalIntakeScreens, questionProgress]);

  const intakeComplete = phase === 'bridge' || phase === 'assessment' || phase === 'profile' || phase === 'completed';

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-400 font-medium">Progress</span>
          <span className="text-xs text-gray-400 font-medium">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      <div className="flex items-center justify-center gap-1 sm:gap-2">
        {/* Intake indicator */}
        <div
          className={cn(
            'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all',
            intakeComplete
              ? 'bg-green-100 text-green-600'
              : phase === 'intake'
              ? 'bg-red-100 text-red-500 ring-2 ring-red-400 ring-offset-2 ring-offset-white'
              : 'bg-gray-100 text-gray-400'
          )}
          title="Intake Questions"
        >
          {intakeComplete ? (
            <Check className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
          )}
        </div>

        {/* Divider */}
        <div
          className={cn(
            'w-4 sm:w-8 h-0.5 mx-1 rounded-full transition-colors',
            intakeComplete ? 'bg-green-300' : 'bg-gray-200'
          )}
        />

        {/* Category indicators */}
        {categoryOrder.map((slug, index) => {
          const Icon = CATEGORY_ICONS[slug] || Target;
          const colorClass = CATEGORY_COLORS[slug] || 'text-gray-400 bg-gray-100';
          const ringColor = CATEGORY_RING_COLORS[slug] || 'ring-gray-400';
          const isComplete = phase === 'assessment' && index < currentCategoryIndex;
          const isCurrent = phase === 'assessment' && index === currentCategoryIndex;
          const isUpcoming = phase === 'assessment' && index > currentCategoryIndex;
          const isIntakePhase = phase === 'intake' || phase === 'bridge';

          return (
            <div key={slug} className="flex items-center">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all',
                  isComplete
                    ? 'bg-green-100 text-green-600'
                    : isCurrent
                    ? cn(colorClass, 'ring-2 ring-offset-2 ring-offset-white', ringColor)
                    : isUpcoming || isIntakePhase
                    ? 'bg-gray-100 text-gray-300'
                    : 'bg-gray-100 text-gray-400'
                )}
                title={GOALIE_CATEGORIES.find(c => c.slug === slug)?.shortName || slug}
              >
                {isComplete ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>

              {index < categoryOrder.length - 1 && (
                <div
                  className={cn(
                    'w-4 sm:w-6 h-0.5 rounded-full transition-colors ml-1 sm:ml-2',
                    isComplete ? 'bg-green-300' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase label */}
      <div className="mt-3 text-center">
        <span className="text-xs text-gray-400">
          {phase === 'intake' && `Intake - Question ${currentIntakeScreen + 1}/${totalIntakeScreens}`}
          {phase === 'bridge' && 'Getting Ready for Assessment'}
          {phase === 'assessment' && questionProgress && (
            `Question ${questionProgress.current + 1} of ${questionProgress.total}`
          )}
          {phase === 'profile' && 'Assessment Complete'}
          {phase === 'completed' && 'Onboarding Complete'}
        </span>
      </div>
    </div>
  );
}

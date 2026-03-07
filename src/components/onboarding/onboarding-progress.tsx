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

/**
 * Map category slugs to Lucide icons
 */
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

/**
 * Category colors for icons
 */
const CATEGORY_COLORS: Record<string, string> = {
  feelings: 'text-purple-400 bg-purple-500/20',
  knowledge: 'text-blue-400 bg-blue-500/20',
  pre_game: 'text-cyan-400 bg-cyan-500/20',
  in_game: 'text-red-400 bg-red-500/20',
  post_game: 'text-green-400 bg-green-500/20',
  training: 'text-orange-400 bg-orange-500/20',
  learning: 'text-indigo-400 bg-indigo-500/20',
};

/**
 * Progress indicator for onboarding flow.
 * Shows intake phase + 7 category icons with completion state.
 */
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

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    if (phase === 'completed' || phase === 'profile') return 100;

    // Intake is 20% of total
    const intakeProgress = phase === 'intake'
      ? (currentIntakeScreen / totalIntakeScreens) * 20
      : phase === 'bridge' || phase === 'assessment'
      ? 20
      : 0;

    // Assessment is 80% of total
    const assessmentProgress = phase === 'assessment' && questionProgress
      ? (questionProgress.current / questionProgress.total) * 80
      : 0;

    return Math.round(intakeProgress + assessmentProgress);
  }, [phase, currentIntakeScreen, totalIntakeScreens, questionProgress]);

  // Determine if intake is complete
  const intakeComplete = phase === 'bridge' || phase === 'assessment' || phase === 'profile' || phase === 'completed';

  return (
    <div className="w-full">
      {/* Overall progress bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-500">Progress</span>
          <span className="text-xs text-slate-500">{overallProgress}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
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
              ? 'bg-cyan-500/30 text-cyan-400'
              : phase === 'intake'
              ? 'bg-cyan-500/20 text-cyan-400 ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-slate-900'
              : 'bg-slate-800 text-slate-500'
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
            intakeComplete ? 'bg-cyan-500/50' : 'bg-slate-700'
          )}
        />

        {/* Category indicators */}
        {categoryOrder.map((slug, index) => {
          const Icon = CATEGORY_ICONS[slug] || Target;
          const colorClass = CATEGORY_COLORS[slug] || 'text-slate-400 bg-slate-500/20';
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
                    ? 'bg-cyan-500/30 text-cyan-400'
                    : isCurrent
                    ? cn(colorClass, 'ring-2 ring-offset-2 ring-offset-slate-900', colorClass.includes('purple') ? 'ring-purple-500/50' : colorClass.includes('blue') ? 'ring-blue-500/50' : colorClass.includes('cyan') ? 'ring-cyan-500/50' : colorClass.includes('red') ? 'ring-red-500/50' : colorClass.includes('green') ? 'ring-green-500/50' : colorClass.includes('orange') ? 'ring-orange-500/50' : 'ring-indigo-500/50')
                    : isUpcoming || isIntakePhase
                    ? 'bg-slate-800 text-slate-600'
                    : 'bg-slate-800 text-slate-500'
                )}
                title={GOALIE_CATEGORIES.find(c => c.slug === slug)?.shortName || slug}
              >
                {isComplete ? (
                  <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </div>

              {/* Divider between categories (not after last one) */}
              {index < categoryOrder.length - 1 && (
                <div
                  className={cn(
                    'w-4 sm:w-6 h-0.5 rounded-full transition-colors ml-1 sm:ml-2',
                    isComplete ? 'bg-cyan-500/50' : 'bg-slate-700'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Current phase label */}
      <div className="mt-3 text-center">
        <span className="text-xs text-slate-500">
          {phase === 'intake' && `Intake - Screen ${currentIntakeScreen + 1}/${totalIntakeScreens}`}
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

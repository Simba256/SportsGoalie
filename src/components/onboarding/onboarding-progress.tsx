'use client';

import { useMemo } from 'react';
import { GoalieCategorySlug, GOALIE_CATEGORIES } from '@/types';
import { Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen, Check, ClipboardList } from 'lucide-react';

const BLUE = '#37b5ff';
const GREEN = '#4ade80';

interface OnboardingProgressProps {
  phase: 'intake' | 'bridge' | 'assessment' | 'profile' | 'completed';
  currentIntakeScreen?: number;
  totalIntakeScreens?: number;
  currentCategoryIndex?: number;
  currentQuestionIndex?: number;
  questionProgress?: { current: number; total: number };
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

const CATEGORY_ACCENT: Record<string, string> = {
  feelings: '#a78bfa',
  knowledge: '#37b5ff',
  pre_game: '#2dd4bf',
  in_game: '#f87171',
  post_game: '#4ade80',
  training: '#fb923c',
  learning: '#818cf8',
};

export function OnboardingProgress({
  phase,
  currentIntakeScreen = 0,
  totalIntakeScreens = 4,
  currentCategoryIndex = 0,
  questionProgress,
}: OnboardingProgressProps) {
  const categoryOrder: GoalieCategorySlug[] = [
    'feelings', 'knowledge', 'pre_game', 'in_game', 'post_game', 'training', 'learning',
  ];

  const overallProgress = useMemo(() => {
    if (phase === 'completed' || phase === 'profile') return 100;
    const intakeProgress = phase === 'intake'
      ? (currentIntakeScreen / totalIntakeScreens) * 20
      : (phase === 'bridge' || phase === 'assessment') ? 20 : 0;
    const assessmentProgress = phase === 'assessment' && questionProgress
      ? (questionProgress.current / questionProgress.total) * 80 : 0;
    return Math.round(intakeProgress + assessmentProgress);
  }, [phase, currentIntakeScreen, totalIntakeScreens, questionProgress]);

  const intakeComplete = phase === 'bridge' || phase === 'assessment' || phase === 'profile' || phase === 'completed';

  const iconSz: React.CSSProperties = { width: '18px', height: '18px' };

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Progress</span>
          <span style={{ fontSize: '11px', color: BLUE, fontWeight: 700 }}>{overallProgress}%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${overallProgress}%`,
            background: `linear-gradient(90deg, ${BLUE}, #0ea5e9)`,
            borderRadius: '99px',
            transition: 'width 0.5s ease',
            boxShadow: `0 0 6px rgba(55,181,255,0.4)`,
          }} />
        </div>
      </div>

      {/* Phase dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', flexWrap: 'wrap' }}>
        {/* Intake icon */}
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s',
            background: intakeComplete
              ? `${GREEN}20`
              : phase === 'intake'
              ? `${BLUE}20`
              : 'rgba(255,255,255,0.05)',
            border: intakeComplete
              ? `2px solid ${GREEN}60`
              : phase === 'intake'
              ? `2px solid ${BLUE}`
              : '2px solid rgba(255,255,255,0.08)',
            color: intakeComplete ? GREEN : phase === 'intake' ? BLUE : 'rgba(255,255,255,0.25)',
            boxShadow: phase === 'intake' ? `0 0 12px ${BLUE}40` : 'none',
          }}
          title="Intake Questions"
        >
          {intakeComplete ? <Check style={iconSz} /> : <ClipboardList style={iconSz} />}
        </div>

        {/* Divider */}
        <div style={{ width: '14px', height: '2px', borderRadius: '99px', background: intakeComplete ? `${GREEN}60` : 'rgba(255,255,255,0.08)' }} />

        {/* Category icons */}
        {categoryOrder.map((slug, index) => {
          const Icon = CATEGORY_ICONS[slug] || Target;
          const accent = CATEGORY_ACCENT[slug] || BLUE;
          const isComplete = (phase === 'assessment' || phase === 'profile' || phase === 'completed') && index < currentCategoryIndex;
          const isCurrent = phase === 'assessment' && index === currentCategoryIndex;
          const label = GOALIE_CATEGORIES.find(c => c.slug === slug)?.shortName || slug;

          return (
            <div key={slug} style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.3s',
                  background: isComplete ? `${GREEN}20` : isCurrent ? `${accent}20` : 'rgba(255,255,255,0.05)',
                  border: isComplete ? `2px solid ${GREEN}60` : isCurrent ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.08)',
                  color: isComplete ? GREEN : isCurrent ? accent : 'rgba(255,255,255,0.2)',
                  boxShadow: isCurrent ? `0 0 12px ${accent}40` : 'none',
                }}
                title={label}
              >
                {isComplete ? <Check style={iconSz} /> : <Icon style={iconSz} />}
              </div>
              {index < categoryOrder.length - 1 && (
                <div style={{
                  width: '10px', height: '2px', borderRadius: '99px',
                  background: isComplete ? `${GREEN}60` : 'rgba(255,255,255,0.08)',
                  marginLeft: '3px',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Phase label */}
      <div style={{ marginTop: '6px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>
          {phase === 'intake' && `Intake · Question ${currentIntakeScreen + 1}/${totalIntakeScreens}`}
          {phase === 'bridge' && 'Getting Ready for Assessment'}
          {phase === 'assessment' && questionProgress && `Question ${questionProgress.current + 1} of ${questionProgress.total}`}
          {phase === 'profile' && 'Assessment Complete'}
          {phase === 'completed' && 'Onboarding Complete'}
        </span>
      </div>
    </div>
  );
}

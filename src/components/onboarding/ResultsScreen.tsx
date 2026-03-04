'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Trophy,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  OnboardingEvaluation,
  PillarSlug,
  AssessmentLevel,
  PILLARS,
  getLevelDisplayText,
  getLevelColor,
} from '@/types';

interface ResultsScreenProps {
  evaluation: OnboardingEvaluation;
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

const levelColors: Record<AssessmentLevel, string> = {
  beginner: 'from-amber-500 to-orange-400',
  intermediate: 'from-blue-500 to-cyan-400',
  advanced: 'from-green-500 to-emerald-400',
};

/**
 * Results reveal screen showing the evaluation results with animations.
 */
export function ResultsScreen({ evaluation, onContinue }: ResultsScreenProps) {
  const [showResults, setShowResults] = useState(false);
  const [animatedPillars, setAnimatedPillars] = useState<number>(0);

  useEffect(() => {
    // Start reveal animation
    const timer1 = setTimeout(() => setShowResults(true), 500);

    // Animate pillars one by one
    const pillarTimers = PILLARS.map((_, index) => {
      return setTimeout(() => {
        setAnimatedPillars(index + 1);
      }, 1000 + index * 200);
    });

    return () => {
      clearTimeout(timer1);
      pillarTimers.forEach(clearTimeout);
    };
  }, []);

  const overallLevel = evaluation.overallLevel || 'beginner';
  const overallPercentage = evaluation.overallPercentage || 0;

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="max-w-4xl w-full py-8">
        {/* Header */}
        <div
          className={cn(
            'text-center mb-10 transition-all duration-700',
            showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30 mb-6">
            <Trophy className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Evaluation Complete!
          </h1>
          <p className="text-slate-400 text-lg">
            Here's your personalized assessment across the 6 Goalie Pillars
          </p>
        </div>

        {/* Overall Level Card */}
        <div
          className={cn(
            'bg-slate-800/50 rounded-2xl p-6 mb-8 text-center transition-all duration-700 delay-300',
            showResults ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <p className="text-slate-400 mb-2">Your Overall Starting Level</p>
          <div
            className={cn(
              'inline-block px-8 py-3 rounded-xl bg-gradient-to-r text-white font-bold text-2xl mb-4',
              levelColors[overallLevel]
            )}
          >
            {getLevelDisplayText(overallLevel)}
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{overallPercentage}%</div>
              <div className="text-sm text-slate-500">Overall Score</div>
            </div>
            <div className="h-12 w-px bg-slate-700" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {evaluation.duration ? Math.round(evaluation.duration / 60) : '?'}
              </div>
              <div className="text-sm text-slate-500">Minutes</div>
            </div>
          </div>
        </div>

        {/* Pillar Results Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          {PILLARS.map((pillar, index) => {
            const Icon = pillarIcons[pillar.slug];
            const result = evaluation.pillarAssessments?.[pillar.slug];
            const isAnimated = index < animatedPillars;

            return (
              <div
                key={pillar.slug}
                className={cn(
                  'bg-slate-800/50 rounded-xl p-5 transition-all duration-500',
                  isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                )}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    `bg-${pillar.color}-500/20 text-${pillar.color}-400`
                  )}
                  style={{
                    backgroundColor: getColorBg(pillar.color),
                    color: getColorText(pillar.color),
                  }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{pillar.shortName}</h3>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs mt-1 border',
                        result ? getLevelColor(result.level) : 'text-slate-500 border-slate-600'
                      )}
                    >
                      {result ? getLevelDisplayText(result.level) : 'N/A'}
                    </Badge>
                  </div>
                </div>

                {/* Score bar */}
                {result && (
                  <>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-400">Score</span>
                      <span className="font-semibold text-white">{result.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-1000 ease-out',
                          result.level === 'advanced' && 'bg-gradient-to-r from-green-500 to-emerald-400',
                          result.level === 'intermediate' && 'bg-gradient-to-r from-blue-500 to-cyan-400',
                          result.level === 'beginner' && 'bg-gradient-to-r from-amber-500 to-orange-400',
                        )}
                        style={{
                          width: isAnimated ? `${result.percentage}%` : '0%',
                          transitionDelay: `${index * 100 + 300}ms`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Insights */}
        {evaluation.pillarAssessments && (
          <div
            className={cn(
              'grid gap-6 sm:grid-cols-2 mb-10 transition-all duration-700',
              animatedPillars >= PILLARS.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            )}
          >
            {/* Strengths */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-green-300">Your Strengths</h3>
              </div>
              <ul className="space-y-2">
                {getTopStrengths(evaluation).map((strength, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-green-400 mt-0.5">•</span>
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Growth */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-amber-300">Areas for Growth</h3>
              </div>
              <ul className="space-y-2">
                {getTopWeaknesses(evaluation).map((weakness, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5">•</span>
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Continue button */}
        <div
          className={cn(
            'text-center transition-all duration-700',
            animatedPillars >= PILLARS.length ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          )}
        >
          <Button
            size="lg"
            onClick={onContinue}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold px-10 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
          >
            Continue to Dashboard
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>

          <p className="mt-4 text-sm text-slate-500">
            Your coach can review these results and adjust your starting level if needed.
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper to get color styles
function getColorBg(color: string): string {
  const colors: Record<string, string> = {
    purple: 'rgba(168, 85, 247, 0.2)',
    blue: 'rgba(59, 130, 246, 0.2)',
    green: 'rgba(34, 197, 94, 0.2)',
    orange: 'rgba(249, 115, 22, 0.2)',
    red: 'rgba(239, 68, 68, 0.2)',
    cyan: 'rgba(6, 182, 212, 0.2)',
  };
  return colors[color] || colors.blue;
}

function getColorText(color: string): string {
  const colors: Record<string, string> = {
    purple: 'rgb(192, 132, 252)',
    blue: 'rgb(96, 165, 250)',
    green: 'rgb(74, 222, 128)',
    orange: 'rgb(251, 146, 60)',
    red: 'rgb(248, 113, 113)',
    cyan: 'rgb(34, 211, 238)',
  };
  return colors[color] || colors.blue;
}

function getTopStrengths(evaluation: OnboardingEvaluation): string[] {
  if (!evaluation.pillarAssessments) return ['Complete the assessment to see your strengths'];

  const strengths: string[] = [];
  const sortedPillars = PILLARS
    .map(p => ({ pillar: p, result: evaluation.pillarAssessments![p.slug] }))
    .filter(({ result }) => result && result.percentage >= 60)
    .sort((a, b) => b.result!.percentage - a.result!.percentage);

  for (const { pillar, result } of sortedPillars.slice(0, 3)) {
    strengths.push(`Strong ${pillar.shortName.toLowerCase()} fundamentals (${result!.percentage}%)`);
  }

  if (strengths.length === 0) {
    strengths.push('Focus on building foundational skills across all pillars');
  }

  return strengths;
}

function getTopWeaknesses(evaluation: OnboardingEvaluation): string[] {
  if (!evaluation.pillarAssessments) return ['Complete the assessment to see growth areas'];

  const weaknesses: string[] = [];
  const sortedPillars = PILLARS
    .map(p => ({ pillar: p, result: evaluation.pillarAssessments![p.slug] }))
    .filter(({ result }) => result && result.percentage < 60)
    .sort((a, b) => a.result!.percentage - b.result!.percentage);

  for (const { pillar, result } of sortedPillars.slice(0, 3)) {
    weaknesses.push(`${pillar.shortName} needs development (${result!.percentage}%)`);
  }

  if (weaknesses.length === 0) {
    weaknesses.push('Great job! Continue refining your advanced skills');
  }

  return weaknesses;
}

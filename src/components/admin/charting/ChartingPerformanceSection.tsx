'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ChartingEntry } from '@/types';
import {
  calculateGoalsStats,
  calculateChallengeStats,
  calculateFocusConsistency,
  calculateSkatingPerformance,
  calculatePositionalPerformance,
  calculateTeamPlay,
  calculateDecisionMaking,
  calculateBodyLanguage,
  calculateReboundControl,
  calculateFreezingPuck,
  calculatePreGameStats,
  calculatePostGameStats,
} from '@/lib/charting/performance-metrics';

interface ChartingPerformanceSectionProps {
  entries: ChartingEntry[];
}

const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  if (trend === 'up') return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="w-5 h-5 text-destructive" />;
  return <Minus className="w-5 h-5 text-muted-foreground" />;
};

export function ChartingPerformanceSection({ entries }: ChartingPerformanceSectionProps) {
  const goalsStats = calculateGoalsStats(entries);
  const challengeStats = calculateChallengeStats(entries);
  const focusStats = calculateFocusConsistency(entries);
  const skatingStats = calculateSkatingPerformance(entries);
  const positionalStats = calculatePositionalPerformance(entries);
  const teamPlayStats = calculateTeamPlay(entries);
  const decisionMaking = calculateDecisionMaking(entries);
  const bodyLanguage = calculateBodyLanguage(entries);
  const reboundControl = calculateReboundControl(entries);
  const freezingPuck = calculateFreezingPuck(entries);
  const preGameStats = calculatePreGameStats(entries);
  const postGameStats = calculatePostGameStats(entries);

  const hasAny =
    goalsStats ||
    challengeStats ||
    focusStats ||
    skatingStats ||
    positionalStats ||
    teamPlayStats ||
    decisionMaking ||
    bodyLanguage ||
    reboundControl ||
    freezingPuck ||
    preGameStats ||
    postGameStats;

  if (!hasAny) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No legacy charting entries to compute performance metrics yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Goals Performance */}
      {goalsStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Goals Performance</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 dark:bg-emerald-500/10 dark:border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg Good Goals/Game</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
                {goalsStats.avgGoodGoals}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Across {goalsStats.totalGames} games
              </p>
            </div>

            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Avg Bad Goals/Game</p>
                <TrendIcon trend={goalsStats.trend} />
              </div>
              <p className="text-3xl font-bold text-destructive">{goalsStats.avgBadGoals}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {goalsStats.trend === 'up' && '📈 Improving! '}
                {goalsStats.trend === 'down' && '📉 Needs attention '}
                {goalsStats.improvement}% vs earlier period
              </p>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Good/Bad Ratio</p>
              <p className="text-3xl font-bold text-primary">
                {(parseFloat(goalsStats.avgGoodGoals) / parseFloat(goalsStats.avgBadGoals) || 0).toFixed(2)}:1
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {parseFloat(goalsStats.avgGoodGoals) > parseFloat(goalsStats.avgBadGoals)
                  ? '✓ More good than bad'
                  : '⚠ Work on reducing bad goals'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Challenge & Consistency */}
      {challengeStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Challenge Level & Consistency</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Average Challenge Rating</p>
              <p className="text-3xl font-bold text-primary">
                {challengeStats.avgChallenge}
                <span className="text-base">/10</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {parseFloat(challengeStats.avgChallenge) < 4 && 'Easier games'}
                {parseFloat(challengeStats.avgChallenge) >= 4 && parseFloat(challengeStats.avgChallenge) < 7 && 'Moderate difficulty'}
                {parseFloat(challengeStats.avgChallenge) >= 7 && 'High difficulty games'}
              </p>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-2">Challenge Consistency</p>
              <p className="text-3xl font-bold text-accent">{challengeStats.consistency}</p>
              <p className="text-xs text-muted-foreground mt-1">
                σ = {challengeStats.stdDev} (standard deviation)
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Mind-Set Performance */}
      {(focusStats || skatingStats) && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Mind-Set Performance</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {focusStats && (
              <div className="bg-primary/5 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Focus Consistency</p>
                  <TrendIcon trend={focusStats.trend} />
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-bold text-primary sm:text-4xl">{focusStats.percentage}%</p>
                  <p className="text-sm text-muted-foreground mb-1">consistent</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${focusStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {focusStats.positiveCount} consistent / {focusStats.negativeCount} inconsistent periods
                </p>
              </div>
            )}

            {skatingStats && (
              <div className="bg-primary/5 border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">Skating In Sync</p>
                  <TrendIcon trend={skatingStats.trend} />
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-bold text-primary sm:text-4xl">{skatingStats.percentage}%</p>
                  <p className="text-sm text-muted-foreground mb-1">in sync</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${skatingStats.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {skatingStats.positiveCount} in sync / {skatingStats.negativeCount} not in sync periods
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Positional */}
      {positionalStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Positional Performance</h2>
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
            <p className="text-sm font-semibold text-foreground mb-3">Strong Positioning</p>
            <div className="flex items-end gap-2 mb-2">
              <p className="text-3xl font-bold text-accent sm:text-4xl">{positionalStats.percentage}%</p>
              <p className="text-sm text-muted-foreground mb-1">good/strong</p>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mb-2">
              <div
                className="bg-accent h-3 rounded-full transition-all"
                style={{ width: `${positionalStats.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {positionalStats.goodCount} good/strong / {positionalStats.needsWorkCount} needs work periods
            </p>
          </div>
        </Card>
      )}

      {/* Pre-Game Preparation */}
      {preGameStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-1 sm:text-xl">Pre-Game Preparation</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Adherence rates across {preGameStats.total} sessions
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: 'Equipment Ready', value: preGameStats.equipment },
              { label: 'Mental Prep', value: preGameStats.mental },
              { label: 'Warm-Up', value: preGameStats.warmup },
              { label: 'Physical', value: preGameStats.physical },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <Badge>{item.value}%</Badge>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Post-Game Review */}
      {postGameStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Post-Game Review</h2>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Review Completion Rate</p>
              <p className="text-3xl font-bold text-foreground">{postGameStats.completionRate}%</p>
              <p className="text-sm text-muted-foreground mt-1">
                {postGameStats.completed} of {postGameStats.total} sessions reviewed
              </p>
            </div>
            <div className="w-28 h-28 shrink-0 sm:w-32 sm:h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  className="text-muted"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="8"
                  fill="none"
                  pathLength={100}
                  strokeDasharray={`${parseFloat(postGameStats.completionRate)} 100`}
                />
              </svg>
            </div>
          </div>
        </Card>
      )}

      {/* Decision Making & Body Language */}
      {(decisionMaking || bodyLanguage) && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Decision Making & Body Language</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {decisionMaking && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-5 dark:bg-emerald-500/10 dark:border-emerald-500/20">
                <p className="text-sm font-semibold text-foreground mb-3">Decision Making - Strong</p>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 sm:text-4xl">
                    {decisionMaking.strongPercentage}%
                  </p>
                  <p className="text-sm text-muted-foreground mb-1">strong</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all dark:bg-emerald-500"
                    style={{ width: `${decisionMaking.strongPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {decisionMaking.strongCount} strong / {decisionMaking.improvingCount} improving / {decisionMaking.needsWorkCount} needs work
                </p>
              </div>
            )}
            {bodyLanguage && (
              <div className="bg-primary/5 border border-border rounded-lg p-5">
                <p className="text-sm font-semibold text-foreground mb-3">Body Language</p>
                <div className="flex items-end gap-2 mb-2">
                  <p className="text-3xl font-bold text-primary sm:text-4xl">{bodyLanguage.consistentPercentage}%</p>
                  <p className="text-sm text-muted-foreground mb-1">consistent</p>
                </div>
                <div className="w-full bg-muted rounded-full h-3 mb-2">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${bodyLanguage.consistentPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {bodyLanguage.consistentCount} consistent / {bodyLanguage.inconsistentCount} inconsistent
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Rebound Control */}
      {reboundControl && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Rebound Control</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Quality</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-primary sm:text-4xl">{reboundControl.qualityGood}%</p>
                <p className="text-sm text-muted-foreground mb-1">good</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${reboundControl.qualityGood}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {reboundControl.goodCount} good / {reboundControl.totalQuality} total
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Consistency</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-accent sm:text-4xl">{reboundControl.consistencyPercentage}%</p>
                <p className="text-sm text-muted-foreground mb-1">consistent</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-accent h-3 rounded-full transition-all"
                  style={{ width: `${reboundControl.consistencyPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {reboundControl.consistentCount} consistent / {reboundControl.totalConsistency} total
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Freezing Puck */}
      {freezingPuck && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Freezing Puck</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Quality</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-primary sm:text-4xl">{freezingPuck.qualityGood}%</p>
                <p className="text-sm text-muted-foreground mb-1">good</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${freezingPuck.qualityGood}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {freezingPuck.goodCount} good / {freezingPuck.totalQuality} total
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Consistency</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-accent sm:text-4xl">{freezingPuck.consistencyPercentage}%</p>
                <p className="text-sm text-muted-foreground mb-1">consistent</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-accent h-3 rounded-full transition-all"
                  style={{ width: `${freezingPuck.consistencyPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {freezingPuck.consistentCount} consistent / {freezingPuck.totalConsistency} total
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Team Play */}
      {teamPlayStats && (
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-foreground mb-4 sm:text-xl">Team Play (Period 3)</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Setting Up Defense</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-primary sm:text-4xl">{teamPlayStats.defensePercentage}%</p>
                <p className="text-sm text-muted-foreground mb-1">good</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${teamPlayStats.defensePercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {teamPlayStats.defenseGoodCount} good / {teamPlayStats.defenseImprovingCount} improving / {teamPlayStats.defensePoorCount} poor
              </p>
            </div>
            <div className="bg-secondary/40 border border-border rounded-lg p-5">
              <p className="text-sm font-semibold text-foreground mb-3">Setting Up Forwards</p>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-bold text-foreground sm:text-4xl">{teamPlayStats.forwardsPercentage}%</p>
                <p className="text-sm text-muted-foreground mb-1">good</p>
              </div>
              <div className="w-full bg-muted rounded-full h-3 mb-2">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${teamPlayStats.forwardsPercentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {teamPlayStats.forwardsGoodCount} good / {teamPlayStats.forwardsImprovingCount} improving / {teamPlayStats.forwardsPoorCount} poor
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

import type { OverallStats } from '@/types';
import type { Goal, GoalType } from '@/types/goals';

/**
 * Goal types that count up from the day the goal is set. "Complete 5 skills" means five
 * more than you had, not five in total since you signed up.
 */
const COUNTS_FROM_START: ReadonlySet<GoalType> = new Set<GoalType>([
  'skill_completion',
  'time_spent',
  'sport_completion',
]);

function finite(n: number | undefined): number {
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

/**
 * Learning time is tracked in seconds. The goal's unit is free text; anything that starts
 * with "min" is measured in minutes, everything else (the default is "hours") in hours.
 */
function secondsToGoalUnit(seconds: number, unit: string): number {
  if (/^min/i.test(unit.trim())) return Math.round(seconds / 60);
  return Math.round((seconds / 3600) * 10) / 10;
}

/** The goalie's current figure for the thing this goal measures. */
export function readGoalStat(type: GoalType, stats: OverallStats, unit: string): number {
  switch (type) {
    case 'skill_completion':
      return finite(stats.skillsCompleted);
    case 'sport_completion':
      return finite(stats.sportsCompleted);
    case 'quiz_score':
      return Math.round(finite(stats.averageQuizScore));
    case 'streak':
      return finite(stats.currentStreak);
    case 'time_spent':
      return secondsToGoalUnit(finite(stats.totalTimeSpent), unit);
  }
}

/** The running total to remember when a goal is created. 0 for goals that are not cumulative. */
export function goalBaseline(type: GoalType, stats: OverallStats, unit: string): number {
  return COUNTS_FROM_START.has(type) ? readGoalStat(type, stats, unit) : 0;
}

/**
 * Where a goal stands right now. A completed goal keeps the value it finished on. Without
 * stats (not loaded yet) an open goal falls back to what was stored.
 */
export function goalProgress(goal: Goal, stats: OverallStats | null): number {
  if (goal.isCompleted || !stats) return goal.currentValue;
  const current = readGoalStat(goal.type, stats, goal.unit);
  if (!COUNTS_FROM_START.has(goal.type)) return current;
  return Math.max(0, Math.round((current - goal.baselineValue) * 10) / 10);
}

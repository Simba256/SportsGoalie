import { describe, it, expect } from 'vitest';
import { goalBaseline, goalProgress, readGoalStat } from '@/lib/goals/progress';
import type { OverallStats } from '@/types';
import type { Goal } from '@/types/goals';

function makeStats(overrides: Partial<OverallStats> = {}): OverallStats {
  return {
    totalTimeSpent: 0,
    skillsCompleted: 0,
    sportsCompleted: 0,
    quizzesCompleted: 0,
    averageQuizScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    level: 1,
    experiencePoints: 0,
    ...overrides,
  };
}

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: 'goal-1',
    title: 'Test goal',
    description: 'A goal for testing',
    type: 'skill_completion',
    targetValue: 5,
    currentValue: 0,
    unit: 'skills',
    priority: 'medium',
    isCompleted: false,
    createdAt: new Date('2026-10-01T12:00:00Z'),
    baselineValue: 0,
    ...overrides,
  };
}

describe('readGoalStat', () => {
  it('reads each goal type from the matching stat', () => {
    const stats = makeStats({ skillsCompleted: 7, sportsCompleted: 2, averageQuizScore: 82.6, currentStreak: 4 });
    expect(readGoalStat('skill_completion', stats, 'skills')).toBe(7);
    expect(readGoalStat('sport_completion', stats, 'sports')).toBe(2);
    expect(readGoalStat('quiz_score', stats, '%')).toBe(83);
    expect(readGoalStat('streak', stats, 'days')).toBe(4);
  });

  it('converts learning time from seconds to hours to one decimal place', () => {
    expect(readGoalStat('time_spent', makeStats({ totalTimeSpent: 5400 }), 'hours')).toBe(1.5);
    expect(readGoalStat('time_spent', makeStats({ totalTimeSpent: 3600 }), 'hours')).toBe(1);
    expect(readGoalStat('time_spent', makeStats({ totalTimeSpent: 0 }), 'hours')).toBe(0);
  });

  it('converts learning time to minutes when the goal unit is minutes', () => {
    const stats = makeStats({ totalTimeSpent: 5400 });
    expect(readGoalStat('time_spent', stats, 'minutes')).toBe(90);
    expect(readGoalStat('time_spent', stats, ' Min ')).toBe(90);
  });

  it('treats missing or non-numeric stats as zero', () => {
    const broken = makeStats({
      skillsCompleted: Number.NaN,
      totalTimeSpent: undefined as unknown as number,
      currentStreak: Number.POSITIVE_INFINITY,
    });
    expect(readGoalStat('skill_completion', broken, 'skills')).toBe(0);
    expect(readGoalStat('time_spent', broken, 'hours')).toBe(0);
    expect(readGoalStat('streak', broken, 'days')).toBe(0);
  });
});

describe('goalBaseline', () => {
  it('remembers the running total for goals that count up from the day they are set', () => {
    const stats = makeStats({ skillsCompleted: 6, sportsCompleted: 1, totalTimeSpent: 7200 });
    expect(goalBaseline('skill_completion', stats, 'skills')).toBe(6);
    expect(goalBaseline('sport_completion', stats, 'sports')).toBe(1);
    expect(goalBaseline('time_spent', stats, 'hours')).toBe(2);
  });

  it('is 0 for goals that measure the current level rather than a running total', () => {
    const stats = makeStats({ averageQuizScore: 90, currentStreak: 9 });
    expect(goalBaseline('quiz_score', stats, '%')).toBe(0);
    expect(goalBaseline('streak', stats, 'days')).toBe(0);
  });
});

describe('goalProgress', () => {
  it('counts only what has been done since a cumulative goal was set', () => {
    const goal = makeGoal({ type: 'skill_completion', baselineValue: 6 });
    expect(goalProgress(goal, makeStats({ skillsCompleted: 6 }))).toBe(0);
    expect(goalProgress(goal, makeStats({ skillsCompleted: 9 }))).toBe(3);
  });

  it('never goes below zero if the running total has dropped since the goal was set', () => {
    const goal = makeGoal({ type: 'skill_completion', baselineValue: 6 });
    expect(goalProgress(goal, makeStats({ skillsCompleted: 4 }))).toBe(0);
  });

  it('tracks learning time since the goal was set, in the goal unit', () => {
    const goal = makeGoal({ type: 'time_spent', unit: 'hours', targetValue: 3, baselineValue: 1 });
    expect(goalProgress(goal, makeStats({ totalTimeSpent: 3 * 3600 }))).toBe(2);
    expect(goalProgress(goal, makeStats({ totalTimeSpent: 5400 }))).toBe(0.5);
  });

  it('shows the current level for quiz-score and streak goals', () => {
    const quiz = makeGoal({ type: 'quiz_score', unit: '%', targetValue: 80 });
    const streak = makeGoal({ type: 'streak', unit: 'days', targetValue: 7 });
    const stats = makeStats({ averageQuizScore: 74, currentStreak: 3 });
    expect(goalProgress(quiz, stats)).toBe(74);
    expect(goalProgress(streak, stats)).toBe(3);
  });

  it('lets a completed goal keep the value it finished on', () => {
    const goal = makeGoal({ isCompleted: true, currentValue: 5, targetValue: 5, baselineValue: 0 });
    expect(goalProgress(goal, makeStats({ skillsCompleted: 1 }))).toBe(5);
  });

  it('falls back to the stored value while stats have not loaded', () => {
    const goal = makeGoal({ currentValue: 2, baselineValue: 6 });
    expect(goalProgress(goal, null)).toBe(2);
  });
});

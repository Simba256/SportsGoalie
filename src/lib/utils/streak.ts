/**
 * Consecutive-day streaks over a set of activity dates.
 *
 * The charting hub and the pillar Progress Board both show a check-in streak and
 * must agree, so they share this one rule: days are local calendar days, several
 * entries on one day count once, and a streak stays alive until a whole day has
 * been missed — so a goalie who last charted yesterday still has a current streak
 * today rather than losing it before they have had the chance to chart.
 */

export interface ActivityStreak {
  currentStreak: number;
  longestStreak: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole-day index for a local calendar day; consecutive days differ by exactly 1 across DST. */
function dayIndex(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS);
}

export function calculateActivityStreak(dates: Date[], now: Date = new Date()): ActivityStreak {
  const days = Array.from(new Set(dates.map(dayIndex))).sort((a, b) => b - a);
  if (days.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i - 1] - days[i] === 1 ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
  }

  // The newest run is the current streak only if it reaches today or yesterday.
  const today = dayIndex(now);
  if (days[0] < today - 1) return { currentStreak: 0, longestStreak };

  let currentStreak = 1;
  while (currentStreak < days.length && days[currentStreak - 1] - days[currentStreak] === 1) {
    currentStreak++;
  }
  return { currentStreak, longestStreak };
}

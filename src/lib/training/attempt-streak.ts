import { calculateActivityStreak, type ActivityStreak } from '@/lib/utils/streak';

type StampLike = { toDate?: () => Date } | Date | string | number | null | undefined;

interface DatedAttempt {
  completedAt?: StampLike;
  submittedAt?: StampLike;
}

function toValidDate(value: StampLike): Date | null {
  if (value === null || value === undefined) return null;

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'object') {
    if (typeof value.toDate !== 'function') return null;
    date = value.toDate();
  } else {
    date = new Date(value);
  }

  return Number.isNaN(date.getTime()) || date.getTime() <= 0 ? null : date;
}

/**
 * The day a finished take counts for.
 *
 * Finishing a take stamps `completedAt` and `status: 'submitted'`, and never
 * `submittedAt`. The dashboard streak used to read `submittedAt` alone, found no date
 * on any take, and showed 0d however many had been finished (item 9 of Michael's
 * 4 Oct run). `submittedAt` stays as a fallback for any older record that has only that.
 */
export function finishedTakeDate(attempt: DatedAttempt): Date | null {
  return toValidDate(attempt.completedAt) ?? toValidDate(attempt.submittedAt);
}

/**
 * Learning streak from a goalie's finished takes: consecutive local days, several takes
 * on one day count once, alive until a whole day has been missed. Uses the same rule as
 * the charting streak so the screens cannot disagree.
 */
export function takeStreak(attempts: DatedAttempt[], now: Date = new Date()): ActivityStreak {
  const dates = attempts
    .map(finishedTakeDate)
    .filter((date): date is Date => date !== null);
  return calculateActivityStreak(dates, now);
}

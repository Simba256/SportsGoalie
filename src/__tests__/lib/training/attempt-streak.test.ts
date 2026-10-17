import { describe, it, expect } from 'vitest';
import { finishedTakeDate, takeStreak } from '@/lib/training/attempt-streak';

// Monday 12 Oct 2026, mid-morning local time.
const now = new Date(2026, 9, 12, 10, 0, 0);
const daysAgo = (n: number, hour = 18) => new Date(2026, 9, 12 - n, hour, 30, 0);
const stamp = (date: Date) => ({ toDate: () => date });

describe('takeStreak', () => {
  it('counts a finished take that only has completedAt (the 0d bug)', () => {
    expect(takeStreak([{ completedAt: stamp(daysAgo(0, 8)) }], now)).toEqual({
      currentStreak: 1,
      longestStreak: 1,
    });
  });

  it('builds a streak across consecutive days', () => {
    const attempts = [0, 1, 2, 3].map((n) => ({ completedAt: stamp(daysAgo(n)) }));
    expect(takeStreak(attempts, now).currentStreak).toBe(4);
  });

  it('counts several takes on one day once, and does not let them break the run', () => {
    const attempts = [
      { completedAt: stamp(daysAgo(0, 9)) },
      { completedAt: stamp(daysAgo(0, 7)) },
      { completedAt: stamp(daysAgo(1, 20)) },
      { completedAt: stamp(daysAgo(1, 8)) },
    ];
    expect(takeStreak(attempts, now).currentStreak).toBe(2);
  });

  it('keeps the current run when an older run sits behind a gap', () => {
    const attempts = [0, 1, 5].map((n) => ({ completedAt: stamp(daysAgo(n)) }));
    expect(takeStreak(attempts, now)).toEqual({ currentStreak: 2, longestStreak: 2 });
  });

  it('is still alive when the last take was yesterday', () => {
    const attempts = [1, 2].map((n) => ({ completedAt: stamp(daysAgo(n)) }));
    expect(takeStreak(attempts, now).currentStreak).toBe(2);
  });

  it('is 0 once a whole day has been missed, but keeps the longest run', () => {
    const attempts = [2, 3, 4].map((n) => ({ completedAt: stamp(daysAgo(n)) }));
    expect(takeStreak(attempts, now)).toEqual({ currentStreak: 0, longestStreak: 3 });
  });

  it('is 0 with no finished takes', () => {
    expect(takeStreak([], now)).toEqual({ currentStreak: 0, longestStreak: 0 });
  });

  it('skips takes with no usable date instead of throwing', () => {
    const attempts = [{}, { completedAt: null }, { completedAt: 'not a date' }, { completedAt: stamp(daysAgo(0)) }];
    expect(takeStreak(attempts, now).currentStreak).toBe(1);
  });
});

describe('finishedTakeDate', () => {
  it('prefers completedAt', () => {
    const completed = daysAgo(0);
    const submitted = daysAgo(3);
    expect(finishedTakeDate({ completedAt: stamp(completed), submittedAt: stamp(submitted) })).toEqual(completed);
  });

  it('falls back to submittedAt on a record that only has that', () => {
    const submitted = daysAgo(1);
    expect(finishedTakeDate({ submittedAt: stamp(submitted) })).toEqual(submitted);
  });

  it('accepts plain Dates, ISO strings and epoch milliseconds', () => {
    const when = daysAgo(0);
    expect(finishedTakeDate({ completedAt: when })).toEqual(when);
    expect(finishedTakeDate({ completedAt: when.toISOString() })).toEqual(when);
    expect(finishedTakeDate({ completedAt: when.getTime() })).toEqual(when);
  });

  it('is null when there is no date', () => {
    expect(finishedTakeDate({})).toBeNull();
  });
});

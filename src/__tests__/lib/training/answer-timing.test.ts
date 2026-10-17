import { describe, it, expect } from 'vitest';
import { secondsToAnswer } from '@/lib/training/answer-timing';

describe('secondsToAnswer', () => {
  it('measures whole seconds from the question appearing to the answer', () => {
    expect(secondsToAnswer(1_000_000, 1_012_000)).toBe(12);
  });

  it('rounds to the nearest second', () => {
    expect(secondsToAnswer(0, 4_400)).toBe(4);
    expect(secondsToAnswer(0, 4_600)).toBe(5);
  });

  it('is 0 when the question was never timed, so it reads as "not measured"', () => {
    expect(secondsToAnswer(null, 5_000)).toBe(0);
    expect(secondsToAnswer(Number.NaN, 5_000)).toBe(0);
  });

  it('is never negative if the clock reads backwards', () => {
    expect(secondsToAnswer(10_000, 4_000)).toBe(0);
  });
});

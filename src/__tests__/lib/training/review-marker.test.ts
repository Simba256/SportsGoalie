import { describe, it, expect } from 'vitest';
import { reviewMarker } from '@/lib/training/review-marker';

describe('reviewMarker', () => {
  it('marks a right answer as right', () => {
    expect(reviewMarker({ isCorrect: true })).toBe('right');
  });

  it('marks a miss as look again, not as a failure', () => {
    expect(reviewMarker({ isCorrect: false })).toBe('look-again');
  });

  it('treats a missing correctness flag as something to look at again', () => {
    expect(reviewMarker({})).toBe('look-again');
  });

  it('never marks a reflective answer as a miss, whatever isCorrect holds', () => {
    expect(reviewMarker({ reflective: true, isCorrect: false })).toBe('reflective');
  });

  it('takes reflective from the question when the answer lacks the flag', () => {
    expect(reviewMarker({ isCorrect: false }, { reflective: true })).toBe('reflective');
  });
});

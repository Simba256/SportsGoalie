import { describe, it, expect } from 'vitest';
import {
  DEFAULT_QUESTION_SPACING,
  clampQuestionSpacing,
  questionsTooClose,
} from '@/lib/quiz/question-spacing';

describe('questionsTooClose', () => {
  it('starts with no gap beyond the second the builder works in', () => {
    expect(DEFAULT_QUESTION_SPACING).toBe(1);
  });

  it('lets a question sit one second from another by default', () => {
    expect(questionsTooClose(11, [10], DEFAULT_QUESTION_SPACING)).toBe(false);
    expect(questionsTooClose(9, [10], DEFAULT_QUESTION_SPACING)).toBe(false);
  });

  it('lets a question sit two seconds from another by default', () => {
    expect(questionsTooClose(12, [10], DEFAULT_QUESTION_SPACING)).toBe(false);
  });

  it('no longer holds a question back for being inside five seconds', () => {
    expect(questionsTooClose(13, [10, 20], DEFAULT_QUESTION_SPACING)).toBe(false);
  });

  it('still refuses a second question in the same second, which the player would skip', () => {
    expect(questionsTooClose(10, [10], DEFAULT_QUESTION_SPACING)).toBe(true);
    expect(questionsTooClose(10, [4, 10, 30], DEFAULT_QUESTION_SPACING)).toBe(true);
  });

  it('still refuses the same second when the gap box has been taken down to zero', () => {
    expect(questionsTooClose(10, [10], 0)).toBe(true);
    expect(questionsTooClose(11, [10], 0)).toBe(false);
  });

  it('keeps a wider gap when the coach asks for one', () => {
    expect(questionsTooClose(12, [10], 3)).toBe(true);
    expect(questionsTooClose(13, [10], 3)).toBe(false);
    expect(questionsTooClose(7, [10], 3)).toBe(false);
  });

  it('says nothing is too close on an empty list', () => {
    expect(questionsTooClose(10, [], DEFAULT_QUESTION_SPACING)).toBe(false);
  });
});

describe('clampQuestionSpacing', () => {
  it('keeps a sensible number as it is', () => {
    expect(clampQuestionSpacing(5)).toBe(5);
    expect(clampQuestionSpacing(120)).toBe(120);
  });

  it('never goes below the one second the builder can place', () => {
    expect(clampQuestionSpacing(0)).toBe(1);
    expect(clampQuestionSpacing(-4)).toBe(1);
  });

  it('caps a very large number', () => {
    expect(clampQuestionSpacing(900)).toBe(120);
  });

  it('falls back to the default for an empty or unreadable box', () => {
    expect(clampQuestionSpacing(Number.NaN)).toBe(DEFAULT_QUESTION_SPACING);
  });
});

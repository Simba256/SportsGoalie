import { describe, it, expect } from 'vitest';
import {
  describeVisibility,
  isQuizLive,
  quizMissing,
  visibilityFlags,
} from '@/lib/training/quiz-visibility';

const complete = {
  title: 'Angles and depth',
  sportId: 'pillar-1',
  skillId: 'skill-1',
  videoUrl: 'https://example.com/video.mp4',
  questions: [{ id: 'q1' }],
};

describe('isQuizLive', () => {
  it('needs both flags, the test every goalie page applies', () => {
    expect(isQuizLive({ isActive: true, isPublished: true })).toBe(true);
    expect(isQuizLive({ isActive: true, isPublished: false })).toBe(false);
    expect(isQuizLive({ isActive: false, isPublished: true })).toBe(false);
    expect(isQuizLive({})).toBe(false);
  });
});

describe('visibilityFlags', () => {
  it('writes both flags from the one switch', () => {
    expect(visibilityFlags(true)).toEqual({ isActive: true, isPublished: true });
    expect(visibilityFlags(false)).toEqual({ isActive: false, isPublished: false });
  });

  it('turning a half-switched quiz on makes it live (the Activate bug)', () => {
    const draft = { ...complete, isActive: false, isPublished: false };
    expect(isQuizLive({ ...draft, ...visibilityFlags(true) })).toBe(true);
  });
});

describe('quizMissing', () => {
  it('is empty for a complete quiz', () => {
    expect(quizMissing(complete)).toEqual([]);
  });

  it('names everything that is absent, in plain words', () => {
    expect(quizMissing({ title: '  ', questions: [] })).toEqual([
      'a title',
      'a pillar',
      'a skill',
      'a video',
      'at least one question',
    ]);
  });
});

describe('describeVisibility', () => {
  it('says goalies can see a live quiz', () => {
    const result = describeVisibility({ ...complete, isActive: true, isPublished: true });
    expect(result.state).toBe('live');
    expect(result.line).toMatch(/can see and take/);
  });

  it('says a complete quiz is hidden when it is switched off', () => {
    const result = describeVisibility({ ...complete, isActive: false, isPublished: false });
    expect(result.state).toBe('hidden');
    expect(result.line).toMatch(/Hidden from goalies/);
  });

  it('treats a half-switched quiz as hidden, not live', () => {
    const result = describeVisibility({ ...complete, isActive: true, isPublished: false });
    expect(result.state).toBe('hidden');
  });

  it('says what is missing instead of claiming it is visible', () => {
    const result = describeVisibility(
      { ...complete, videoUrl: '', questions: [], isActive: true, isPublished: true },
      true,
    );
    expect(result.state).toBe('blocked');
    expect(result.line).toBe('Not visible to goalies yet. It still needs a video and at least one question.');
  });

  it('follows the switch on the form rather than the stored flags when told to', () => {
    const stored = { ...complete, isActive: false, isPublished: false };
    expect(describeVisibility(stored, true).state).toBe('live');
  });
});

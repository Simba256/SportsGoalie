import { describe, it, expect } from 'vitest';

import { VOICE_MOMENTS, hasHadMoment, isMomentForUser } from '@/lib/audio/moments';
import { COACH_AUDIO_CATALOGUE } from '@/types/coach-audio';

describe('VOICE_MOMENTS', () => {
  it("is Michael's order: V-A-01, 02, 03 at first login, then V-A-04, 05 at first charting", () => {
    expect(VOICE_MOMENTS.firstLogin.clips).toEqual(['V-A-01', 'V-A-02', 'V-A-03']);
    expect(VOICE_MOMENTS.chartingFirstOpen.clips).toEqual(['V-A-04', 'V-A-05']);
    expect(VOICE_MOMENTS.mindVaultFirstVisit.clips).toEqual(['V-A-14']);
  });

  it('only names clips that are in the catalogue', () => {
    const known = new Set(COACH_AUDIO_CATALOGUE.map(entry => entry.id));
    for (const moment of Object.values(VOICE_MOMENTS)) {
      for (const id of moment.clips) expect(known.has(id), id).toBe(true);
    }
  });
});

describe('hasHadMoment', () => {
  it('is false for no user, for no record, and for a record without that key', () => {
    expect(hasHadMoment(null, 'firstLogin')).toBe(false);
    expect(hasHadMoment({}, 'firstLogin')).toBe(false);
    expect(hasHadMoment({ voiceMoments: {} }, 'firstLogin')).toBe(false);
  });

  it('is true once that key is stamped, and only for that key', () => {
    const user = { voiceMoments: { firstLogin: new Date() } } as never;
    expect(hasHadMoment(user, 'firstLogin')).toBe(true);
    expect(hasHadMoment(user, 'chartingFirstOpen')).toBe(false);
  });
});

describe('isMomentForUser', () => {
  it('speaks to goalies only', () => {
    for (const role of ['coach', 'parent', 'admin'] as const) {
      expect(isMomentForUser('firstLogin', { role }), role).toBe(false);
      expect(isMomentForUser('chartingFirstOpen', { role }), role).toBe(false);
    }
    expect(isMomentForUser('firstLogin', null)).toBe(false);
  });

  it('gives the welcome to a goalie who has not finished the baseline profile', () => {
    expect(isMomentForUser('firstLogin', { role: 'student' })).toBe(true);
    expect(isMomentForUser('firstLogin', { role: 'student', onboardingCompleted: false })).toBe(true);
  });

  it('does not give the welcome to a goalie who has finished it', () => {
    expect(isMomentForUser('firstLogin', { role: 'student', onboardingCompleted: true })).toBe(false);
  });

  it('gives the charting lines to a goalie whether or not the baseline is done', () => {
    expect(isMomentForUser('chartingFirstOpen', { role: 'student', onboardingCompleted: true })).toBe(true);
    expect(isMomentForUser('chartingFirstOpen', { role: 'student', onboardingCompleted: false })).toBe(true);
  });
});

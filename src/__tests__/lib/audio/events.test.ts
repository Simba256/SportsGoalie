import { describe, it, expect } from 'vitest';

import {
  EVENT_COOLDOWN_MS,
  EVENT_LINES,
  NEW_ACCOUNT_DAYS,
  eventMaySpeak,
  isNewAccount,
  type VoiceEventKey,
} from '@/lib/audio/events';
import { COACH_AUDIO_CATALOGUE, getCoachAudioEntry } from '@/types/coach-audio';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-10-19T12:00:00Z').getTime();
const daysAgo = (days: number) => new Date(NOW - days * DAY);

const goalie = { role: 'student', createdAt: daysAgo(1) } as never;

describe('EVENT_LINES', () => {
  it('names the six short lines Michael passed for testing on 17 Oct', () => {
    expect(EVENT_LINES).toEqual({
      chartSaved: 'V-A-27',
      answerSaved: 'V-A-28',
      vaultSaved: 'V-A-29',
      longFormOpen: 'V-A-30',
      emptyScreen: 'V-A-35',
      nextStep: 'V-A-37',
    });
  });

  it('only names clips that are in the catalogue and are not parked', () => {
    const known = new Set(COACH_AUDIO_CATALOGUE.map(entry => entry.id));
    for (const id of Object.values(EVENT_LINES)) {
      expect(known.has(id), id).toBe(true);
      expect(getCoachAudioEntry(id)?.parked, id).toBeUndefined();
    }
  });
});

describe('isNewAccount', () => {
  it('is true inside the window and false outside it', () => {
    expect(isNewAccount({ createdAt: daysAgo(0) }, NOW)).toBe(true);
    expect(isNewAccount({ createdAt: daysAgo(NEW_ACCOUNT_DAYS - 1) }, NOW)).toBe(true);
    expect(isNewAccount({ createdAt: daysAgo(NEW_ACCOUNT_DAYS + 1) }, NOW)).toBe(false);
  });

  it('reads a Firestore timestamp as well as a date', () => {
    expect(isNewAccount({ createdAt: { toMillis: () => NOW - DAY } }, NOW)).toBe(true);
    expect(isNewAccount({ createdAt: { seconds: (NOW - 90 * DAY) / 1000 } }, NOW)).toBe(false);
  });

  it('is false when the age is not known, rather than guessing day one', () => {
    expect(isNewAccount(null, NOW)).toBe(false);
    expect(isNewAccount({}, NOW)).toBe(false);
    expect(isNewAccount({ createdAt: 'yesterday' }, NOW)).toBe(false);
  });
});

describe('eventMaySpeak', () => {
  it('speaks to a goalie and to no one else', () => {
    expect(eventMaySpeak('chartSaved', goalie, undefined, NOW)).toBe(true);
    for (const role of ['coach', 'parent', 'admin']) {
      expect(eventMaySpeak('chartSaved', { role } as never, undefined, NOW), role).toBe(false);
    }
    expect(eventMaySpeak('chartSaved', null, undefined, NOW)).toBe(false);
  });

  it('keeps an event quiet for the cooldown after it has spoken, then lets it speak again', () => {
    expect(eventMaySpeak('vaultSaved', goalie, NOW - 60_000, NOW)).toBe(false);
    expect(eventMaySpeak('vaultSaved', goalie, NOW - EVENT_COOLDOWN_MS + 1, NOW)).toBe(false);
    expect(eventMaySpeak('vaultSaved', goalie, NOW - EVENT_COOLDOWN_MS, NOW)).toBe(true);
  });

  it('keeps "day one" for new accounts only', () => {
    const old = { role: 'student', createdAt: daysAgo(90) } as never;
    expect(eventMaySpeak('emptyScreen', goalie, undefined, NOW)).toBe(true);
    expect(eventMaySpeak('emptyScreen', old, undefined, NOW)).toBe(false);
  });

  it('does not hold the other events to the account age', () => {
    const old = { role: 'student', createdAt: daysAgo(90) } as never;
    const others = (Object.keys(EVENT_LINES) as VoiceEventKey[]).filter(key => key !== 'emptyScreen');
    for (const key of others) expect(eventMaySpeak(key, old, undefined, NOW), key).toBe(true);
  });
});

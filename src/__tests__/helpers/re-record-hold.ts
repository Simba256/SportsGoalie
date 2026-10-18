import { COACH_AUDIO_CATALOGUE } from '@/types/coach-audio';

/**
 * Puts a re-record hold on catalogue entries for the length of a test.
 *
 * Use ids the shipped catalogue does not already hold (the 17 October holds are
 * V-A-13, 17, 19, 32 and V-B-12), so the mechanism can be switched on here
 * without disturbing them. The entries are shared objects, so the hold is seen
 * by `isHeldForReRecord` and everything built on it. Returns the undo; call it
 * in `afterEach`.
 */
export function holdForReRecord(ids: string[], heldBefore: string): () => void {
  const held = COACH_AUDIO_CATALOGUE.filter(entry => ids.includes(entry.id));
  if (held.length !== ids.length) {
    throw new Error(`holdForReRecord: not every id is in the catalogue (${ids.join(', ')})`);
  }
  for (const entry of held) {
    if (entry.reRecord) {
      throw new Error(`holdForReRecord: ${entry.id} already carries a hold in the shipped catalogue`);
    }
    entry.reRecord = { reason: 'Held for re-recording (test).', heldBefore };
  }
  return () => {
    for (const entry of held) delete entry.reRecord;
  };
}

/**
 * Takes parked clips back out of the parked list for the length of a test, so a
 * placement that is switched off in the shipped catalogue can still be tested
 * for the day it is switched back on. Returns the undo; call it in `afterEach`.
 */
export function unpark(ids: string[]): () => void {
  const entries = COACH_AUDIO_CATALOGUE.filter(entry => ids.includes(entry.id));
  if (entries.length !== ids.length) {
    throw new Error(`unpark: not every id is in the catalogue (${ids.join(', ')})`);
  }
  const was = entries.map(entry => entry.parked);
  for (const entry of entries) delete entry.parked;
  return () => {
    entries.forEach((entry, i) => {
      entry.parked = was[i];
    });
  };
}

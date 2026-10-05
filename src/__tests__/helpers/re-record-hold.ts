import { COACH_AUDIO_CATALOGUE } from '@/types/coach-audio';

/**
 * Puts a re-record hold on catalogue entries for the length of a test.
 *
 * No entry in the shipped catalogue carries a hold today, so the mechanism has
 * to be switched on here to be tested at all. The entries are shared objects,
 * so the hold is seen by `isHeldForReRecord` and everything built on it.
 * Returns the undo; call it in `afterEach`.
 */
export function holdForReRecord(ids: string[], heldBefore: string): () => void {
  const held = COACH_AUDIO_CATALOGUE.filter(entry => ids.includes(entry.id));
  if (held.length !== ids.length) {
    throw new Error(`holdForReRecord: not every id is in the catalogue (${ids.join(', ')})`);
  }
  for (const entry of held) {
    entry.reRecord = { reason: 'Held for re-recording (test).', heldBefore };
  }
  return () => {
    for (const entry of held) delete entry.reRecord;
  };
}

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { createConnection } from 'net';
import { join } from 'path';

// The shared test setup mocks the Firebase SDK; these tests need the real one to reach the emulator.
vi.unmock('firebase/app');
vi.unmock('firebase/firestore');

/**
 * Rules for `achievements` (the definitions) and `user_achievements` (a goalie's unlocks).
 * Needs the Firestore emulator (port 8080, see firebase.json):
 *   firebase emulators:exec --only firestore "npx vitest run src/__tests__/lib/security/achievements-rules.test.ts"
 * Skipped when nothing is listening there, so the normal test run is unaffected. The shared test
 * setup replaces process.env, so FIRESTORE_EMULATOR_HOST cannot be used to detect it.
 */
const EMULATOR_HOST = '127.0.0.1';
const EMULATOR_PORT = 8080;

function isEmulatorListening(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: EMULATOR_HOST, port: EMULATOR_PORT });
    socket.setTimeout(1000);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.once('error', () => { socket.destroy(); resolve(false); });
  });
}

const emulatorRunning = await isEmulatorListening();

function definition(isActive = true) {
  return {
    name: 'Week Warrior',
    description: 'Keep a 7-day learning streak.',
    type: 'streak',
    criteria: { condition: 'daily_streak', value: 7 },
    points: 100,
    isActive,
  };
}

/** The document the app writes when a goalie unlocks an achievement. */
function unlock(userId: string, achievementId: string) {
  return {
    id: `${userId}_${achievementId}`,
    userId,
    achievementId,
    progress: 100,
    isCompleted: true,
    isNotified: false,
  };
}

describe.skipIf(!emulatorRunning)('Firestore rules: achievements', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'sportscoach-achievements-test',
      firestore: {
        rules: readFileSync(join(process.cwd(), 'firestore.rules'), 'utf8'),
        host: EMULATOR_HOST,
        port: EMULATOR_PORT,
      },
    });
  });

  afterAll(async () => {
    await testEnv?.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'users', 'admin-1'), { role: 'admin', email: 'admin@example.com' });
      await setDoc(doc(db, 'achievements', 'week_warrior'), definition());
      await setDoc(doc(db, 'achievements', 'retired'), definition(false));
      await setDoc(doc(db, 'user_achievements', 'bob_week_warrior'), unlock('bob', 'week_warrior'));
    });
  });

  describe('achievement definitions', () => {
    it('lets a goalie read active definitions but not retired ones', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(getDoc(doc(db, 'achievements', 'week_warrior')));
      await assertFails(getDoc(doc(db, 'achievements', 'retired')));
    });

    it('lets a goalie list the active definitions with the query the page uses', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      const snapshot = await assertSucceeds(
        getDocs(query(collection(db, 'achievements'), where('isActive', '==', true)))
      );
      expect(snapshot.docs.map((d) => d.id)).toEqual(['week_warrior']);
    });

    it('does not let a goalie create or change a definition', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(db, 'achievements', 'free_points'), { ...definition(), points: 100000 }));
      await assertFails(updateDoc(doc(db, 'achievements', 'week_warrior'), { points: 100000 }));
    });
  });

  describe('unlocking', () => {
    it('lets a goalie record their own unlock of an active achievement', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(setDoc(doc(db, 'user_achievements', 'alice_week_warrior'), unlock('alice', 'week_warrior')));
    });

    it('lets a goalie record an unlock that carries the unlock time', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(
        setDoc(doc(db, 'user_achievements', 'alice_week_warrior'), { ...unlock('alice', 'week_warrior'), unlockedAt: new Date() })
      );
    });

    it("does not let a goalie unlock an achievement for someone else", async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(db, 'user_achievements', 'carol_week_warrior'), unlock('carol', 'week_warrior')));
    });

    it('does not let a signed-out visitor unlock anything', async () => {
      const db = testEnv.unauthenticatedContext().firestore();
      await assertFails(setDoc(doc(db, 'user_achievements', 'alice_week_warrior'), unlock('alice', 'week_warrior')));
    });

    it('requires the document id to be the goalie and achievement it records', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(db, 'user_achievements', 'anything-else'), unlock('alice', 'week_warrior')));
    });

    it('does not let a goalie unlock an achievement that does not exist or is retired', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(db, 'user_achievements', 'alice_made_up'), unlock('alice', 'made_up')));
      await assertFails(setDoc(doc(db, 'user_achievements', 'alice_retired'), unlock('alice', 'retired')));
    });

    it('only accepts a finished unlock', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      const ref = doc(db, 'user_achievements', 'alice_week_warrior');
      await assertFails(setDoc(ref, { ...unlock('alice', 'week_warrior'), isCompleted: false }));
      await assertFails(setDoc(ref, { ...unlock('alice', 'week_warrior'), progress: 40 }));
    });

    it('rejects extra fields', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(setDoc(doc(db, 'user_achievements', 'alice_week_warrior'), { ...unlock('alice', 'week_warrior'), bonusPoints: 9999 }));
    });

    it('does not let an unlock be recorded a second time', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      const ref = doc(db, 'user_achievements', 'alice_week_warrior');
      await assertSucceeds(setDoc(ref, unlock('alice', 'week_warrior')));
      await assertFails(setDoc(ref, unlock('alice', 'week_warrior')));
    });

    it('still lets an admin record an unlock for a goalie', async () => {
      const db = testEnv.authenticatedContext('admin-1').firestore();
      await assertSucceeds(setDoc(doc(db, 'user_achievements', 'carol_week_warrior'), unlock('carol', 'week_warrior')));
    });
  });

  describe('reading and changing unlocks', () => {
    it('lets a goalie read their own unlock and list their own', async () => {
      const db = testEnv.authenticatedContext('bob').firestore();
      await assertSucceeds(getDoc(doc(db, 'user_achievements', 'bob_week_warrior')));
      const snapshot = await assertSucceeds(
        getDocs(query(collection(db, 'user_achievements'), where('userId', '==', 'bob')))
      );
      expect(snapshot.docs.map((d) => d.id)).toEqual(['bob_week_warrior']);
    });

    it("does not let a goalie read someone else's unlocks", async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(getDoc(doc(db, 'user_achievements', 'bob_week_warrior')));
      await assertFails(getDocs(query(collection(db, 'user_achievements'), where('userId', '==', 'bob'))));
    });

    it('does not let a goalie change or remove an unlock', async () => {
      const db = testEnv.authenticatedContext('bob').firestore();
      await assertFails(updateDoc(doc(db, 'user_achievements', 'bob_week_warrior'), { progress: 0 }));
      await assertFails(deleteDoc(doc(db, 'user_achievements', 'bob_week_warrior')));
    });
  });
});

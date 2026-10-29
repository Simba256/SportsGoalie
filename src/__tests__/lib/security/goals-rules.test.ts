import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { createConnection } from 'net';
import { join } from 'path';

// The shared test setup mocks the Firebase SDK; these tests need the real one to reach the emulator.
vi.unmock('firebase/app');
vi.unmock('firebase/firestore');

/**
 * Rules for the `student_goals` collection. Needs the Firestore emulator (port 8080, see firebase.json):
 *   firebase emulators:exec --only firestore "npx vitest run src/__tests__/lib/security/goals-rules.test.ts"
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

function validGoal(studentId: string) {
  return {
    studentId,
    title: 'Complete 5 skills this month',
    description: 'Get through five more skills',
    type: 'skill_completion',
    targetValue: 5,
    currentValue: 0,
    unit: 'skills',
    priority: 'medium',
    isCompleted: false,
    baselineValue: 2,
  };
}

describe.skipIf(!emulatorRunning)('Firestore rules: student_goals', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'sportscoach-goals-test',
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
      await setDoc(doc(db, 'student_goals', 'goal-alice'), validGoal('alice'));
      await setDoc(doc(db, 'student_goals', 'goal-bob'), validGoal('bob'));
    });
  });

  it('lets a goalie list their own goals with the query the page uses', async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    const snapshot = await assertSucceeds(
      getDocs(query(collection(db, 'student_goals'), where('studentId', '==', 'alice')))
    );
    expect(snapshot.docs.map((d) => d.id)).toEqual(['goal-alice']);
  });

  it("does not let a goalie read someone else's goal or list their goals", async () => {
    const db = testEnv.authenticatedContext('alice').firestore();
    await assertFails(getDoc(doc(db, 'student_goals', 'goal-bob')));
    await assertFails(getDocs(query(collection(db, 'student_goals'), where('studentId', '==', 'bob'))));
  });

  it('does not let signed-out visitors read goals', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, 'student_goals', 'goal-alice')));
  });

  it('lets an admin read any goal', async () => {
    const db = testEnv.authenticatedContext('admin-1').firestore();
    await assertSucceeds(getDoc(doc(db, 'student_goals', 'goal-alice')));
  });

  describe('create', () => {
    it('lets a goalie create a goal for themselves', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(addDoc(collection(db, 'student_goals'), validGoal('alice')));
    });

    it('does not let a goalie create a goal for someone else', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(addDoc(collection(db, 'student_goals'), validGoal('bob')));
    });

    it('rejects a missing, empty or over-long title', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      const withoutTitle: Partial<ReturnType<typeof validGoal>> = validGoal('alice');
      delete withoutTitle.title;
      await assertFails(addDoc(collection(db, 'student_goals'), withoutTitle));
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), title: '' }));
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), title: 'x'.repeat(101) }));
    });

    it('rejects a target that is not a positive number', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), targetValue: 0 }));
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), targetValue: '5' }));
    });

    it('rejects an unknown goal type or priority', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), type: 'world_domination' }));
      await assertFails(addDoc(collection(db, 'student_goals'), { ...validGoal('alice'), priority: 'urgent' }));
    });
  });

  describe('update', () => {
    it('lets a goalie mark their own goal complete', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(updateDoc(doc(db, 'student_goals', 'goal-alice'), { isCompleted: true, currentValue: 5 }));
    });

    it("does not let a goalie change someone else's goal", async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(updateDoc(doc(db, 'student_goals', 'goal-bob'), { isCompleted: true }));
    });

    it('never lets the owner of a goal be changed', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(updateDoc(doc(db, 'student_goals', 'goal-alice'), { studentId: 'bob' }));
    });
  });

  describe('delete', () => {
    it('lets a goalie delete their own goal', async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertSucceeds(deleteDoc(doc(db, 'student_goals', 'goal-alice')));
    });

    it("does not let a goalie delete someone else's goal", async () => {
      const db = testEnv.authenticatedContext('alice').firestore();
      await assertFails(deleteDoc(doc(db, 'student_goals', 'goal-bob')));
    });
  });
});

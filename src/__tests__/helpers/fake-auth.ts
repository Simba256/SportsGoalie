import { useSyncExternalStore } from 'react';
import { vi } from 'vitest';

/**
 * A stand-in for the auth context and the user service, for tests of the
 * once-only voice moments. Tests mock `@/lib/auth/context` with `useAuth` and
 * `@/lib/database/services/user.service` with `markVoiceMoment` from here.
 *
 * `stored` plays the part of Firestore: `markVoiceMoment` writes to it, and
 * `refreshUser` reads it back into the signed-in user, as the real round trip
 * does.
 */

type FakeUser = {
  id: string;
  role: string;
  onboardingCompleted?: boolean;
  voiceMoments?: Record<string, unknown>;
};

let user: FakeUser | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

export const stored: Record<string, Record<string, unknown>> = {};

export const markVoiceMoment = vi.fn(async (userId: string, key: string) => {
  stored[userId] = { ...stored[userId], [key]: new Date() };
  return { success: true };
});

export const refreshUser = vi.fn(async () => {
  if (!user) return;
  user = { ...user, voiceMoments: { ...stored[user.id] } };
  emit();
});

/** Signs in `next`; any moments it already carries count as stored. */
export function signIn(next: FakeUser | null) {
  user = next;
  if (next?.voiceMoments) stored[next.id] = { ...next.voiceMoments };
  emit();
}

export function resetFakeAuth() {
  user = null;
  for (const key of Object.keys(stored)) delete stored[key];
  markVoiceMoment.mockClear();
  refreshUser.mockClear();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function useAuth() {
  const current = useSyncExternalStore(
    subscribe,
    () => user,
    () => null
  );
  return { user: current, loading: false, refreshUser };
}

/**
 * Coach Mike's once-only voice moments.
 *
 * Michael's placement doc (4 Oct 2026) splits the voice clips into those that
 * sit on a page behind a button and those that "fire on an event". The events
 * are here. Each moment is a list of clips and a key; once it has played, the
 * key is stamped on the goalie's account (`User.voiceMoments`) and it never
 * fires again, on any phone.
 *
 * A moment with more than one clip is all or nothing. The lines are one spoken
 * piece (V-A-02 begins "Coach Mike here:" because V-A-01 has just welcomed
 * them), so playing the ones that are on file and stamping the moment done
 * would lose the missing ones for good. Until every clip is uploaded the
 * moment simply waits.
 */

import type { User } from '@/types';

export const VOICE_MOMENTS = {
  /** First successful login, ever. V-A-01, then V-A-02, then V-A-03. */
  firstLogin: { clips: ['V-A-01', 'V-A-02', 'V-A-03'] },
  /** First time the goalie opens the charting screen. V-A-04, then V-A-05. */
  chartingFirstOpen: { clips: ['V-A-04', 'V-A-05'] },
  /** First visit to the Mind-Vault page, where V-A-14 shows as a button once. */
  mindVaultFirstVisit: { clips: ['V-A-14'] },
} as const;

export type VoiceMomentKey = keyof typeof VOICE_MOMENTS;

/** The moments that play by themselves, as opposed to showing a button once. */
export type SequenceMomentKey = 'firstLogin' | 'chartingFirstOpen';

/** Whether the moment has already happened on this account. */
export function hasHadMoment(user: Pick<User, 'voiceMoments'> | null | undefined, key: VoiceMomentKey): boolean {
  return Boolean(user?.voiceMoments?.[key]);
}

/**
 * Whether a sequence moment is addressed to this user at all. Both are spoken
 * to a goalie, so a coach, parent or admin signing in never triggers them. (The
 * parent and coach welcomes are separate clips with a place still to come.)
 *
 * The first-login welcome also waits on the baseline profile: a goalie who has
 * finished it has long since had their welcome, in the only form there was.
 */
export function isMomentForUser(
  key: SequenceMomentKey,
  user: Pick<User, 'role' | 'onboardingCompleted'> | null | undefined
): boolean {
  if (!user || user.role !== 'student') return false;
  if (key === 'firstLogin') return user.onboardingCompleted !== true;
  return true;
}

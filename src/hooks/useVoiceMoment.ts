'use client';

/**
 * The two ways a once-only Coach Mike moment reaches a goalie.
 *
 * `useVoiceMomentSequence` plays a run of clips by itself, the first time, and
 * stamps the account once the first line is audible.
 *
 * `useFirstVisit` is for a button that shows on the first visit to a page and
 * never again. The visit is stamped when the button is first shown, not when it
 * is pressed, so a goalie who ignores it has still had their visit.
 *
 * Neither stamps anything while a clip is missing: a moment that had nothing to
 * play must not use up the goalie's one chance.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/lib/auth/context';
import { useCoachAudio } from '@/lib/audio/context';
import {
  VOICE_MOMENTS,
  hasHadMoment,
  isMomentForUser,
  type SequenceMomentKey,
} from '@/lib/audio/moments';
import { userService } from '@/lib/database/services/user.service';

export function useVoiceMomentSequence(moment: SequenceMomentKey) {
  const { user, refreshUser } = useAuth();
  const { clips, isLoading, enabled, playingId, blockedId, playSequence } = useCoachAudio();

  const ids = VOICE_MOMENTS[moment].clips;
  const firstLine = ids[0];
  const userId = user?.id;

  const startedRef = useRef(false);
  const stampedRef = useRef(false);

  const everyLineOnFile = ids.every(id => Boolean(clips[id]));
  const due =
    isMomentForUser(moment, user) &&
    !hasHadMoment(user, moment) &&
    !isLoading &&
    enabled &&
    everyLineOnFile;

  // Start it once. The ref, not the stamp, stops a second start: the stamp is a
  // write that can fail, and a failed write must not turn into a replay.
  useEffect(() => {
    if (!due || startedRef.current) return;
    startedRef.current = true;
    playSequence([...ids]);
  }, [due, ids, playSequence]);

  // It has happened once the first line is audible. A refused play, which is
  // what an iPhone does without a tap, stamps nothing and is offered again.
  useEffect(() => {
    if (!userId || !startedRef.current || stampedRef.current || playingId !== firstLine) return;
    stampedRef.current = true;

    void userService.markVoiceMoment(userId, moment).then(result => {
      if (result.success) void refreshUser();
    });
  }, [userId, playingId, firstLine, moment, refreshUser]);

  const playNow = useCallback(() => playSequence([...ids]), [playSequence, ids]);

  return {
    /** The phone refused the automatic start, so the goalie needs to tap. */
    blocked: due && blockedId === firstLine,
    /** Starts the run again. Call it from a tap. */
    playNow,
  };
}

export function useFirstVisit(moment: 'mindVaultFirstVisit'): boolean {
  const { user, refreshUser } = useAuth();
  const { clips, isLoading } = useCoachAudio();

  const clipId = VOICE_MOMENTS[moment].clips[0];
  const userId = user?.id;
  const onFile = Boolean(clips[clipId]);
  const alreadyHad = hasHadMoment(user, moment);

  // Set once the stamp has been written, so the button stays for the rest of
  // this visit after the account says the visit has happened.
  const [stayingThisVisit, setStayingThisVisit] = useState(false);
  const stampedRef = useRef(false);

  const visible = Boolean(userId) && !isLoading && onFile && (!alreadyHad || stayingThisVisit);

  useEffect(() => {
    if (!visible || !userId || alreadyHad || stampedRef.current) return;
    stampedRef.current = true;

    void userService.markVoiceMoment(userId, moment).then(result => {
      if (!result.success) return;
      setStayingThisVisit(true);
      void refreshUser();
    });
  }, [visible, userId, alreadyHad, moment, refreshUser]);

  return visible;
}

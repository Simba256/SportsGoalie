'use client';

/**
 * Says one of the short event lines (V-A-27 to V-A-37) when something happens.
 *
 *   const say = useEventVoice();
 *   ...
 *   if (result.success) say('chartSaved');
 *
 * It does nothing, quietly, unless the viewer is a goalie, the event has not
 * just spoken, and nothing else is being said. See `eventMaySpeak`.
 *
 * "Has not just spoken" is counted per place. Steps that follow one another,
 * like the Pre-Game save and then the Periods save, are each a place of their
 * own and each get their line; saving the same step again is what is held back:
 *
 *   say('nextStep', 'periods');
 *
 * On an iPhone a line that no tap started is refused until the page has played
 * a clip from a tap once. That is left alone on purpose: waking the phone's
 * audio on every save would pause the goalie's music for a line that may not
 * even be on file.
 */

import { useCallback } from 'react';

import { useAuth } from '@/lib/auth/context';
import { useCoachAudio } from '@/lib/audio/context';
import { EVENT_LINES, eventMaySpeak, type VoiceEventKey } from '@/lib/audio/events';

/**
 * When each event last spoke in this tab, by event and place. Module-level so it
 * survives navigation from one step to the next.
 */
const lastSpokeAt = new Map<string, number>();

/** Forgets what has spoken. For tests. */
export function resetEventVoice(): void {
  lastSpokeAt.clear();
}

export function useEventVoice(): (event: VoiceEventKey, place?: string) => boolean {
  const { user } = useAuth();
  const { isLoading, playLine } = useCoachAudio();

  return useCallback(
    (event: VoiceEventKey, place?: string) => {
      const now = Date.now();
      const key = place ? `${event}:${place}` : event;
      if (isLoading || !eventMaySpeak(event, user, lastSpokeAt.get(key), now)) return false;

      const started = playLine(EVENT_LINES[event]);
      if (started) lastSpokeAt.set(key, now);
      return started;
    },
    [user, isLoading, playLine]
  );
}

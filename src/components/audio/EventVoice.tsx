'use client';

import { useEffect, useRef } from 'react';

import { useEventVoice } from '@/hooks/useEventVoice';
import { useAuth } from '@/lib/auth/context';
import { useCoachAudio } from '@/lib/audio/context';
import type { VoiceEventKey } from '@/lib/audio/events';

/**
 * Fires a short Coach Mike line when this is first shown, and renders nothing.
 * Mount it inside the part of a screen that is the event: the empty state, or
 * the first page of a long form.
 *
 * It waits for the clips and the account to load, then tries once. If the line
 * cannot speak at that moment (something else is playing, or it spoke a minute
 * ago) it is not retried for this visit.
 */
export function EventVoice({ event }: { event: VoiceEventKey }): null {
  const say = useEventVoice();
  const { loading: authLoading } = useAuth();
  const { isLoading } = useCoachAudio();
  const tried = useRef(false);

  useEffect(() => {
    if (authLoading || isLoading || tried.current) return;
    tried.current = true;
    say(event);
  }, [authLoading, isLoading, say, event]);

  return null;
}

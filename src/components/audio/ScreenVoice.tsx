'use client';

import React, { useEffect } from 'react';
import { CoachAudioButton } from '@/components/audio/CoachAudioButton';
import { useCoachAudio } from '@/lib/audio/context';

interface ScreenVoiceProps {
  clipId: string;
  label: string;
  className?: string;
}

/**
 * A Coach Mike voice line tied to a screen's lifetime: stops the clip when
 * the screen goes, so it does not run on over the next one. Hidden until the
 * take is uploaded, and while a take is held for re-recording, so no screen
 * offers audio it cannot play.
 */
export function ScreenVoice({ clipId, label, className }: ScreenVoiceProps): React.ReactElement {
  const { stopClip } = useCoachAudio();

  useEffect(() => () => stopClip(clipId), [clipId, stopClip]);

  return <CoachAudioButton clipId={clipId} label={label} whenMissing="hide" className={className} />;
}

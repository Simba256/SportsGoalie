'use client';

/**
 * The "Hear Coach Mike" button on a public page.
 *
 * Nine public pages used to draw their own copy of this button, and none of the
 * copies played anything. Michael's rule (17 October): a button stays hidden
 * until its gem is recorded.
 *
 * A button with no `clipId` has nothing to play, so it draws nothing. When a gem
 * is recorded, add its id from the Coach Audio list to the button's `clipId`;
 * it then appears once that clip is uploaded and stays hidden before that.
 */

import { CoachAudioButton } from '@/components/audio/CoachAudioButton';

interface GemVoiceButtonProps {
  /** The words on the button on a wider screen. */
  label: string;
  /** The Coach Audio id of the recorded gem. Leave out until it is recorded. */
  clipId?: string;
}

export function GemVoiceButton({ label, clipId }: GemVoiceButtonProps) {
  if (!clipId) return null;
  return <CoachAudioButton clipId={clipId} label={label} whenMissing="hide" />;
}

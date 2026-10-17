'use client';

import React from 'react';

import { ScreenVoice } from '@/components/audio/ScreenVoice';
import { useFirstVisit } from '@/hooks/useVoiceMoment';
import { VOICE_MOMENTS } from '@/lib/audio/moments';

interface FirstVisitVoiceProps {
  moment: 'mindVaultFirstVisit';
  label: string;
  className?: string;
}

/**
 * A Coach Mike button for a page that carries it on the first visit only.
 * Shown while the visit lasts, gone on every visit after, and never shown (nor
 * counted as a visit) while its recording is missing.
 */
export function FirstVisitVoice({ moment, label, className }: FirstVisitVoiceProps): React.ReactElement | null {
  const visible = useFirstVisit(moment);
  if (!visible) return null;

  return <ScreenVoice clipId={VOICE_MOMENTS[moment].clips[0]} label={label} className={className} />;
}

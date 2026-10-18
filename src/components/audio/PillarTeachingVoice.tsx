'use client';

import React from 'react';

import { ScreenVoice } from '@/components/audio/ScreenVoice';
import { useCoachAudio } from '@/lib/audio/context';
import { clipsForPillar } from '@/lib/audio/placements';

interface PillarTeachingVoiceProps {
  /** The pillar's Firestore document id, e.g. 'pillar_positioning'. */
  pillarId: string;
}

/**
 * The Coach Mike buttons for one pillar's screen, stacked in the order Michael
 * set: the pillar's welcome first, then any foundational tools placed on it,
 * then the clips that teach it. A clip that is not uploaded shows no button, and
 * a pillar with nothing showing renders nothing at all. The voice on/off switch
 * sits beside the first button that is showing, not beside every one.
 */
export function PillarTeachingVoice({ pillarId }: PillarTeachingVoiceProps): React.ReactElement | null {
  const { clips } = useCoachAudio();
  const placed = clipsForPillar(pillarId);

  const firstShowing = placed.find(item => clips[item.clipId])?.clipId;
  if (!firstShowing) return null;

  return (
    <div className="mb-4 flex flex-col items-start gap-2.5">
      {placed.map(item => (
        <ScreenVoice
          key={item.clipId}
          clipId={item.clipId}
          label={item.label}
          showToggle={item.clipId === firstShowing}
        />
      ))}
    </div>
  );
}

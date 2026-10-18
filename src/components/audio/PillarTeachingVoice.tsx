'use client';

import React from 'react';

import { ScreenVoice } from '@/components/audio/ScreenVoice';
import { useCoachAudio } from '@/lib/audio/context';
import { clipsForPillar, type PlacedClip } from '@/lib/audio/placements';

interface PillarTeachingVoiceProps {
  /** The pillar's Firestore document id, e.g. 'pillar_positioning'. */
  pillarId: string;
}

/**
 * The Coach Mike buttons for one pillar's screen, in the order Michael set: the
 * pillar's welcome first, then any foundational tools placed on it, then the
 * clips that teach it. A clip with a `short` name in the placements is drawn as
 * a small chip, and chips that follow one another share a single wrapped row. A
 * clip that is not uploaded shows no button, and a pillar with nothing showing
 * renders nothing at all. The voice on/off switch sits beside the first button
 * that is showing, not beside every one.
 */
export function PillarTeachingVoice({ pillarId }: PillarTeachingVoiceProps): React.ReactElement | null {
  const { clips } = useCoachAudio();
  const placed = clipsForPillar(pillarId);

  const firstShowing = placed.find(item => clips[item.clipId])?.clipId;
  if (!firstShowing) return null;

  const voice = (item: PlacedClip) => (
    <ScreenVoice
      key={item.clipId}
      clipId={item.clipId}
      label={item.label}
      chipLabel={item.short}
      showToggle={item.clipId === firstShowing}
    />
  );

  // Consecutive chips go into one row; a full button stands on its own line. Only
  // clips that are showing are laid out, so a row of chips with none uploaded
  // leaves no empty gap behind.
  const rows: PlacedClip[][] = [];
  for (const item of placed.filter(p => clips[p.clipId])) {
    const last = rows[rows.length - 1];
    if (item.short && last?.[0].short) last.push(item);
    else rows.push([item]);
  }

  return (
    <div className="mb-4 flex flex-col items-start gap-2.5">
      {rows.map(row =>
        row[0].short ? (
          <div key={row[0].clipId} className="flex flex-wrap items-center gap-2">
            {row.map(voice)}
          </div>
        ) : (
          voice(row[0])
        )
      )}
    </div>
  );
}

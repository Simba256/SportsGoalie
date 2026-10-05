'use client';

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

import { useVoiceMomentSequence } from '@/hooks/useVoiceMoment';
import type { SequenceMomentKey } from '@/lib/audio/moments';

interface VoiceMomentTriggerProps {
  moment: SequenceMomentKey;
}

/**
 * Plays one of Coach Mike's event sequences the first time it is due, and
 * renders nothing while it does.
 *
 * It shows a single button only when the phone refuses to start the voice
 * without a tap. Login and sign-up unlock playback from the tap that submits
 * the form, so on the normal path nobody ever sees this; it is the way back in
 * for a phone that refuses anyway, such as a goalie who reloads the page.
 */
export function VoiceMomentTrigger({ moment }: VoiceMomentTriggerProps): React.ReactElement | null {
  const { blocked, playNow } = useVoiceMomentSequence(moment);
  const [dismissed, setDismissed] = useState(false);

  if (!blocked || dismissed) return null;

  return (
    <div role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-sky-300/40 bg-slate-950/95 py-1.5 pl-1.5 pr-1 shadow-lg shadow-sky-500/20">
        <button
          type="button"
          onClick={playNow}
          className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-[11px] font-bold tracking-[0.1em] text-sky-300"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-500">
            <Play size={11} color="#fff" fill="#fff" />
          </span>
          TAP TO HEAR COACH MIKE
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';

import { VoiceMomentTrigger } from '@/components/audio/VoiceMomentTrigger';

/**
 * Coach Mike speaks the first time a goalie opens charting, whichever charting
 * screen they land on. The layout, not the hub page, carries it so a deep link
 * into a session counts as opening charting too.
 */
export default function ChartingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <VoiceMomentTrigger moment="chartingFirstOpen" />
    </>
  );
}

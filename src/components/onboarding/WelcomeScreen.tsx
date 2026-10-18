'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

import { ScreenVoice } from '@/components/audio/ScreenVoice';

interface WelcomeScreenProps {
  /** "Welcome to Smarter Goalie." for a parent, "Welcome, Coach." for a coach. */
  heading: string;
  /** The Coach Mike recording that goes with this welcome. */
  clipId: string;
  /** The pathway's colour, for the rule under the heading. */
  accent: string;
  /** The questionnaire's own fade-in and button classes and button style, so the screen matches the ones after it. */
  fadeClassName: string;
  buttonClassName: string;
  buttonStyle: React.CSSProperties;
  onContinue: () => void;
}

/**
 * The first screen a parent or coach sees after registering: a greeting, Coach
 * Mike's recording behind a button, and Continue. Continue works at any time,
 * with the recording unplayed, half played or finished, and stops it.
 *
 * The questionnaire decides whether to show this at all. With no recording on
 * file the line "Hear from Coach Mike" would promise something that is not
 * there, so the questionnaire opens on its own first screen instead.
 */
export function WelcomeScreen({
  heading,
  clipId,
  accent,
  fadeClassName,
  buttonClassName,
  buttonStyle,
  onContinue,
}: WelcomeScreenProps): React.ReactElement {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }} className={fadeClassName}>
        <h1
          style={{
            fontSize: 'clamp(28px,6vw,46px)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '14px',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {heading}
        </h1>

        <div
          aria-hidden="true"
          style={{ width: '56px', height: '3px', borderRadius: '3px', background: accent, margin: '0 auto 22px' }}
        />

        <p
          style={{
            fontSize: 'clamp(15px,2vw,18px)',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.6,
            marginBottom: '22px',
          }}
        >
          Hear from Coach Mike before you begin.
        </p>

        <ScreenVoice clipId={clipId} label="HEAR COACH MIKE: WELCOME" className="mb-8 justify-center" />

        <button onClick={onContinue} style={buttonStyle} className={buttonClassName}>
          CONTINUE
          <ChevronRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
}

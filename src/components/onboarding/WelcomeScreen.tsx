'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';

import { ScreenVoice } from '@/components/audio/ScreenVoice';
import { useCoachAudioClip } from '@/lib/audio/context';

interface WelcomeScreenProps {
  /** "Welcome to Smarter Goalie." for a parent, "Welcome, Coach." for a coach. */
  heading: string;
  /** The small pill above the heading, e.g. "Smarter Goalie — Coach Pathway". */
  badge: string;
  /** The Coach Mike recording that goes with this welcome. */
  clipId: string;
  /** The pathway's colour, as a 6-digit hex. It tints the glow, the badge, the rule and the card. */
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
  badge,
  clipId,
  accent,
  fadeClassName,
  buttonClassName,
  buttonStyle,
  onContinue,
}: WelcomeScreenProps): React.ReactElement {
  const { available } = useCoachAudioClip(clipId);

  // `accent` is always a 6-digit hex, so a two-digit suffix is its alpha.
  const tint = (alpha: string): string => `${accent}${alpha}`;

  return (
    <div
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: [
          `radial-gradient(ellipse 80% 55% at 50% 0%, ${tint('38')} 0%, transparent 70%)`,
          `radial-gradient(ellipse 60% 40% at 50% 105%, ${tint('1f')} 0%, transparent 70%)`,
        ].join(', '),
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'min(120vw, 720px)',
          height: 'min(120vw, 720px)',
          transform: 'translate(-50%, -54%)',
          borderRadius: '50%',
          border: `1px solid ${tint('22')}`,
          boxShadow: `inset 0 0 120px ${tint('14')}`,
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 'min(84vw, 480px)',
          height: 'min(84vw, 480px)',
          transform: 'translate(-50%, -54%)',
          borderRadius: '50%',
          border: `1px solid ${tint('30')}`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: '560px', width: '100%', textAlign: 'center' }} className={fadeClassName}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 14px',
            background: tint('1f'),
            border: `1px solid ${tint('4d')}`,
            borderRadius: '99px',
            marginBottom: '20px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            {badge}
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(32px,7.5vw,58px)',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            marginBottom: '16px',
            color: '#fff',
            background: `linear-gradient(180deg, #ffffff 0%, #ffffff 55%, ${accent} 160%)`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {heading}
        </h1>

        <div
          aria-hidden="true"
          style={{
            width: '120px',
            height: '3px',
            borderRadius: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
            margin: '0 auto 22px',
          }}
        />

        <p
          style={{
            fontSize: 'clamp(16px,2.4vw,20px)',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.82)',
            lineHeight: 1.6,
            marginBottom: '26px',
          }}
        >
          Hear from Coach Mike before you begin.
        </p>

        {available && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px 16px',
              marginBottom: '30px',
              borderRadius: '18px',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${tint('40')}`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.35), 0 0 40px ${tint('1a')}`,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <ScreenVoice clipId={clipId} label="HEAR COACH MIKE: WELCOME" className="justify-center" />
          </div>
        )}

        <button onClick={onContinue} style={buttonStyle} className={buttonClassName}>
          CONTINUE
          <ChevronRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
}

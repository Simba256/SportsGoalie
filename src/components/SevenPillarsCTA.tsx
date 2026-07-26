'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import type { PillarFromKey } from '@/lib/pillar-public-routes';
import { PUBLIC_PILLARS, sevenPillarsHubHref } from '@/lib/pillar-public-routes';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';

interface SevenPillarsCTAProps {
  /** Role overview key — used so Back from the hub returns here */
  from: PillarFromKey;
  /** Optional eyebrow override, e.g. "For The Goalie" */
  eyebrow?: string;
}

/**
 * Public CTA block for role overview pages.
 * Leads to the shared /7-pillars hub (no login).
 */
export function SevenPillarsCTA({ from, eyebrow }: SevenPillarsCTAProps) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '100dvh',
        padding: 'clamp(96px,11vw,150px) 0',
        background: 'linear-gradient(160deg, #000f28 0%, #041530 55%, #060d1a 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(96,205,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.03) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(80vw, 720px)',
          height: '360px',
          background: 'radial-gradient(ellipse, rgba(55,181,255,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-20">
          <div style={{ maxWidth: 560 }}>
            <div className="inline-flex items-center gap-3 mb-6">
              <div style={{ width: 36, height: 1.5, background: BLUE2, opacity: 0.6 }} />
              <p
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '4px',
                  color: BLUE2,
                  textTransform: 'uppercase',
                  margin: 0,
                }}
              >
                {eyebrow ?? 'The Architecture'}
              </p>
            </div>

            <h2
              style={{
                fontSize: 'clamp(32px, 5.2vw, 64px)',
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-0.03em',
                margin: '0 0 18px',
                lineHeight: 1.05,
              }}
            >
              THE{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 50%, ${BLUE3} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                7 PILLARS
              </span>
            </h2>

            <p
              style={{
                fontSize: 'clamp(15px, 1.8vw, 20px)',
                color: 'rgba(184,212,240,0.78)',
                lineHeight: 1.8,
                margin: '0 0 40px',
                maxWidth: 480,
              }}
            >
              Seven connected layers. One complete system. Explore every Pillar — open to every role, no login required.
            </p>

            <button
              type="button"
              onClick={() => router.push(sevenPillarsHubHref(from))}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`,
                color: '#000f28',
                border: 'none',
                borderRadius: 10,
                padding: '15px 28px',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(55,181,255,0.35)',
              }}
            >
              View more about this
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Preview strip — not clickable destinations; CTA is the entry */}
          <div style={{ position: 'relative', flex: '1 1 auto', maxWidth: 660, width: '100%' }} aria-hidden>
            {/* connecting thread — reinforces "seven connected layers" */}
            <div
              style={{
                position: 'absolute',
                top: '38%',
                left: 4,
                right: 4,
                height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(96,205,255,0.3) 15%, rgba(96,205,255,0.3) 85%, transparent)',
                zIndex: 0,
              }}
            />
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-4" style={{ position: 'relative', zIndex: 1 }}>
              {PUBLIC_PILLARS.map((p) => {
                const hovered = hoveredId === p.id;
                return (
                  <div
                    key={p.id}
                    onMouseEnter={() => setHoveredId(p.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${hovered ? p.accent : `${p.accent}40`}`,
                      background: `linear-gradient(160deg, ${p.accent}${hovered ? '22' : '14'}, rgba(4,8,20,0.85))`,
                      padding: '24px 10px',
                      textAlign: 'center',
                      cursor: 'default',
                      transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                      boxShadow: hovered ? `0 10px 26px -8px ${p.accent}` : 'none',
                      transition: 'transform 240ms ease, box-shadow 240ms ease, border-color 240ms ease, background 240ms ease',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 26,
                        fontWeight: 900,
                        color: p.accent,
                        margin: '0 0 8px',
                        lineHeight: 1,
                        textShadow: `0 0 10px ${p.accent}55`,
                      }}
                    >
                      {p.num}
                    </p>
                    <div style={{ width: 18, height: 2, background: p.accent, opacity: 0.5, margin: '0 auto 9px' }} />
                    <p
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: '0.3px',
                        color: `${p.accent}99`,
                        textTransform: 'uppercase',
                        margin: 0,
                        lineHeight: 1.3,
                      }}
                    >
                      {p.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

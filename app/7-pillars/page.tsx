'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  Brain,
  Footprints,
  Map,
  Grid3X3,
  Target,
  BarChart3,
  Heart,
  type LucideIcon,
} from 'lucide-react';
import { PublicPageNav } from '@/components/PublicPageNav';
import { Footer7 } from '@/components/footer-7';
import { TiltCard } from '@/components/ui/tilt-card';
import {
  PILLAR_FROM_CONTEXT,
  PUBLIC_PILLARS,
  pillarDetailHref,
  resolvePillarFrom,
} from '@/lib/pillar-public-routes';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';

const TOOLBOX_PALETTES = [
  {
    accent: '#37b5ff',
    accentLight: '#7dd3fc',
    accentRgb: '55,181,255',
    cardGradient: 'linear-gradient(155deg, rgba(18,72,140,0.94) 0%, rgba(8,32,72,0.97) 48%, rgba(4,18,44,0.99) 100%)',
    glowColor: 'rgba(55,181,255,0.32)',
  },
  {
    accent: '#c4b5fd',
    accentLight: '#e9d5ff',
    accentRgb: '196,181,253',
    cardGradient: 'linear-gradient(155deg, rgba(76,48,140,0.92) 0%, rgba(36,24,82,0.97) 48%, rgba(12,10,44,0.99) 100%)',
    glowColor: 'rgba(167,139,250,0.3)',
  },
  {
    accent: '#5eead4',
    accentLight: '#99f6e4',
    accentRgb: '94,234,212',
    cardGradient: 'linear-gradient(155deg, rgba(16,100,100,0.92) 0%, rgba(10,52,68,0.97) 48%, rgba(4,22,40,0.99) 100%)',
    glowColor: 'rgba(45,212,191,0.3)',
  },
] as const;

const PILLAR_META: {
  tag: string;
  blurb: string;
  Icon: LucideIcon;
}[] = [
  { tag: 'The Foundation', blurb: 'V.M.P. Character. Leadership. Every other Pillar stands on this.', Icon: Brain },
  { tag: 'Movement Command', blurb: 'M.E.T. Game Sync. Arrive before the play moves.', Icon: Footprints },
  { tag: "The Goalie's GPS", blurb: 'Seven markers. Feel Factor. Positional certainty.', Icon: Map },
  { tag: 'Net Management', blurb: 'Below the icing line. Wraparounds. Complete coverage.', Icon: Grid3X3 },
  { tag: 'Technical Precision', blurb: 'Set crouch. Max coverage. Minimal movement.', Icon: Target },
  { tag: 'Development Loop', blurb: 'Read the play. Chart everything. Close the gaps.', Icon: BarChart3 },
  { tag: 'Off-Ice Performance', blurb: 'Recovery. Fuel. Balance. The Maintenance Program.', Icon: Heart },
];

function PillarHubCard({
  id,
  num,
  label,
  fromKey,
  index,
  isActive,
  isDimmed,
  onHover,
}: {
  id: number;
  num: string;
  label: string;
  fromKey: string;
  index: number;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (id: number | null) => void;
}) {
  const router = useRouter();
  const palette = TOOLBOX_PALETTES[index % 3];
  const meta = PILLAR_META[index];
  const { Icon } = meta;

  return (
    <TiltCard
      effect="gravitate"
      tiltLimit={10}
      scale={1.035}
      spotlight
      onClick={() => router.push(pillarDetailHref(id, fromKey))}
      className="group h-full cursor-pointer rounded-[22px]"
      style={{
        border: `1px solid rgba(${palette.accentRgb}, ${isActive ? 0.8 : 0.4})`,
        boxShadow: isActive
          ? `0 28px 64px ${palette.glowColor}, 0 0 0 1px rgba(${palette.accentRgb}, 0.22), inset 0 1px 0 rgba(255,255,255,0.12)`
          : `0 14px 40px ${palette.glowColor}, inset 0 1px 0 rgba(255,255,255,0.06)`,
        background: palette.cardGradient,
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
        animation: `pillar-card-in 0.55s ease ${index * 0.06}s both`,
        opacity: isDimmed ? 0.55 : 1,
      }}
    >
      <div
        className="relative flex h-full min-h-[220px] flex-col overflow-hidden p-6 md:p-7"
        onMouseEnter={() => onHover(id)}
        onMouseLeave={() => onHover(null)}
      >
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${palette.accent} 35%, ${palette.accentLight} 65%, transparent 100%)`,
            opacity: isActive ? 1 : 0.65,
          }}
        />
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full blur-3xl"
          style={{ background: `rgba(${palette.accentRgb}, 0.28)` }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <Icon
          size={120}
          strokeWidth={1}
          className="pointer-events-none absolute -bottom-5 -right-5 opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.12]"
          style={{ color: palette.accent }}
        />
        <div
          className="pointer-events-none absolute right-1 bottom-0 font-black leading-none select-none"
          style={{
            fontSize: 'clamp(64px, 10vw, 88px)',
            color: `rgba(${palette.accentRgb}, 0.1)`,
            letterSpacing: '-5px',
          }}
        >
          {num}
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-start justify-between gap-3">
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.2em',
                color: palette.accentLight,
                background: `rgba(${palette.accentRgb}, 0.16)`,
                border: `1px solid rgba(${palette.accentRgb}, 0.35)`,
                borderRadius: 8,
                padding: '5px 10px',
                boxShadow: `0 0 16px rgba(${palette.accentRgb}, 0.12)`,
              }}
            >
              {num}
            </span>
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
              style={{
                background: `linear-gradient(135deg, rgba(${palette.accentRgb}, 0.35) 0%, rgba(${palette.accentRgb}, 0.08) 100%)`,
                border: `1px solid rgba(${palette.accentRgb}, 0.4)`,
                boxShadow: `0 8px 20px rgba(${palette.accentRgb}, 0.2)`,
              }}
            >
              <Icon size={20} style={{ color: palette.accentLight }} strokeWidth={2} />
            </div>
          </div>

          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#fff',
              background: `linear-gradient(135deg, rgba(${palette.accentRgb}, 0.32), rgba(${palette.accentRgb}, 0.1))`,
              border: `1px solid rgba(${palette.accentRgb}, 0.35)`,
              borderRadius: 999,
              padding: '5px 12px',
              width: 'fit-content',
              marginBottom: 12,
            }}
          >
            {meta.tag}
          </span>

          <h2
            style={{
              fontSize: 'clamp(18px, 2.2vw, 22px)',
              fontWeight: 900,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
              margin: '0 0 10px',
              lineHeight: 1.15,
              textShadow: `0 0 28px rgba(${palette.accentRgb}, 0.25)`,
            }}
          >
            {label}
          </h2>

          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.68)',
              lineHeight: 1.55,
              margin: '0 0 18px',
              flex: 1,
            }}
          >
            {meta.blurb}
          </p>

          <div
            className="mt-auto flex items-center justify-between rounded-xl px-3.5 py-3 transition-all duration-300"
            style={{
              background: isActive
                ? `linear-gradient(135deg, rgba(${palette.accentRgb}, 0.28), rgba(${palette.accentRgb}, 0.1))`
                : 'rgba(0,0,0,0.22)',
              border: `1px solid rgba(${palette.accentRgb}, ${isActive ? 0.4 : 0.2})`,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
              Explore
            </span>
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${palette.accentLight}, ${palette.accent})`
                  : `rgba(${palette.accentRgb}, 0.2)`,
                color: isActive ? '#041530' : palette.accentLight,
                boxShadow: isActive ? `0 6px 18px rgba(${palette.accentRgb}, 0.45)` : 'none',
                transform: isActive ? 'translate(2px, -2px)' : 'none',
              }}
            >
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </span>
          </div>
        </div>
      </div>
    </TiltCard>
  );
}

function SevenPillarsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromKey = resolvePillarFrom(searchParams.get('from'));
  const from = PILLAR_FROM_CONTEXT[fromKey];
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div
      style={{
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        color: '#fff',
        minHeight: '100vh',
        background: '#000f28',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pillar-card-in {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes hub-ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hub-node-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes hub-glow-breathe {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}} />

      <PublicPageNav />

      <div
        style={{
          background: 'linear-gradient(90deg, rgba(14,36,72,0.95) 0%, rgba(8,28,58,0.98) 100%)',
          borderBottom: '1px solid rgba(96,205,255,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-3.5 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push(from.href)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(55,181,255,0.08)',
              border: '1px solid rgba(96,205,255,0.25)',
              borderRadius: 999,
              padding: '7px 14px',
              cursor: 'pointer',
              color: BLUE2,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(55,181,255,0.16)';
              e.currentTarget.style.borderColor = 'rgba(96,205,255,0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(55,181,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(96,205,255,0.25)';
            }}
          >
            <ArrowLeft size={13} />
            {from.label}
          </button>
          <div style={{ width: 1, height: 16, background: 'rgba(96,205,255,0.25)' }} />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '2.5px', color: 'rgba(96,205,255,0.7)', textTransform: 'uppercase' }}>
            The 7 Pillars
          </span>
        </div>
      </div>

      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: 'clamp(56px,8vw,100px) 0 clamp(72px,9vw,120px)',
          background: 'linear-gradient(165deg, #000f28 0%, #041530 42%, #071a36 100%)',
        }}
      >
        {/* Atmosphere */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(96,205,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.035) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)',
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: '-8%',
            left: '18%',
            width: 'min(55vw, 520px)',
            height: 'min(55vw, 520px)',
            background: 'radial-gradient(circle, rgba(55,181,255,0.16) 0%, transparent 68%)',
            animation: 'hub-glow-breathe 7s ease-in-out infinite',
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            bottom: '5%',
            right: '8%',
            width: 'min(45vw, 440px)',
            height: 'min(45vw, 440px)',
            background: 'radial-gradient(circle, rgba(94,234,212,0.1) 0%, transparent 70%)',
            animation: 'hub-glow-breathe 9s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="pointer-events-none absolute"
          style={{
            top: '35%',
            left: '55%',
            width: 'min(40vw, 380px)',
            height: 'min(40vw, 380px)',
            background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)',
          }}
        />
        <div
          className="pointer-events-none absolute select-none"
          style={{
            right: '-3%',
            top: '42%',
            transform: 'translateY(-50%)',
            fontSize: 'clamp(220px, 38vw, 520px)',
            fontWeight: 900,
            color: 'rgba(55,181,255,0.035)',
            lineHeight: 1,
            letterSpacing: '-18px',
          }}
        >
          7
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* Hero */}
          <div className="mb-12 flex flex-col gap-10 lg:mb-16 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div
                className="mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2"
                style={{
                  background: 'rgba(55,181,255,0.1)',
                  border: '1px solid rgba(96,205,255,0.28)',
                  boxShadow: '0 0 24px rgba(55,181,255,0.12)',
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: BLUE,
                    boxShadow: '0 0 0 3px rgba(55,181,255,0.25)',
                  }}
                />
                <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.28em', color: BLUE2, textTransform: 'uppercase', margin: 0 }}>
                  Open Architecture · No Login
                </p>
              </div>

              <div
                className="mb-6 flex h-1 w-40 overflow-hidden rounded-full"
                style={{ gap: 3 }}
              >
                {[BLUE, BLUE2, '#c4b5fd', '#5eead4'].map((c) => (
                  <div key={c} style={{ flex: 1, background: c, boxShadow: `0 0 10px ${c}` }} />
                ))}
              </div>

              <h1
                style={{
                  fontSize: 'clamp(36px, 6vw, 72px)',
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 0.95,
                  margin: '0 0 18px',
                  color: '#fff',
                }}
              >
                THE{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE2} 45%, #5eead4 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 28px rgba(55,181,255,0.35))',
                  }}
                >
                  7 PILLARS
                </span>
              </h1>

              <p
                style={{
                  fontSize: 'clamp(15px, 1.8vw, 19px)',
                  color: 'rgba(184,212,240,0.78)',
                  lineHeight: 1.7,
                  maxWidth: 520,
                  margin: 0,
                }}
              >
                Seven layers. One system. Pick a Pillar to go deeper — then return to your role overview whenever you&apos;re ready.
              </p>
            </div>

            {/* Orbital badge */}
            <div className="hidden shrink-0 md:flex flex-col items-center">
              <div style={{ position: 'relative', width: 132, height: 132 }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: -10,
                    borderRadius: '50%',
                    border: '1px dashed rgba(96,205,255,0.28)',
                    animation: 'hub-ring-spin 28s linear infinite',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(55,181,255,0.18) 0%, transparent 72%)',
                    border: '1px solid rgba(96,205,255,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 48px rgba(55,181,255,0.18), inset 0 0 28px rgba(55,181,255,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    7
                  </span>
                </div>
                {PUBLIC_PILLARS.map((p, i) => {
                  const angle = (i / 7) * 2 * Math.PI - Math.PI / 2;
                  const x = 50 + 48 * Math.cos(angle);
                  const y = 50 + 48 * Math.sin(angle);
                  const palette = TOOLBOX_PALETTES[i % 3];
                  return (
                    <div
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: 'translate(-50%, -50%)',
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        background: palette.accent,
                        boxShadow: `0 0 10px ${palette.accent}`,
                        animation: 'hub-node-pulse 2.6s ease-in-out infinite',
                        animationDelay: `${i * 0.18}s`,
                        opacity: hoveredId === null || hoveredId === p.id ? 1 : 0.3,
                        transition: 'opacity 0.25s',
                      }}
                    />
                  );
                })}
              </div>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.22em',
                  color: 'rgba(96,205,255,0.5)',
                  textTransform: 'uppercase',
                }}
              >
                Connected System
              </p>
            </div>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {PUBLIC_PILLARS.slice(0, 4).map((p, i) => (
                <PillarHubCard
                  key={p.id}
                  id={p.id}
                  num={p.num}
                  label={p.label}
                  fromKey={fromKey}
                  index={i}
                  isActive={hoveredId === p.id}
                  isDimmed={hoveredId !== null && hoveredId !== p.id}
                  onHover={setHoveredId}
                />
              ))}
            </div>

            <div className="mx-auto grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:w-3/4 xl:grid-cols-3">
              {PUBLIC_PILLARS.slice(4).map((p, i) => (
                <PillarHubCard
                  key={p.id}
                  id={p.id}
                  num={p.num}
                  label={p.label}
                  fromKey={fromKey}
                  index={i + 4}
                  isActive={hoveredId === p.id}
                  isDimmed={hoveredId !== null && hoveredId !== p.id}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          </div>

          <p
            style={{
              marginTop: 40,
              textAlign: 'center',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(148,195,228,0.4)',
            }}
          >
            Seven layers · One architecture · Built for every role
          </p>
        </div>
      </section>

      <Footer7 />
    </div>
  );
}

export default function SevenPillarsHubPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#000f28',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 12,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          LOADING…
        </div>
      }
    >
      <SevenPillarsHubContent />
    </Suspense>
  );
}

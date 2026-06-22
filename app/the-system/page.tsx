'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { PillarsArchitectureSection } from '@/components/the-system/pillars-architecture-section';
import { TiltCard } from '@/components/ui/tilt-card';

const FloatingPaths = dynamic(() => import('@/components/ui/background-paths').then(m => ({ default: m.FloatingPaths })), { ssr: false, loading: () => null });
const MeshGradientBg = dynamic(() => import('@/components/ui/mesh-gradient-bg').then(m => ({ default: m.MeshGradientBg })), { ssr: false, loading: () => null });

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';
const RED = '#C00000';

function VoiceButton({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => on && setPlaying(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: on ? 'linear-gradient(135deg, rgba(55,181,255,0.14), rgba(96,205,255,0.07))' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${on ? 'rgba(96,205,255,0.32)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '50px', padding: '9px 18px 9px 10px',
          color: on ? BLUE2 : '#475569', fontSize: '11px', fontWeight: 700,
          letterSpacing: '1.2px', cursor: on ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
          boxShadow: on ? '0 2px 10px rgba(55,181,255,0.12)' : 'none',
        }}
      >
        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: on ? `linear-gradient(135deg, ${BLUE}, ${BLUE3})` : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <Pause size={10} color="#fff" /> : <Play size={10} color="#fff" fill="#fff" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">HEAR COACH MIKE</span>
      </button>
      <button
        onClick={() => { setOn(v => !v); if (on) setPlaying(false); }}
        style={{ fontSize: '10px', color: on ? BLUE2 : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' as const }}
      >
        VOICE {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

export default function TheSystemPage() {
  const router = useRouter();
  const [activeChartCard, setActiveChartCard] = useState<number | null>(null);
  const [activeLibCard, setActiveLibCard] = useState<number | null>(null);

  const sec: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 'clamp(80px,10vw,130px) 0',
  };

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loop-pulse {
          0%, 100% { box-shadow: 0 0 14px rgba(55,181,255,0.25); }
          50%       { box-shadow: 0 0 32px rgba(55,181,255,0.5); }
        }
        @keyframes loop-pulse-green {
          0%, 100% { box-shadow: 0 0 14px rgba(52,211,153,0.25); }
          50%       { box-shadow: 0 0 32px rgba(52,211,153,0.5); }
        }
        @keyframes loop-pulse-purple {
          0%, 100% { box-shadow: 0 0 14px rgba(167,139,250,0.25); }
          50%       { box-shadow: 0 0 32px rgba(167,139,250,0.5); }
        }
        @keyframes player-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-10px); }
        }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            <button
              onClick={() => router.push('/who-we-are')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />
              WHO WE ARE
            </button>
            {/* Active state — THE SYSTEM */}
            <button
              style={{ background: 'none', border: 'none', cursor: 'default', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: BLUE, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, boxShadow: `0 0 0 3px rgba(55,181,255,0.22)`, flexShrink: 0 }} />
              THE SYSTEM
            </button>
            <button
              onClick={() => router.push('/contact')}
              style={{
                background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
                border: 'none', borderRadius: '50px',
                padding: '9px 20px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff',
                boxShadow: '0 2px 12px rgba(55,181,255,0.3)',
              }}
            >
              CONTACT US
            </button>
          </div>
          {/* Mobile contact button */}
          <button
            onClick={() => router.push('/contact')}
            className="sm:hidden"
            style={{
              background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`,
              border: 'none', borderRadius: '50px',
              padding: '8px 16px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff',
            }}
          >
            CONTACT
          </button>
        </div>
      </nav>

      {/* ── B: OPENING STATEMENT ── */}
      <section style={{ ...sec, background: '#060f28' }}>
        <MeshGradientBg
          colors={['#060f28', '#0f2847', '#1F3864', '#1850b4', '#37b5ff', '#0a2040']}
          distortion={0.9}
          swirl={0.7}
          speed={0.38}
          veilOpacity={0.48}
        />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
            <div style={{ width: '48px', height: '2px', background: `linear-gradient(90deg, ${BLUE2}, rgba(96,205,255,0.2))`, flexShrink: 0 }} />
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>THE SMARTER GOALIE SYSTEM</p>
          </div>

          <h1 style={{ fontSize: 'clamp(30px, 5vw, 68px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 28px', color: '#fff', maxWidth: '920px' }}>
            SEVEN PILLARS.<br />
            <span style={{ color: BLUE2 }}>ONE COMPLETE ARCHITECTURE.</span><br />
            <span style={{ color: RED }}>BUILT ON SIX DECADES.</span>
          </h1>

          <p style={{ fontSize: 'clamp(15px, 1.8vw, 20px)', color: 'rgba(255,255,255,0.68)', lineHeight: 1.85, maxWidth: '680px', margin: '0 0 44px', fontStyle: 'italic' }}>
            Every component shown on this page is connected to every other. Nothing operates in isolation. The goalie who engages with the full system develops faster, more completely, and more permanently than any program has ever produced.
          </p>

          <VoiceButton label="Coach Mike: The Complete System" />
        </div>
      </section>

      {/* ── C: 7 PILLARS OVERVIEW ── */}
      <PillarsArchitectureSection
        voiceButton={
          <VoiceButton label="Coach Mike: The 7 Pillars" />
        }
      />

      {/* ── D: CHARTING ARCHITECTURE ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #060d1f 0%, #0a1835 55%, #061228 100%)' }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(55,181,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(55,181,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', right: '-8%', top: '10%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.08) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-5%', bottom: '5%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(14,165,233,0.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          {/* Section header */}
          <div style={{ marginBottom: '48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(96,205,255,0.25)', borderRadius: '50px', padding: '6px 16px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE2, boxShadow: `0 0 8px ${BLUE2}` }} />
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase' as const }}>Connected Architecture</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '6px', minHeight: '80px', background: `linear-gradient(180deg, ${BLUE2}, rgba(96,205,255,0.15))`, boxShadow: `0 0 20px ${BLUE2}60`, borderRadius: '3px', flexShrink: 0 }} />
              <div>
                <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 58px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.0 }}>
                  THE CHARTING<br />
                  <span style={{ color: BLUE2 }}>ARCHITECTURE</span>
                </h2>
                <p style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', color: 'rgba(148,200,232,0.72)', margin: '14px 0 0', maxWidth: '580px', lineHeight: 1.75 }}>
                  Four interconnected charting types that feed one continuous development loop. Every session recorded. Every pattern revealed. Nothing ever lost.
                </p>
              </div>
            </div>
          </div>

          {/* Impact statement */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', marginBottom: '52px', maxWidth: '820px' }}>
            {/* Left red accent bar */}
            <div style={{ width: '5px', borderRadius: '3px', background: `linear-gradient(180deg, ${RED}, rgba(192,0,0,0.3))`, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ fontSize: 'clamp(18px, 2.6vw, 36px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                CHART IT ONCE.{' '}
                <span style={{ color: RED }}>BUILD ON IT FOREVER.</span>
              </p>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', color: 'rgba(148,200,232,0.65)', margin: 0, lineHeight: 1.7, fontWeight: 400 }}>
                Every session feeds the next. Every pattern compounds. Every insight is stored, cross-referenced, and waiting for you — session after session, season after season.
              </p>
            </div>
          </div>

          {/* 4 charting types — interactive tilt cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: '56px' }}>
            {[
              {
                num: '01',
                title: 'Game Charting',
                desc: 'Factor Ratios, good goal / weak goal, V.M.P. intensity, period by period',
                metric: 'Factor Ratio',
                color: BLUE2,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/><polyline points="7 12 11 8 15 12 19 8"/>
                  </svg>
                ),
              },
              {
                num: '02',
                title: 'Practice Charting',
                desc: 'Designated training, one directive, what improved, what needs more',
                metric: 'Practice Index',
                color: '#34d399',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                ),
              },
              {
                num: '03',
                title: 'Self-Evaluation',
                desc: 'Technical Eye and Feel Factor — the gap between what you think happened and what did',
                metric: 'Feel Factor',
                color: '#a78bfa',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                ),
              },
              {
                num: '04',
                title: 'Skill Charting',
                desc: 'Strong Side maintained, Weak Side developing, gap closing',
                metric: 'Skill Gap',
                color: '#fb923c',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
              },
            ].map((item, i) => {
              const isActive = activeChartCard === null || activeChartCard === i;
              return (
                <TiltCard
                  key={i}
                  tiltLimit={7}
                  scale={1.04}
                  effect="gravitate"
                  spotlight
                  className="group h-full rounded-[18px] cursor-default"
                  style={{
                    background: `linear-gradient(155deg, ${item.color}16, ${item.color}07, #060d1f 80%)`,
                    border: `1px solid ${item.color}${isActive ? '55' : '28'}`,
                    boxShadow: isActive
                      ? `0 16px 48px ${item.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
                      : '0 6px 24px rgba(0,0,0,0.35)',
                    opacity: activeChartCard !== null && !isActive ? 0.38 : 1,
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  <div
                    className="relative flex flex-col h-full overflow-hidden p-6"
                    style={{ minHeight: '260px' }}
                    onMouseEnter={() => setActiveChartCard(i)}
                    onMouseLeave={() => setActiveChartCard(null)}
                  >
                    {/* Top accent bar */}
                    <div
                      className="pointer-events-none absolute top-0 inset-x-0"
                      style={{ height: '3px', background: `linear-gradient(90deg, ${item.color}, ${item.color}30)` }}
                    />
                    {/* Corner glow — fades in on hover */}
                    <div
                      className="pointer-events-none absolute -left-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `${item.color}40` }}
                    />
                    {/* Number watermark */}
                    <div
                      className="pointer-events-none absolute bottom-2 right-2 font-black select-none leading-none"
                      style={{ fontSize: '76px', color: `${item.color}18`, letterSpacing: '-4px' }}
                    >
                      {item.num}
                    </div>

                    {/* Icon + num badge */}
                    <div className="relative z-10 flex justify-between items-start mb-5">
                      <div
                        className="flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                        style={{
                          width: 52,
                          height: 52,
                          background: `linear-gradient(135deg, ${item.color}28, ${item.color}0c)`,
                          border: `1px solid ${item.color}45`,
                          color: item.color,
                          boxShadow: `0 4px 16px ${item.color}20`,
                        }}
                      >
                        {item.icon}
                      </div>
                      <span
                        className="font-black"
                        style={{ fontSize: '11px', color: `${item.color}70`, letterSpacing: '1.5px' }}
                      >
                        {item.num}
                      </span>
                    </div>

                    {/* Title + expanding underline */}
                    <div className="relative z-10 mb-3">
                      <h3 style={{ fontSize: 'clamp(12px, 1.2vw, 14px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '1.2px', lineHeight: 1.25, margin: '0 0 8px' }}>
                        {item.title}
                      </h3>
                      <div
                        className="h-px w-8 transition-all duration-500 group-hover:w-full"
                        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                      />
                    </div>

                    {/* Description */}
                    <p className="relative z-10 flex-1" style={{ fontSize: '12px', color: 'rgba(148,200,232,0.7)', lineHeight: 1.75, margin: 0 }}>
                      {item.desc}
                    </p>

                    {/* Metric chip — slides up + fades in on hover */}
                    <div className="relative z-10 mt-4 transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ background: `${item.color}14`, border: `1px solid ${item.color}38`, padding: '5px 12px' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                        <span className="font-black uppercase" style={{ fontSize: '9px', color: item.color, letterSpacing: '1.5px' }}>
                          {item.metric}
                        </span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          <VoiceButton label="Coach Mike: The Development Loop" />
        </div>
      </section>

      {/* ── E: PERSONALIZED COMPANION SYSTEM ── */}
      <section style={{ ...sec, background: 'linear-gradient(145deg, #1e5ec4 0%, #1850b4 58%, #0f3d9e 100%)' }}>
        <FloatingPaths position={-1} color="rgba(96,205,255,0.7)" />
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row gap-14 lg:gap-20 items-center">
            <div style={{ flex: '1 1 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '48px', height: '2px', background: `linear-gradient(90deg, ${BLUE2}, rgba(96,205,255,0.2))`, flexShrink: 0 }} />
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>THE MOST DIFFERENTIATED FEATURE</p>
              </div>
              <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 60px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#fff' }}>
                COACH MIKE<br />KNOWS YOUR NAME.
              </h2>
              <p style={{ fontSize: 'clamp(18px, 2.5vw, 30px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
                He speaks to you directly.
              </p>
              <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, margin: '0 0 36px', maxWidth: '480px' }}>
                Not a generic message. Not automation pretending to be personal. Coach Mike&rsquo;s actual voice. Your actual name. Your actual milestone. Delivered the moment you earn it.
              </p>
              <VoiceButton label="Coach Mike: Your Personal Companion" />
            </div>

            <div style={{ flex: '0 0 auto', maxWidth: '400px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'player-float 6s ease-in-out infinite' }}>
                {[
                  { text: 'Every achievement triggers a personalized voice message from Coach Mike', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                    </svg>
                  )},
                  { text: 'Goalies, parents, and coaches each receive messages relevant to their role', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  )},
                  { text: 'The system never sleeps. The recognition never stops.', icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={BLUE2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  )},
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '16px',
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(96,205,255,0.25)',
                    borderRadius: '14px',
                    padding: '20px 22px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                  }}>
                    <div style={{ flexShrink: 0, marginTop: '2px' }}>{item.icon}</div>
                    <p style={{ fontSize: '14px', color: 'rgba(220,235,248,0.9)', margin: 0, lineHeight: 1.75 }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── F: MOTIVATIONAL LIBRARY ── */}
      <section style={{ ...sec, background: 'linear-gradient(145deg, #0b0f1e 0%, #080d18 60%, #0f0d1c 100%)' }}>
        {/* Amber glow bottom-left */}
        <div style={{ position: 'absolute', bottom: '-8%', left: '-5%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(251,191,36,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Blue glow top-right */}
        <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Subtle amber grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(251,191,36,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.012) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        {/* Ghost word */}
        <div style={{ position: 'absolute', right: '-2%', bottom: '6%', fontSize: 'clamp(80px, 16vw, 240px)', fontWeight: 900, color: 'rgba(251,191,36,0.028)', letterSpacing: '-0.05em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const }}>YOURS</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          {/* Section header */}
          <div style={{ marginBottom: '52px' }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.28)', borderRadius: '50px', padding: '6px 16px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(251,191,36,0.08)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }} />
              <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#fbbf24', textTransform: 'uppercase' as const }}>A Space Personal To Each Member</span>
            </div>
            {/* Title block */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ width: '6px', minHeight: '90px', background: 'linear-gradient(180deg, #fbbf24, rgba(251,191,36,0.15))', boxShadow: '0 0 20px rgba(251,191,36,0.45)', borderRadius: '3px', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 58px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.0 }}>
                  THE MOTIVATIONAL<br />
                  <span style={{ color: '#fbbf24' }}>LIBRARY</span>
                </h2>
                <p style={{ fontSize: 'clamp(13px, 1.6vw, 18px)', fontWeight: 700, color: 'rgba(251,191,36,0.75)', margin: '12px 0 0', fontStyle: 'italic', letterSpacing: '0.02em' }}>
                  Your Highlights. Your Milestones. Your Library.
                </p>
              </div>
            </div>
          </div>

          {/* 5 feature cards — interactive tilt cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ marginBottom: '40px' }}>
            {[
              {
                num: '01',
                title: 'Personal Highlight Clips',
                desc: 'Saves, breakthrough moments, before and after comparisons. Your journey preserved.',
                tag: 'Your Journey',
                color: BLUE2,
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
                  </svg>
                ),
              },
              {
                num: '02',
                title: 'Milestone Markers',
                desc: 'First AA game, first perfect chart, first self-correction identified. Every first remembered.',
                tag: 'Every First',
                color: '#34d399',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                ),
              },
              {
                num: '03',
                title: 'Member-Contributed Content',
                desc: 'Movie clips, music, quotes, poems — anything that motivates, all in one place.',
                tag: 'What Motivates You',
                color: '#a78bfa',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ),
              },
              {
                num: '04',
                title: 'Coach Mike Voice Messages',
                desc: 'Personalized voice messages triggered by every accolade. Your name. Your achievement.',
                tag: 'Your Name. Your Achievement.',
                color: '#fbbf24',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                ),
              },
              {
                num: '05',
                title: 'Parent & Coach Achievement Wall',
                desc: 'Commitment, dedication, and results celebrated. The people who matter see the journey.',
                tag: 'Your People See It',
                color: '#fb923c',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
              },
            ].map((item, i) => {
              const isActive = activeLibCard === null || activeLibCard === i;
              return (
                <TiltCard
                  key={i}
                  tiltLimit={7}
                  scale={1.04}
                  effect="gravitate"
                  spotlight
                  className={`group h-full rounded-[18px] cursor-default${i === 4 ? ' sm:col-span-2 lg:col-span-1' : ''}`}
                  style={{
                    background: `linear-gradient(155deg, ${item.color}16, ${item.color}07, #0b0f1e 80%)`,
                    border: `1px solid ${item.color}${isActive ? '55' : '28'}`,
                    boxShadow: isActive
                      ? `0 16px 48px ${item.color}22, inset 0 1px 0 rgba(255,255,255,0.08)`
                      : '0 6px 24px rgba(0,0,0,0.35)',
                    opacity: activeLibCard !== null && !isActive ? 0.38 : 1,
                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
                  }}
                >
                  <div
                    className="relative flex flex-col h-full overflow-hidden p-6"
                    style={{ minHeight: '260px' }}
                    onMouseEnter={() => setActiveLibCard(i)}
                    onMouseLeave={() => setActiveLibCard(null)}
                  >
                    {/* Top accent bar */}
                    <div
                      className="pointer-events-none absolute top-0 inset-x-0"
                      style={{ height: '3px', background: `linear-gradient(90deg, ${item.color}, ${item.color}30)` }}
                    />
                    {/* Corner glow */}
                    <div
                      className="pointer-events-none absolute -left-8 -top-8 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: `${item.color}40` }}
                    />
                    {/* Number watermark */}
                    <div
                      className="pointer-events-none absolute bottom-2 right-2 font-black select-none leading-none"
                      style={{ fontSize: '76px', color: `${item.color}18`, letterSpacing: '-4px' }}
                    >
                      {item.num}
                    </div>

                    {/* Icon + num badge */}
                    <div className="relative z-10 flex justify-between items-start mb-5">
                      <div
                        className="flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                        style={{
                          width: 52,
                          height: 52,
                          background: `linear-gradient(135deg, ${item.color}28, ${item.color}0c)`,
                          border: `1px solid ${item.color}45`,
                          color: item.color,
                          boxShadow: `0 4px 16px ${item.color}20`,
                        }}
                      >
                        {item.icon}
                      </div>
                      <span
                        className="font-black"
                        style={{ fontSize: '11px', color: `${item.color}70`, letterSpacing: '1.5px' }}
                      >
                        {item.num}
                      </span>
                    </div>

                    {/* Title + expanding underline */}
                    <div className="relative z-10 mb-3">
                      <h3 style={{ fontSize: 'clamp(12px, 1.2vw, 14px)', fontWeight: 800, color: '#fff', textTransform: 'uppercase' as const, letterSpacing: '1.2px', lineHeight: 1.25, margin: '0 0 8px' }}>
                        {item.title}
                      </h3>
                      <div
                        className="h-px w-8 transition-all duration-500 group-hover:w-full"
                        style={{ background: `linear-gradient(90deg, ${item.color}, transparent)` }}
                      />
                    </div>

                    {/* Description */}
                    <p className="relative z-10 flex-1" style={{ fontSize: '12px', color: 'rgba(148,200,232,0.7)', lineHeight: 1.75, margin: 0 }}>
                      {item.desc}
                    </p>

                    {/* Tag chip — slides up + fades in on hover */}
                    <div className="relative z-10 mt-4 transition-all duration-300 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <div
                        className="inline-flex items-center gap-2 rounded-full"
                        style={{ background: `${item.color}14`, border: `1px solid ${item.color}38`, padding: '5px 12px' }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }} />
                        <span className="font-black uppercase" style={{ fontSize: '9px', color: item.color, letterSpacing: '1.5px' }}>
                          {item.tag}
                        </span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              );
            })}
          </div>

          {/* Bottom statement — "Not Curriculum. Not Charting." */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', marginBottom: '52px', maxWidth: '820px' }}>
            <div style={{ width: '5px', borderRadius: '3px', background: 'linear-gradient(180deg, #fbbf24, rgba(251,191,36,0.3))', flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: 'clamp(18px, 2.4vw, 30px)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Not Curriculum.{' '}
                <span style={{ color: '#fbbf24' }}>Not Charting.</span>
              </p>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', color: 'rgba(148,200,232,0.65)', margin: 0, lineHeight: 1.7, fontWeight: 400 }}>
                A celebration of the journey. A dedicated space that grows with every goalie — session by session, season by season.
              </p>
            </div>
          </div>

          <VoiceButton label="Coach Mike: The Motivational Library" />
        </div>
      </section>

      {/* ── G: YOUR INDIVIDUAL PAGE ── */}
      <section style={{ ...sec, background: 'linear-gradient(155deg, #07101f 0%, #0b1d36 55%, #060f22 100%)' }}>
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(55,181,255,0.13) 1.5px, transparent 1.5px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        {/* Blue glow orb top-right */}
        <div style={{ position: 'absolute', top: '-8%', right: '-5%', width: '55vw', height: '55vw', maxWidth: '720px', maxHeight: '720px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        {/* Red glow orb bottom-left */}
        <div style={{ position: 'absolute', bottom: '-8%', left: '-8%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(192,0,0,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 2 }}>
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div style={{ flex: '1 1 0', maxWidth: '560px' }}>
              <h2 style={{ fontSize: 'clamp(28px, 4.2vw, 58px)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 0 28px', color: '#fff' }}>
                Your Page.<br />
                <span style={{ color: BLUE2 }}>Your Journey.</span><br />
                <span style={{ color: 'rgba(255,255,255,0.85)' }}>A Record That</span><br />
                <span style={{ color: BLUE2 }}>Never Goes Away.</span>
              </h2>
              <p style={{ fontSize: 'clamp(14px, 1.7vw, 18px)', color: 'rgba(255,255,255,0.68)', lineHeight: 1.9, margin: '0 0 36px' }}>
                Every goalie, parent, and coach has their own page within the system. Progress. Charts. Videos. GEMs earned. Development milestones. It does not disappear when the season ends. It is the permanent record of everything you have built.
              </p>
              <VoiceButton label="Coach Mike: Your Individual Page" />
            </div>

            <div style={{ flex: '0 0 auto', maxWidth: '420px', width: '100%', marginLeft: 'auto' }}>
              <TiltCard
                tiltLimit={10}
                scale={1.03}
                effect="gravitate"
                spotlight
                className="rounded-[24px]"
                style={{
                  background: 'linear-gradient(145deg, rgba(10,20,44,0.97) 0%, rgba(7,15,34,0.99) 100%)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(55,181,255,0.22)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(55,181,255,0.06), inset 0 1px 0 rgba(255,255,255,0.07)',
                }}
              >
                <div>
                  {/* Top accent bar */}
                  <div style={{ height: '3px', background: `linear-gradient(90deg, ${BLUE}, ${BLUE2}, rgba(55,181,255,0.1))`, borderRadius: '24px 24px 0 0' }} />

                  <div style={{ padding: '28px 28px 20px' }}>
                    {/* Profile header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '26px' }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'loop-pulse 3s ease-in-out infinite' }}>
                          <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>G</span>
                        </div>
                        <div style={{ position: 'absolute', bottom: '1px', right: '1px', width: '12px', height: '12px', borderRadius: '50%', background: '#34d399', border: '2px solid #0a141e', boxShadow: '0 0 6px #34d399' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: '0 0 4px', lineHeight: 1 }}>Your Name</p>
                        <p style={{ fontSize: '9px', fontWeight: 700, color: BLUE2, letterSpacing: '1.8px', textTransform: 'uppercase' as const, margin: 0 }}>GOALIE — MEMBER SINCE 2026</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.28)', borderRadius: '20px', padding: '5px 11px', flexShrink: 0 }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 5px #34d399' }} />
                        <span style={{ fontSize: '8px', fontWeight: 800, color: '#34d399', letterSpacing: '1.2px' }}>ACTIVE</span>
                      </div>
                    </div>

                    {/* Pillars with progress bar */}
                    <div style={{ paddingBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: BLUE2, flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', color: 'rgba(148,200,232,0.7)', fontWeight: 600 }}>Pillars Completed</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: BLUE2 }}>4 / 7</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(55,181,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: '57%', background: `linear-gradient(90deg, ${BLUE}, ${BLUE2})`, borderRadius: '4px', boxShadow: `0 0 10px ${BLUE}80` }} />
                      </div>
                    </div>

                    {/* Stat rows */}
                    {[
                      { label: 'Charts Logged', value: '32', color: '#34d399' },
                      { label: 'GEMs Earned', value: '18', color: '#fbbf24' },
                      { label: 'Development Streak', value: '14 Days', color: '#f472b6' },
                      { label: 'Strong Side Maintained', value: '✓', color: '#34d399' },
                    ].map((stat, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: stat.color, flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', color: 'rgba(148,200,232,0.7)', fontWeight: 600 }}>{stat.label}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: stat.color }}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── H: ACHIEVEMENT & ACCOLADE ENGINE ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #0a2040 0%, #0c2444 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.022) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 20vw, 300px)', fontWeight: 900, color: 'rgba(255,255,255,0.015)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const, letterSpacing: '-5px' }}>ACHIEVE</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '48px' }}>
            <div style={{ width: '6px', height: '80px', background: '#fbbf24', boxShadow: '0 0 15px #fbbf24', borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: '#fbbf24', textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Built Into The Architecture</p>
              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE ACHIEVEMENT &amp; ACCOLADE ENGINE</h2>
              <p style={{ fontSize: 'clamp(13px, 1.5vw, 16px)', color: 'rgba(148,195,228,0.8)', margin: '12px 0 0', maxWidth: '600px', lineHeight: 1.65 }}>
                Not an add-on. Not a gamification gimmick. Real recognition for real development.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ maxWidth: '880px', marginBottom: '48px' }}>
            {[
              { type: 'Commitment', desc: 'Login streaks, consecutive charting streaks, consistent practice', color: BLUE2 },
              { type: 'Dedication', desc: 'Knowledge Acquisition Confirmation speed improving, Pillar completion', color: '#a78bfa' },
              { type: 'Results', desc: 'Factor Ratio improvement, Strong Side maintained, self-correction identified', color: '#34d399' },
              { type: 'Character', desc: 'Accountability, Resilience, Leadership, Self-awareness milestone', color: RED },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}0f, ${item.color}04)`,
                border: `1px solid ${item.color}32`,
                borderRadius: '16px',
                padding: '24px 26px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 6px ${item.color}`, flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', fontWeight: 800, color: item.color, letterSpacing: '3px', textTransform: 'uppercase' as const }}>{item.type} ACCOLADES</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(148,200,232,0.85)', margin: 0, lineHeight: 1.75 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <VoiceButton label="Coach Mike: The Achievement Engine" />
        </div>
      </section>

      {/* ── I: THE COMMUNITY ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #1b3c7c 0%, #163272 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.01) 60px, rgba(255,255,255,0.01) 61px)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '44px' }}>
            <div style={{ width: '6px', height: '80px', background: BLUE2, boxShadow: `0 0 15px ${BLUE2}`, borderRadius: '3px', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: BLUE2, textTransform: 'uppercase' as const, margin: '0 0 8px' }}>Hosted By Coach Mike</p>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>THE COMMUNITY</h2>
            </div>
          </div>

          <div style={{ maxWidth: '820px', marginBottom: '44px' }}>
            <div style={{ border: `1px solid rgba(96,205,255,0.28)`, background: 'rgba(96,205,255,0.07)', borderRadius: '12px', padding: '18px 26px', marginBottom: '24px' }}>
              <p style={{ fontSize: 'clamp(14px, 1.7vw, 17px)', fontWeight: 700, color: '#fff', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                WHAT&rsquo;S YOUR OPINION? DEEP THOUGHTS. DID YOU KNOW THIS. WE WELCOME CHALLENGE.
              </p>
            </div>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, margin: 0 }}>
              The Smarter Goalie community is not a forum. It is a conversation hosted by Coach Mike. Every question invites a response. Every response builds the community. The hockey world has been waiting for this conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: '44px' }}>
            {[
              { title: 'Role-Filtered Threads', desc: 'Goalies, Parents, Coaches, Goalie Coaches, Organizations — each conversation where it belongs', color: BLUE2 },
              { title: "Coach Mike's Voice", desc: "Every major question receives Coach Mike's voice. The conversation never goes unanswered.", color: '#34d399' },
              { title: 'Deep Thoughts & Did You Know', desc: 'GEMs and knowledge shared daily. The community that keeps growing.', color: '#a78bfa' },
              { title: 'We Welcome Challenge', desc: 'Constructive banter, pro analysis, agree or disagree. This is the conversation hockey needs.', color: '#fb923c' },
              { title: 'History of Goaltending', desc: 'Past, Present, Future — built by the community, hosted by the expert.', color: '#f472b6' },
              { title: 'Becomes The Most Valuable Part', desc: 'Over time the community becomes the most valuable part of the entire system.', color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} style={{
                background: `linear-gradient(135deg, ${item.color}0f, ${item.color}04)`,
                border: `1px solid ${item.color}2c`,
                borderRadius: '14px',
                padding: '22px 20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color, boxShadow: `0 0 8px ${item.color}`, marginBottom: '14px' }} />
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '0.3px' }}>{item.title}</p>
                <p style={{ fontSize: '13px', color: 'rgba(148,200,232,0.8)', margin: 0, lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <VoiceButton label="Coach Mike: The Community" />
        </div>
      </section>

      {/* ── J: THE CLOSE ── */}
      <section style={{ ...sec, background: 'linear-gradient(160deg, #092038 0%, #0e2848 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.018) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.018) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-40px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 24vw, 380px)', fontWeight: 900, color: 'rgba(255,255,255,0.016)', letterSpacing: '-10px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' as const }}>SYSTEM</div>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(96,205,255,0.26)', borderRadius: '50px', padding: '8px 20px', marginBottom: '36px', boxShadow: '0 2px 12px rgba(55,181,255,0.1)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: RED, boxShadow: '0 0 0 3px rgba(192,0,0,0.2)', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: BLUE2, margin: 0, textTransform: 'uppercase' as const }}>A System. Not A Program.</p>
          </div>

          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '28px' }}>
            THIS IS NOT A PROGRAM.<br />
            <span style={{ color: BLUE2 }}>IT IS A SYSTEM.</span><br />
            <span style={{ color: RED }}>THERE IS A DIFFERENCE.</span>
          </h2>

          <p style={{ fontSize: 'clamp(14px, 1.8vw, 19px)', color: 'rgba(175,215,238,0.9)', lineHeight: 1.9, maxWidth: '680px', margin: '0 auto 18px' }}>
            A program ends. A system grows. Every goalie who joins Smarter Goalie adds to the knowledge that serves every goalie who comes after them. The system learns. The community builds. The development never stops.
          </p>

          <p style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', color: 'rgba(148,192,222,0.8)', lineHeight: 1.9, maxWidth: '620px', margin: '0 auto 44px', fontStyle: 'italic' }}>
            This is what six decades produced. This is what continues to be built. Every day.
          </p>

          <div style={{ marginBottom: '36px' }}>
            <VoiceButton label="Coach Mike: Program vs. System" />
          </div>

          {/* CTA to Page 6 */}
          <div style={{ marginTop: '52px' }}>
            <button
              onClick={() => router.push('/offer')}
              style={{
                background: RED, color: '#fff', border: 'none',
                padding: 'clamp(16px,2vw,22px) clamp(32px,4vw,56px)',
                borderRadius: '12px', fontSize: 'clamp(13px,1.5vw,16px)',
                fontWeight: 900, letterSpacing: '2px', cursor: 'pointer',
                textTransform: 'uppercase' as const, boxShadow: '0 8px 32px rgba(192,0,0,0.35)',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '10px',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 44px rgba(192,0,0,0.5)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(192,0,0,0.35)'; }}
            >
              NEXT: THE OFFER
              <ChevronRight size={18} />
            </button>
            <p style={{ fontSize: '10px', color: 'rgba(148,192,222,0.45)', letterSpacing: '3px', textTransform: 'uppercase' as const, margin: '14px 0 0' }}>PAGE 6 OF 6</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#061530', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          &copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}

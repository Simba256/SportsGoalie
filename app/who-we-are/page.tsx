'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, ChevronLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
const BeamsBackground = dynamic(
  () => import('@/components/ui/beams-background').then(m => ({ default: m.BeamsBackground })),
  { ssr: false }
);

const CYAN   = '#00FFFF';
const MINT   = '#00FF99';
const VIOLET = '#B388FF';
const CORAL  = '#FF6B6B';

function VoiceButton({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => on && setPlaying(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: on ? `linear-gradient(135deg, ${VIOLET}28, ${VIOLET}12)` : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? `${VIOLET}66` : 'rgba(255,255,255,0.1)'}`, borderRadius: '50px', padding: '9px 18px 9px 10px', color: on ? VIOLET : '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', cursor: on ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: on ? `0 2px 14px ${VIOLET}35` : 'none' }}
      >
        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: on ? `linear-gradient(135deg, ${VIOLET}, #9c5fff)` : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: on ? `0 0 8px ${VIOLET}88` : 'none' }}>
          {playing ? <Pause size={10} color="#fff" /> : <Play size={10} color="#fff" fill="#fff" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">HEAR COACH MIKE</span>
      </button>
      <button onClick={() => { setOn(v => !v); if (on) setPlaying(false); }} style={{ fontSize: '10px', color: on ? VIOLET : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
        VOICE {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

// Each act bg uses a dark-hued base tinted toward its accent color
// plus a strong ambient radial so the color is visible, not just implied
const ACTS = [
  {
    number: 'ACT ONE',
    title: 'THE ACCIDENT',
    body: [
      'It started without a plan. House league hockey — and the regular goalie did not show up.',
      'Coach Mike was moved to net.',
      'He won two championships from that crease. Nobody chose it for him. The pads chose him.',
    ],
    accent: CYAN,
    bodyColor: 'rgba(200,248,255,0.84)',
    bg: `radial-gradient(ellipse at 70% 20%, rgba(0,255,255,0.15) 0%, transparent 55%),
         radial-gradient(ellipse at 20% 80%, rgba(0,255,255,0.07) 0%, transparent 45%),
         linear-gradient(160deg, #001822 0%, #020810 100%)`,
  },
  {
    number: 'ACT TWO',
    title: 'THE FIRST TRYOUT',
    body: [
      'AAA tryouts. Twelve goalies. One spot.',
      'The butterflies were real — but so was the preparation. While others waited their turn, Coach Mike had already been studying. Every NHL game he could find, on grainy black-and-white footage.',
      'He watched. He copied what worked. He adapted it to his own body. He built something of his own.',
    ],
    accent: MINT,
    bodyColor: 'rgba(200,255,226,0.84)',
    bg: `radial-gradient(ellipse at 30% 70%, rgba(0,255,153,0.14) 0%, transparent 55%),
         radial-gradient(ellipse at 75% 20%, rgba(0,255,153,0.07) 0%, transparent 45%),
         linear-gradient(160deg, #001512 0%, #020a0c 100%)`,
  },
  {
    number: 'ACT THREE',
    title: 'THE STARTER',
    body: [
      'He won the number-one spot. And he held it.',
      'Through AAA. Through Junior. Then nine years as a professional in Europe — competing at the highest level, every day, still studying the game that built him.',
      'He never gave the net back.',
    ],
    accent: CYAN,
    bodyColor: 'rgba(200,248,255,0.84)',
    bg: `radial-gradient(ellipse at 35% 60%, rgba(0,255,255,0.14) 0%, transparent 55%),
         radial-gradient(ellipse at 80% 20%, rgba(0,255,255,0.07) 0%, transparent 40%),
         linear-gradient(160deg, #001620 0%, #020810 100%)`,
  },
  {
    number: 'ACT FOUR',
    title: 'AGE 14 — THE ANALYTICAL AWAKENING',
    body: [
      'At fourteen, Coach Mike picked up martial arts. Not because hockey told him to — because he understood something about bilateral discipline before he had the words for it.',
      'Train both sides. Equal strength. Equal precision.',
      'Four questions emerged that would define the entire Smarter Goalie system:',
    ],
    highlight: 'WHERE. WHEN. WHY. HOW.',
    highlightNote: 'Every read. Every save. Every movement. In that order.',
    accent: VIOLET,
    bodyColor: 'rgba(222,210,255,0.84)',
    bg: `radial-gradient(ellipse at 55% 30%, rgba(179,136,255,0.16) 0%, transparent 55%),
         radial-gradient(ellipse at 20% 80%, rgba(179,136,255,0.08) 0%, transparent 45%),
         linear-gradient(160deg, #0e0820 0%, #04041a 100%)`,
  },
  {
    number: 'ACT FIVE',
    title: 'AGE 21 — THE 7AMS GENESIS',
    body: [
      'Age 21. A book by Dave Dryden. An overhead photograph of the crease — the ice seen from above for the first time.',
      'Coach Mike drew a line from the net to center ice.',
      'He saw the geometry that no one else was talking about. In that moment, the 7 Angle-Mark System was born. Not a theory. A discovery.',
    ],
    accent: MINT,
    bodyColor: 'rgba(200,255,226,0.84)',
    bg: `radial-gradient(ellipse at 70% 65%, rgba(0,255,153,0.14) 0%, transparent 55%),
         radial-gradient(ellipse at 25% 20%, rgba(0,255,153,0.07) 0%, transparent 40%),
         linear-gradient(160deg, #001610 0%, #020a0a 100%)`,
  },
  {
    number: 'ACT SIX',
    title: 'NINE YEARS PROFESSIONAL',
    body: [
      'Nine years in Europe. Professional hockey at the highest level.',
      'He was still studying. Still refining. The system grew — Pillar by Pillar — built for himself first, because no one else was building it.',
      'What did not exist, he created. What he created, he tested on himself before teaching it to anyone else.',
    ],
    accent: CYAN,
    bodyColor: 'rgba(200,248,255,0.84)',
    bg: `radial-gradient(ellipse at 65% 30%, rgba(0,255,255,0.15) 0%, transparent 55%),
         radial-gradient(ellipse at 15% 75%, rgba(0,255,255,0.07) 0%, transparent 40%),
         linear-gradient(160deg, #001a24 0%, #020610 100%)`,
  },
  {
    number: 'ACT SEVEN',
    title: 'THE CALLING',
    body: [
      'Year six of his professional career. A phone call to his best friend.',
      'Two words arrived as a clear directive:',
    ],
    quote: '"Coach. Teach your game to others."',
    quoteNote: 'The mission became real that day. What had been built privately for sixty years now had a purpose beyond the man who built it.',
    accent: CORAL,
    bodyColor: 'rgba(255,218,210,0.84)',
    bg: `radial-gradient(ellipse at 60% 35%, rgba(255,107,107,0.18) 0%, transparent 55%),
         radial-gradient(ellipse at 25% 75%, rgba(255,107,107,0.09) 0%, transparent 45%),
         linear-gradient(160deg, #200606 0%, #090208 100%)`,
  },
];

const PILLARS_LIST = [
  'MIND-SET',
  'SKATING TECH',
  'THE 7 ANGLE-MARK SYSTEM',
  'THE 7 POINT SYSTEM',
  'FORM TECH',
  'GAME AND PRACTICE PERFORMANCE',
  'LIFE STYLE',
];

const PILLAR_COLORS = [CYAN, MINT, VIOLET, CORAL, CYAN, MINT, VIOLET];

const STATS = [
  { value: '60+', label: 'Years\nBuilding', color: CYAN },
  { value: '7',   label: 'Pillars\nSystem',  color: MINT },
  { value: '9',   label: 'Pro\nSeasons',     color: VIOLET },
  { value: '100', label: 'Goalies\nSelected', color: CORAL },
];

export default function WhoWeArePage() {
  const router = useRouter();

  const navBtnStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px',
    color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px',
  } as React.CSSProperties;

  const dotStyle = {
    width: '6px', height: '6px', borderRadius: '50%', background: CYAN, flexShrink: 0,
  } as React.CSSProperties;

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff' }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            <button onClick={() => router.push('/who-we-are')} style={{ ...navBtnStyle, color: '#0ea5e9' }}>
              <span style={{ ...dotStyle, background: '#0ea5e9' }} />WHO WE ARE
            </button>
            <button onClick={() => router.push('/the-system')} style={{ ...navBtnStyle }}>
              <span style={dotStyle} />THE SYSTEM
            </button>
            <button onClick={() => router.push('/contact')} style={{ background: `linear-gradient(135deg, ${CORAL}, #ff4d4d)`, border: 'none', borderRadius: '50px', padding: '9px 20px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff', boxShadow: `0 2px 12px ${CORAL}55` }}>
              CONTACT US
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      {/* Background: beams + four-corner colored glows that bleed into each other */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: 'clamp(80px,10vw,120px)', paddingBottom: 'clamp(60px,8vw,100px)' }}>

        {/* Base dark bg */}
        <div style={{ position: 'absolute', inset: 0, background: '#050912', zIndex: 0 }} />

        {/* Four corner color washes */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background:
          `radial-gradient(ellipse at 0% 0%,   rgba(0,255,255,0.13)   0%, transparent 45%),
           radial-gradient(ellipse at 100% 0%,  rgba(179,136,255,0.12) 0%, transparent 45%),
           radial-gradient(ellipse at 0% 100%,  rgba(0,255,153,0.10)  0%, transparent 40%),
           radial-gradient(ellipse at 100% 100%,rgba(255,107,107,0.11) 0%, transparent 40%)`,
          pointerEvents: 'none' }} />

        {/* Beams on top of color washes */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflow: 'hidden' }}>
          <BeamsBackground
            beamWidth={3}
            beamHeight={30}
            beamNumber={12}
            lightColor={CYAN}
            backgroundColor="transparent"
            speed={1.5}
            noiseIntensity={1.2}
            scale={0.14}
            rotation={43}
          />
        </div>

        {/* Readability overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, background: 'linear-gradient(to bottom, rgba(5,9,18,0.35) 0%, rgba(5,9,18,0.1) 40%, rgba(5,9,18,0.45) 100%)', pointerEvents: 'none' }} />

        {/* Back button */}
        <button
          onClick={() => router.back()}
          style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '8px', padding: '7px 13px', color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px', cursor: 'pointer', transition: 'all 0.2s', backdropFilter: 'blur(8px)' }}
          onMouseEnter={e => { const el = e.currentTarget; el.style.background = `${CYAN}22`; el.style.borderColor = `${CYAN}70`; el.style.color = '#fff'; }}
          onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.08)'; el.style.borderColor = 'rgba(255,255,255,0.18)'; el.style.color = 'rgba(255,255,255,0.8)'; }}
        >
          <ChevronLeft size={13} />Back
        </button>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 4 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: `${CYAN}14`, border: `1px solid ${CYAN}40`, borderRadius: '50px', padding: '8px 20px', marginBottom: '28px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: CYAN, boxShadow: `0 0 0 3px ${CYAN}30`, flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: CYAN, margin: 0, textTransform: 'uppercase' }}>BUILT BY A GOALIE. FOR MOTIVATED GOALIES.</p>
          </div>

          {/* 4-colour rule */}
          <div style={{ display: 'flex', height: '3px', width: '220px', borderRadius: '4px', overflow: 'hidden', marginBottom: '28px', gap: '2px' }}>
            {[CYAN, MINT, VIOLET, CORAL].map(c => (
              <div key={c} style={{ flex: 1, background: c, boxShadow: `0 0 8px ${c}` }} />
            ))}
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 96px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#fff' }}>
            THE COACH<br />
            <span style={{ color: CYAN, textShadow: `0 0 40px ${CYAN}77, 0 0 80px ${CYAN}33` }}>MIKE</span>
            {' '}
            <span style={{ color: '#fff' }}>STORY</span>
          </h1>

          <p style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 800, color: MINT, margin: '0 0 28px', letterSpacing: '-0.01em', textShadow: `0 0 20px ${MINT}55` }}>
            Six decades. Seven pillars. One system built from nothing.
          </p>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: '480px', margin: '0 0 44px' }}>
            No template was handed to him. No coach built it for him. What you are about to read is how a boy in a house league net became the person who built the most complete goaltending development system in the world.
          </p>

          {/* Act dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {ACTS.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: act.accent, boxShadow: `0 0 8px ${act.accent}99, 0 0 16px ${act.accent}44` }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: act.accent, opacity: 0.6, letterSpacing: '1.5px' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE 7 ACTS ── */}
      {ACTS.map((act, i) => (
        <section
          key={i}
          style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: act.bg, borderBottom: `1px solid ${act.accent}25` }}
        >
          {/* Ghost act number */}
          <div style={{ position: 'absolute', right: '-2%', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 20vw, 280px)', fontWeight: 900, fontStyle: 'italic', color: `${act.accent}10`, letterSpacing: '-0.05em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', zIndex: 0 }}>
            {String(i + 1).padStart(2, '0')}
          </div>

          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
              {/* Accent bar */}
              <div style={{ width: '6px', minHeight: '80px', background: `linear-gradient(to bottom, ${act.accent}, ${act.accent}55)`, boxShadow: `0 0 20px ${act.accent}cc, 0 0 40px ${act.accent}44`, borderRadius: '3px', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3.5px', color: act.accent, textTransform: 'uppercase', margin: '0 0 6px', textShadow: `0 0 12px ${act.accent}99` }}>{act.number}</p>
                <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', margin: 0 }}>
                  {act.title}
                </h2>
              </div>
            </div>

            <div style={{ maxWidth: '720px', marginLeft: '22px' }}>
              {act.body.map((para, pi) => (
                <p key={pi} style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: act.bodyColor, lineHeight: 1.85, marginBottom: '16px', fontStyle: 'italic' }}>
                  {para}
                </p>
              ))}

              {'highlight' in act && act.highlight && (
                <div style={{ margin: '32px 0', background: `${act.accent}12`, border: `1px solid ${act.accent}35`, borderLeft: `4px solid ${act.accent}`, borderRadius: '0 12px 12px 0', padding: '20px 24px' }}>
                  <p style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: act.accent, textShadow: `0 0 32px ${act.accent}88, 0 0 60px ${act.accent}33`, letterSpacing: '0.06em', lineHeight: 1.1, margin: '0 0 12px' }}>
                    {act.highlight}
                  </p>
                  {act.highlightNote && (
                    <p style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                      {act.highlightNote}
                    </p>
                  )}
                </div>
              )}

              {'quote' in act && act.quote && (
                <div style={{ margin: '28px 0', background: `${act.accent}10`, border: `1px solid ${act.accent}30`, borderLeft: `4px solid ${act.accent}`, borderRadius: '0 12px 12px 0', padding: '20px 24px' }}>
                  <p style={{ fontSize: 'clamp(22px, 3.5vw, 42px)', fontWeight: 900, fontStyle: 'italic', color: act.accent, textShadow: `0 0 24px ${act.accent}77`, lineHeight: 1.2, margin: '0 0 14px' }}>
                    {act.quote}
                  </p>
                  {act.quoteNote && (
                    <p style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: act.bodyColor, lineHeight: 1.75, margin: 0 }}>
                      {act.quoteNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bottom fade line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(to right, transparent, ${act.accent}55, transparent)`, pointerEvents: 'none' }} />
        </section>
      ))}

      {/* ── PUZZLE METAPHOR CLOSING ── */}
      {/* Background blends all four colors — cyan top-left, mint bottom-right, violet mid-left */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0',
        background: `
          radial-gradient(ellipse at 10% 15%,  rgba(0,255,255,0.13)   0%, transparent 45%),
          radial-gradient(ellipse at 90% 85%,  rgba(0,255,153,0.12)   0%, transparent 45%),
          radial-gradient(ellipse at 20% 80%,  rgba(179,136,255,0.10) 0%, transparent 40%),
          radial-gradient(ellipse at 80% 10%,  rgba(255,107,107,0.08) 0%, transparent 35%),
          linear-gradient(145deg, #051428 0%, #060c22 50%, #040a18 100%)
        ` }}>

        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 14vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>PUZZLE</div>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: VIOLET, textTransform: 'uppercase', marginBottom: '18px', textShadow: `0 0 10px ${VIOLET}66` }}>THE COMPLETE SYSTEM</p>

          <h2 style={{ fontSize: 'clamp(22px, 4vw, 54px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 36px', maxWidth: '900px' }}>
            IN THE BEGINNING, GOALTENDING WAS LIKE A THOUSAND-PIECE PUZZLE —{' '}
            <span style={{ color: CYAN, textShadow: `0 0 24px ${CYAN}55` }}>NO BORDERS. NO PICTURE. NO BOX.</span>
          </h2>

          <div style={{ marginBottom: '44px' }}>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, maxWidth: '680px', marginBottom: '28px', fontStyle: 'italic', borderLeft: `3px solid ${CYAN}66`, paddingLeft: '16px' }}>
              Coach Mike did not receive the pieces. He found them. One by one, over six decades. He sorted them. Named them. Built the framework that holds them together.
            </p>

            <p style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 700, color: MINT, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', textShadow: `0 0 10px ${MINT}55` }}>
              THE 7 PUZZLES — IN ORDER:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '560px', marginBottom: '32px' }}>
              {PILLARS_LIST.map((pillar, i) => {
                const c = PILLAR_COLORS[i];
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', background: `${c}0e`, border: `1px solid ${c}30`, borderRadius: '10px', borderLeft: `3px solid ${c}` }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${c}22`, border: `1px solid ${c}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 8px ${c}33` }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: c }}>{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>{pillar}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ maxWidth: '680px' }}>
              <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '16px', fontStyle: 'italic', borderLeft: `3px solid ${MINT}66`, paddingLeft: '16px' }}>
                Seven puzzles. Seven complete sections. Built in order. Assembled with purpose. Proven on the man who built them before they were taught to anyone else.
              </p>
              <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '36px', fontStyle: 'italic', borderLeft: `3px solid ${VIOLET}66`, paddingLeft: '16px' }}>
                The border was built first. Then every piece was filled in. In order. With purpose. Nothing guessed. Nothing random.
              </p>
            </div>
          </div>

          {/* Closing callout */}
          <div style={{ background: `${CORAL}10`, border: `1px solid ${CORAL}35`, borderLeft: `4px solid ${CORAL}`, borderRadius: '0 16px 16px 0', padding: '28px 32px', maxWidth: '680px', marginBottom: '44px' }}>
            <p style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              You bring the motivation.
            </p>
            <p style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, color: CORAL, textShadow: `0 0 24px ${CORAL}66`, lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em' }}>
              We bring the TOOL BOX.
            </p>
          </div>

          <VoiceButton label="HEAR COACH MIKE TELL THIS STORY" />
        </div>
      </section>

      {/* ── CTA ── */}
      {/* All four colors live in the background — coral top-right, violet bottom-left, cyan left, mint bottom-right */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', textAlign: 'center',
        background: `
          radial-gradient(ellipse at 85% 10%,  rgba(255,107,107,0.18) 0%, transparent 45%),
          radial-gradient(ellipse at 15% 90%,  rgba(179,136,255,0.15) 0%, transparent 45%),
          radial-gradient(ellipse at 5%  40%,  rgba(0,255,255,0.12)   0%, transparent 40%),
          radial-gradient(ellipse at 90% 70%,  rgba(0,255,153,0.11)   0%, transparent 40%),
          linear-gradient(160deg, #040f24 0%, #06081e 100%)
        ` }}>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(16px, 4vw, 48px)', flexWrap: 'wrap', marginBottom: '56px' }}>
            {STATS.map(s => (
              <div key={s.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '80px' }}>
                <span style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 900, color: s.color, letterSpacing: '-0.03em', lineHeight: 1, textShadow: `0 0 28px ${s.color}77` }}>{s.value}</span>
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', whiteSpace: 'pre-line', textAlign: 'center', lineHeight: 1.4 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* 4-colour divider */}
          <div style={{ display: 'flex', height: '2px', width: '200px', margin: '0 auto 40px', borderRadius: '4px', overflow: 'hidden', gap: '2px' }}>
            {[CYAN, MINT, VIOLET, CORAL].map(c => (
              <div key={c} style={{ flex: 1, background: c, boxShadow: `0 0 6px ${c}` }} />
            ))}
          </div>

          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: MINT, textTransform: 'uppercase', marginBottom: '20px', textShadow: `0 0 10px ${MINT}55` }}>WHAT COMES NEXT</p>
          <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 58px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: '24px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            The system is ready.<br />
            <span style={{ color: CORAL, textShadow: `0 0 28px ${CORAL}66` }}>Are you?</span>
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'rgba(175,215,238,0.85)', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px' }}>
            Coach Mike is personally selecting the first one hundred goalies to join the Smarter Goalie BUILD experience. The application takes five minutes.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/explain')}
              style={{ background: `linear-gradient(135deg, ${CORAL}, #ff4d4d)`, color: '#fff', border: 'none', padding: '16px 36px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: `0 4px 28px ${CORAL}66` }}
            >
              SELECT YOUR ROLE →
            </button>
            <button
              onClick={() => router.push('/team-programs/pillar/1')}
              style={{ background: `${VIOLET}20`, color: VIOLET, border: `1px solid ${VIOLET}66`, padding: '16px 36px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: `0 0 16px ${VIOLET}22` }}
            >
              EXPLORE THE SYSTEM
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#040e1f', padding: '28px 24px', textAlign: 'center' }}>
        <div style={{ height: '2px', background: `linear-gradient(to right, ${CYAN}, ${MINT}, ${VIOLET}, ${CORAL})`, marginBottom: '20px', boxShadow: `0 0 12px rgba(0,255,255,0.3)` }} />
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          &copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}

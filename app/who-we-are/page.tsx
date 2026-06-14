'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, ChevronLeft } from 'lucide-react';

const BLUE  = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';
const RED   = '#C00000';

function VoiceButton({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={() => on && setPlaying(p => !p)}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: on ? 'linear-gradient(135deg, rgba(55,181,255,0.14), rgba(96,205,255,0.07))' : 'rgba(255,255,255,0.04)', border: `1px solid ${on ? 'rgba(96,205,255,0.32)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '50px', padding: '9px 18px 9px 10px', color: on ? BLUE2 : '#475569', fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', cursor: on ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: on ? '0 2px 10px rgba(55,181,255,0.12)' : 'none' }}
      >
        <span style={{ width: '26px', height: '26px', borderRadius: '50%', background: on ? `linear-gradient(135deg, ${BLUE}, ${BLUE3})` : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {playing ? <Pause size={10} color="#fff" /> : <Play size={10} color="#fff" fill="#fff" />}
        </span>
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">HEAR COACH MIKE</span>
      </button>
      <button onClick={() => { setOn(v => !v); if (on) setPlaying(false); }} style={{ fontSize: '10px', color: on ? BLUE2 : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textTransform: 'uppercase' }}>
        VOICE {on ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

const ACTS = [
  {
    number: 'ACT ONE',
    title: 'THE ACCIDENT',
    body: [
      'It started without a plan. House league hockey — and the regular goalie did not show up.',
      'Coach Mike was moved to net.',
      'He won two championships from that crease. Nobody chose it for him. The pads chose him.',
    ],
    accent: '#00f2ff',
    bg: 'radial-gradient(circle at 65% 30%, #0d1b3a 0%, #050912 100%)',
  },
  {
    number: 'ACT TWO',
    title: 'THE FIRST TRYOUT',
    body: [
      'AAA tryouts. Twelve goalies. One spot.',
      'The butterflies were real — but so was the preparation. While others waited their turn, Coach Mike had already been studying. Every NHL game he could find, on grainy black-and-white footage.',
      'He watched. He copied what worked. He adapted it to his own body. He built something of his own.',
    ],
    accent: BLUE2,
    bg: 'linear-gradient(150deg, #0d2848 0%, #133050 100%)',
  },
  {
    number: 'ACT THREE',
    title: 'THE STARTER',
    body: [
      'He won the number-one spot. And he held it.',
      'Through AAA. Through Junior. Then nine years as a professional in Europe — competing at the highest level, every day, still studying the game that built him.',
      'He never gave the net back.',
    ],
    accent: BLUE,
    bg: 'radial-gradient(circle at 35% 60%, #0d1b3a 0%, #050912 100%)',
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
    accent: '#a78bfa',
    bg: 'linear-gradient(150deg, #12203c 0%, #1a1040 100%)',
  },
  {
    number: 'ACT FIVE',
    title: 'AGE 21 — THE 7AMS GENESIS',
    body: [
      'Age 21. A book by Dave Dryden. An overhead photograph of the crease — the ice seen from above for the first time.',
      'Coach Mike drew a line from the net to center ice.',
      'He saw the geometry that no one else was talking about. In that moment, the 7 Angle-Mark System was born. Not a theory. A discovery.',
    ],
    accent: '#00f2ff',
    bg: 'linear-gradient(150deg, #0d2848 0%, #133050 100%)',
  },
  {
    number: 'ACT SIX',
    title: 'NINE YEARS PROFESSIONAL',
    body: [
      'Nine years in Europe. Professional hockey at the highest level.',
      'He was still studying. Still refining. The system grew — Pillar by Pillar — built for himself first, because no one else was building it.',
      'What did not exist, he created. What he created, he tested on himself before teaching it to anyone else.',
    ],
    accent: BLUE2,
    bg: 'radial-gradient(circle at 65% 30%, #0d1b3a 0%, #050912 100%)',
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
    accent: '#34d399',
    bg: 'linear-gradient(150deg, #0a2018 0%, #0d2848 100%)',
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

export default function WhoWeArePage() {
  const router = useRouter();

  const navBtnStyle = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px',
    color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px',
  } as React.CSSProperties;

  const dotStyle = {
    width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0,
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
            <button onClick={() => router.push('/who-we-are')} style={{ ...navBtnStyle, color: BLUE3 }}>
              <span style={{ ...dotStyle, background: BLUE3 }} />WHO WE ARE
            </button>
            <button style={navBtnStyle}>
              <span style={dotStyle} />THE SYSTEM
            </button>
          </div>
        </div>
      </nav>

      {/* Back bar */}
      <div style={{ background: '#0e2448', borderBottom: '1px solid rgba(96,205,255,0.22)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-2.5">
          <button
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', padding: '5px 10px', color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.3px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget; el.style.background = 'rgba(55,181,255,0.12)'; el.style.borderColor = 'rgba(55,181,255,0.4)'; el.style.color = '#fff'; }}
            onMouseLeave={e => { const el = e.currentTarget; el.style.background = 'rgba(255,255,255,0.06)'; el.style.borderColor = 'rgba(255,255,255,0.15)'; el.style.color = 'rgba(255,255,255,0.75)'; }}
          >
            <ChevronLeft size={12} />
            Back
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(80px,10vw,130px) 0', background: 'linear-gradient(145deg, #050912 0%, #0d2848 60%, #091830 100%)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(0,242,255,0.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.006) 0px, rgba(255,255,255,0.006) 1px, transparent 1px, transparent 14px)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: `${BLUE2}12`, border: `1px solid ${BLUE2}35`, borderRadius: '50px', padding: '8px 20px', marginBottom: '32px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: BLUE2, boxShadow: `0 0 0 3px ${BLUE2}30`, flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: BLUE2, margin: 0, textTransform: 'uppercase' }}>BUILT BY A GOALIE. FOR MOTIVATED GOALIES.</p>
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 96px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#fff' }}>
            THE COACH<br />MIKE STORY
          </h1>
          <p style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>
            Six decades. Seven pillars. One system built from nothing.
          </p>
          <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, maxWidth: '480px', margin: '0 0 44px' }}>
            No template was handed to him. No coach built it for him. What you are about to read is how a boy in a house league net became the person who built the most complete goaltending development system in the world.
          </p>

          {/* Act dots navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {ACTS.map((act, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: act.accent, opacity: 0.6 }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
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
          style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(80px,10vw,120px) 0', background: act.bg }}
        >
          {/* Ghost act number */}
          <div style={{ position: 'absolute', right: '-2%', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(140px, 20vw, 280px)', fontWeight: 900, fontStyle: 'italic', color: `${act.accent}06`, letterSpacing: '-0.05em', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', zIndex: 0 }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ position: 'absolute', top: i % 2 === 0 ? '-5%' : 'auto', bottom: i % 2 === 1 ? '-5%' : 'auto', left: i % 2 === 0 ? '-5%' : 'auto', right: i % 2 === 1 ? '-5%' : 'auto', width: '500px', height: '500px', background: `radial-gradient(ellipse, ${act.accent}08 0%, transparent 65%)`, pointerEvents: 'none', zIndex: 0 }} />

          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
              {/* Accent bar */}
              <div style={{ width: '6px', height: '80px', background: act.accent, boxShadow: `0 0 14px ${act.accent}`, borderRadius: '3px', flexShrink: 0, marginTop: '4px' }} />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3.5px', color: act.accent, textTransform: 'uppercase', margin: '0 0 6px' }}>{act.number}</p>
                <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', margin: 0 }}>
                  {act.title}
                </h2>
              </div>
            </div>

            <div style={{ maxWidth: '720px', marginLeft: '22px' }}>
              {act.body.map((para, pi) => (
                <p key={pi} style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '16px', fontStyle: 'italic' }}>
                  {para}
                </p>
              ))}

              {'highlight' in act && act.highlight && (
                <div style={{ margin: '28px 0' }}>
                  <p style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: act.accent, textShadow: `0 0 24px ${act.accent}55`, letterSpacing: '0.06em', lineHeight: 1.1, margin: '0 0 12px' }}>
                    {act.highlight}
                  </p>
                  {act.highlightNote && (
                    <p style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
                      {act.highlightNote}
                    </p>
                  )}
                </div>
              )}

              {'quote' in act && act.quote && (
                <div style={{ margin: '28px 0', borderLeft: `4px solid ${act.accent}`, paddingLeft: '24px' }}>
                  <p style={{ fontSize: 'clamp(22px, 3.5vw, 42px)', fontWeight: 900, fontStyle: 'italic', color: act.accent, textShadow: `0 0 20px ${act.accent}45`, lineHeight: 1.2, margin: '0 0 14px' }}>
                    {act.quote}
                  </p>
                  {act.quoteNote && (
                    <p style={{ fontSize: 'clamp(14px, 1.8vw, 18px)', color: 'rgba(184,212,232,0.75)', lineHeight: 1.75, margin: 0 }}>
                      {act.quoteNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* ── PUZZLE METAPHOR CLOSING ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(100px,12vw,160px) 0', background: 'linear-gradient(140deg, #1b3c7c 0%, #143270 100%)' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 14vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>PUZZLE</div>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>

          {/* Opening headline */}
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 54px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.02em', margin: '0 0 36px', maxWidth: '900px' }}>
            IN THE BEGINNING, GOALTENDING WAS LIKE A THOUSAND-PIECE PUZZLE —{' '}
            <span style={{ color: BLUE2 }}>NO BORDERS. NO PICTURE. NO BOX.</span>
          </h2>

          {/* 7 puzzles */}
          <div style={{ marginBottom: '44px' }}>
            <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, maxWidth: '680px', marginBottom: '28px', fontStyle: 'italic' }}>
              Coach Mike did not receive the pieces. He found them. One by one, over six decades. He sorted them. Named them. Built the framework that holds them together.
            </p>
            <p style={{ fontSize: 'clamp(13px, 1.4vw, 15px)', fontWeight: 700, color: BLUE2, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px' }}>
              THE 7 PUZZLES — IN ORDER:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '560px', marginBottom: '32px' }}>
              {PILLARS_LIST.map((pillar, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${BLUE2}14`, border: `1px solid ${BLUE2}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '10px', fontWeight: 900, color: BLUE2 }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', fontWeight: 700, color: '#fff', margin: 0, letterSpacing: '0.5px' }}>{pillar}</p>
                </div>
              ))}
            </div>
            <div style={{ maxWidth: '680px' }}>
              <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '16px', fontStyle: 'italic' }}>
                Seven puzzles. Seven complete sections. Built in order. Assembled with purpose. Proven on the man who built them before they were taught to anyone else.
              </p>
              <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '36px', fontStyle: 'italic' }}>
                The border was built first. Then every piece was filled in. In order. With purpose. Nothing guessed. Nothing random.
              </p>
            </div>
          </div>

          {/* Closing callout */}
          <div style={{ background: `${BLUE2}0a`, border: `1px solid ${BLUE2}25`, borderLeft: `4px solid ${BLUE2}`, borderRadius: '0 16px 16px 0', padding: '28px 32px', maxWidth: '680px', marginBottom: '44px' }}>
            <p style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
              You bring the motivation.
            </p>
            <p style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 900, color: RED, lineHeight: 1.2, margin: 0, letterSpacing: '-0.01em' }}>
              We bring the TOOL BOX.
            </p>
          </div>

          <VoiceButton label="HEAR COACH MIKE TELL THIS STORY" />
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: 'clamp(80px,10vw,120px) 0', background: 'linear-gradient(160deg, #092038 0%, #0e2848 100%)', textAlign: 'center' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, textTransform: 'uppercase', marginBottom: '20px' }}>WHAT COMES NEXT</p>
          <h2 style={{ fontSize: 'clamp(26px, 4.5vw, 58px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: '24px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
            The system is ready.<br />
            <span style={{ color: BLUE2 }}>Are you?</span>
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'rgba(175,215,238,0.85)', lineHeight: 1.8, maxWidth: '520px', margin: '0 auto 40px' }}>
            Coach Mike is personally selecting the first one hundred goalies to join the Smarter Goalie BUILD experience. The application takes five minutes.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/explain')}
              style={{ background: `linear-gradient(135deg, ${BLUE}, ${BLUE3})`, color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: `0 4px 20px ${BLUE}40` }}
            >
              SELECT YOUR ROLE →
            </button>
            <button
              onClick={() => router.push('/team-programs/pillar/1')}
              style={{ background: 'transparent', color: BLUE2, border: `1px solid ${BLUE2}40`, padding: '14px 32px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, letterSpacing: '1.5px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              EXPLORE THE SYSTEM
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#061530', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>
          &copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}

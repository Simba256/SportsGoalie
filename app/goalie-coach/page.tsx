'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Target, Check } from 'lucide-react';

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

function AutoVoicePlayer() {
  const [playing, setPlaying] = useState(false);
  const [on, setOn] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => { const t = setTimeout(() => setPlaying(true), 900); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!playing || progress >= 100) return;
    const iv = setInterval(() => setProgress(p => Math.min(100, p + 0.5)), 450);
    return () => clearInterval(iv);
  }, [playing, progress]);
  useEffect(() => { if (progress >= 100) setPlaying(false); }, [progress]);

  const fmt = (pct: number) => { const s = Math.round((pct / 100) * 90); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(96,205,255,0.03))', border: '1px solid rgba(96,205,255,0.22)', borderRadius: '20px', padding: '28px 28px 24px', backdropFilter: 'blur(12px)', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: playing ? '#22c55e' : BLUE2, boxShadow: playing ? '0 0 0 4px rgba(34,197,94,0.25)' : `0 0 0 4px rgba(96,205,255,0.2)`, transition: 'all 0.3s', flexShrink: 0 }} />
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2.5px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>AUTO-PLAYING: COACH MIKE&apos;S PERSONAL MESSAGE TO YOU</p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => setPlaying(p => !p)} style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE3} 100%)`, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: playing ? '0 0 0 12px rgba(55,181,255,0.15), 0 0 0 24px rgba(55,181,255,0.06), 0 4px 16px rgba(14,165,233,0.4)' : '0 0 0 8px rgba(55,181,255,0.12), 0 4px 12px rgba(14,165,233,0.25)', transition: 'box-shadow 0.4s' }}>
          {playing ? <Pause size={22} color="#fff" /> : <Play size={22} color="#fff" fill="#fff" />}
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', marginBottom: '10px', cursor: 'pointer', overflow: 'hidden' }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setProgress(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100))); }}>
            <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${BLUE3}, ${BLUE2})`, borderRadius: '3px', transition: 'width 0.15s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>{fmt(progress)}</span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>1:30</span>
          </div>
        </div>
        <button onClick={() => setOn(v => !v)} style={{ fontSize: '10px', color: on ? BLUE2 : '#475569', letterSpacing: '1.5px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>{on ? 'ON' : 'OFF'}</button>
      </div>
    </div>
  );
}

function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
      <div style={{ width: '3px', height: '42px', background: `linear-gradient(180deg, ${BLUE2}, ${BLUE3}, rgba(14,165,233,0.1))`, borderRadius: '2px', flexShrink: 0 }} />
      <p style={{ fontSize: 'clamp(18px, 2.2vw, 27px)', fontWeight: 800, color: BLUE2, textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0 }}>{text}</p>
    </div>
  );
}

export default function GoalieCoachPage() {
  const router = useRouter();

  const sec: React.CSSProperties = { position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(80px,10vw,130px) 0' };

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff' }}>

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            {['WHO WE ARE', 'THE SYSTEM'].map((item) => (
              <button key={item} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: BLUE, flexShrink: 0 }} />{item}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Role bar */}
      <div style={{ background: '#050c18', borderBottom: '1px solid rgba(96,205,255,0.12)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-2.5 flex items-center gap-3">
          <Target size={13} color={BLUE2} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: BLUE2 }}>YOU SELECTED:</span>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: '#fff' }}>GOALIE COACH</span>
        </div>
      </div>

      {/* ── C: Voice Player ── */}
      <section style={{ ...sec, background: 'linear-gradient(145deg, #1c4080 0%, #102e6c 58%, #091e55 100%)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', maxHeight: '680px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.14) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(55deg, transparent, transparent 80px, rgba(255,255,255,0.012) 80px, rgba(255,255,255,0.012) 81px)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-14 lg:gap-20">
            <div style={{ flex: '1 1 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                <div style={{ width: '48px', height: '2px', background: `linear-gradient(90deg, ${BLUE2}, rgba(96,205,255,0.2))`, flexShrink: 0 }} />
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: BLUE2, margin: 0, textTransform: 'uppercase' }}>COACH MIKE IS WAITING FOR YOU</p>
              </div>
              <h1 style={{ fontSize: 'clamp(40px, 6.5vw, 80px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#fff' }}>A personal<br />message.</h1>
              <p style={{ fontSize: 'clamp(22px, 3.2vw, 38px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>Peer to peer.</p>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, margin: 0, maxWidth: '400px' }}>
                Coach Mike recorded this specifically for goalie coaches who made it to this page.
              </p>
            </div>
            <div style={{ flex: '1 1 0', maxWidth: '520px', width: '100%' }}><AutoVoicePlayer /></div>
          </div>
        </div>
      </section>

      {/* ── D: Opening Statement ── */}
      <section style={{ ...sec, background: 'linear-gradient(155deg, #060c1a 0%, #0a1628 65%, #050f1c 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.028) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25%', left: '-5%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(34px, 6.2vw, 84px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', color: RED, margin: '0 0 28px', maxWidth: '1000px' }}>
            YOU CHOSE THE TOUGHEST JOB IN HOCKEY.
          </h2>
          <p style={{ fontSize: 'clamp(20px, 3vw, 38px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, maxWidth: '820px', margin: '0 0 20px', textTransform: 'uppercase' }}>
            HOW GOES THE GOALIE — HOW GOES THE TEAM.{' '}
            <span style={{ color: BLUE2 }}>You are an influencer who creates starters.</span>
          </p>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(55,181,255,0.09), rgba(96,205,255,0.05))', border: '1px solid rgba(96,205,255,0.22)', borderLeft: `4px solid ${BLUE3}`, borderRadius: '0 12px 12px 0', padding: '16px 28px', marginBottom: '40px', boxShadow: '0 2px 16px rgba(14,165,233,0.08)' }}>
            <p style={{ fontSize: 'clamp(15px, 1.9vw, 22px)', fontWeight: 700, color: BLUE2, margin: 0 }}>
              Smarter Goalie does not compete with what you do. It completes it.
            </p>
          </div>
          <br />
          <VoiceButton label="HEAR COACH MIKE: THE GOALIE COACH'S ROLE AND WHY IT MATTERS MORE THAN ANY OTHER COACHING POSITION" />
        </div>
      </section>

      {/* ── E: Respect Factor & Feel Factor ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #172e68 0%, #0c1e4e 100%)' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 15vw, 220px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>FEEL</div>
        <div style={{ position: 'absolute', top: '-10%', right: '15%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Respect Factor and Feel Factor" />
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '22px', fontWeight: 600 }}>Two things your goalies must develop that most programs never address directly.</p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>The Respect Factor is earned through consistency. The Feel Factor is built through honest self-evaluation.</p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '40px', fontWeight: 600 }}>How many of your goalies can self-coach? How many can identify their own breakdown before you tell them? Smarter Goalie builds that capacity deliberately.</p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE RESPECT FACTOR AND THE FEEL FACTOR" />
        </div>
      </section>

      {/* ── F: Mathematical Framework ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #050a18 0%, #070d1c 100%)' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Mathematical Framework" />
          <h2 style={{ fontSize: 'clamp(22px, 3.2vw, 44px)', fontWeight: 900, letterSpacing: '-0.01em', color: RED, lineHeight: 1.2, maxWidth: '820px', marginBottom: '36px' }}>
            CAN YOUR CURRENT SYSTEM SURVIVE FOUR FILTERS?
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10" style={{ maxWidth: '820px' }}>
            {['Logic', 'Common Sense', 'Math', 'Science'].map((filter, i) => (
              <div key={i} style={{ background: 'linear-gradient(135deg, rgba(55,181,255,0.09), rgba(96,205,255,0.05))', border: '1px solid rgba(96,205,255,0.24)', borderRadius: '16px', padding: 'clamp(20px,2.5vw,32px) 16px', textAlign: 'center', boxShadow: '0 2px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: 'clamp(30px,4.5vw,52px)', fontWeight: 900, color: BLUE2, lineHeight: 1, marginBottom: '12px' }}>{String(i + 1).padStart(2, '0')}</p>
                <p style={{ fontSize: 'clamp(14px, 1.6vw, 18px)', fontWeight: 700, color: '#fff', letterSpacing: '0.5px' }}>{filter}</p>
              </div>
            ))}
          </div>
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>
              Smarter Goalie is built on six decades of original IP. Every principle has been stress-tested against those four filters. Not one has failed.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '40px', fontWeight: 600 }}>
              The 7 Angle-Mark System. The 7 Point System. The Feel Factor. The Mind&rsquo;s Eye. The Development Loop. These are not philosophies. They are systems with mathematical foundations.
            </p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE MATHEMATICAL FRAMEWORK BEHIND THE SMARTER GOALIE SYSTEM" />
        </div>
      </section>

      {/* ── G: Goalie Coach Welcome Mat ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #163068 0%, #0b1e52 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-30px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 15vw, 220px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>PEER</div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Goalie Coach Welcome Mat" />
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '22px', fontWeight: 600 }}>
              Smarter Goalie has created a welcome mat for goalie coaches &mdash; volunteer, part-time, or full-time.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '40px' }}>
              One of our goals is to help goalie coach entrepreneurs grow. We share knowledge. We build the profession together. We raise the standard of goaltending development at every level.
            </p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE GOALIE COACH COMMUNITY AND WHAT WE ARE BUILDING TOGETHER" />
        </div>
      </section>

      {/* ── H: What Smarter Goalie Gives the Goalie Coach ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #05101e 0%, #030c18 100%)' }}>
        <div style={{ position: 'absolute', top: '15%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.007) 60px, rgba(255,255,255,0.007) 61px)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="What You Receive" />
          <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 40px 56px' }}>What Smarter Goalie gives the Goalie Coach:</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '680px', marginBottom: '40px' }}>
            {[
              { label: 'Complete 7 Pillar System', desc: 'Access to the deepest goaltending curriculum available' },
              { label: 'Charting Architecture', desc: 'Factor Ratios, Development Loop, cross-reference engine — all accessible' },
              { label: "Feel Factor & Mind's Eye Frameworks", desc: 'Trainable. Most programs do not train them at all.' },
              { label: 'A Peer Conversation with Coach Mike', desc: 'Not a student relationship. Coach Mike speaks to you as a peer.' },
              { label: 'Self-Coaching Tools', desc: 'Tools to help your goalies self-coach — the highest level of development' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,205,255,0.1)', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(55,181,255,0.18), rgba(96,205,255,0.1))', border: '1px solid rgba(96,205,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <Check size={12} color={BLUE2} strokeWidth={3} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, color: BLUE2, fontSize: 'clamp(12px, 1.3vw, 14px)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 4px' }}>{item.label}</p>
                  <p style={{ fontSize: 'clamp(14px, 1.6vw, 17px)', color: '#dde8f0', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE TOOLS AVAILABLE TO THE GOALIE COACH" />
        </div>
      </section>

      {/* ── I: Founding Member ── */}
      <section id="enquire" style={{ ...sec, background: 'linear-gradient(160deg, #04080f 0%, #070e1c 100%)' }}>
        <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(200px, 30vw, 440px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-20px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>100</div>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(96,205,255,0.26)', borderRadius: '50px', padding: '8px 20px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(55,181,255,0.1)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: RED, boxShadow: '0 0 0 3px rgba(192,0,0,0.2)', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: BLUE2, margin: 0, textTransform: 'uppercase' }}>Limited Availability</p>
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 66px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '24px' }}>
            THIS IS THE EXPERIENCE<br /><span style={{ color: BLUE2 }}>BUILDING PHASE</span>
          </h2>
          <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', color: '#475569', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 52px' }}>
            Coach Mike is personally selecting one hundred founding members. The goalie coaches who join this phase become part of building the standard for the profession.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            {[
              { num: '01', text: 'Complete the goalie coach questionnaire — 5 minutes' },
              { num: '02', text: 'Coach Mike personally reviews your application' },
              { num: '03', text: 'Coach Mike calls you personally — peer to peer' },
            ].map((step) => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(96,205,255,0.1)', borderRadius: '16px', padding: '28px 24px', flex: '1', maxWidth: '240px', width: '100%', margin: '0 auto', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '38px', fontWeight: 900, color: BLUE2, lineHeight: 1, marginBottom: '14px' }}>{step.num}</p>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            style={{ background: `linear-gradient(135deg, ${BLUE} 0%, ${BLUE3} 100%)`, color: '#fff', border: 'none', padding: 'clamp(16px,2vw,22px) clamp(32px,4vw,56px)', borderRadius: '12px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(14,165,233,0.35)', transition: 'all 0.2s', display: 'inline-block', marginBottom: '36px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 44px rgba(14,165,233,0.55)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(14,165,233,0.35)'; }}
          >
            ENQUIRE →
          </button>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <VoiceButton label="HEAR COACH MIKE: THE FOUNDING MEMBER OPPORTUNITY FOR GOALIE COACHES" />
          </div>
        </div>
      </section>

      <div style={{ background: '#020408', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '10px', color: '#0f172a', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>&copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER</p>
      </div>
    </div>
  );
}

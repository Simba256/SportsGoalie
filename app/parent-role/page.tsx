'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Users, Check } from 'lucide-react';

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

export default function ParentRolePage() {
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
          <Users size={13} color={BLUE2} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: BLUE2 }}>YOU SELECTED:</span>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: '#fff' }}>PARENT</span>
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
              <p style={{ fontSize: 'clamp(22px, 3.2vw, 38px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>Just for you.</p>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, margin: 0, maxWidth: '400px' }}>
                Coach Mike recorded this specifically for goalie parents who made it to this page.
              </p>
            </div>
            <div style={{ flex: '1 1 0', maxWidth: '520px', width: '100%' }}><AutoVoicePlayer /></div>
          </div>
        </div>
      </section>

      {/* ── D: Opening Statement ── */}
      <section style={{ ...sec, background: 'linear-gradient(155deg, #060c1a 0%, #0a1628 65%, #050f1c 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,205,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(96,205,255,0.028) 1px, transparent 1px)', backgroundSize: '72px 72px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-25%', right: '-5%', width: '700px', height: '700px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(30px, 5.8vw, 74px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 28px', maxWidth: '1000px' }}>
            HOW TO BE THAT GOALIE PARENT WHO{' '}
            <span style={{ color: BLUE2 }}>TRULY UNDERSTANDS AND SUPPORTS THEIR GOALIE.</span>
          </h2>
          <p style={{ fontSize: 'clamp(17px, 2.1vw, 24px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '680px', margin: '0 0 28px', fontWeight: 500 }}>
            Smarter Goalie is your support system. Coach Mike is your tour guide.
          </p>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(55,181,255,0.09), rgba(96,205,255,0.05))', border: '1px solid rgba(96,205,255,0.22)', borderLeft: `4px solid ${BLUE3}`, borderRadius: '0 12px 12px 0', padding: '16px 28px', marginBottom: '40px', boxShadow: '0 2px 16px rgba(14,165,233,0.08)' }}>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 22px)', fontWeight: 900, color: BLUE2, margin: 0, textTransform: 'uppercase', letterSpacing: '0.01em' }}>
              You do not need to know the position. You need to know your goalie.
            </p>
          </div>
          <br />
          <VoiceButton label="HEAR COACH MIKE: WHAT THE GOALIE PARENT'S ROLE ACTUALLY IS" />
        </div>
      </section>

      {/* ── E: The Car Ride Home ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #172e68 0%, #0c1e4e 100%)' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 16vw, 240px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>20 MIN</div>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Car Ride Home" />
          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(96,205,255,0.03))', border: '1px solid rgba(96,205,255,0.2)', borderRadius: '18px', padding: 'clamp(24px,3vw,40px)', maxWidth: '820px', marginBottom: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 800, color: '#fff', lineHeight: 1.3, margin: '0 0 12px' }}>
              The car ride home after a bad game is the most influential{' '}
              <span style={{ color: BLUE2 }}>20 minutes</span>{' '}in your goalie&rsquo;s development week.
            </p>
            <p style={{ fontSize: 'clamp(14px, 1.7vw, 18px)', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, margin: 0 }}>Not the practice. Not the game. The 20 minutes after.</p>
          </div>
          <div style={{ maxWidth: '820px', marginBottom: '40px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>What do you say? What should you say? What should you never say?</p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, fontWeight: 600 }}>Nobody taught you this. Nobody gave you the language. Smarter Goalie does.</p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE CAR RIDE HOME AND WHY IT MATTERS MORE THAN THE PRACTICE" />
        </div>
      </section>

      {/* ── F: The Honest Truth About Goalie Development ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #050a18 0%, #070d1c 100%)' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(120px, 18vw, 260px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-8px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>TRUTH</div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Honest Truth About Goalie Development" />
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>Most goalie parents want to help but have never been given the tools to do it effectively.</p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>A parent who understands the position produces a goalie who is easier to coach, more resilient under pressure, and more self-aware for life.</p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '40px', fontWeight: 600 }}>This is not about knowing the technical details. It is about knowing how to support the person in the pads.</p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: WHAT THE BEST GOALIE PARENTS DO DIFFERENTLY" />
        </div>
      </section>

      {/* ── G: What You Receive ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #163068 0%, #0b1e52 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="What You Receive" />
          <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 40px 56px' }}>As a Smarter Goalie Parent you receive:</h2>
          <div style={{ maxWidth: '740px', marginBottom: '40px' }}>
            {[
              { num: '01', label: 'Self-Directed Dashboard', desc: 'A 7 Pillar dashboard — learn about every aspect of your goalie\'s development at your own pace' },
              { num: '02', label: 'The Language', desc: 'The language to have the right conversation after every game and every practice' },
              { num: '03', label: 'Parent Observation Chart', desc: 'A structured way to watch your goalie with educated eyes' },
              { num: '04', label: 'Coach Mike as Your Guide', desc: 'Through every stage of your goalie\'s development' },
              { num: '05', label: 'Direct Connection', desc: 'Access to your goalie\'s progress, charts, and milestones' },
              { num: '06', label: 'Car Ride Home Framework', desc: 'What to say, what not to say, and why it matters' },
            ].map((item, i, arr) => (
              <div key={i} style={{ display: 'flex', gap: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '56px', flexShrink: 0, paddingTop: '18px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: BLUE2, boxShadow: `0 0 0 4px rgba(96,205,255,0.15)`, flexShrink: 0 }} />
                  {i < arr.length - 1 && <div style={{ flex: 1, width: '2px', background: `linear-gradient(180deg, ${BLUE3}, rgba(14,165,233,0.06))`, margin: '6px 0', minHeight: '28px' }} />}
                </div>
                <div style={{ flex: 1, paddingLeft: '8px', paddingBottom: i < arr.length - 1 ? '24px' : '0', paddingTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(96,205,255,0.35)', letterSpacing: '2px' }}>{item.num}</span>
                    <p style={{ fontWeight: 800, color: BLUE2, fontSize: 'clamp(13px, 1.4vw, 16px)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>{item.label}</p>
                  </div>
                  <p style={{ fontSize: 'clamp(14px, 1.5vw, 16px)', color: '#435a72', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginLeft: '56px' }}><VoiceButton label="HEAR COACH MIKE: THE PARENT DASHBOARD AND HOW IT WORKS" /></div>
        </div>
      </section>

      {/* ── H: Parent Observation Chart ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #05101e 0%, #030c18 100%)' }}>
        <div style={{ position: 'absolute', top: '15%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Parent Observation Chart" />
          <p style={{ fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 800, color: '#fff', lineHeight: 1.4, maxWidth: '720px', marginBottom: '24px' }}>
            You are already watching every game. Now you watch with a purpose.
          </p>
          <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.85, maxWidth: '820px', marginBottom: '36px' }}>
            The Parent Observation Chart gives you a structured framework to observe your goalie&rsquo;s development across three levels.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10" style={{ maxWidth: '780px' }}>
            {[
              { level: 'Foundation', desc: 'The base layer — understanding what you are watching and why it matters', shade: 'rgba(55,181,255,0.08)' },
              { level: 'Educated', desc: 'Developing the eye — seeing what the coach sees, not just the outcome', shade: 'rgba(55,181,255,0.06)' },
              { level: 'Cross-Reference', desc: 'Connecting game observations to practice sessions and development goals', shade: 'rgba(96,205,255,0.09)' },
            ].map((item, i) => (
              <div key={i} style={{ background: item.shade, border: '1px solid rgba(96,205,255,0.2)', borderRadius: '16px', padding: '24px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '10px', color: BLUE2, fontWeight: 800, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '10px' }}>LEVEL {i + 1}</p>
                <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{item.level}</p>
                <p style={{ fontSize: '14px', color: '#435a72', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 'clamp(15px, 1.9vw, 19px)', color: '#fff', lineHeight: 1.85, maxWidth: '720px', marginBottom: '40px', fontWeight: 600 }}>
            You do not need to be a hockey expert. You need to be present, consistent, and honest.
          </p>
          <VoiceButton label="HEAR COACH MIKE: THE PARENT OBSERVATION CHART AND WHAT IT REVEALS" />
        </div>
      </section>

      {/* ── I: What Your Goalie Is Building ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #183870 0%, #102e62 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.007) 60px, rgba(255,255,255,0.007) 61px)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(20px, 3vw, 38px)', fontWeight: 900, lineHeight: 1.3, maxWidth: '900px', letterSpacing: '-0.01em', marginBottom: '44px' }}>
            YOUR CHILD IS NOT JUST LEARNING HOW TO STOP A PUCK.{' '}
            <span style={{ color: RED }}>THEY ARE LEARNING HOW TO PERFORM UNDER PRESSURE FOR THE REST OF THEIR LIFE.</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '680px', marginBottom: '36px' }}>
            {[
              'How to perform under pressure with a calm mind',
              'How to self-evaluate honestly and grow from every game',
              'How to lead — goalies are natural leaders. This system builds that deliberately.',
              'How to recover from failure and compete at game speed',
              'Self-awareness that lasts a lifetime — in hockey, in school, and in everything that follows',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(96,205,255,0.1)', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(55,181,255,0.18), rgba(96,205,255,0.1))', border: '1px solid rgba(96,205,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <Check size={12} color={BLUE2} strokeWidth={3} />
                </div>
                <p style={{ fontSize: 'clamp(15px, 1.7vw, 18px)', color: '#dde8f0', lineHeight: 1.7, margin: 0 }}>{item}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.85, maxWidth: '720px', marginBottom: '40px', fontWeight: 600 }}>These are not hockey skills. These are life skills. Smarter Goalie builds both simultaneously.</p>
          <VoiceButton label="HEAR COACH MIKE: WHAT YOUR GOALIE IS ACTUALLY BECOMING" />
        </div>
      </section>

      {/* ── J: Founding Member ── */}
      <section id="apply" style={{ ...sec, background: 'linear-gradient(160deg, #04080f 0%, #070e1c 100%)' }}>
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
          <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', color: '#475569', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 16px' }}>
            Coach Mike is personally selecting one hundred founding members to join the Smarter Goalie BUILD experience.
          </p>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', color: '#2d3f52', lineHeight: 1.85, maxWidth: '640px', margin: '0 auto 52px' }}>
            Not open to the general public. Founding members help build what Smarter Goalie becomes. In return &mdash; Coach Mike&rsquo;s personal attention, direct access, and a founding member rate locked in forever.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            {[
              { num: '01', text: 'Complete the parent questionnaire — 5 minutes' },
              { num: '02', text: 'Coach Mike personally reviews your application — no automation, no filter' },
              { num: '03', text: 'Coach Mike calls you personally' },
            ].map((step) => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(96,205,255,0.1)', borderRadius: '16px', padding: '28px 24px', flex: '1', maxWidth: '240px', width: '100%', margin: '0 auto', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '38px', fontWeight: 900, color: BLUE2, lineHeight: 1, marginBottom: '14px' }}>{step.num}</p>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            style={{ background: RED, color: '#fff', border: 'none', padding: 'clamp(16px,2vw,22px) clamp(32px,4vw,56px)', borderRadius: '12px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(192,0,0,0.35)', transition: 'all 0.2s', display: 'inline-block', marginBottom: '36px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 44px rgba(192,0,0,0.5)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(192,0,0,0.35)'; }}
          >
            APPLY TO JOIN THE EXPERIENCE →
          </button>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <VoiceButton label="HEAR COACH MIKE: WHAT IT MEANS TO BE A FOUNDING MEMBER PARENT" />
          </div>
        </div>
      </section>

      <div style={{ background: '#020408', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '10px', color: '#0f172a', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>&copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER</p>
      </div>
    </div>
  );
}

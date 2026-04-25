'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Building2, Check } from 'lucide-react';

const BLUE = '#37b5ff';
const BLUE2 = '#60cdff';
const BLUE3 = '#0ea5e9';
const RED = '#C00000';
const AMBER = '#d97706';

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

export default function OrganizationPage() {
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
          <Building2 size={13} color={BLUE2} />
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: BLUE2 }}>YOU SELECTED:</span>
          <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '3px', color: '#fff' }}>ORGANIZATION</span>
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
              <p style={{ fontSize: 'clamp(22px, 3.2vw, 38px)', fontWeight: 800, color: BLUE2, margin: '0 0 28px', letterSpacing: '-0.01em' }}>Built for your scale.</p>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'rgba(255,255,255,0.42)', lineHeight: 1.75, margin: 0, maxWidth: '400px' }}>
                Coach Mike recorded this specifically for organizations who made it to this page.
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
          <h2 style={{ fontSize: 'clamp(30px, 5.8vw, 74px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 28px', maxWidth: '1100px' }}>
            YOUR ORGANIZATION DEVELOPS FORWARDS AND DEFENCE.{' '}
            <span style={{ color: RED }}>WHO DEVELOPS YOUR GOALIES?</span>
          </h2>
          <p style={{ fontSize: 'clamp(17px, 2.1vw, 24px)', color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, maxWidth: '780px', margin: '0 0 28px', fontWeight: 500 }}>
            Consistent goaltending development across your entire organization. Every age group. One system. Scalable. Measurable. Built on principles that never change.
          </p>
          <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, rgba(55,181,255,0.09), rgba(96,205,255,0.05))', border: '1px solid rgba(96,205,255,0.22)', borderLeft: `4px solid ${BLUE3}`, borderRadius: '0 12px 12px 0', padding: '16px 28px', marginBottom: '40px', boxShadow: '0 2px 16px rgba(14,165,233,0.08)' }}>
            <p style={{ fontSize: 'clamp(14px, 1.8vw, 22px)', fontWeight: 900, color: BLUE2, margin: 0, textTransform: 'uppercase' }}>One system. Every age group. No gaps.</p>
          </div>
          <br />
          <VoiceButton label="HEAR COACH MIKE: WHAT CONSISTENT ORGANIZATION-WIDE GOALTENDING DEVELOPMENT PRODUCES" />
        </div>
      </section>

      {/* ── E: The Gap ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #172e68 0%, #0c1e4e 100%)' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 14vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>GAP</div>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: '500px', height: '500px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Gap in Every Organization" />
          <div style={{ background: 'linear-gradient(135deg, rgba(192,0,0,0.09), rgba(192,0,0,0.05))', border: '1px solid rgba(192,0,0,0.26)', borderRadius: '16px', padding: 'clamp(24px,3vw,40px)', maxWidth: '820px', marginBottom: '32px', boxShadow: '0 3px 16px rgba(0,0,0,0.25)' }}>
            <p style={{ fontSize: 'clamp(18px, 2.6vw, 30px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>
              Most organizations have systems for every player on the ice{' '}
              <span style={{ color: RED }}>except the most important one.</span>
            </p>
          </div>
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>
              A bad habit developed at the atom level does not correct itself at peewee without a system designed to catch it. Most organizations do not have that system. Smarter Goalie is that system.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '40px', fontWeight: 600 }}>
              Parents choose organizations that can demonstrate measurable goalie development. Can you demonstrate it? What data do you have?
            </p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: WHAT ORGANIZATIONS ARE MISSING AND WHAT IT COSTS THEM" />
        </div>
      </section>

      {/* ── F: What the System Delivers ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #050a18 0%, #070d1c 100%)' }}>
        <div style={{ position: 'absolute', top: '10%', right: '10%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The System" />
          <h2 style={{ fontSize: 'clamp(24px, 3.6vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 40px 56px' }}>What Smarter Goalie delivers to an organization:</h2>
          <div style={{ maxWidth: '740px', marginBottom: '40px' }}>
            {[
              { num: '01', label: 'Foundation to Refinement', desc: 'A complete development pathway from first year goalie to elite level' },
              { num: '02', label: 'Every Age Group Covered', desc: 'One consistent system adapted to the development stage — no gaps, no blind spots' },
              { num: '03', label: 'Organization-Wide Curriculum', desc: 'Every goalie in your program following the same proven framework' },
              { num: '04', label: 'Coach Education at Every Level', desc: 'Your coaches learn alongside your goalies' },
              { num: '05', label: 'Admin Visibility', desc: 'Development data for every goalie at every level across the entire program' },
              { num: '06', label: 'Measurable Results', desc: 'Factor Ratios, charting data, development timelines across cohorts' },
              { num: '07', label: 'Custom Package Model', desc: 'Built for your organization\'s size, structure, and goals' },
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
          <div style={{ marginLeft: '56px' }}><VoiceButton label="HEAR COACH MIKE: THE ORGANIZATION-WIDE SYSTEM AND HOW IT IS STRUCTURED" /></div>
        </div>
      </section>

      {/* ── G: Scalability Architecture ── */}
      <section style={{ ...sec, background: 'linear-gradient(140deg, #163068 0%, #0b1e52 100%)' }}>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(96,205,255,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,255,255,0.007) 60px, rgba(255,255,255,0.007) 61px)', pointerEvents: 'none' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Scalability Architecture" />
          <h2 style={{ fontSize: 'clamp(28px, 4.4vw, 56px)', fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', lineHeight: 1.05, marginBottom: '32px' }}>
            ONE SYSTEM.<br /><span style={{ color: AMBER }}>UNLIMITED SCALE.</span>
          </h2>
          <div style={{ maxWidth: '820px', marginBottom: '36px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>
              Smarter Goalie&rsquo;s architecture is built to grow with your organization. Whether you have 10 goalies or 500 &mdash; the system delivers the same consistent development framework to every one of them.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, fontWeight: 600 }}>
              Admin controls all permissions. Every goalie, parent, and coach in your program operates within the structure you define. Nothing goes unseen.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10" style={{ maxWidth: '740px' }}>
            {[{ n: '10', label: 'Goalies' }, { n: '50', label: 'Goalies' }, { n: '200', label: 'Goalies' }, { n: '500+', label: 'Goalies' }].map((item, i) => (
              <div key={i} style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.1), rgba(217,119,6,0.05))', border: '1px solid rgba(217,119,6,0.25)', borderRadius: '14px', padding: '22px 16px', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: 'clamp(26px,3.8vw,40px)', fontWeight: 900, color: AMBER, lineHeight: 1, marginBottom: '6px' }}>{item.n}</p>
                <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</p>
                <p style={{ fontSize: '10px', color: '#334155', margin: 0 }}>Same system</p>
              </div>
            ))}
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE SCALABILITY ARCHITECTURE AND ADMIN CONTROLS" />
        </div>
      </section>

      {/* ── H: Custom Package ── */}
      <section style={{ ...sec, background: 'linear-gradient(135deg, #05101e 0%, #030c18 100%)' }}>
        <div style={{ position: 'absolute', top: '15%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-30px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(100px, 14vw, 200px)', fontWeight: 900, color: 'rgba(255,255,255,0.022)', letterSpacing: '-6px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none', textTransform: 'uppercase' }}>CUSTOM</div>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <SectionLabel text="The Custom Package" />
          <div style={{ maxWidth: '820px' }}>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '22px', fontWeight: 600 }}>
              Smarter Goalie does not offer a one-size-fits-all organization package. We build yours.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: 'rgba(184,212,232,0.9)', lineHeight: 1.9, marginBottom: '22px' }}>
              Every organization is different in size, structure, competitive level, and development philosophy. Your package is designed around what your organization actually needs.
            </p>
            <p style={{ fontSize: 'clamp(17px, 2.1vw, 22px)', color: '#fff', lineHeight: 1.9, marginBottom: '40px', fontWeight: 600 }}>
              The conversation starts with Coach Mike. Not a sales team. Not an automated system. Coach Mike.
            </p>
          </div>
          <VoiceButton label="HEAR COACH MIKE: THE CUSTOM PACKAGE MODEL AND WHAT THE FIRST CONVERSATION LOOKS LIKE" />
        </div>
      </section>

      {/* ── I: Founding Partner ── */}
      <section id="package" style={{ ...sec, background: 'linear-gradient(160deg, #04080f 0%, #070e1c 100%)' }}>
        <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(200px, 30vw, 440px)', fontWeight: 900, color: 'rgba(255,255,255,0.02)', letterSpacing: '-20px', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>100</div>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', width: '800px', height: '800px', background: 'radial-gradient(ellipse, rgba(55,181,255,0.06) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 text-center w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.32)', borderRadius: '50px', padding: '8px 20px', marginBottom: '28px', boxShadow: '0 2px 12px rgba(217,119,6,0.12)' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: AMBER, boxShadow: '0 0 0 3px rgba(217,119,6,0.22)', flexShrink: 0 }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: AMBER, margin: 0, textTransform: 'uppercase' }}>Founding Partner Opportunity</p>
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 66px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '24px' }}>
            THIS IS THE EXPERIENCE<br /><span style={{ color: BLUE2 }}>BUILDING PHASE</span>
          </h2>
          <p style={{ fontSize: 'clamp(16px, 2vw, 21px)', color: '#475569', lineHeight: 1.8, maxWidth: '680px', margin: '0 auto 16px' }}>
            Organizations that join during the Experience Building Phase become founding partners.
          </p>
          <p style={{ fontSize: 'clamp(14px, 1.5vw, 17px)', color: '#2d3f52', lineHeight: 1.85, maxWidth: '640px', margin: '0 auto 52px' }}>
            The relationship we build with you during this phase shapes how Smarter Goalie serves organizations at every level for years to come.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            {[
              { num: '01', text: 'Complete the organization inquiry form — 5 minutes' },
              { num: '02', text: 'Coach Mike personally reviews your inquiry' },
              { num: '03', text: "Coach Mike calls you personally to discuss your organization's needs" },
            ].map((step) => (
              <div key={step.num} style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(217,119,6,0.14)', borderRadius: '16px', padding: '28px 24px', flex: '1', maxWidth: '240px', width: '100%', margin: '0 auto', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
                <p style={{ fontSize: '38px', fontWeight: 900, color: AMBER, lineHeight: 1, marginBottom: '14px' }}>{step.num}</p>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.65, margin: 0 }}>{step.text}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            style={{ background: AMBER, color: '#fff', border: 'none', padding: 'clamp(16px,2vw,22px) clamp(32px,4vw,56px)', borderRadius: '12px', fontSize: 'clamp(13px,1.5vw,16px)', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer', textTransform: 'uppercase', boxShadow: '0 8px 32px rgba(217,119,6,0.38)', transition: 'all 0.2s', display: 'inline-block', marginBottom: '36px' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 14px 44px rgba(217,119,6,0.58)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 32px rgba(217,119,6,0.38)'; }}
          >
            BUILD A PACKAGE →
          </button>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <VoiceButton label="HEAR COACH MIKE: WHAT THE FOUNDING ORGANIZATION RELATIONSHIP LOOKS LIKE" />
          </div>
        </div>
      </section>

      <div style={{ background: '#020408', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <p style={{ fontSize: '10px', color: '#0f172a', letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', margin: 0 }}>&copy; 2026 SMARTER GOALIE INC. | THE INTELLIGENT ATHLETIC GOALTENDER</p>
      </div>
    </div>
  );
}

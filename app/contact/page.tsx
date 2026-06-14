'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const BLUE  = '#37b5ff';
const BLUE2 = '#60cdff';
const GOLD  = '#D4A93B';
const MUTED = 'rgba(255,255,255,0.45)';

const CARD_BG   = 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)';
const CARD_BDR  = '1px solid rgba(55,181,255,0.18)';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  background: 'rgba(4,33,63,0.8)',
  border: `1px solid rgba(212,169,59,0.22)`,
  borderRadius: '10px',
  color: '#fff',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  color: GOLD,
  marginBottom: '7px',
};

export default function ContactPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', role: '', organisation: '', location: '',
    teams: '', goalies: '', goals: '', email: '', phone: '',
    preferred_contact: '', consent: false,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const navBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px',
    color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px',
  };

  return (
    <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif', color: '#fff', background: '#000f28' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(212,169,59,.4)} 50%{box-shadow:0 0 0 10px rgba(212,169,59,0)} }
        .contact-input:focus { border-color: ${GOLD} !important; box-shadow: 0 0 0 3px rgba(212,169,59,.12) !important; }
        .contact-input::placeholder { color: rgba(255,255,255,0.22); }
        .contact-input option { background: #04213f; color: #fff; }
        .section-card { background: ${CARD_BG}; border: ${CARD_BDR}; border-radius: 16px; }
        .cta-btn:hover { opacity: 0.88; transform: translateY(-2px); }
      `}} />

      {/* ── NAV ── */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <img src="/logo.png" alt="Smarter Goalie" className="h-10 sm:h-11 w-auto object-contain" />
          </button>
          <div className="hidden sm:flex gap-6 items-center">
            <button onClick={() => router.push('/who-we-are')} style={navBtnStyle}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ea5e9' }} />WHO WE ARE
            </button>
            <button onClick={() => router.push('/the-system')} style={navBtnStyle}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0f172a' }} />THE SYSTEM
            </button>
            <button style={{ background: `linear-gradient(135deg, ${BLUE}, #0ea5e9)`, border: 'none', borderRadius: '50px', padding: '9px 20px', cursor: 'default', fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', color: '#fff', boxShadow: '0 2px 12px rgba(55,181,255,0.3)' }}>
              CONTACT US
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(80px,10vw,120px) 0', background: 'linear-gradient(145deg, #050912 0%, #0d2848 60%, #091830 100%)' }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-8%', width: '55vw', height: '55vw', maxWidth: '680px', background: `radial-gradient(ellipse, rgba(55,181,255,0.1) 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: `radial-gradient(ellipse, rgba(212,169,59,0.06) 0%, transparent 65%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, ${BLUE}55, transparent)` }} />

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: `rgba(212,169,59,0.1)`, border: `1px solid rgba(212,169,59,0.3)`, borderRadius: '50px', padding: '8px 20px', marginBottom: '32px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: GOLD, boxShadow: `0 0 0 3px rgba(212,169,59,0.25)` }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: GOLD, margin: 0, textTransform: 'uppercase' }}>Organisations · Federations · Hockey Businesses</p>
          </div>

          <div style={{ display: 'inline-block', marginBottom: '12px', fontSize: '11px', fontWeight: 700, letterSpacing: '.22em', color: BLUE2, border: `1px solid rgba(96,205,255,0.3)`, borderRadius: '99px', padding: '7px 18px', textTransform: 'uppercase' }}>
            A Self-Generating, Turn-Key Goaltending Operation
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 7vw, 88px)', fontWeight: 900, lineHeight: 0.95, letterSpacing: '-0.03em', margin: '0 0 22px', color: '#fff' }}>
            YOUR OPERATION.<br />
            YOUR BRAND.<br />
            <span style={{ color: BLUE2 }}>OUR SIX DECADES</span><br />
            <span style={{ color: BLUE2 }}>BEHIND IT.</span>
          </h1>

          <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: MUTED, lineHeight: 1.75, maxWidth: '540px', margin: '0 0 44px' }}>
            Smarter Goalie enhances what your operation already is — working with all circumstances, tailoring the experience and our expertise to your brand.
          </p>

          <button
            onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', background: `linear-gradient(135deg, ${GOLD}, #B8891E)`, border: 'none', borderRadius: '12px', padding: '14px 32px', color: '#0c0800', fontSize: '13px', fontWeight: 800, letterSpacing: '.5px', cursor: 'pointer', boxShadow: `0 6px 24px rgba(212,169,59,0.35)`, transition: 'all .2s' }}
            className="cta-btn"
          >
            SET UP THE CALL →
          </button>
        </div>
      </section>

      {/* ── CREDENTIALS ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: 'linear-gradient(150deg, #061a38 0%, #0a2848 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: GOLD, textTransform: 'uppercase', marginBottom: '10px' }}>Why We Get to Say This</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '8px' }}>
            We Have Done It All.
          </h2>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: BLUE2, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '36px' }}>
            For Over Six Decades.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="section-card" style={{ padding: '28px' }}>
              <div style={{ width: '44px', height: '3px', background: GOLD, borderRadius: '99px', marginBottom: '16px' }} />
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85 }}>
                Smarter Goalie was not assembled from theory. It was earned — six decades of studying, deciphering, and creating <b style={{ color: BLUE2 }}>an original teaching philosophy that simplifies the position and the game itself</b>: the mysteries of the net broken down into a system that can be taught, learned, and proven.
              </p>
            </div>
            <div className="section-card" style={{ padding: '28px' }}>
              <div style={{ width: '44px', height: '3px', background: BLUE2, borderRadius: '99px', marginBottom: '16px' }} />
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85 }}>
                Over five decades of running clinics, building camps, and delivering custom programs — developing goalies at every age and every level — across organisations, federations, sports academies, facilities, grassroots programs, and education institutions.
              </p>
            </div>
          </div>

          <div style={{ background: `rgba(212,169,59,0.08)`, border: `1px solid rgba(212,169,59,0.28)`, borderLeft: `4px solid ${GOLD}`, borderRadius: '0 16px 16px 0', padding: '28px 32px', maxWidth: '860px' }}>
            <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
              The experience Smarter Goalie brings goes back to opening{' '}
              <b style={{ color: GOLD, fontStyle: 'normal' }}>the first year-round goalie school</b>{' '}
              in Toronto, Canada — the Mecca of hockey — in the early '80s.
            </p>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: 'radial-gradient(ellipse at 60% 30%, #0a1e42 0%, #050912 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: GOLD, textTransform: 'uppercase', marginBottom: '10px' }}>The Most Important Position on the Team</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '6px' }}>
            How the Goalie Goes —
          </h2>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: BLUE2, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '40px' }}>
            The Team Goes.
          </h2>

          <div style={{ maxWidth: '760px', marginBottom: '36px' }}>
            <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '20px' }}>
              Goalies carry a leadership role whether they ask for it or not — so getting to know each goalie is critical to advancing them as a person, as an athlete, and as a goaltender. Their personal <b style={{ color: BLUE2 }}>Baseline Profile</b> starts their journey on a unique, intuitive teaching system built exclusively for the most important person — and position — on the team.
            </p>
            <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 800, color: '#fff', lineHeight: 1.4 }}>
              <span style={{ color: BLUE2 }}>Confident goalie, confident bench.</span>{' '}
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Weak goalie, deflated bench.</span>
            </p>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '36px' }}>
            {['Self-Evaluation', 'Self-Coaching', 'Practice Formatting', 'Game Performance Analytics'].map(s => (
              <span key={s} style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.06em', border: `1px solid rgba(55,181,255,0.28)`, color: BLUE2, borderRadius: '99px', padding: '10px 20px', background: 'rgba(4,33,63,0.8)' }}>{s}</span>
            ))}
          </div>

          <p style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 800, color: BLUE2, lineHeight: 1.4, maxWidth: '680px' }}>
            We build athletes for life and for the game of hockey — and we build starters. That's Smarter Goalie.
          </p>
        </div>
      </section>

      {/* ── SUPPORTING CAST ── */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: 'linear-gradient(150deg, #061830 0%, #0c2542 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: GOLD, textTransform: 'uppercase', marginBottom: '10px' }}>The Supporting Cast</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '6px' }}>
            Nobody Stands in the Crease
          </h2>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 64px)', fontWeight: 900, color: BLUE2, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '44px' }}>
            Alone.
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            <div className="section-card" style={{ padding: '28px', borderTop: `3px solid ${BLUE2}` }}>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '16px' }}>
                Behind every goalie stands a parent who wants to help and a coach who wants answers — and Smarter Goalie puts both to work. We are active in parent support, and we welcome the coach to <b style={{ color: BLUE2 }}>engage and learn at their own speed — never any pressure</b>.
              </p>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85 }}>
                What that builds is a <b style={{ color: BLUE2 }}>full, impact-driven experience</b> — one that captures every minute of learning impact, in team practice and private practice alike.
              </p>
            </div>
            <div className="section-card" style={{ padding: '28px', borderTop: `3px solid ${GOLD}` }}>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, marginBottom: '16px' }}>
                Every goalie in your program carries a living history: from baseline profile through every chart, every reflection, every season — data they keep, to reflect on, to reaffirm their goals are being met.
              </p>
              <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85 }}>
                That history is what makes the relationship <b style={{ color: GOLD }}>long-term</b> — your program doesn't get a season of help. It gets a system that stays.
              </p>
            </div>
          </div>

          <div style={{ background: `rgba(55,181,255,0.07)`, border: `1px solid rgba(55,181,255,0.2)`, borderLeft: `4px solid ${BLUE}`, borderRadius: '0 16px 16px 0', padding: '24px 28px', maxWidth: '780px' }}>
            <p style={{ fontSize: 'clamp(15px, 1.6vw, 17px)', color: 'rgba(184,212,232,0.88)', lineHeight: 1.85, margin: 0 }}>
              We meet you where your organisation wants to go — <b style={{ color: BLUE2 }}>your goals, your budget, your vision</b>. And if the vision isn't fully formed yet, Smarter Goalie can help you build that too.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section id="contact-form" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: 'radial-gradient(ellipse at 35% 65%, #04152e 0%, #070f1e 100%)' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3.5px', color: GOLD, textTransform: 'uppercase', marginBottom: '10px' }}>Start Here</p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 900, color: '#fff', lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '6px' }}>
            A Few Specific Questions.
          </h2>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 900, color: BLUE2, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: '36px' }}>
            Then a Call on the Calendar.
          </h2>

          {/* Process steps */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '14px' }}>
            {[['Answer the Questions', GOLD], ['→', null], ['Pick Your Time', BLUE2], ['→', null], ['We Chat', BLUE]].map(([label, color], i) => (
              color === null
                ? <span key={i} style={{ color: GOLD, fontSize: '18px', fontWeight: 700 }}>{label}</span>
                : <span key={i} style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', border: `1px solid ${color}55`, color: color as string, borderRadius: '99px', padding: '10px 20px', background: 'rgba(4,33,63,0.8)', textTransform: 'uppercase' }}>{label}</span>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: MUTED, fontStyle: 'italic', marginBottom: '32px' }}>
            Direct to the Smarter Goalie team — a real conversation about where your program wants to go.
          </p>

          {submitted ? (
            <div style={{ background: CARD_BG, border: `1px solid rgba(212,169,59,0.35)`, borderRadius: '20px', padding: '56px 32px', textAlign: 'center', maxWidth: '600px' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>✓</div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '12px', color: GOLD }}>Your answers are on their way.</h3>
              <p style={{ fontSize: '16px', color: MUTED, lineHeight: 1.7 }}>
                The Smarter Goalie team will be in touch to set up the call. We look forward to hearing about your program.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ background: CARD_BG, border: CARD_BDR, borderRadius: '20px', padding: 'clamp(24px,4vw,40px)', maxWidth: '900px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Your Name</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="First and last name" required style={inputStyle} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Your Role</label>
                  <select name="role" value={form.role} onChange={handleChange} required style={inputStyle} className="contact-input">
                    <option value="" disabled>Select your role…</option>
                    {['Head Coach','Goalie Coach','Team Manager','Organisation / Association Executive','Federation Representative','Camp Director / Hockey Business','Sports Academy / Facility Director','Education Institution','Grassroots Program','Parent Group Representative','Other'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Organisation / Program Name</label>
                  <input name="organisation" value={form.organisation} onChange={handleChange} placeholder="Your organisation, team, or business" required style={inputStyle} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Location <span style={{ color: MUTED, textTransform: 'none', letterSpacing: 0, fontWeight: 'normal' }}>(city & region)</span></label>
                  <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Vaughan, Ontario" required style={inputStyle} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Teams in Your Program</label>
                  <select name="teams" value={form.teams} onChange={handleChange} style={inputStyle} className="contact-input">
                    <option value="" disabled>Select…</option>
                    {['1 team','2–5 teams','6–15 teams','16+ teams','Camp / seasonal program'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Goaltenders in Your Program</label>
                  <select name="goalies" value={form.goalies} onChange={handleChange} style={inputStyle} className="contact-input">
                    <option value="" disabled>Select…</option>
                    {['1–2','3–10','11–30','31+'].map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Your Program's Goals <span style={{ color: MUTED, textTransform: 'none', letterSpacing: 0, fontWeight: 'normal' }}>(in your own words)</span></label>
                  <textarea name="goals" value={form.goals} onChange={handleChange} placeholder="Where does your organisation want to go? What would a goaltending standard change for your teams, your coaches, your parents, your goalies?" style={{ ...inputStyle, minHeight: '130px', resize: 'vertical' }} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required style={inputStyle} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <label style={labelStyle}>Phone <span style={{ color: MUTED, textTransform: 'none', letterSpacing: 0, fontWeight: 'normal' }}>(optional)</span></label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="For the call" style={inputStyle} className="contact-input" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Preferred Way to Talk</label>
                  <select name="preferred_contact" value={form.preferred_contact} onChange={handleChange} style={inputStyle} className="contact-input">
                    <option value="" disabled>Select…</option>
                    {['Phone call','Video call','Email first'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '13px', color: MUTED, lineHeight: 1.6, gridColumn: '1 / -1' }}>
                  <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} required style={{ width: 'auto', marginTop: '3px', accentColor: GOLD }} />
                  <span>I'd like Smarter Goalie to contact me about my program. My information stays with Smarter Goalie — never sold, never shared.</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button type="submit" className="cta-btn" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '.14em', textTransform: 'uppercase', color: '#0c0800', background: `linear-gradient(135deg, ${GOLD}, #B8891E)`, border: 'none', borderRadius: '12px', padding: '16px 44px', cursor: 'pointer', boxShadow: `0 6px 24px rgba(212,169,59,0.35)`, transition: 'all .2s' }}>
                  Set Up the Call
                </button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '12px', color: MUTED, fontStyle: 'italic', marginTop: '14px' }}>
                Your answers reach the Smarter Goalie team directly — and the calendar opens to pick your time.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* ── CLOSING ── */}
      <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(60px,8vw,100px) 0', background: 'linear-gradient(160deg, #040f24 0%, #061a38 100%)', textAlign: 'center' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 w-full">
          <div style={{ maxWidth: '760px', margin: '0 auto' }}>
            <p style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.3, color: '#fff', marginBottom: '8px' }}>
              We build the human behind the goalie.
            </p>
            <p style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.3, color: '#fff', marginBottom: '8px' }}>
              We build athletes for life.
            </p>
            <p style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 900, lineHeight: 1.3, color: BLUE2, marginBottom: '28px' }}>
              We build starters.
            </p>
            <p style={{ fontSize: 'clamp(16px, 2vw, 20px)', color: MUTED, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700 }}>
              That's Smarter Goalie. <span style={{ color: GOLD }}>Think Smart. Play Smart.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#061530', padding: '28px 24px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '10px', color: MUTED, letterSpacing: '3px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
          Turn-Key Goaltending · Tell Us About Your Program
        </p>
        <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>
          Organisations · Federations · Camps · Hockey Businesses · Academies · Facilities · Grassroots · Education · © 2026 Smarter Goalie Inc.
        </p>
      </footer>
    </div>
  );
}

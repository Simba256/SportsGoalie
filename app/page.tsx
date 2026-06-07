'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack/ScrollStack';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';

const MIND_VAULT_GEMS = [
  {
    label: 'THE FOUNDATION',
    gem: 'Regardless how technically strong you are — if the mind is not the strongest tool you have, then what is your foundation built on?',
  },
  {
    label: 'THE MIND-VAULT',
    gem: 'The discipline of building where only the most valuable foundational thoughts and behaviors are kept. For game performance. And for life in general.',
  },
  {
    label: 'YOUR FILTERS',
    gem: 'Logic, Common Sense, Math, and Science become your filters — applied to every read, every shift, every decision.',
  },
  {
    label: 'PERFORMANCE VS OUTCOME',
    gem: 'Learn the difference between performance and outcome — and understand why the goalie controls one, not the other.',
  },
  {
    label: 'THE BENCH',
    gem: 'How the goalie goes reflects on the bench. A solid goalie lifts the bench. An inconsistent goalie deflates it.',
  },
  {
    label: 'SIX DECADES OF ORIGINAL IP',
    gem: 'One foundation. Built over sixty years. Proven on every goalie it has ever touched. The MIND-VAULT is yours to build.',
  },
];

function MindVaultGemPanel() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setActive(a => (a + 1) % MIND_VAULT_GEMS.length), 4500);
    return () => clearInterval(iv);
  }, []);
  const gem = MIND_VAULT_GEMS[active];
  return (
    <section style={{ padding: 'clamp(48px,7vw,80px) clamp(16px,3vw,20px)', background: 'linear-gradient(180deg, #041530 0%, #000f28 100%)', borderTop: '1px solid rgba(167,139,250,0.1)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px rgba(167,139,250,0.8)' }} />
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', color: '#a78bfa', textTransform: 'uppercase', margin: 0 }}>THE MIND-VAULT — DAILY GEMS</p>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 10px rgba(167,139,250,0.8)' }} />
        </div>

        {/* Gem card */}
        <div style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.1) 0%, rgba(6,30,70,0.98) 60%, rgba(109,40,217,0.06) 100%)', border: '1px solid rgba(167,139,250,0.28)', borderRadius: '20px', padding: 'clamp(28px,4vw,48px)', textAlign: 'center', minHeight: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', boxShadow: '0 4px 32px rgba(167,139,250,0.1)', transition: 'all 0.4s ease' }}>
          <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '3px', color: 'rgba(167,139,250,0.7)', textTransform: 'uppercase', margin: 0 }}>{gem.label}</p>
          <p style={{ fontSize: 'clamp(16px,2.2vw,22px)', color: '#fff', lineHeight: 1.75, maxWidth: '680px', margin: 0, fontStyle: 'italic' }}>
            &ldquo;{gem.gem}&rdquo;
          </p>
        </div>

        {/* Navigation dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          {MIND_VAULT_GEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{ width: i === active ? '24px' : '8px', height: '8px', borderRadius: i === active ? '4px' : '50%', background: i === active ? '#a78bfa' : 'rgba(167,139,250,0.25)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s', boxShadow: i === active ? '0 0 8px rgba(167,139,250,0.6)' : 'none' }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const router = useRouter();

  const testimonials = [
    {
      author: {
        name: 'Tyler Bouchard',
        handle: '@tylerbouchard_g',
        avatar:
          'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=150&h=150&fit=crop&crop=face',
      },
      text: 'The angle-mark system changed how I read plays entirely. I used to guess my positioning — now I own my crease with confidence every game.',
    },
    {
      author: {
        name: 'Sandra Lafleur',
        handle: '@sandraL_hockeymom',
        avatar:
          'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face',
      },
      text: 'My son used to come off the ice frustrated with no idea what went wrong. Now he logs his sessions, reviews the feedback, and shows up next practice with a real plan.',
    },
    {
      author: {
        name: 'Coach Rémi Tremblay',
        handle: '@remitremblay_goalie',
        avatar:
          'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
      },
      text: 'I coach AAA midget goalies in Québec and this platform fills a gap nothing else does. The charting tools give me data I can actually coach from — not just gut feelings.',
    },
    {
      author: {
        name: 'Kaitlyn MacPherson',
        handle: '@kaitlyn_saves',
        avatar:
          'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
      },
      text: 'As a female goalie in a program that rarely focuses on us specifically, Smarter Goalie finally feels like it was built for me. The seven-point system alone is worth it.',
    },
    {
      author: {
        name: 'Derek Kowalski',
        handle: '@dkowalski_pads',
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      },
      text: 'I\'ve been playing rep hockey in Ontario for six years. Nothing has improved my rebound control and breakout reading faster than the video quizzes on this platform.',
    },
    {
      author: {
        name: 'Lucie Gagnon',
        handle: '@lucieg_parentBC',
        avatar:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      },
      text: 'The coach sends weekly notes through the app and I can actually follow along with my daughter\'s development. For the first time I feel like part of her training, not just a driver.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative min-h-screen overflow-hidden flex flex-col"
        style={{ backgroundColor: '#000f28' }}
      >
        {/* Background image — clearly visible */}
        <img
          src="/quality.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0, filter: 'brightness(0.88) saturate(1.15)' }}
        />

        {/* Left-to-right gradient — strong on left for text, fades to almost nothing on right */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: 'linear-gradient(90deg, rgba(0,8,28,0.97) 0%, rgba(0,10,35,0.93) 25%, rgba(0,12,38,0.72) 45%, rgba(0,10,30,0.25) 65%, transparent 100%)',
            zIndex: 1,
          }}
        />
        {/* Mobile: lighter overlay so image still shows */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: 'rgba(0,8,28,0.78)', zIndex: 1 }}
        />

        {/* Subtle bottom fade to match next section */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(0,8,28,0.55) 80%, #000f28 100%)', zIndex: 2 }}
        />

        {/* ── NAV BAR ── */}
        <nav className="relative flex items-center justify-between px-6 md:px-12 py-5" style={{ zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: '#37b5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#000f28" />
              </svg>
            </div>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
              SMARTER <span style={{ color: '#37b5ff' }}>GOALIE</span>
            </span>
          </div>

          {/* Nav links — desktop only */}
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'For Goalies', 'For Parents'].map((item) => (
              <span key={item} style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', letterSpacing: '0.2px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >{item}</span>
            ))}
            <a href="tel:+14169390555" style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.55)', textDecoration: 'none', letterSpacing: '0.2px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#37b5ff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
            >+1 (416) 939-0555</a>
          </div>

          {/* Login CTA */}
          <button
            onClick={() => router.push('/auth/login')}
            className="hover:opacity-90 transition-opacity"
            style={{ background: 'rgba(55,181,255,0.15)', border: '1px solid rgba(55,181,255,0.45)', color: '#37b5ff', padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            Login
          </button>
        </nav>

        {/* ── HERO CONTENT ── */}
        <div className="relative flex-1 flex items-center" style={{ zIndex: 10 }}>
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20">
            {/* Content lives in the left ~45% on desktop, full width on mobile */}
            <div className="w-full md:max-w-[520px]">

              {/* Eyebrow */}
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#37b5ff', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '16px' }}>
                WELCOME TO
              </p>

              {/* Brand name */}
              <h1
                className="font-black uppercase leading-none mb-6"
                style={{ fontSize: 'clamp(52px, 8vw, 96px)', letterSpacing: '-0.03em', lineHeight: 0.88 }}
              >
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #ffffff 0%, #c8e8ff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>SMARTER</span>
                <span style={{
                  display: 'block',
                  color: 'transparent',
                  WebkitTextStroke: '3px #37b5ff',
                  filter: 'drop-shadow(0 0 18px rgba(55,181,255,0.7))',
                }}>GOALIE</span>
              </h1>

              {/* Accent line */}
              <div style={{ width: '48px', height: '3px', background: '#37b5ff', borderRadius: '99px', marginBottom: '24px', boxShadow: '0 0 10px rgba(55,181,255,0.6)' }} />

              {/* Sub-headline */}
              <h2
                className="font-bold uppercase mb-3"
                style={{ fontSize: 'clamp(13px, 1.8vw, 18px)', lineHeight: 1.4, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}
              >
                Are goalies the{' '}
                <em style={{ color: '#37b5ff', fontStyle: 'normal' }}>worst trained</em>{' '}
                athletes in sports?
              </h2>

              <p
                className="uppercase font-semibold mb-10"
                style={{ color: 'rgba(255,255,255,0.38)', letterSpacing: '2.5px', fontSize: '10px' }}
              >
                HERE IS WHAT WE KNOW.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                {/* Video button */}
                <button
                  className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: 'rgba(55,181,255,0.12)', border: '1px solid rgba(55,181,255,0.45)', color: '#fff', padding: '12px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', borderRadius: '6px', whiteSpace: 'nowrap' }}
                >
                  <span className="flex items-center justify-center shrink-0" style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#37b5ff', color: '#000f28', fontSize: '9px', fontWeight: 900 }}>▶</span>
                  COACH MIKE
                </button>

                {/* Primary CTA */}
                <button
                  onClick={() => router.push('/explain')}
                  className="hover:opacity-90 hover:scale-[1.02] transition-all duration-200"
                  style={{ background: '#37b5ff', color: '#000f28', fontWeight: 800, fontSize: '11px', letterSpacing: '2px', padding: '12px 28px', textTransform: 'uppercase', borderRadius: '6px', whiteSpace: 'nowrap' }}
                >
                  LET US EXPLAIN →
                </button>
              </div>

             
            </div>
          </div>
        </div>

        {/* Bottom brand watermark */}
        <div className="relative pb-6 flex justify-center md:justify-end md:px-12" style={{ zIndex: 2 }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.18)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            © SMARTER GOALIE
          </span>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <>
          <section id="features" className="pt-20 pb-0" style={{ background: 'linear-gradient(180deg, #000f28 0%, #041530 100%)' }}>
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 mb-12">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">WHAT WE DO</h2>
                <span className="text-xl font-semibold" style={{ color: '#37b5ff' }}>1/5</span>
              </div>
            </div>
            <ScrollStack useWindowScroll={true} itemDistance={200} itemScale={0.02} itemStackDistance={30} stackPosition="20%" scaleEndPosition="15%" baseScale={0.95}>
              {/* 1 — The 7 Pillars of Intelligent Goaltending */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.45)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(55,181,255,0.08)' }}>
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[420px] md:h-[560px]">
                      <div className="h-56 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url("/7-pillars.png")' }}></div>
                      <div className="p-7 md:p-12 flex flex-col justify-center">
                        <div className="text-right mb-4"><span className="text-lg font-semibold" style={{ color: '#37b5ff' }}>1/5</span></div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">THE 7 PILLARS</h3>
                        <p className="text-lg md:text-xl mb-6" style={{ color: '#37b5ff' }}>Learn Smart. Play Smart. Stay Consistent.</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">We build Intelligent Athletic Goaltenders through 7 Pillars — from MIND-SET and Skating Tech to our Seven Angle-Mark System, Seven Point System, Form Tech, TEAM-PRACTICE, and LIFE STYLE.</p>
                        <p className="text-zinc-400 text-sm mb-6">Master each pillar and unlock consistency you can repeat every game.</p>
                        <button className="text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit hover:opacity-85" style={{ background: 'linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)', boxShadow: '0 4px 16px rgba(55,181,255,0.25)' }}><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 2 — Video Learning */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.45)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(55,181,255,0.08)' }}>
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[420px] md:h-[560px]">
                      <div className="h-56 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_2.png")' }}></div>
                      <div className="p-7 md:p-12 flex flex-col justify-center">
                        <div className="text-right mb-4"><span className="text-lg font-semibold" style={{ color: '#37b5ff' }}>2/5</span></div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">VIDEO LEARNING</h3>
                        <p className="text-lg md:text-xl mb-6" style={{ color: '#37b5ff' }}>Structured lessons you can replay</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">YouTube-integrated video lessons organised into structured modules covering technique, positioning, decision-making, and game sense. Track completion per lesson, pick up where you left off, and learn at your own pace.</p>
                        <button className="text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit hover:opacity-85" style={{ background: 'linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)', boxShadow: '0 4px 16px rgba(55,181,255,0.25)' }}><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 3 — Performance Analytics & Gap Management */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.45)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(55,181,255,0.08)' }}>
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[420px] md:h-[560px]">
                      <div className="h-56 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_3.png")' }}></div>
                      <div className="p-7 md:p-12 flex flex-col justify-center">
                        <div className="text-right mb-4"><span className="text-lg font-semibold" style={{ color: '#37b5ff' }}>3/5</span></div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">ANALYTICS & GAP MANAGEMENT</h3>
                        <p className="text-lg md:text-xl mb-6" style={{ color: '#37b5ff' }}>See what others miss</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">Chart every game and practice session. Our analytics reveal your consistency patterns, good vs. bad goal ratios, and pinpoint exactly which skills need work.</p>
                        <p className="text-zinc-400 text-sm mb-6">Nothing is left to imagination — advance with confidence knowing precisely where you stand.</p>
                        <button className="text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit hover:opacity-85" style={{ background: 'linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)', boxShadow: '0 4px 16px rgba(55,181,255,0.25)' }}><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 4 — Goaltending: A Chess Game */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.45)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(55,181,255,0.08)' }}>
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[420px] md:h-[560px]">
                      <div className="h-56 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_4.png")' }}></div>
                      <div className="p-7 md:p-12 flex flex-col justify-center">
                        <div className="text-right mb-4"><span className="text-lg font-semibold" style={{ color: '#37b5ff' }}>4/5</span></div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">THE CHESS GAME</h3>
                        <p className="text-lg md:text-xl mb-6" style={{ color: '#37b5ff' }}>Think Smart. Play Smart. Read the Play.</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">Our video-questionnaire and quiz system assesses your decision-making from a goalie&rsquo;s point of view. We identify your knowledge gaps, then build your personalised &ldquo;UP YOUR GAME&rdquo; learning path.</p>
                        <p className="text-zinc-400 text-sm mb-6">Outsmart the shooter before the puck leaves their stick.</p>
                        <button className="text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit hover:opacity-85" style={{ background: 'linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)', boxShadow: '0 4px 16px rgba(55,181,255,0.25)' }}><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 5 — Session Charting */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
                  <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.45)', boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(55,181,255,0.08)' }}>
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[420px] md:h-[560px]">
                      <div className="h-56 md:h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_5.png")' }}></div>
                      <div className="p-7 md:p-12 flex flex-col justify-center">
                        <div className="text-right mb-4"><span className="text-lg font-semibold" style={{ color: '#37b5ff' }}>5/5</span></div>
                        <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4">SESSION CHARTING</h3>
                        <p className="text-lg md:text-xl mb-6" style={{ color: '#37b5ff' }}>Our flagship goalie feature</p>

                        <p className="text-zinc-300 leading-relaxed mb-8">Log every shot, save, and goal against — period by period. Rate yourself across 8 performance factors like Intensity, Positional Play, and Reading the Breakout. Low ratings trigger a personalised growth menu that connects you to the exact lessons you need.</p>
                        <button className="text-white px-8 py-3 rounded-full transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit hover:opacity-85" style={{ background: 'linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)', boxShadow: '0 4px 16px rgba(55,181,255,0.25)' }}><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </section>

          {/* Scrolling Marquee */}
          <section className="py-6 overflow-hidden" style={{ background: '#041530', borderTop: '1px solid rgba(55,181,255,0.12)', borderBottom: '1px solid rgba(55,181,255,0.12)' }}>
            <div className="relative flex" style={{ '--duration': '30s', '--gap': '2rem' } as React.CSSProperties}>
              <div className="flex shrink-0 animate-marquee items-center gap-8">
                {['MIND-SET', 'MIND-VAULT', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'MIND-VAULT', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 cursor-default" style={{ color: text === 'MIND-VAULT' ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.55)' }}>{text}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: text === 'MIND-VAULT' ? '#a78bfa' : '#37b5ff' }}></span>
                  </span>
                ))}
              </div>
              <div className="flex shrink-0 animate-marquee items-center gap-8" aria-hidden="true">
                {['MIND-SET', 'MIND-VAULT', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'MIND-VAULT', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 cursor-default" style={{ color: text === 'MIND-VAULT' ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.55)' }}>{text}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: text === 'MIND-VAULT' ? '#a78bfa' : '#37b5ff' }}></span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* MIND-VAULT GEM Panel */}
          <MindVaultGemPanel />

          {/* What's In YOUR Tool Box? */}
          <section style={{ padding: 'clamp(40px,7vw,80px) clamp(16px,3vw,20px)', background: 'linear-gradient(180deg, #000f28 0%, #041530 100%)' }}>
            <style>{`
              .toolbox-card { transition: transform 0.25s ease, box-shadow 0.25s ease; }
              .toolbox-card:hover { transform: translateY(-4px) scale(1.02); }
            `}</style>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <p style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#37b5ff', textTransform: 'uppercase', marginBottom: '16px' }}>YOUR TOOLKIT</p>
              <h2 style={{ fontSize: 'clamp(28px,4.5vw,48px)', fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: '14px' }}>
                What&rsquo;s In <span style={{ color: '#37b5ff' }}>YOUR</span> Tool Box?
              </h2>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '17px', marginBottom: '56px', maxWidth: '520px', margin: '0 auto 56px' }}>
                Three systems that separate good goalies from great ones.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Card 1 — Positional Systems */}
                <div className="toolbox-card" style={{
                  background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(55,181,255,0.35)',
                  borderRadius: '18px', padding: '32px', cursor: 'default',
                  boxShadow: '0 4px 32px rgba(55,181,255,0.08)',
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(55,181,255,0.15)', border: '1px solid rgba(55,181,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#37b5ff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Positional Systems</h3>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>See the ice through the puck&rsquo;s eyes. Master net-crease positioning and the angle-mark system so you&rsquo;re always in the right spot before the shot.</p>
                  <div style={{ marginTop: '24px', height: '2px', borderRadius: '2px', background: 'linear-gradient(90deg, #37b5ff 0%, transparent 100%)', opacity: 0.5 }} />
                </div>

                {/* Card 2 — Game IQ */}
                <div className="toolbox-card" style={{
                  background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(167,139,250,0.35)',
                  borderRadius: '18px', padding: '32px', cursor: 'default',
                  boxShadow: '0 4px 32px rgba(167,139,250,0.08)',
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Game IQ Assessments</h3>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>Think two passes ahead. Measure your hockey sense through video analysis and charting — then watch your decision speed climb game after game.</p>
                  <div style={{ marginTop: '24px', height: '2px', borderRadius: '2px', background: 'linear-gradient(90deg, #a78bfa 0%, transparent 100%)', opacity: 0.5 }} />
                </div>

                {/* Card 3 — Performance Analytics */}
                <div className="toolbox-card" style={{
                  background: 'rgba(6,30,70,0.98)', border: '1px solid rgba(45,212,191,0.35)',
                  borderRadius: '18px', padding: '32px', cursor: 'default',
                  boxShadow: '0 4px 32px rgba(45,212,191,0.08)',
                }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#2dd4bf" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>Performance Analytics</h3>
                  <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>Know what you don&rsquo;t know. Track your gaps, chart your growth, and build the self-awareness to coach yourself between sessions.</p>
                  <div style={{ marginTop: '24px', height: '2px', borderRadius: '2px', background: 'linear-gradient(90deg, #2dd4bf 0%, transparent 100%)', opacity: 0.5 }} />
                </div>
              </div>
            </div>
          </section>

          <TestimonialsSection
            title="Voices From The Smarter Goalie Community"
            description="Goalies, parents, and coaches trust Smarter Goalie to sharpen their game, track real progress, and train with purpose."
            testimonials={testimonials}
            className="!bg-[#000f28]"
            dark={true}
            gradientColor="#000f28"
          />
      </>

    </div>
  );
}

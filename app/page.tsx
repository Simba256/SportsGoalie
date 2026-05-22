'use client';

import { useRouter } from 'next/navigation';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack/ScrollStack';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';

export default function Home() {
  const router = useRouter();

  const testimonials = [
    {
      author: {
        name: 'Aarav Singh',
        handle: '@goalieaarav',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      },
      text: 'The goalie drills are super practical. I can see my reaction speed improving every week with clear feedback after each session.',
    },
    {
      author: {
        name: 'Maya Patel',
        handle: '@parentmaya',
        avatar:
          'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      },
      text: 'As a parent, I finally understand my child\'s progress. The weekly reports and coach notes make it easy to support training at home.',
    },
    {
      author: {
        name: 'Coach Leo Martins',
        handle: '@coachleo',
        avatar:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
      },
      text: 'Smarter Goalie helps me assign the right drills to each athlete. Personalized learning paths save time and improve outcomes fast.',
    },
    {
      author: {
        name: 'Zoya Khan',
        handle: '@zoyasaves',
        avatar:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face',
      },
      text: 'I love that everything is in one place: training plans, quizzes, and progress charts. It feels like having a full academy in my pocket.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="relative min-h-screen overflow-hidden flex flex-col"
        style={{ backgroundColor: '#000f28' }}
      >
        {/* Background image — blue-tinted */}
        <img
          src="/quality.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 0, filter: 'brightness(0.81) saturate(1.3)' }}
        />

        {/* Blue colour wash over the image */}
        <div className="absolute inset-0" style={{ background: 'rgba(5,20,80,0.38)', zIndex: 1 }} />

        {/* Bottom-up fade */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, rgba(0,10,30,0.65) 75%, #000f28 100%)', zIndex: 2 }} />

        {/* Left-side vignette for text area */}
        <div className="absolute inset-0 hidden md:block" style={{ background: 'linear-gradient(90deg, rgba(0,5,25,0.70) 0%, rgba(0,5,25,0.40) 40%, rgba(0,5,25,0.08) 65%, transparent 100%)', zIndex: 2 }} />
        <div className="absolute inset-0 md:hidden" style={{ background: 'rgba(0,5,25,0.65)', zIndex: 2 }} />

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
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
            <div className="max-w-full md:max-w-[680px]">

              {/* ── BRAND NAME — the dominant element ── */}
              <div className="mb-6 md:mb-8 text-center md:text-left">
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#37b5ff', letterSpacing: '5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                  WELCOME TO
                </p>
                <h1
                  className="font-black uppercase leading-none"
                  style={{ fontSize: 'clamp(36px, 6.5vw, 72px)', letterSpacing: '-0.03em', lineHeight: 0.9 }}
                >
                  <span style={{
                    display: 'block',
                    background: 'linear-gradient(135deg, #ffffff 0%, #a8d8ff 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 24px rgba(55,181,255,0.5))',
                  }}>SMARTER</span>
                  <span style={{
                    display: 'block',
                    color: 'transparent',
                    WebkitTextStroke: '2.5px #37b5ff',
                    filter: 'drop-shadow(0 0 20px rgba(55,181,255,0.8)) drop-shadow(0 0 40px rgba(55,181,255,0.4))',
                  }}>GOALIE</span>
                </h1>
                {/* Blue accent line */}
                <div style={{ width: '56px', height: '3px', background: 'linear-gradient(90deg, #37b5ff, transparent)', borderRadius: '99px', marginTop: '18px', boxShadow: '0 0 8px rgba(55,181,255,0.5)' }} className="mx-auto md:mx-0" />
              </div>

              {/* Sub-headline question */}
              <h2
                className="font-black uppercase mb-4 text-center md:text-left"
                style={{ fontSize: 'clamp(15px, 2.4vw, 22px)', lineHeight: 1.3, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}
              >
                Are goalies the{' '}
                <em style={{ color: '#37b5ff', fontStyle: 'normal' }}>worst trained</em>{' '}
                athletes in sports?
              </h2>

              {/* Tagline */}
              <p
                className="uppercase font-bold mb-8 md:mb-10 text-center md:text-left"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '2.5px', fontSize: '10px' }}
              >
                HERE IS WHAT WE KNOW.
              </p>

              {/* Video intro button */}
              <button
                className="flex items-center gap-3 mb-5 md:mb-7 cursor-pointer hover:opacity-90 transition-opacity w-full md:w-auto justify-center md:justify-start"
                style={{ background: 'rgba(55,181,255,0.12)', border: '1px solid rgba(55,181,255,0.5)', color: '#fff', padding: '11px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}
              >
                <span className="flex items-center justify-center shrink-0" style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#37b5ff', color: '#000f28', fontSize: '9px', fontWeight: 900 }}>▶</span>
                COACH MIKE — INTRODUCTION
              </button>

              {/* Primary CTA */}
              <button
                onClick={() => router.push('/explain')}
                className="mb-8 md:mb-10 hover:opacity-90 hover:scale-[1.02] transition-all duration-200 w-full md:w-auto text-center"
                style={{ background: '#37b5ff', color: '#000f28', fontWeight: 800, fontSize: '12px', letterSpacing: '2px', padding: '15px 36px', textTransform: 'uppercase', display: 'block', borderRadius: '4px' }}
              >
                LET US EXPLAIN →
              </button>

              {/* Role pills */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {[
                  { label: 'GOALIE', action: () => router.push('/auth/register') },
                  { label: 'PARENT', action: () => router.push('/auth/register') },
                  { label: 'COACH', action: () => router.push('/auth/register') },
                  { label: 'GOALIE COACH', action: () => router.push('/auth/register') },
                ].map(({ label, action }) => (
                  <button key={label} onClick={action} className="hover:opacity-80 transition-opacity"
                    style={{ background: 'rgba(55,181,255,0.14)', border: '1px solid rgba(55,181,255,0.45)', padding: '7px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#e6f6ff', cursor: 'pointer' }}
                  >
                    {label}
                  </button>
                ))}
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
                        <p className="text-zinc-300 leading-relaxed mb-5">We build Intelligent Athletic Goaltenders through 6 core skill pillars — from Mind-Set and Skating Tech to our Seven Angle-Mark System, Seven Point System, Form Tech, and Performance Charting.</p>
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
                {['MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 cursor-default" style={{ color: 'rgba(255,255,255,0.55)' }}>{text}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#37b5ff' }}></span>
                  </span>
                ))}
              </div>
              <div className="flex shrink-0 animate-marquee items-center gap-8" aria-hidden="true">
                {['MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide transition-colors duration-300 cursor-default" style={{ color: 'rgba(255,255,255,0.55)' }}>{text}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#37b5ff' }}></span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* What's In YOUR Tool Box? */}
          <section style={{ padding: '80px 20px', background: 'linear-gradient(180deg, #000f28 0%, #041530 100%)' }}>
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
            description="Goalkeepers, parents, and coaches trust our sports LMS to build skills, confidence, and consistent match performance."
            testimonials={testimonials}
            className="!bg-[#000f28]"
          />
      </>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#000a1e', borderTop: '1px solid rgba(55,181,255,0.15)', padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#37b5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="#000f28" />
                  </svg>
                </div>
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>
                  SMARTER <span style={{ color: '#37b5ff' }}>GOALIE</span>
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '240px' }}>
                Building intelligent goaltenders through structured learning, data-driven analytics, and personalized coaching.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#37b5ff', textTransform: 'uppercase', marginBottom: '16px' }}>Platform</p>
              <div className="flex flex-col gap-3">
                {['Features', 'For Goalies', 'For Parents', 'For Coaches'].map(link => (
                  <span key={link} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                  >{link}</span>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: '#37b5ff', textTransform: 'uppercase', marginBottom: '16px' }}>Contact Us</p>
              <div className="flex flex-col gap-4">
                <a href="mailto:info@smartergoalie.com" className="flex items-center gap-3 group" style={{ textDecoration: 'none' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#37b5ff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#37b5ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >info@smartergoalie.com</span>
                </a>
                <a href="tel:+14169390555" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(55,181,255,0.1)', border: '1px solid rgba(55,181,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#37b5ff" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#37b5ff')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  >+1 (416) 939-0555</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '1px' }}>© 2024 SMARTER GOALIE. ALL RIGHTS RESERVED.</span>
            <div className="flex gap-5">
              {['Privacy Policy', 'Terms of Service'].map(item => (
                <span key={item} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >{item}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}

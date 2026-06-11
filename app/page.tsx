'use client';

import { useRouter } from 'next/navigation';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack/ScrollStack';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { GalleryHoverCarousel, type GalleryCarouselItem } from '@/components/ui/gallery-hover-carousel';
import { Network, Lock, Filter, TrendingUp, Users, Trophy } from 'lucide-react';

const MIND_VAULT_ITEMS: GalleryCarouselItem[] = [
  {
    id: 'gem-1',
    label: 'THE FOUNDATION',
    title: 'What is your foundation built on?',
    quote: 'Regardless how technically strong you are — if the mind is not the strongest tool you have, then what is your foundation built on?',
    accent: '#bde4ff',
    bg: 'linear-gradient(145deg, #1562ea 0%, #0d44c2 55%, #0a2e9a 100%)',
    WatermarkIcon: Network,
  },
  {
    id: 'gem-2',
    label: 'THE MIND-VAULT',
    title: 'Where only the most valuable thoughts are kept.',
    quote: 'The discipline of building where only the most valuable foundational thoughts and behaviors are kept. For game performance. And for life in general.',
    accent: '#a8ecff',
    bg: 'linear-gradient(145deg, #0892cc 0%, #0672ac 55%, #044e84 100%)',
    WatermarkIcon: Lock,
  },
  {
    id: 'gem-3',
    label: 'YOUR FILTERS',
    title: 'Logic. Math. Science. Every read.',
    quote: 'Logic, Common Sense, Math, and Science become your filters — applied to every read, every shift, every decision.',
    accent: '#c8e8ff',
    bg: 'linear-gradient(145deg, #0c3ed6 0%, #0828ae 55%, #061a86 100%)',
    WatermarkIcon: Filter,
  },
  {
    id: 'gem-4',
    label: 'PERFORMANCE VS OUTCOME',
    title: 'You control one. Not the other.',
    quote: 'Learn the difference between performance and outcome — and understand why the goalie controls one, not the other.',
    accent: '#b8ddff',
    bg: 'linear-gradient(145deg, #1e72e8 0%, #1452c8 55%, #0e3aa8 100%)',
    WatermarkIcon: TrendingUp,
  },
  {
    id: 'gem-5',
    label: 'THE BENCH',
    title: 'How the goalie goes, the bench follows.',
    quote: 'How the goalie goes reflects on the bench. A solid goalie lifts the bench. An inconsistent goalie deflates it.',
    accent: '#9ed8f8',
    bg: 'linear-gradient(145deg, #067ab8 0%, #055898 55%, #033878 100%)',
    WatermarkIcon: Users,
  },
  {
    id: 'gem-6',
    label: 'SIX DECADES OF ORIGINAL IP',
    title: 'One foundation. Sixty years. Proven.',
    quote: 'One foundation. Built over sixty years. Proven on every goalie it has ever touched. The MIND-VAULT is yours to build.',
    accent: '#c0d8ff',
    bg: 'linear-gradient(145deg, #2248c8 0%, #1630a8 55%, #102088 100%)',
    WatermarkIcon: Trophy,
  },
];

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
        style={{ backgroundColor: '#020e2e' }}
      >
        {/* Background image — positioned right so goalie fills the right half */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/quality.png")',
            backgroundSize: 'auto 90%',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            filter: 'brightness(0.85) saturate(1.1)',
          }}
        />

        {/* Left-to-right gradient — blue-tinted opaque on left, transparent on right */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background: 'linear-gradient(to right, rgba(2,18,60,1) 0%, rgba(2,15,52,0.95) 35%, rgba(2,10,38,0.18) 58%, rgba(2,6,23,0.0) 80%)',
            zIndex: 1,
          }}
        />
        {/* Mobile overlay */}
        <div
          className="absolute inset-0 md:hidden"
          style={{ background: 'rgba(2,18,60,0.86)', zIndex: 1 }}
        />

        {/* Bottom fade into next section */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 60%, rgba(2,6,23,0.6) 85%, #000f28 100%)', zIndex: 2 }}
        />

        {/* ── NAV BAR ── */}
        <nav className="relative flex items-center justify-between px-6 md:px-12 py-5" style={{ zIndex: 10 }}>
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
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'About', 'Pricing'].map((item) => (
              <span key={item} style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)', cursor: 'pointer', letterSpacing: '0.5px', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#37b5ff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.75)')}
              >{item}</span>
            ))}
          </div>

          {/* Login CTA */}
          <button
            onClick={() => router.push('/auth/login')}
            className="hover:opacity-90 transition-opacity"
            style={{ background: '#37b5ff', color: '#000f28', padding: '8px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, letterSpacing: '0.5px', cursor: 'pointer', border: 'none' }}
          >
            Login
          </button>
        </nav>

        {/* ── HERO CONTENT ── */}
        <div className="relative flex-1 flex items-center" style={{ zIndex: 10 }}>
          <div className="w-full max-w-7xl mx-auto pl-4 md:pl-6 pr-6 md:pr-16 py-12 md:py-20">
            <div className="w-full md:max-w-[600px]">

              {/* Eyebrow */}
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#37b5ff', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px' }}>
                WELCOME TO
              </p>

              {/* Brand name — italic, SMARTER=blue, GOALIE=white */}
              <h1
                className="font-black uppercase italic leading-none mb-6"
                style={{ fontSize: 'clamp(56px, 9vw, 108px)', letterSpacing: '-0.03em', lineHeight: 0.92, fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif' }}
              >
                <span style={{ display: 'block', color: '#42a5f5' }}>SMARTER</span>
                <span style={{ display: 'block', color: '#ffffff' }}>GOALIE</span>
              </h1>

              {/* Full-width divider */}
              <div style={{ width: '100%', maxWidth: '520px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '32px' }} />

              {/* Sub-headline — large bold */}
              <h2
                className="font-black uppercase leading-tight mb-4"
                style={{ fontSize: 'clamp(22px, 3.5vw, 42px)', lineHeight: 1.1, color: '#ffffff', letterSpacing: '-0.01em' }}
              >
                ARE GOALIES THE WORST<br />ATHLETES IN SPORTS?
              </h2>

              <p
                className="uppercase font-semibold mb-12"
                style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.2em', fontSize: '11px' }}
              >
                HERE IS WHAT WE KNOW.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Video button */}
                <button
                  className="flex items-center gap-3 cursor-pointer transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '14px 24px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', borderRadius: '12px', whiteSpace: 'nowrap' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                >
                  <span className="flex items-center justify-center shrink-0" style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#fff', color: '#020617', fontSize: '9px', fontWeight: 900 }}>▶</span>
                  COACH MIKE
                </button>

                {/* Primary CTA */}
                <button
                  onClick={() => router.push('/explain')}
                  className="transition-all duration-200"
                  style={{ background: '#42a5f5', color: '#fff', fontWeight: 800, fontSize: '12px', letterSpacing: '0.15em', padding: '14px 32px', textTransform: 'uppercase', borderRadius: '12px', whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', boxShadow: '0 0 24px rgba(66,165,245,0.45)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(66,165,245,0.7)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(66,165,245,0.45)'; (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'; }}
                >
                  LET US EXPLAIN →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom brand watermark */}
        <div className="relative pb-6 flex justify-center md:justify-end md:px-12" style={{ zIndex: 2 }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.15)', letterSpacing: '3px', textTransform: 'uppercase' }}>
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
          <GalleryHoverCarousel
            eyebrow="THE MIND-VAULT — DAILY GEMS"
            heading="Six Foundations. One Complete System."
            subheading="The mental pillars every goalie needs — built into your game, your mindset, and your life."
            items={MIND_VAULT_ITEMS}
          />

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

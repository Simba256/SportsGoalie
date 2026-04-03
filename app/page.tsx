'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack/ScrollStack';
import ClubIntroSection from '@/components/ClubIntroSection/ClubIntroSection';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';
import { BackgroundGradient } from '@/components/ui/background-gradient';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'goalie' | 'parent' | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

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
      {/* Hero Section — full background image */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-end"
        style={{ backgroundImage: "url('/hero-section-icehockey.png')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-8 pb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          {/* Heading */}
          <div className="max-w-3xl">
            <div className="mb-6">
              <p className="text-sm md:text-base font-semibold text-red-300 uppercase tracking-widest mb-4">
                Smarter Goalie Academy
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] uppercase tracking-tight mb-6">
                Where Mind Meets Body
              </h1>
            </div>
            <p className="text-base md:text-lg text-white/85 max-w-2xl leading-relaxed">
              The only platform built for goalies who think as much as they react. Master positioning systems, decision-making frameworks, and technical mastery.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 md:pb-2">
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-600/30"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="border-2 border-white text-white font-semibold px-6 py-3 hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      <ClubIntroSection />

      {/* Choose Your Role Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
         
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
              Choose Your Role
            </h2>
            <p className="text-lg md:text-xl text-gray-500 font-medium">
              Goalies build skills. Parents support the journey. Start here.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mt-20 max-w-3xl mx-auto">
            {/* Card 1 - Goalie Role */}
            <button
              onClick={() => {
                setSelectedRole('goalie');
                setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`group relative h-[380px] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] text-left bg-red-500 ${
                selectedRole === 'parent' ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'
              }`}
            >
              {/* Hover background image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundImage: 'url("/goalie_card_hover.png")' }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full flex flex-col justify-between p-7 z-10">
                <span className="text-lg font-semibold text-white/80">(01)</span>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    I&rsquo;m a Goalie
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    Access role-based drills, smart feedback, and progress tracking designed to improve your saves, reactions, and game confidence.
                  </p>
                  <span className="inline-block mt-5 rounded-full bg-white text-red-500 px-5 py-2 text-sm font-semibold">
                    Enter as Goalie
                  </span>
                </div>
              </div>
            </button>

            {/* Card 2 - Parent Role */}
            <button
              onClick={() => {
                setSelectedRole('parent');
                setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}
              className={`group relative h-[380px] rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] text-left bg-zinc-800 ${
                selectedRole === 'goalie' ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100'
              }`}
            >
              {/* Hover background image */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ backgroundImage: 'url("/parent_card_hover.png")' }}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full flex flex-col justify-between p-7 z-10">
                <span className="text-lg font-semibold text-white/80">(02)</span>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    I&rsquo;m a Parent
                  </h3>
                  <p className="text-zinc-300 leading-relaxed">
                    Stay informed with clear progress updates, coach notes, and learning milestones so you can confidently support your child&rsquo;s development.
                  </p>
                  <span className="inline-block mt-5 rounded-full bg-white text-zinc-800 px-5 py-2 text-sm font-semibold">
                    Enter as Parent
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Change role link */}
          {selectedRole && (
            <div className="mt-8 max-w-3xl mx-auto">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-sm text-gray-400 hover:text-gray-700 transition-colors duration-200 underline underline-offset-4"
              >
                ← Change role
              </button>
            </div>
          )}
         
        </div>
      </section>

      {/* Role-conditional content anchor */}
      <div ref={contentRef} />

      {/* ── GENERAL (no role selected) ── */}
      {!selectedRole && (
        <>
          <section id="features" className="pt-20 pb-0 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">WHAT WE DO</h2>
                <span className="text-xl font-semibold text-gray-600">1/5</span>
              </div>
            </div>
            <ScrollStack useWindowScroll={true} itemDistance={200} itemScale={0.02} itemStackDistance={30} stackPosition="20%" scaleEndPosition="15%" baseScale={0.95}>
              {/* 1 — The 7 Pillars of Intelligent Goaltending */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center h-[560px]">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_1.png")' }}></div>
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">1/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">THE 7 PILLARS</h3>
                        <p className="text-xl text-red-400 mb-6">Learn Smart. Play Smart. Stay Consistent.</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">We build Intelligent Athletic Goaltenders through 6 core skill pillars — from Mind-Set and Skating Tech to our Seven Angle-Mark System, Seven Point System, Form Tech, and Performance Charting.</p>
                        <p className="text-zinc-400 text-sm mb-6">Master each pillar and unlock consistency you can repeat every game.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 2 — Video Learning */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center h-[560px]">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_2.png")' }}></div>
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">2/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">VIDEO LEARNING</h3>
                        <p className="text-xl text-red-400 mb-6">Structured lessons you can replay</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">YouTube-integrated video lessons organised into structured modules covering technique, positioning, decision-making, and game sense. Track completion per lesson, pick up where you left off, and learn at your own pace.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 3 — Performance Analytics & Gap Management */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center h-[560px]">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_3.png")' }}></div>
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">3/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">ANALYTICS & GAP MANAGEMENT</h3>
                        <p className="text-xl text-red-400 mb-6">See what others miss</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">Chart every game and practice session. Our analytics reveal your consistency patterns, good vs. bad goal ratios, and pinpoint exactly which skills need work.</p>
                        <p className="text-zinc-400 text-sm mb-6">Nothing is left to imagination — advance with confidence knowing precisely where you stand.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 4 — Goaltending: A Chess Game */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center h-[560px]">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_4.png")' }}></div>
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">4/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">THE CHESS GAME</h3>
                        <p className="text-xl text-red-400 mb-6">Think Smart. Play Smart. Read the Play.</p>
                        <p className="text-zinc-300 leading-relaxed mb-5">Our video-questionnaire and quiz system assesses your decision-making from a goalie&rsquo;s point of view. We identify your knowledge gaps, then build your personalised &ldquo;UP YOUR GAME&rdquo; learning path.</p>
                        <p className="text-zinc-400 text-sm mb-6">Outsmart the shooter before the puck leaves their stick.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 5 — Session Charting */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center h-[560px]">
                      <div className="h-full bg-cover bg-center" style={{ backgroundImage: 'url("/feature_5.png")' }}></div>
                      <div className="p-12 flex flex-col justify-center h-full">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">5/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">SESSION CHARTING</h3>
                        <p className="text-xl text-red-400 mb-6">Our flagship goalie feature</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">Log every shot, save, and goal against — period by period. Rate yourself across 8 performance factors like Intensity, Positional Play, and Reading the Breakout. Low ratings trigger a personalised growth menu that connects you to the exact lessons you need.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2 w-fit"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
          </section>

          {/* Scrolling Marquee */}
          <section className="py-6 bg-gray-50 overflow-hidden border-y border-gray-100">
            <div className="relative flex" style={{ '--duration': '30s', '--gap': '2rem' } as React.CSSProperties}>
              <div className="flex shrink-0 animate-marquee items-center gap-8">
                {['MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide text-gray-800 hover:text-gray-900 transition-colors duration-300 cursor-default">{text}</span>
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                  </span>
                ))}
              </div>
              <div className="flex shrink-0 animate-marquee items-center gap-8" aria-hidden="true">
                {['MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ', 'MIND-SET', 'SKATING TECH', 'ANGLE-MARK SYSTEM', 'SEVEN POINT SYSTEM', 'FORM TECH', 'PERFORMANCE CHARTING', 'GAME IQ'].map((text, i) => (
                  <span key={i} className="flex items-center gap-8 whitespace-nowrap">
                    <span className="text-xl md:text-2xl font-bold tracking-wide text-gray-800 hover:text-gray-900 transition-colors duration-300 cursor-default">{text}</span>
                    <span className="w-2 h-2 rounded-full bg-red-400 shrink-0"></span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* What's In YOUR Tool Box? */}
          <section className="py-24 px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
                What&rsquo;s In YOUR Tool Box?
              </h2>
              <p className="text-center text-gray-500 text-lg mb-14 max-w-2xl mx-auto">Three systems that separate good goalies from great ones.</p>
              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                {/* Card 1 — Positional Systems */}
                <BackgroundGradient
                  containerClassName="rounded-[22px] h-full"
                  className="rounded-[18px] h-full"
                  gradientClassName="bg-[radial-gradient(circle_farthest-side_at_0_100%,#b91c1c,transparent),radial-gradient(circle_farthest-side_at_100%_0,#ef4444,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#7f1d1d,transparent),radial-gradient(circle_farthest-side_at_0_0,#dc2626,#1c0505)]"
                >
                  <div className="group p-8 text-white cursor-pointer transition-all duration-500 hover:scale-[1.02] bg-red-700 rounded-[18px] h-full">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5 group-hover:bg-white/30 transition-colors duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Positional Systems</h3>
                    <p className="text-white/85 leading-relaxed mb-4">See the ice through the puck&rsquo;s eyes. Master net-crease positioning and the angle-mark system so you&rsquo;re always in the right spot before the shot.</p>
                  </div>
                </BackgroundGradient>

                {/* Card 2 — Game IQ */}
                <BackgroundGradient
                  containerClassName="rounded-[22px] h-full"
                  className="rounded-[18px] h-full"
                  gradientClassName="bg-[radial-gradient(circle_farthest-side_at_0_100%,#374151,transparent),radial-gradient(circle_farthest-side_at_100%_0,#6b7280,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#111827,transparent),radial-gradient(circle_farthest-side_at_0_0,#4b5563,#030712)]"
                >
                  <div className="group p-8 text-white cursor-pointer transition-all duration-500 hover:scale-[1.02] bg-black rounded-[18px] h-full">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5 group-hover:bg-white/20 transition-colors duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Game IQ Assessments</h3>
                    <p className="text-white/85 leading-relaxed mb-4">Think two passes ahead. Measure your hockey sense through video analysis and charting — then watch your decision speed climb game after game.</p>
                  </div>
                </BackgroundGradient>

                {/* Card 3 — Performance Analytics */}
                <BackgroundGradient
                  containerClassName="rounded-[22px] h-full"
                  className="rounded-[18px] h-full"
                  gradientClassName="bg-[radial-gradient(circle_farthest-side_at_0_100%,#1d4ed8,transparent),radial-gradient(circle_farthest-side_at_100%_0,#3b82f6,transparent),radial-gradient(circle_farthest-side_at_100%_100%,#1e3a8a,transparent),radial-gradient(circle_farthest-side_at_0_0,#2563eb,#030712)]"
                >
                  <div className="group p-8 text-white cursor-pointer transition-all duration-500 hover:scale-[1.02] bg-blue-600 rounded-[18px] h-full">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5 group-hover:bg-white/30 transition-colors duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-3">Performance Analytics</h3>
                    <p className="text-white/85 leading-relaxed mb-4">Know what you don&rsquo;t know. Track your gaps, chart your growth, and build the self-awareness to coach yourself between sessions.</p>
                  </div>
                </BackgroundGradient>
              </div>
            </div>
          </section>

          <TestimonialsSection
            title="Voices From The Smarter Goalie Community"
            description="Goalkeepers, parents, and coaches trust our sports LMS to build skills, confidence, and consistent match performance."
            testimonials={testimonials}
          />
        </>
      )}

      {/* ── GOALIE ── */}
      {selectedRole === 'goalie' && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Everything built for you</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">Every tool, drill, and insight in one place — designed specifically for goalies who want to improve.</p>
            </div>

            <div className="space-y-24">
              {[
                {
                  title: 'Session Charting',
                  desc: 'The most complete in-game tracking tool for goalies. Log every shot, save, and goal against — period by period. Rate yourself across 8 performance factors like Intensity, Positional Play, and Reading the Breakout. Low ratings trigger a personalised growth menu that connects you to the exact lessons you need.',
                  image: '/goalie_feature_1.png',
                  badge: 'Flagship Feature',
                },
                {
                  title: 'Two Learning Paths',
                  desc: 'Choose between Automated self-paced progression driven by the algorithm, or a Custom coach-guided curriculum where content is unlocked by your coach. Both paths adapt to your skill level and keep you moving forward.',
                  image: '/goalie_feature_2.png',
                },
                {
                  title: 'Sports Catalog & Video Learning',
                  desc: 'Browse all available lessons and quizzes across every skill category. YouTube-integrated video lessons are organised into structured modules covering technique, positioning, decision-making, and game sense — with built-in progress tracking per lesson.',
                  image: '/goalie_feature_3.png',
                },
                {
                  title: 'Progress Tracking & Achievements',
                  desc: 'Visual charts show your skill-level and sport-level progress over time. Earn badges, hit milestones, and maintain streaks — every improvement is tracked and celebrated to keep you motivated.',
                  image: '/goalie_feature_4.png',
                },
                {
                  title: 'Interactive Quizzes',
                  desc: 'Multiple question types — multiple-choice, true/false, scenario-based — with instant feedback after every answer. Quizzes are tied directly to video lessons so you prove your understanding before moving on.',
                  image: '/goalie_feature_5.png',
                },
                {
                  title: 'Goal Setting & Profile',
                  desc: 'Set personal development goals and track how close you are to hitting them. Your unique Student ID (SG-XXXX-XXXX) lets you share your profile with parents and coaches, keeping everyone connected.',
                  image: '/goalie_feature_6.png',
                },
                {
                  title: 'Messages & Notifications',
                  desc: 'Stay connected with your coach and team through a built-in inbox. Receive notifications about new lessons, quiz results, coach feedback, and milestone achievements — all in one place.',
                  image: '/goalie_feature_7.png',
                },
              ].map((feature, i) => (
                <div key={feature.title} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-16`}>
                  {/* Text */}
                  <div className="flex-1">
                    {feature.badge && (
                      <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">{feature.badge}</span>
                    )}
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">{feature.desc}</p>
                  </div>
                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Goalie CTA */}
            <div className="mt-24 flex justify-center">
              <div className="w-full max-w-2xl relative bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-8 md:p-10 text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-50/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <p className="text-red-500 font-semibold tracking-widest uppercase text-xs mb-3">Your journey starts here</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to Play Smarter?</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Join the academy and get access to every drill, lesson, quiz, and analytics tool — built for goalies who want to level up.</p>
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="group bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 hover:scale-105 transition-all duration-300 font-semibold inline-flex items-center gap-2"
                  >
                    Register Now
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PARENT ── */}
      {selectedRole === 'parent' && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Stay close to the journey</h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">Everything you need to support your child — progress reports, coach notes, achievements, and more.</p>
            </div>

            <div className="space-y-24">
              {[
                {
                  title: 'Monitor Progress',
                  desc: 'Link to your child via their unique Student ID and track their full learning journey from your own dashboard. See skill levels, completion rates, and growth trends at a glance.',
                  image: '/parent_feature_1.png',
                },
                {
                  title: 'Learning Activity',
                  desc: 'See exactly what your child is working on — active lessons, quizzes attempted, and time spent training. Stay informed about their daily engagement without needing to ask.',
                  image: '/parent_feature_2.png',
                },
                {
                  title: 'Achievements & Badges',
                  desc: 'View every badge earned and milestone reached. Celebrate their wins as they happen and use achievements as conversation starters to encourage continued growth.',
                  image: '/parent_feature_3.png',
                },
                {
                  title: 'Session Review',
                  desc: "Browse your child's charting session history — shot counts, save rates, and period-by-period factor ratings. Understand how they performed on game day without being on the bench.",
                  image: '/parent_feature_4.png',
                },
                {
                  title: 'Child Messages',
                  desc: "Monitor your child's coach communications with privacy controls so you're informed without being intrusive. Know what feedback they're receiving and how they're responding.",
                  image: '/parent_feature_5.png',
                },
                {
                  title: 'Multi-child Support',
                  desc: 'Link and manage multiple children from a single parent account — each with their own independent progress view. Switch between profiles effortlessly.',
                  image: '/parent_feature_6.png',
                },
              ].map((feature, i) => (
                <div key={feature.title} className={`flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-16`}>
                  {/* Text */}
                  <div className="flex-1">
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-500 text-base md:text-lg leading-relaxed">{feature.desc}</p>
                  </div>
                  {/* Image */}
                  <div className="flex-1 w-full">
                    <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[4/3]">
                      <img src={feature.image} alt={feature.title} className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Parent CTA */}
            <div className="mt-24 flex justify-center">
              <div className="w-full max-w-2xl relative bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-8 md:p-10 text-center overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-50/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                <div className="relative z-10">
                  <p className="text-blue-500 font-semibold tracking-widest uppercase text-xs mb-3">Stay connected to their growth</p>
                  <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Support Starts Here</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">Create your parent account and link to your child&rsquo;s profile. Track progress, celebrate wins, and stay informed — all from one dashboard.</p>
                  <button
                    onClick={() => router.push('/auth/register')}
                    className="group bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 font-semibold inline-flex items-center gap-2"
                  >
                    Register Now
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-24">
              <TestimonialsSection
                title="What Parents Are Saying"
                description="Parents across the community trust Smarter Goalie to keep them informed and connected to their child's development."
                testimonials={testimonials.filter((_, i) => [1, 2, 3].includes(i))}
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

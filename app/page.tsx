'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ScrollStack, { ScrollStackItem } from '@/components/ScrollStack/ScrollStack';
import ClubIntroSection from '@/components/ClubIntroSection/ClubIntroSection';
import { TestimonialsSection } from '@/components/ui/testimonials-with-marquee';

export default function Home() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'goalie' | 'parent' | null>(null);
  const [athletesCount, setAthletesCount] = useState(0);
  const [coursesCount, setCoursesCount] = useState(0);
  const [trustedCount, setTrustedCount] = useState(0);
  const [hasAnimatedStats, setHasAnimatedStats] = useState(false);
  const statsSectionRef = useRef<HTMLElement | null>(null);
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

  useEffect(() => {
    const sectionElement = statsSectionRef.current;
    if (!sectionElement) return;

    const animateValue = (
      startValue: number,
      endValue: number,
      duration: number,
      setValue: (value: number) => void
    ) => {
      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const nextValue = Math.floor(startValue + (endValue - startValue) * easedProgress);
        setValue(nextValue);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimatedStats) {
          animateValue(0, 10000, 1800, setAthletesCount);
          animateValue(0, 500, 1800, setCoursesCount);
          animateValue(0, 10000, 1800, setTrustedCount);
          setHasAnimatedStats(true);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(sectionElement);

    return () => observer.disconnect();
  }, [hasAnimatedStats]);

  const formatStat = (value: number, asCompact = false) => {
    if (asCompact) {
      return `${Math.floor(value / 1000)}K+`;
    }
    return `${value.toLocaleString()}+`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image - Replace the background style with your actual image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("/hero-section-icehockey.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70"></div>
          {/* Color accent overlays */}
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 via-transparent to-blue-500/20"></div>
        </div>

        {/* Content - Bottom Layout */}
        <div className="absolute bottom-0 left-0 right-0 z-10 max-w-7xl mx-auto px-8 pb-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            {/* Left: Headline */}
            <div className="animate-fadeInUp">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-white max-w-3xl">
                TRAINING THE NEXT
                <span className="block mt-1 text-white bg-clip-text text-transparent">
                  GENERATION OF GOALIES
                </span>
              </h1>
            </div>

            {/* Right: Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <button
                onClick={() => router.push('/auth/login')}
                className="bg-red-600 text-white px-8 py-3 hover:bg-red-700 hover:shadow-2xl hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 font-semibold text-base whitespace-nowrap"
              >
                Start today
              </button>
              <button className="bg-white/10 backdrop-blur-md border-2 border-white/50 text-white px-8 py-3 hover:bg-white hover:text-gray-900 hover:border-white hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-base whitespace-nowrap">
                Discover our approach
              </button>
            </div>
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
          <section
            ref={statsSectionRef}
            className="py-20 px-6 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden"
          >
            <div className="absolute top-16 left-8 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-8 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="max-w-6xl mx-auto relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  Ready to level up your training?
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Learn skills, take quizzes, and track progress — all in one clean dashboard.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl p-8 text-center bg-white shadow-xl shadow-red-900/5 border border-red-200/40">
                  <div className="text-5xl font-bold text-red-500 mb-2">{formatStat(athletesCount, true)}</div>
                  <div className="text-gray-700 font-semibold">Athletes</div>
                </div>
                <div className="rounded-3xl p-8 text-center bg-white shadow-xl shadow-blue-900/5 border border-blue-200/40">
                  <div className="text-5xl font-bold text-blue-500 mb-2">{formatStat(coursesCount)}</div>
                  <div className="text-gray-700 font-semibold">Courses</div>
                </div>
                <div className="rounded-3xl p-8 text-center bg-zinc-900 shadow-xl shadow-black/20 border border-white/10">
                  <div className="text-5xl font-bold text-white mb-2">{formatStat(trustedCount)}</div>
                  <div className="text-zinc-300 font-semibold">Trusted by athletes</div>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 mb-12">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900">WHAT WE DO</h2>
                <span className="text-xl font-semibold text-gray-600">1/5</span>
              </div>
            </div>
            <ScrollStack useWindowScroll={true} itemDistance={200} itemScale={0.02} itemStackDistance={30} stackPosition="20%" scaleEndPosition="15%" baseScale={0.95}>
              {/* 1 — AI-Powered Training */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
                      <div className="h-full min-h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/feature_1.png")' }}></div>
                      <div className="p-12">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">1/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">AI-POWERED TRAINING</h3>
                        <p className="text-xl text-red-400 mb-6">Personalised to every athlete</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">Our algorithm adapts to each athlete&rsquo;s skill level and learning pace. Whether you follow the automated self-paced path or a coach-guided custom curriculum, every drill, lesson, and recommendation is tailored to help you improve faster.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 2 — Video Learning */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
                      <div className="h-full min-h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/feature_2.png")' }}></div>
                      <div className="p-12">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">2/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">VIDEO LEARNING</h3>
                        <p className="text-xl text-red-400 mb-6">Structured lessons you can replay</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">YouTube-integrated video lessons organised into structured modules covering technique, positioning, decision-making, and game sense. Track completion per lesson, pick up where you left off, and learn at your own pace.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 3 — Progress Analytics */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
                      <div className="h-full min-h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/feature_3.png")' }}></div>
                      <div className="p-12">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">3/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">PROGRESS ANALYTICS</h3>
                        <p className="text-xl text-red-400 mb-6">See growth you can measure</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">Visual dashboards chart improvement across every skill and sport over time. Track completion rates, quiz scores, session stats, and streaks — all in one place so athletes and parents can see exactly how far they&rsquo;ve come.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 4 — Interactive Quizzes */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
                      <div className="h-full min-h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/feature_4.png")' }}></div>
                      <div className="p-12">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">4/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">INTERACTIVE QUIZZES</h3>
                        <p className="text-xl text-red-400 mb-6">Reinforce what you learn</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">Multiple question types — multiple-choice, true/false, scenario-based — with instant feedback after every answer. Quizzes are tied directly to video lessons so athletes prove their understanding before moving on.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
              {/* 5 — Session Charting */}
              <ScrollStackItem>
                <div className="max-w-7xl mx-auto px-6">
                  <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-0 items-center min-h-[500px]">
                      <div className="h-full min-h-[500px] bg-cover bg-center" style={{ backgroundImage: 'url("/feature_5.png")' }}></div>
                      <div className="p-12">
                        <div className="text-right mb-4"><span className="text-lg font-semibold text-red-400">5/5</span></div>
                        <h3 className="text-5xl md:text-6xl font-bold text-white mb-4">SESSION CHARTING</h3>
                        <p className="text-xl text-red-400 mb-6">Our flagship goalie feature</p>
                        <p className="text-zinc-300 leading-relaxed mb-8">Log every shot, save, and goal against — period by period. Rate yourself across 8 performance factors like Intensity, Positional Play, and Reading the Breakout. Low ratings trigger a personalised growth menu that connects you to the exact lessons you need.</p>
                        <button className="bg-red-500 text-white px-8 py-3 rounded-full hover:bg-red-600 transition-all duration-300 font-semibold inline-flex items-center gap-2"><span className="w-2 h-2 bg-white rounded-full"></span>More about this</button>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollStackItem>
            </ScrollStack>
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

'use client';

import { useRouter } from 'next/navigation';
import { Shield, Users, ClipboardList, Target, Building2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Door {
  id: string;
  role: string;
  Icon: LucideIcon;
  headline: string;
  body: string;
  cta: string;
  href: string;
  accent: string;
  iconBg: string;
  iconBorder: string;
  hoverShadow: string;
  hoverRing: string;
  btnBg: string;
}

const DOORS: Door[] = [
  {
    id: '01',
    role: 'GOALIE',
    Icon: Shield,
    headline: 'The knowledge and support that sets you apart is here.',
    body: 'All you need is an open mind. You will become one of the best goalies at your level. Failure is not in our vocabulary.',
    cta: 'ENTER AS GOALIE',
    href: '/goalie',
    accent: '#60a5fa',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    hoverShadow: 'rgba(96,165,250,0.18)',
    hoverRing: '#60a5fa40',
    btnBg: '#3b82f6',
  },
  {
    id: '02',
    role: 'PARENT',
    Icon: Users,
    headline: 'How to be the goalie parent who truly understands and supports their goalie.',
    body: 'Smarter Goalie meets you where you are. Coach Mike is your guide.',
    cta: 'ENTER AS PARENT',
    href: '/parent-role',
    accent: '#60a5fa',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    hoverShadow: 'rgba(96,165,250,0.18)',
    hoverRing: '#60a5fa40',
    btnBg: '#3b82f6',
  },
  {
    id: '03',
    role: 'COACH / MANAGER',
    Icon: ClipboardList,
    headline: 'The goalie development layer your program has always needed.',
    body: 'Structured. Measurable. Real data every game and every practice.',
    cta: 'ENTER AS COACH',
    href: '/team-programs',
    accent: '#60a5fa',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    hoverShadow: 'rgba(96,165,250,0.18)',
    hoverRing: '#60a5fa40',
    btnBg: '#3b82f6',
  },
  {
    id: '04',
    role: 'GOALIE COACH',
    Icon: Target,
    headline: "The toughest job in hockey. We don't compete with what you do. We complete it.",
    body: 'How goes the goalie — how goes the team. You are an influencer who creates starters.',
    cta: 'ENQUIRE',
    href: '/goalie-coach',
    accent: '#60a5fa',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    hoverShadow: 'rgba(96,165,250,0.18)',
    hoverRing: '#60a5fa40',
    btnBg: '#3b82f6',
  },
  {
    id: '05',
    role: 'ORGANIZATION',
    Icon: Building2,
    headline: 'Consistent goaltending development across your entire organization.',
    body: 'Every age group. One system. Scalable. Measurable. Built on principles that never change.',
    cta: 'BUILD A PACKAGE',
    href: '/organization',
    accent: '#60a5fa',
    iconBg: '#eff6ff',
    iconBorder: '#bfdbfe',
    hoverShadow: 'rgba(96,165,250,0.18)',
    hoverRing: '#60a5fa40',
    btnBg: '#3b82f6',
  },
];

export default function ExplainPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)',
      }}
    >
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-slate-100/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center"
            aria-label="Go to home"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <img
              src="/logo.png"
              alt="Smarter Goalie"
              className="h-10 w-auto object-contain"
            />
          </button>

          <div className="hidden md:flex items-center gap-7">
            <button
              onClick={() => router.push('/')}
              className="text-slate-800 hover:text-slate-900 text-[15px] font-medium tracking-wide"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="text-slate-800 hover:text-slate-900 text-[15px] font-medium tracking-wide"
            >
              Pricing
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-[#37b5ff] hover:bg-[#22a7f5] text-white px-4 py-2 rounded-md text-[15px] font-medium tracking-wide transition-colors duration-300"
            >
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* ── Header ── */}
      <div className="text-center px-4 sm:px-6 pt-10 sm:pt-16 pb-8 sm:pb-14 flex-shrink-0">
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-5 sm:mb-6">
          <div style={{ width: '32px', height: '1.5px', background: '#37b5ff', opacity: 0.5 }} />
          <p
            className="uppercase font-bold"
            style={{ fontSize: '10px', letterSpacing: '4px', color: '#37b5ff' }}
          >
            THE SMARTER GOALIE DIFFERENCE
          </p>
          <div style={{ width: '32px', height: '1.5px', background: '#37b5ff', opacity: 0.5 }} />
        </div>

        {/* Headline */}
        <h1
          className="font-black uppercase mx-auto"
          style={{
            fontSize: 'clamp(20px, 4vw, 50px)',
            lineHeight: 1.1,
            color: '#ffffff',
            maxWidth: '840px',
            letterSpacing: '-0.02em',
          }}
        >
          ONE UNIQUE SYSTEM BUILT FOR{' '}
          <span style={{ color: '#37b5ff' }}>THE GOALIE</span>
          <span className="hidden sm:inline"><br /></span>
          <span className="sm:hidden"> </span>
          <span style={{ color: '#37b5ff' }}>&amp; EVERYONE WHO CARES ABOUT THEM</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4 sm:mt-5 mx-auto"
          style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', maxWidth: '400px', lineHeight: 1.65 }}
        >
          Select your role below. Coach Mike&rsquo;s voice is waiting on the other side.
        </p>
      </div>

      {/* ── Cards ── */}
      <div className="flex-1 px-4 sm:px-6 pt-3 pb-10 sm:pb-14">
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 mx-auto"
          style={{ maxWidth: '1300px' }}
        >
          {DOORS.map((door) => {
            const Icon = door.Icon;
            return (
              <div
                key={door.id}
                className="flex flex-col cursor-pointer"
                style={{
                  background: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(-6px)';
                  el.style.boxShadow = `0 20px 48px ${door.hoverShadow}, 0 0 0 1.5px ${door.hoverRing}`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = 'translateY(0)';
                  el.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)';
                }}
                onClick={() => router.push(door.href)}
              >
                {/* Colored top stripe */}
                <div style={{ height: '5px', background: door.accent, flexShrink: 0 }} />

                {/* Content */}
                <div className="flex flex-col flex-1 items-center text-center p-6">
                  {/* Icon */}
                  <div
                    className="mb-5 flex items-center justify-center"
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      background: door.iconBg,
                      border: `1.5px solid ${door.iconBorder}`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={30} color={door.accent} strokeWidth={1.6} />
                  </div>

                  {/* Role title */}
                  <p
                    className="font-black uppercase mb-2"
                    style={{ fontSize: '15px', letterSpacing: '1.8px', color: '#0f172a' }}
                  >
                    {door.role}
                  </p>

                  {/* Accent divider */}
                  <div
                    className="mb-4"
                    style={{
                      width: '28px',
                      height: '3px',
                      borderRadius: '2px',
                      background: door.accent,
                      opacity: 0.6,
                    }}
                  />

                  {/* Headline */}
                  <p
                    className="mb-3"
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: '#1e293b',
                      lineHeight: 1.6,
                    }}
                  >
                    {door.headline}
                  </p>

                  {/* Body */}
                  <p
                    className="mb-6"
                    style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.7 }}
                  >
                    {door.body}
                  </p>

                  <div className="flex-1" />

                  {/* CTA button */}
                  <button
                    className="w-full font-bold uppercase mt-3"
                    style={{
                      background: door.btnBg,
                      border: 'none',
                      color: '#fff',
                      padding: '13px 0',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'filter 0.2s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.08)')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1)')
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(door.href);
                    }}
                  >
                    {door.cta} →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="text-center px-4 pb-8 sm:pb-10 flex-shrink-0">
        <p
          className="uppercase font-bold"
          style={{ fontSize: '9px', letterSpacing: '3px', color: '#cbd5e1' }}
        >
          EVERY DOOR LEADS TO THE SAME DESTINATION &mdash; THE INTELLIGENT ATHLETIC GOALTENDER
        </p>
      </div>
    </div>
  );
}

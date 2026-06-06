'use client';

import { GraduationCap, ChevronRight, Brain, Target, Clock, Eye, MessageCircle, TrendingUp, BookOpen } from 'lucide-react';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

interface CoachWelcomeScreenProps {
  coachName: string;
  onBegin: () => void;
}

const COACH_CATS = [
  { name: 'Knowledge', icon: Brain,         color: BLUE },
  { name: 'Approach',  icon: Target,         color: PURPLE },
  { name: 'Pre-Game',  icon: Clock,          color: '#22d3ee' },
  { name: 'In-Game',   icon: Eye,            color: '#f87171' },
  { name: 'Post-Game', icon: MessageCircle,  color: '#4ade80' },
  { name: 'Goals',     icon: TrendingUp,     color: '#fb923c' },
  { name: 'Preferences', icon: BookOpen,     color: '#818cf8' },
];

const CHECK_ITEMS = [
  'Quick intake questions about your coaching background',
  '28 assessment questions across 7 categories',
  'All multiple choice — no right or wrong answers',
  'Your responses cross-reference with each goalie\'s self-assessment',
  'Reveals coaching perception gaps and alignment areas',
  'Progress is saved automatically',
];

export function CoachWelcomeScreen({ coachName, onBegin }: CoachWelcomeScreenProps) {
  return (
    <>
      <style>{`
        .cw-begin:hover { opacity: 0.88 !important; transform: translateY(-2px) !important; }
        .cw-cat:hover { border-color: rgba(55,181,255,0.35) !important; }
        @keyframes cw-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .cw-fade { animation: cw-fade 0.4s ease both; }
        @media (max-width: 720px) {
          .cw-grid { flex-direction: column !important; }
          .cw-left { align-items: center !important; text-align: center !important; }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 60px' }}>
        <div className="cw-fade cw-grid" style={{ display: 'flex', gap: '56px', alignItems: 'center', maxWidth: '860px', width: '100%' }}>

          {/* LEFT */}
          <div className="cw-left" style={{ flex: '0 0 auto', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: `${BLUE}18`, border: `2px solid ${BLUE}50`, boxShadow: `0 0 28px ${BLUE}28`, marginBottom: '20px' }}>
              <GraduationCap size={32} color={BLUE} />
            </div>

            <h1 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px' }}>
              Welcome,{' '}
              <span style={{ color: BLUE }}>{coachName}</span>!
            </h1>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '24px' }}>
              Tell us about your current coaching approach across{' '}
              <span style={{ color: BLUE, fontWeight: 700 }}>7 key areas</span>{' '}
              so we can calibrate cross-reference insights for your goalies.
            </p>

            <button
              className="cw-begin"
              onClick={onBegin}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#000f28', padding: '15px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}45`, transition: 'all 0.2s', marginBottom: '12px' }}
            >
              Let&apos;s Get Started <ChevronRight size={18} />
            </button>

            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              Answer honestly — current reality, not aspirations.
            </p>
          </div>

          {/* DIVIDER */}
          <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(55,181,255,0.12)', flexShrink: 0 }} />

          {/* RIGHT */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>7 Assessment Areas</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                {COACH_CATS.map(({ name, icon: Icon, color }) => (
                  <div key={name} className="cw-cat" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', background: `${color}12`, border: `1px solid ${color}28`, transition: 'border-color 0.2s' }}>
                    <Icon size={13} color={color} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'rgba(2,18,44,0.7)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '14px', padding: '18px 20px' }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px' }}>What to expect</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {CHECK_ITEMS.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '9px' }}>
                    <ChevronRight size={15} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

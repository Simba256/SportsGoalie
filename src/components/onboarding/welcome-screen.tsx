'use client';

import { Heart, Brain, Clock, Target, MessageCircle, Dumbbell, BookOpen, ChevronRight } from 'lucide-react';

const BLUE = '#37b5ff';

interface WelcomeScreenProps {
  studentName: string;
  onBegin: () => void;
}

const CATEGORIES = [
  { name: 'Feelings', icon: Heart, accent: '#a78bfa' },
  { name: 'Knowledge', icon: Brain, accent: '#37b5ff' },
  { name: 'Pre-Game', icon: Clock, accent: '#2dd4bf' },
  { name: 'In-Game', icon: Target, accent: '#f87171' },
  { name: 'Post-Game', icon: MessageCircle, accent: '#4ade80' },
  { name: 'Training', icon: Dumbbell, accent: '#fb923c' },
  { name: 'Learning', icon: BookOpen, accent: '#818cf8' },
];

const card: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
};

export function WelcomeScreen({ studentName, onBegin }: WelcomeScreenProps) {
  return (
    <>
      <style>{`
        .ws-pill:hover { opacity: 0.85 !important; }
        .ws-btn:hover { opacity: 0.9 !important; transform: scale(1.02) !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ws-s1 { animation: fade-up 0.5s ease both; }
        .ws-s2 { animation: fade-up 0.5s 0.1s ease both; }
        .ws-s3 { animation: fade-up 0.5s 0.2s ease both; }
        .ws-s4 { animation: fade-up 0.5s 0.3s ease both; }
        .ws-s5 { animation: fade-up 0.5s 0.4s ease both; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '620px', width: '100%', textAlign: 'center' }}>

          {/* Welcome heading */}
          <div className="ws-s1">
            <h1 style={{ fontSize: 'clamp(32px,6vw,52px)', fontWeight: 900, color: '#fff', marginBottom: '16px', lineHeight: 1.1 }}>
              Welcome,{' '}
              <span style={{ color: BLUE }}>{studentName}!</span>
            </h1>
            <p style={{ fontSize: 'clamp(15px,2vw,18px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: '32px' }}>
              Before we begin your goaltending journey, let&apos;s discover where you are today.
              We&apos;ll explore{' '}
              <span style={{ color: BLUE, fontWeight: 700 }}>7 areas of your game</span>
              {' '}to build your personalized Intelligence Profile.
            </p>
          </div>

          {/* Category pills */}
          <div className="ws-s2" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            {CATEGORIES.map(({ name, icon: Icon, accent }) => (
              <div
                key={name}
                className="ws-pill"
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px',
                  padding: '8px 14px',
                  background: `${accent}14`,
                  border: `1px solid ${accent}33`,
                  borderRadius: '40px',
                  fontSize: '13px', fontWeight: 600, color: accent,
                  transition: 'opacity 0.2s',
                }}
              >
                <Icon style={{ width: '14px', height: '14px' }} />
                {name}
              </div>
            ))}
          </div>

          {/* Info box */}
          <div className="ws-s3" style={{ ...card, padding: '24px', textAlign: 'left', marginBottom: '28px' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '14px' }}>What to expect:</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                'Quick intake questions to learn about you',
                '28 assessment questions across 7 categories',
                'All multiple choice — no right or wrong answers',
                'Your personalized Intelligence Profile at the end',
                'Progress is saved automatically',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <ChevronRight style={{ width: '16px', height: '16px', color: BLUE, flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="ws-s4">
            <button
              onClick={onBegin}
              className="ws-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`,
                border: 'none', color: '#fff',
                padding: '14px 36px',
                borderRadius: '12px', fontWeight: 800, fontSize: '17px',
                cursor: 'pointer', transition: 'opacity 0.2s, transform 0.2s',
                boxShadow: `0 8px 32px rgba(55,181,255,0.25)`,
              }}
            >
              Let&apos;s Get Started
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          <div className="ws-s5">
            <p style={{ marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
              Answer honestly — this helps us personalize your learning path.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

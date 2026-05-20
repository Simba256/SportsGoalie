'use client';

import { useMemo } from 'react';
import { GoalieAgeRange } from '@/types';
import { ChevronRight, Target, Sparkles, CheckCircle2 } from 'lucide-react';

const BLUE = '#37b5ff';

interface BridgeMessageProps {
  studentName: string;
  ageRange?: GoalieAgeRange;
  experienceLevel?: string;
  primaryReasons?: string[];
  onContinue: () => void;
}

const REASON_DISPLAY: Record<string, string> = {
  'reason-get-better': 'getting better at your position',
  'reason-learn-right': 'learning the right way to play goalie',
  'reason-struggling': 'working through challenges in your game',
  'reason-structure': 'having structured training you can do on your own',
  'reason-understand': 'understanding your strengths and areas to work on',
  'reason-referred': 'what your parent or coach told you about',
  'reason-next-level': 'taking your game to the next level',
  'reason-exploring': 'checking out what this is all about',
};

const EXPERIENCE_DISPLAY: Record<string, string> = {
  'new': "You're just getting started as a goalie — and that's an exciting place to be.",
  'less_than_1_season': "You've got a bit of experience under your belt.",
  '1_to_3_seasons': "You've been at this for a while now and have some experience.",
  '4_plus_seasons': "You're a veteran between the pipes with plenty of games behind you.",
};

const card: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(55,181,255,0.14)',
  borderRadius: '16px',
};

export function BridgeMessage({
  studentName,
  ageRange,
  experienceLevel,
  primaryReasons = [],
  onContinue,
}: BridgeMessageProps) {
  const experienceMessage = useMemo(() => {
    if (!experienceLevel) return '';
    return EXPERIENCE_DISPLAY[experienceLevel] || '';
  }, [experienceLevel]);

  const formattedReasons = useMemo(() => {
    const reasons = primaryReasons.slice(0, 3).map(id => REASON_DISPLAY[id]).filter(Boolean);
    if (reasons.length === 0) return 'improving your goaltending skills';
    if (reasons.length === 1) return reasons[0];
    if (reasons.length === 2) return `${reasons[0]} and ${reasons[1]}`;
    return `${reasons[0]}, ${reasons[1]}, and ${reasons[2]}`;
  }, [primaryReasons]);

  const isYounger = ageRange === '8-10' || ageRange === '11-13';

  return (
    <>
      <style>{`
        .bm-btn:hover { opacity: 0.88 !important; transform: scale(1.02) !important; }
        @keyframes sparkle-pop { 0% { transform: scale(0.7); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        .bm-icon { animation: sparkle-pop 0.5s 0.1s ease both; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .bm-s1 { animation: fade-up 0.45s ease both; }
        .bm-s2 { animation: fade-up 0.45s 0.1s ease both; }
        .bm-s3 { animation: fade-up 0.45s 0.2s ease both; }
        .bm-s4 { animation: fade-up 0.45s 0.3s ease both; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div className="bm-icon" style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '80px', height: '80px', borderRadius: '50%',
              background: `${BLUE}15`,
              border: `2px solid ${BLUE}40`,
              boxShadow: `0 0 32px ${BLUE}20`,
            }}>
              <Sparkles style={{ width: '36px', height: '36px', color: BLUE }} />
            </div>
          </div>

          {/* Greeting */}
          <div className="bm-s1">
            <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#fff', marginBottom: '20px' }}>
              {isYounger ? <>Got it, {studentName}!</> : <>Thanks, {studentName}.</>}
            </h1>
          </div>

          {/* Experience */}
          <div className="bm-s2">
            {experienceMessage && (
              <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', marginBottom: '12px', lineHeight: 1.6 }}>
                {experienceMessage}
              </p>
            )}
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.65)', marginBottom: '32px', lineHeight: 1.6 }}>
              {isYounger ? (
                <>
                  It sounds like you&apos;re interested in{' '}
                  <span style={{ color: BLUE, fontWeight: 700 }}>{formattedReasons}</span>.
                  {' '}That&apos;s exactly what Smarter Goalie is here to help with.
                </>
              ) : (
                <>
                  You&apos;re here for{' '}
                  <span style={{ color: BLUE, fontWeight: 700 }}>{formattedReasons}</span>{' '}—
                  and that&apos;s exactly what Smarter Goalie is built to help you with.
                </>
              )}
            </p>
          </div>

          {/* Info card */}
          <div className="bm-s3" style={{ ...card, padding: '24px', textAlign: 'left', marginBottom: '28px' }}>
            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target style={{ width: '18px', height: '18px', color: BLUE }} />
              {isYounger ? "What's next?" : "Now let's get to know your game."}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
              {isYounger ? (
                "We're going to ask you some questions about how you play goalie — things like how you feel about games, what you do during practice, and how you think about your position."
              ) : (
                "The next section will ask you questions across 7 areas of your goaltending. This isn't a test — there are no wrong answers. We're trying to understand where you are today so we can personalize your experience."
              )}
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', listStyle: 'none', margin: 0, padding: 0 }}>
              {[
                '7 categories covering different parts of goaltending',
                '28 quick questions — all multiple choice',
                'No right or wrong answers — just be honest',
                'Your progress is saved if you need to take a break',
              ].map(item => (
                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <CheckCircle2 style={{ width: '16px', height: '16px', color: BLUE, flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bm-s4">
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginBottom: '24px' }}>
              {isYounger
                ? "Take your time with each question. There's no rush, and your answers help us help you!"
                : "Your answers will help us build your Intelligence Profile and customize your learning path."}
            </p>

            <button
              className="bm-btn"
              onClick={onContinue}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`,
                border: 'none', color: '#fff',
                padding: '14px 36px', borderRadius: '12px',
                fontWeight: 800, fontSize: '17px', cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.2s',
                boxShadow: `0 8px 32px rgba(55,181,255,0.25)`,
              }}
            >
              {isYounger ? "Let's Go!" : 'Continue to Assessment'}
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

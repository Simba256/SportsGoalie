'use client';

import { ChevronRight, Target, CheckCircle2 } from 'lucide-react';

const BLUE = '#37b5ff';

interface ParentBridgeMessageProps {
  parentName: string;
  onContinue: () => void;
}

const CHECKLIST = [
  '7 categories covering different aspects of being a goalie parent',
  '28 quick questions — all multiple choice',
  'No right or wrong answers — just be honest',
  'Your progress is saved if you need to take a break',
];

export function ParentBridgeMessage({ parentName, onContinue }: ParentBridgeMessageProps) {
  return (
    <>
      <style>{`
        .pb-cta:hover { opacity: 0.88 !important; transform: translateY(-2px) !important; }
        @keyframes pb-fade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .pb-fade { animation: pb-fade 0.4s ease both; }
        @media (max-width: 720px) {
          .pb-grid { flex-direction: column !important; }
          .pb-left { text-align: center !important; align-items: center !important; }
        }
      `}</style>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 60px' }}>
        <div className="pb-fade pb-grid" style={{ display: 'flex', gap: '56px', alignItems: 'center', maxWidth: '860px', width: '100%' }}>

          {/* ── LEFT: Heading + CTA ── */}
          <div className="pb-left" style={{ flex: '0 0 auto', maxWidth: '340px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0' }}>

            {/* Icon */}
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '72px', height: '72px', borderRadius: '50%', background: `${BLUE}18`, border: `2px solid ${BLUE}40`, boxShadow: `0 0 28px ${BLUE}22`, marginBottom: '20px' }}>
              <Target size={32} color={BLUE} />
            </div>

            {/* Heading */}
            <h1 style={{ fontSize: 'clamp(28px,3.5vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '12px' }}>
              Thanks,{' '}
              <span style={{ color: BLUE }}>{parentName}.</span>
            </h1>

            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: '28px' }}>
              Now let&apos;s understand how you see your goalie&apos;s game — and your role in their development.
            </p>

            {/* CTA */}
            <button
              className="pb-cta"
              onClick={onContinue}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#000f28', padding: '15px 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}45`, transition: 'all 0.2s' }}
            >
              Continue to Assessment <ChevronRight size={18} />
            </button>

            <p style={{ marginTop: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
              Your answers will be cross-referenced with your goalie&apos;s self-assessment to identify alignment.
            </p>
          </div>

          {/* ── DIVIDER ── */}
          <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(55,181,255,0.12)', flexShrink: 0 }} />

          {/* ── RIGHT: Info Card ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ background: 'rgba(2,18,44,0.7)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '16px', padding: '24px 26px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: BLUE }}>◆</span> Now for the deeper questions.
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '18px', lineHeight: 1.65 }}>
                The next section explores how you perceive your goalie&apos;s current state,
                your understanding of the position, and how you communicate after games.
                This isn&apos;t a test — we&apos;re looking for your honest perspective.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {CHECKLIST.map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <CheckCircle2 size={17} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{item}</span>
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

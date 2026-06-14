'use client';

import { ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

const BLUE = '#37b5ff';

interface ParentAssessmentCompleteProps {
  parentName?: string;
  onContinue: () => void;
}

export function ParentAssessmentComplete({ parentName = 'Parent', onContinue }: ParentAssessmentCompleteProps) {
  return (
    <>
      <style>{`
        .pac-btn:hover { opacity: 0.88 !important; transform: translateY(-2px) !important; }
        @keyframes pac-bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pac-glow { 0%,100%{box-shadow:0 0 20px rgba(55,181,255,0.3)} 50%{box-shadow:0 0 40px rgba(55,181,255,0.6)} }
        @keyframes pac-pulse { 0%,100%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.6);opacity:0} }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 60px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

          {/* Icon */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '24px' }}>
            {/* Pulse ring */}
            <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', border: `2px solid ${BLUE}40`, animation: 'pac-pulse 2s 0.3s ease-out infinite' }} />
            <div style={{ width: '96px', height: '96px', margin: '0 auto', borderRadius: '50%', background: `${BLUE}18`, border: `2px solid ${BLUE}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pac-glow 3s ease-in-out infinite' }}>
              <CheckCircle size={46} color={BLUE} />
            </div>
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '32px', height: '32px', borderRadius: '50%', background: '#a78bfa', border: '1px solid rgba(167,139,250,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pac-bounce 1.5s ease-in-out infinite', boxShadow: '0 4px 12px rgba(167,139,250,0.4)' }}>
              <Sparkles size={16} color="#fff" />
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(28px,4.5vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '14px' }}>
            Thank You, <span style={{ color: BLUE }}>{parentName}!</span>
          </h1>

          {/* Message */}
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', marginBottom: '14px', lineHeight: 1.7 }}>
            You&apos;ve completed your parent assessment. Your responses will be
            cross-referenced with your goalie&apos;s self-assessment to provide valuable
            insights into their development.
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '30px' }}>
            Head to your dashboard to link your goalie and start tracking their progress.
          </p>

          {/* Confirmation card */}
          <div style={{ background: `${BLUE}0d`, border: `1px solid ${BLUE}30`, borderRadius: '12px', padding: '16px 22px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle size={20} color={BLUE} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '14px', color: BLUE, fontWeight: 600, textAlign: 'left' }}>
              Assessment saved — your perspective is locked in.
            </p>
          </div>

          {/* CTA */}
          <button
            className="pac-btn"
            onClick={onContinue}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`, border: 'none', color: '#fff', padding: '16px 40px', borderRadius: '14px', fontSize: '17px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 8px 24px ${BLUE}45`, transition: 'all 0.2s' }}
          >
            Go to Dashboard <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

'use client';

import { ChevronRight, CheckCircle, Sparkles } from 'lucide-react';

const BLUE = '#37b5ff';
const PURPLE = '#a78bfa';

interface AssessmentCompleteProps {
  studentName?: string;
  onContinue: () => void;
}

export function AssessmentComplete({
  studentName = 'Goalie',
  onContinue,
}: AssessmentCompleteProps) {
  return (
    <>
      <style>{`
        .ac-btn:hover { opacity: 0.88 !important; transform: scale(1.03) !important; }
        @keyframes pop-in { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(1.6); opacity: 0; } }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .ac-icon { animation: pop-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both; }
        .ac-sparkle { animation: bounce 1.4s 0.6s ease-in-out infinite; }
        .ac-ring { animation: pulse-ring 2s 0.3s ease-out infinite; }
        .ac-s1 { animation: fade-up 0.5s 0.3s ease both; }
        .ac-s2 { animation: fade-up 0.5s 0.45s ease both; }
        .ac-s3 { animation: fade-up 0.5s 0.6s ease both; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center' }}>

          {/* Success icon */}
          <div style={{ position: 'relative', marginBottom: '36px', display: 'inline-block' }}>
            {/* Pulse ring */}
            <div className="ac-ring" style={{
              position: 'absolute', inset: '-12px', borderRadius: '50%',
              border: `2px solid ${BLUE}40`,
            }} />
            {/* Main circle */}
            <div className="ac-icon" style={{
              width: '96px', height: '96px', borderRadius: '50%',
              background: `${BLUE}18`,
              border: `2px solid ${BLUE}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${BLUE}25`,
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: BLUE }} />
            </div>
            {/* Sparkle badge */}
            <div className="ac-sparkle" style={{
              position: 'absolute', top: '-4px', right: '-8px',
              width: '32px', height: '32px', borderRadius: '50%',
              background: PURPLE,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${PURPLE}60`,
            }}>
              <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
            </div>
          </div>

          {/* Title */}
          <div className="ac-s1">
            <h1 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, color: '#fff', marginBottom: '16px' }}>
              Great Job, <span style={{ color: BLUE }}>{studentName}!</span>
            </h1>
          </div>

          {/* Message */}
          <div className="ac-s2">
            <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, marginBottom: '12px' }}>
              You&apos;ve completed your initial assessment. Your coach will review your
              responses and work with you to create a personalized training plan.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.35)', marginBottom: '36px', lineHeight: 1.6 }}>
              In the meantime, you can explore the pillars and start learning at your own pace.
            </p>
          </div>

          {/* CTA */}
          <div className="ac-s3">
            <button
              className="ac-btn"
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
              Go to Dashboard
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import { Zap, X, Share2 } from 'lucide-react';

export interface CelebrationPopupProps {
  show: boolean;
  onClose: () => void;
  achievement: {
    title: string;
    description: string;
    category: string; // WINS | BREAKTHROUGHS | CLIMBS | STREAKS | MILESTONES
    tier: string;     // FOUNDATION | DEVELOPING | OWNING IT | 80-100 CLUB | 95-100 CLUB
    points: number;
  } | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  WINS: '#4ade80',
  BREAKTHROUGHS: '#a78bfa',
  CLIMBS: '#37b5ff',
  STREAKS: '#fb923c',
  MILESTONES: '#fbbf24',
};

const TIER_COLORS: Record<string, string> = {
  FOUNDATION: '#fbbf24',
  DEVELOPING: '#60a5fa',
  'OWNING IT': '#37b5ff',
  '80-100 CLUB': '#22d3ee',
  '95-100 CLUB': '#fbbf24',
};

const CONFETTI_COLORS = [
  '#37b5ff', '#fbbf24', '#4ade80', '#a78bfa', '#fb923c',
  '#f87171', '#22d3ee', '#e879f9', '#facc15', '#60a5fa',
];

interface ConfettiPiece {
  id: number;
  color: string;
  angle: number;   // degrees
  distance: number; // px
  size: number;
  delay: number;   // ms
  shape: 'square' | 'circle' | 'rect';
}

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    angle: (360 / count) * i + Math.random() * 15 - 7,
    distance: 100 + Math.random() * 80,
    size: 6 + Math.random() * 6,
    delay: Math.random() * 300,
    shape: (['square', 'circle', 'rect'] as const)[i % 3],
  }));
}

const CONFETTI_PIECES = generateConfetti(30);

export function CelebrationPopup({ show, onClose, achievement }: CelebrationPopupProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (show) {
      timerRef.current = setTimeout(() => { onClose(); }, 6000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show, onClose]);

  if (!show || !achievement) return null;

  const cat = achievement.category.toUpperCase();
  const tier = achievement.tier.toUpperCase();
  const categoryColor = CATEGORY_COLORS[cat] || '#37b5ff';
  const tierColor = TIER_COLORS[tier] || '#37b5ff';

  const handleShareWithCoach = () => {
    console.log('[CelebrationPopup] Share with coach:', achievement);
  };

  return (
    <>
      <style>{`
        @keyframes celebrate-in {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes confetti-fly {
          0%   { opacity: 1; transform: translate(0, 0) rotate(0deg) scale(1); }
          60%  { opacity: 1; }
          100% { opacity: 0; transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.4); }
        }
        @keyframes trophy-glow {
          0%,100% { filter: drop-shadow(0 0 8px #fbbf24aa); }
          50%      { filter: drop-shadow(0 0 22px #fbbf24ee); }
        }
        @keyframes points-pop {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes dismiss-bar {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Card */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
          padding: '16px',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%', maxWidth: '420px',
            background: 'linear-gradient(160deg, #000a1f 0%, #041530 50%, #071e42 100%)',
            border: '1px solid rgba(55,181,255,0.28)',
            borderRadius: '24px',
            padding: '36px 28px 28px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(55,181,255,0.12)',
            pointerEvents: 'all',
            animation: 'celebrate-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
            overflow: 'hidden',
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: `linear-gradient(90deg, transparent, ${categoryColor}, #fbbf24, transparent)`,
            borderRadius: '24px 24px 0 0',
          }} />

          {/* Confetti burst — absolutely positioned relative to card */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {CONFETTI_PIECES.map((piece) => {
              const rad = (piece.angle * Math.PI) / 180;
              const dx = Math.round(Math.cos(rad) * piece.distance);
              const dy = Math.round(Math.sin(rad) * piece.distance);
              const rot = Math.round(Math.random() * 720 - 360);
              const borderRadius =
                piece.shape === 'circle' ? '50%' :
                piece.shape === 'rect'   ? '2px' : '3px';
              const w = piece.shape === 'rect' ? piece.size * 0.5 : piece.size;
              const h = piece.size;
              return (
                <div
                  key={piece.id}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '30%',
                    width: `${w}px`,
                    height: `${h}px`,
                    marginLeft: `-${w / 2}px`,
                    marginTop: `-${h / 2}px`,
                    background: piece.color,
                    borderRadius,
                    opacity: 0,
                    animation: `confetti-fly 1.4s ease-out ${piece.delay}ms forwards`,
                    // CSS custom properties for the keyframe
                    ['--dx' as string]: `${dx}px`,
                    ['--dy' as string]: `${dy}px`,
                    ['--rot' as string]: `${rot}deg`,
                  }}
                />
              );
            })}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', padding: '6px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.5)', transition: 'background 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <X size={14} />
          </button>

          {/* Trophy icon */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <div
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(251,191,36,0.18) 0%, transparent 70%)',
                border: '1px solid rgba(251,191,36,0.3)',
                animation: 'trophy-glow 2s ease-in-out infinite',
                fontSize: '40px', lineHeight: 1,
              }}
            >
              🏆
            </div>
          </div>

          {/* "Achievement Unlocked!" */}
          <p style={{
            textAlign: 'center', fontSize: '12px', fontWeight: 800,
            color: '#fbbf24', letterSpacing: '2px', textTransform: 'uppercase',
            marginBottom: '8px',
          }}>
            Achievement Unlocked!
          </p>

          {/* Title */}
          <h2 style={{
            textAlign: 'center', fontSize: '22px', fontWeight: 900,
            color: '#fff', margin: '0 0 10px 0', lineHeight: 1.2,
          }}>
            {achievement.title}
          </h2>

          {/* Description */}
          <p style={{
            textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.5)',
            marginBottom: '20px', lineHeight: 1.5,
          }}>
            {achievement.description}
          </p>

          {/* Badges row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            flexWrap: 'wrap', marginBottom: '20px',
          }}>
            {/* Category badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 800, letterSpacing: '.5px',
              textTransform: 'uppercase',
              color: categoryColor,
              background: `${categoryColor}1a`,
              border: `1px solid ${categoryColor}44`,
              borderRadius: '20px', padding: '4px 12px',
            }}>
              {achievement.category}
            </span>

            {/* Tier badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: 800, letterSpacing: '.5px',
              textTransform: 'uppercase',
              color: tierColor,
              background: `${tierColor}1a`,
              border: `1px solid ${tierColor}44`,
              borderRadius: '20px', padding: '4px 12px',
            }}>
              {achievement.tier}
            </span>
          </div>

          {/* Growth Points */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: '24px',
            animation: 'points-pop 0.5s 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)',
              borderRadius: '30px', padding: '8px 20px',
            }}>
              <Zap size={16} color="#fbbf24" fill="#fbbf24" />
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#fbbf24' }}>
                +{achievement.points} Growth Points
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={handleShareWithCoach}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                width: '100%', padding: '13px 0',
                background: `linear-gradient(135deg, #37b5ff 0%, #0ea5e9 100%)`,
                border: 'none', borderRadius: '12px',
                color: '#000a1f', fontSize: '14px', fontWeight: 900,
                cursor: 'pointer', letterSpacing: '.3px',
                boxShadow: '0 6px 20px rgba(55,181,255,0.35)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = 'translateY(-2px)';
                b.style.boxShadow = '0 10px 28px rgba(55,181,255,0.45)';
              }}
              onMouseLeave={e => {
                const b = e.currentTarget as HTMLButtonElement;
                b.style.transform = '';
                b.style.boxShadow = '0 6px 20px rgba(55,181,255,0.35)';
              }}
            >
              <Share2 size={15} /> Share with Coach Mike
            </button>

            <button
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '100%', padding: '12px 0',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px', color: 'rgba(255,255,255,0.6)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'; }}
            >
              Close
            </button>
          </div>

          {/* Auto-dismiss progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
            background: 'rgba(255,255,255,0.06)', borderRadius: '0 0 24px 24px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              background: `linear-gradient(90deg, ${categoryColor}, #37b5ff)`,
              animation: 'dismiss-bar 6s linear forwards',
              width: '100%',
              transformOrigin: 'left',
            }} />
          </div>
        </div>
      </div>
    </>
  );
}

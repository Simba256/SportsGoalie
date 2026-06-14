'use client';

import { TrainingAnalytics } from '@/lib/training/analytics';

const CYAN = '#00FFFF';
const MINT = '#00FF99';
const VIOLET = '#B388FF';
const CORAL = '#FF6B6B';

const CATEGORY_COLORS: Record<string, string> = {
  ice: CYAN,
  puck_machine: MINT,
  land_conditioning: VIOLET,
  lifestyle_foundations: '#FFD166',
  games_tourneys: CORAL,
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  const pct = Math.round((score / 5) * 100);
  return (
    <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: '3px',
          background: color,
          transition: 'width 0.6s ease',
        }}
      />
    </div>
  );
}

function MasteryRing({ percent }: { percent: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  const gap = circ - dash;
  const isClub = percent >= 95;

  return (
    <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={isClub ? '#FFD700' : MINT}
          strokeWidth="8"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: isClub ? '#FFD700' : '#fff', fontSize: '20px', fontWeight: 800 }}>{percent}%</span>
        {isClub && <span style={{ color: '#FFD700', fontSize: '8px', fontWeight: 700 }}>CLUB</span>}
      </div>
    </div>
  );
}

interface Props {
  analytics: TrainingAnalytics;
}

export function TrainingAnalyticsDashboard({ analytics }: Props) {
  const { categoryScores, overallScore, masteryPercent } = analytics;
  const overallPct = Math.round((overallScore / 5) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Top row: overall standing + mastery ring */}
      <div style={{
        display: 'flex', gap: '16px', alignItems: 'center',
        background: 'rgba(0,255,153,0.05)',
        border: '1px solid rgba(0,255,153,0.15)',
        borderRadius: '16px', padding: '20px',
      }}>
        <MasteryRing percent={masteryPercent} />
        <div style={{ flex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
            Mastery Climb
          </p>
          <p style={{ color: '#fff', fontSize: '22px', fontWeight: 800, marginBottom: '4px' }}>
            {masteryPercent >= 95 ? '95–100 Club 🏆' : `${masteryPercent}% toward the Club`}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
            Overall standing: <strong style={{ color: MINT }}>{overallScore.toFixed(1)} / 5</strong>
            {' '}({overallPct}%)
          </p>
        </div>
      </div>

      {/* Category scores */}
      <div style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px', padding: '20px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '16px' }}>
          Category Scores
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {categoryScores.map(cat => {
            const color = CATEGORY_COLORS[cat.category] || CYAN;
            const scorePct = Math.round((cat.score / 5) * 100);
            return (
              <div key={cat.category}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600 }}>{cat.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{cat.doneCount}/{cat.itemCount}</span>
                    <span style={{ color: cat.score > 0 ? color : 'rgba(255,255,255,0.2)', fontSize: '13px', fontWeight: 700, minWidth: '36px', textAlign: 'right' }}>
                      {cat.score > 0 ? `${scorePct}%` : '—'}
                    </span>
                  </div>
                </div>
                <ScoreBar score={cat.score} color={color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Period range */}
      {analytics.periodRange && (
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center' }}>
          Based on logs from {analytics.periodRange.from} → {analytics.periodRange.to}
        </p>
      )}
    </div>
  );
}

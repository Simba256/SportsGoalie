'use client';

import Link from 'next/link';
import { Zap, ArrowLeft, Info } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

const BLUE = '#37b5ff';

interface SampleTransaction {
  id: number;
  points: number;
  description: string;
  pillar: string;
  type: 'knowledge-check' | 'module';
}

const SAMPLE_TRANSACTIONS: SampleTransaction[] = [
  { id: 1, points: 10, description: 'Knowledge Check Completed', pillar: '7AMS Pillar', type: 'knowledge-check' },
  { id: 2, points: 5,  description: 'Module Completed',          pillar: 'MIND-SET Pillar', type: 'module' },
  { id: 3, points: 10, description: 'Knowledge Check Completed', pillar: 'SKATING Pillar',  type: 'knowledge-check' },
  { id: 4, points: 5,  description: 'Module Completed',          pillar: '7AMS Pillar',     type: 'module' },
  { id: 5, points: 5,  description: 'Module Completed',          pillar: 'SKATING Pillar',  type: 'module' },
];

export default function GrowthPointsPage() {
  return (
    <ProtectedRoute>
      <GrowthPointsContent />
    </ProtectedRoute>
  );
}

function GrowthPointsContent() {
  return (
    <div style={{ minHeight: '100vh', background: '#000a1f' }}>
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .gp-row { transition: background 0.15s, border-color 0.15s; }
        .gp-row:hover { background: rgba(55,181,255,0.05) !important; border-color: rgba(55,181,255,0.18) !important; }
      `}</style>

      <div style={{
        maxWidth: '720px', margin: '0 auto',
        padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 28px) 64px',
        animation: 'fade-up 0.4s ease both',
      }}>

        {/* Back link */}
        <Link
          href="/progress"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none', marginBottom: '28px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = BLUE; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.45)'; }}
        >
          <ArrowLeft size={14} /> Back to Progress
        </Link>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '14px', flexShrink: 0,
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(251,191,36,0.15)',
          }}>
            <Zap size={22} color="#fbbf24" fill="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>
              Growth Points History
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', margin: '4px 0 0 0' }}>
              Track your earned points across all activities
            </p>
          </div>
        </div>

        {/* Summary card */}
        <div style={{
          background: 'rgba(2,18,44,0.9)',
          border: '1px solid rgba(55,181,255,0.16)',
          borderRadius: '18px', padding: '24px',
          marginBottom: '24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Top accent */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #fbbf24, transparent)',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                Total Growth Points Earned
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '48px', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>0</span>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>pts</span>
              </div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: '12px', padding: '12px 16px', maxWidth: '260px',
            }}>
              <Zap size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.5, margin: 0 }}>
                Points accumulate as you complete modules, Knowledge Checks, and charting sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div style={{
          background: 'rgba(2,18,44,0.9)',
          border: '1px solid rgba(55,181,255,0.14)',
          borderRadius: '18px', overflow: 'hidden',
          marginBottom: '24px',
        }}>
          {/* List header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 22px', borderBottom: '1px solid rgba(55,181,255,0.09)',
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', margin: 0 }}>Transactions</h2>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '3px' }}>
                Recent activity log
              </p>
            </div>
            {/* Sample data badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px', padding: '4px 10px',
            }}>
              <Info size={10} /> Sample data
            </span>
          </div>

          {/* Rows */}
          {SAMPLE_TRANSACTIONS.map((tx, idx) => (
            <div
              key={tx.id}
              className="gp-row"
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '16px 22px',
                borderBottom: idx < SAMPLE_TRANSACTIONS.length - 1
                  ? '1px solid rgba(55,181,255,0.07)'
                  : 'none',
                background: 'transparent',
                border: 'none',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
                background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.22)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap size={16} color="#fbbf24" />
              </div>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px', fontWeight: 700, color: '#fff',
                  margin: '0 0 3px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {tx.description}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                  {tx.pillar}
                </p>
              </div>

              {/* Points + date */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '16px', fontWeight: 900, color: '#fbbf24', margin: '0 0 3px 0' }}>
                  +{tx.points}
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
                  Sample data
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          background: 'rgba(55,181,255,0.06)', border: '1px solid rgba(55,181,255,0.14)',
          borderRadius: '12px', padding: '14px 18px',
        }}>
          <Info size={14} color={BLUE} style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', margin: 0, lineHeight: 1.5 }}>
            Your full transaction history will be available once your account accumulates points.
          </p>
        </div>
      </div>
    </div>
  );
}

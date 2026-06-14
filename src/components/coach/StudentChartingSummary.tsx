'use client';

import { useEffect, useState } from 'react';
import { Loader2, BarChart3, TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import { chartingService } from '@/lib/database/services/charting.service';
import type { StudentChartingAnalytics } from '@/types';

const BLUE = '#37b5ff';
const GREEN = '#4ade80';
const RED = '#f87171';
const YELLOW = '#fbbf24';

const card: React.CSSProperties = { background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.14)', borderRadius: '14px', overflow: 'hidden' };
const sectionHeader: React.CSSProperties = { padding: '14px 16px', borderBottom: '1px solid rgba(55,181,255,0.08)' };

const LEVEL_STYLE: Record<string, { color: string; border: string }> = {
  strong:    { color: GREEN,  border: 'rgba(74,222,128,0.3)' },
  good:      { color: BLUE,   border: 'rgba(55,181,255,0.3)' },
  improving: { color: YELLOW, border: 'rgba(251,191,36,0.3)' },
  weak:      { color: RED,    border: 'rgba(248,113,113,0.3)' },
};

interface Props { studentId: string; }

export function StudentChartingSummary({ studentId }: Props) {
  const [analytics, setAnalytics] = useState<StudentChartingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await chartingService.getStudentAnalytics(studentId);
        if (result.success && result.data) setAnalytics(result.data);
      } catch (err) {
        console.error('Failed to load charting analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (loading) {
    return (
      <>
        <style>{`@keyframes sc-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        <div style={{ ...card, padding: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Loader2 size={18} color="rgba(255,255,255,0.3)" style={{ animation: 'sc-spin 1s linear infinite' }} />
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>Loading charts…</p>
        </div>
      </>
    );
  }

  if (!analytics || !analytics.sessionStats) {
    return (
      <div style={{ ...card, padding: '28px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
          <BarChart3 size={22} color="rgba(255,255,255,0.25)" />
        </div>
        <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>No Game Data Yet</p>
        <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', lineHeight: 1.6 }}>
          Performance data will appear here once the student logs games and practices.
        </p>
      </div>
    );
  }

  const stats = analytics.sessionStats;
  const goals = analytics.goalsAnalytics;

  const TrendIcon = ({ trend }: { trend?: string }) => {
    if (trend === 'improving') return <TrendingUp size={12} color={GREEN} />;
    if (trend === 'declining') return <TrendingDown size={12} color={RED} />;
    return <Minus size={12} color="rgba(255,255,255,0.3)" />;
  };

  return (
    <div style={card}>
      <div style={sectionHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={14} color={BLUE} />
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>Game Performance</p>
        </div>
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Session stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Sessions', value: stats.totalSessions || 0, color: BLUE },
            { label: 'Completed', value: stats.completedSessions || 0, color: GREEN },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }}>
              <p style={{ fontSize: '22px', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '4px' }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Goals analytics */}
        {goals && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Goals Analysis</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Good/Bad ratio</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: goals.goodBadRatio >= 1 ? GREEN : RED, background: goals.goodBadRatio >= 1 ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', border: `1px solid ${goals.goodBadRatio >= 1 ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`, borderRadius: '20px', padding: '2px 8px' }}>
                  {goals.goodBadRatio.toFixed(1)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Good goals</span>
                <span style={{ color: GREEN, fontWeight: 700, fontSize: '13px' }}>{goals.totalGoodGoals}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Bad goals</span>
                <span style={{ color: RED, fontWeight: 700, fontSize: '13px' }}>{goals.totalBadGoals}</span>
              </div>
            </div>
          </div>
        )}

        {/* Category trends */}
        {analytics.categoryPerformances && analytics.categoryPerformances.length > 0 && (
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Category Trends</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analytics.categoryPerformances.slice(0, 5).map((cat) => {
                const lvl = LEVEL_STYLE[cat.currentLevel] || LEVEL_STYLE.weak;
                return (
                  <div key={cat.category} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', textTransform: 'capitalize', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.category.replace(/_/g, ' ')}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <TrendIcon trend={cat.trend} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: lvl.color, background: `${lvl.color}15`, border: `1px solid ${lvl.border}`, borderRadius: '20px', padding: '1px 7px' }}>
                        {cat.currentLevel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Streak */}
        {analytics.streak && analytics.streak.currentStreak > 0 && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Flame size={14} color={YELLOW} />
              <span style={{ color: YELLOW, fontSize: '13px', fontWeight: 800 }}>{analytics.streak.currentStreak} day streak</span>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>Best: {analytics.streak.longestStreak}d</span>
          </div>
        )}

      </div>
    </div>
  );
}

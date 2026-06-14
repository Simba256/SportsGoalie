'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { Session, SessionStats, DynamicChartingEntry, ChartingEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, CheckCircle2, X, ArrowRight, BarChart2 } from 'lucide-react';
import { SkeletonBannerLight, SkeletonStatCards, SkeletonChart } from '@/components/ui/skeletons';
import { format } from 'date-fns';
import { CalendarHeatmap } from '@/components/charting/CalendarHeatmap';
import { NewSessionModal } from '@/components/charting/NewSessionModal';

const CYAN   = '#00FFFF';
const MINT   = '#00FF99';
const VIOLET = '#B388FF';
const CORAL  = '#FF6B6B';
const MUTED  = 'rgba(255,255,255,0.38)';
const LABEL  = 'rgba(255,255,255,0.55)';

const DAY_MS = 24 * 60 * 60 * 1000;

const toDate = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value) {
    const candidate = value as { toDate?: () => Date };
    if (typeof candidate.toDate === 'function') return candidate.toDate();
  }
  return null;
};

const toDateKey = (value: unknown): string | null => {
  const date = toDate(value);
  return date ? format(date, 'yyyy-MM-dd') : null;
};

const calculateSessionStats = (sessions: Session[]): SessionStats => {
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const gameSessions     = sessions.filter(s => s.type === 'game');
  const practiceSessions = sessions.filter(s => s.type === 'practice');
  const now = new Date();
  const oneWeekAgo  = new Date(now.getTime() - 7 * DAY_MS);
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisWeekSessions  = sessions.filter(s => { const d = toDate(s.date); return d ? d >= oneWeekAgo : false; }).length;
  const thisMonthSessions = sessions.filter(s => { const d = toDate(s.date); return d ? d >= monthStart : false; }).length;
  return {
    totalSessions: sessions.length, completedSessions: completedSessions.length,
    gameSessions: gameSessions.length, practiceSessions: practiceSessions.length,
    completionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
    averageSessionsPerWeek: thisWeekSessions, averageSessionsPerMonth: thisMonthSessions,
    thisWeekSessions, thisMonthSessions,
  };
};

const calculateCurrentStreak = (sessions: Session[], chartingEntries: ChartingEntry[], dynamicEntries: DynamicChartingEntry[]): number => {
  const activityDateKeys = new Set<string>();
  sessions.filter(s => s.status === 'completed').forEach(s => { const k = toDateKey(s.date); if (k) activityDateKeys.add(k); });
  chartingEntries.forEach(e => { const k = toDateKey(e.submittedAt); if (k) activityDateKeys.add(k); });
  dynamicEntries.forEach(e => { const k = toDateKey(e.submittedAt); if (k) activityDateKeys.add(k); });
  const streakDates = Array.from(activityDateKeys).sort((a, b) => b.localeCompare(a));
  if (!streakDates.length) return 0;
  const today     = toDateKey(new Date());
  const yesterday = toDateKey(new Date(Date.now() - DAY_MS));
  if (!today || !yesterday) return 0;
  if (streakDates[0] !== today && streakDates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < streakDates.length; i++) {
    const prev = new Date(`${streakDates[i - 1]}T00:00:00`);
    const curr = new Date(`${streakDates[i]}T00:00:00`);
    const diff = Math.round((prev.getTime() - curr.getTime()) / DAY_MS);
    if (diff === 1) { streak++; continue; }
    if (diff > 1) break;
  }
  return streak;
};

export default function ChartingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions,        setSessions]        = useState<Session[]>([]);
  const [chartingEntries, setChartingEntries] = useState<ChartingEntry[]>([]);
  const [dynamicEntries,  setDynamicEntries]  = useState<DynamicChartingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const stats         = useMemo<SessionStats>(() => calculateSessionStats(sessions), [sessions]);
  const currentStreak = useMemo(() => calculateCurrentStreak(sessions, chartingEntries, dynamicEntries), [sessions, chartingEntries, dynamicEntries]);

  const chartedSessionIds = useMemo(() => {
    const ids = new Set<string>();
    chartingEntries.forEach(e => ids.add(e.sessionId));
    dynamicEntries.forEach(e => ids.add(e.sessionId));
    return ids;
  }, [chartingEntries, dynamicEntries]);

  const chartingStats = useMemo(() => {
    const totalSessions   = sessions.length;
    const chartedSessions = sessions.reduce((n, s) => n + (chartedSessionIds.has(s.id) ? 1 : 0), 0);
    return { totalSessions, chartedSessions, completionRate: totalSessions > 0 ? Math.round((chartedSessions / totalSessions) * 100) : 0 };
  }, [sessions, chartedSessionIds]);

  const [selectedDate,        setSelectedDate]        = useState<Date | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([]);
  const [showNewSession,      setShowNewSession]      = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push('/auth/login'); }, [user, authLoading, router]);
  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sR, eR, dR] = await Promise.all([
        chartingService.getSessionsByStudent(user.id, { limit: 500, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getChartingEntriesByStudent(user.id),
        dynamicChartingService.getDynamicEntriesByStudent(user.id),
      ]);
      if (sR.success && sR.data) setSessions(sR.data);
      if (eR.success && eR.data) setChartingEntries(eR.data);
      if (dR.success && dR.data) setDynamicEntries(dR.data);
    } catch (err) { console.error('Failed to load data:', err); }
    finally { setLoading(false); }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': case 'charted': return 'default';
      case 'in-progress': return 'secondary';
      default: return 'outline';
    }
  };

  const getDisplayStatus = (session: Session) => {
    if (session.status === 'completed') return 'completed';
    return chartedSessionIds.has(session.id) ? 'charted' : session.status;
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <SkeletonBannerLight />
        <SkeletonStatCards count={4} />
        <SkeletonChart />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>{`
        .charting-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; }
        .metric-card-ch { transition: border-color .2s, transform .2s; }
        .metric-card-ch:hover { transform: translateY(-2px); }
      `}</style>

      {/* ── HEADER CARD ── */}
      <div style={{ position: 'relative', borderRadius: '16px', background: 'linear-gradient(135deg, #0f0d20 0%, #1a1830 55%, #0d0b1c 100%)', border: '1px solid rgba(0,255,255,0.18)', overflow: 'hidden' }}>
        {/* cyan top line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent 0%, ${CYAN} 35%, ${MINT} 65%, transparent 100%)` }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px', padding: 'clamp(20px,3vw,32px) clamp(18px,3vw,28px)' }}>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'stretch' }}>
            {/* accent bar */}
            <div style={{ width: '4px', borderRadius: '99px', background: `linear-gradient(180deg, ${CYAN}, ${MINT})`, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '11px', color: LABEL, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Performance Tracking
              </p>
              <h1 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-.03em', lineHeight: 1, marginBottom: '12px' }}>
                Chart Every <span style={{ color: CYAN, textShadow: `0 0 20px rgba(0,255,255,0.4)` }}>Session</span>
              </h1>
              <p style={{ fontSize: '14px', color: MUTED, lineHeight: 1.6, maxWidth: '380px' }}>
                {stats.totalSessions > 0
                  ? `${stats.totalSessions} total sessions · ${chartingStats.completionRate}% charted · ${currentStreak} day streak`
                  : 'Start charting your game and practice sessions to track your progress.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowNewSession(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: `linear-gradient(135deg, ${CYAN}, ${MINT})`, border: 'none', borderRadius: '9px', padding: '9px 18px', color: '#001a0d', fontSize: '13px', fontWeight: 800, cursor: 'pointer', boxShadow: `0 4px 18px rgba(0,255,255,0.35)` }}
                >
                  <Plus size={13} /> New Session
                </button>
                <button
                  onClick={() => router.push('/charting/analytics')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.14)', borderRadius: '9px', padding: '9px 18px', color: 'rgba(255,255,255,.75)', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                >
                  <BarChart2 size={13} /> View Analytics
                </button>
              </div>
            </div>
          </div>

          {/* Donut ring */}
          <div style={{ flexShrink: 0 }}>
            <ChartingRing pct={chartingStats.completionRate} charted={chartingStats.chartedSessions} total={chartingStats.totalSessions} />
          </div>
        </div>
      </div>

      {/* ── METRICS STRIP ── */}
      <div className="charting-metrics">
        <MetricCard label="Total Sessions"  value={stats.totalSessions}           sub="all time"             icon={<Calendar size={22} />}    accent={CYAN} />
        <MetricCard label="Games"           value={stats.gameSessions}            sub="game sessions"        icon={<TrendingUp size={22} />}  accent={CORAL} />
        <MetricCard label="Practices"       value={stats.practiceSessions}        sub="practice sessions"    icon={<CheckCircle2 size={22} />} accent={MINT} />
        <MetricCard label="This Month"      value={stats.thisMonthSessions || 0}  sub="sessions logged"      icon={<Calendar size={22} />}    accent={VIOLET} />
      </div>

      {/* ── ACTIVITY CALENDAR ── */}
      <div style={{ background: 'linear-gradient(135deg, #0f0d20 0%, #1a1830 100%)', border: '1px solid rgba(0,255,255,0.14)', borderRadius: '14px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '16px 20px', borderBottom: '1px solid rgba(0,255,255,0.1)' }}>
          <Calendar size={13} color={CYAN} />
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', letterSpacing: '.01em' }}>Activity Calendar</h3>
        </div>
        <div style={{ padding: '20px 20px 16px' }}>
          <CalendarHeatmap
            sessions={sessions}
            chartingEntries={chartingEntries}
            dynamicEntries={dynamicEntries}
            colorScheme="blue"
            onDayClick={(date, daySessions) => { setSelectedDate(date); setSelectedDaySessions(daySessions); }}
          />
        </div>
      </div>

      {/* ── DAY CLICK MODAL ── */}
      {selectedDate && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 50 }}
          onClick={() => { setSelectedDate(null); setSelectedDaySessions([]); }}
        >
          <div
            style={{ background: 'linear-gradient(135deg, #0f0d20 0%, #1a1830 100%)', border: '1px solid rgba(0,255,255,0.22)', borderRadius: '20px', maxWidth: '560px', width: '100%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: LABEL }}>
                  {format(selectedDate, 'EEEE')}
                </p>
                <button
                  onClick={() => { setSelectedDate(null); setSelectedDaySessions([]); }}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>
                {format(selectedDate, 'MMMM d, yyyy')}
              </h3>
              <p style={{ fontSize: '13px', color: MUTED, marginTop: '4px' }}>
                {selectedDaySessions.length} session{selectedDaySessions.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ padding: '16px 24px 24px' }}>
              {selectedDaySessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                    <Calendar size={20} color="rgba(255,255,255,0.3)" />
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>No sessions on this day</p>
                  <p style={{ fontSize: '12px', color: MUTED }}>Tap &quot;New Session&quot; to create one</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedDaySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => router.push(`/charting/sessions/${session.id}`)}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,255,255,0.14)', borderRadius: '12px', padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(0,255,255,0.35)`; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `rgba(0,255,255,0.14)`; }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                            {session.type === 'game' ? '🥅 Game' : '🏒 Practice'}
                            {session.opponent && ` vs ${session.opponent}`}
                          </h4>
                          <Badge variant={getStatusBadgeVariant(getDisplayStatus(session))}>
                            {getDisplayStatus(session)}
                          </Badge>
                        </div>
                        {session.location && (
                          <p style={{ fontSize: '12px', color: MUTED }}>{session.location}</p>
                        )}
                        {session.tags && session.tags.length > 0 && (
                          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {session.tags.map(tag => (
                              <span key={tag} style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(0,255,255,0.8)', background: 'rgba(0,255,255,0.08)', border: '1px solid rgba(0,255,255,0.22)', borderRadius: '99px', padding: '2px 8px' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ArrowRight size={14} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginLeft: '12px' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Session Modal */}
      <NewSessionModal open={showNewSession} onClose={() => setShowNewSession(false)} />
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

function ChartingRing({ pct, charted, total }: { pct: number; charted: number; total: number }) {
  const size   = 108;
  const stroke = 7;
  const r      = (size - stroke) / 2;
  const circ   = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="chart-ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={CYAN} />
              <stop offset="60%" stopColor={MINT} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
            </linearGradient>
          </defs>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#chart-ring-grad)" strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{pct}%</span>
          <span style={{ fontSize: '10px', color: MUTED, fontWeight: 600, letterSpacing: '.04em' }}>charted</span>
        </div>
      </div>
      <p style={{ fontSize: '11px', color: MUTED, textAlign: 'center' }}>{charted}/{total} sessions</p>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, accent }: { label: string; value: string | number; sub: string; icon: React.ReactNode; accent: string }) {
  return (
    <div className="metric-card-ch" style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: 'linear-gradient(135deg, #0f0d20 0%, #1a1830 100%)', border: `1px solid ${accent}38`, padding: '18px 18px 16px' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${accent}, ${accent}44, transparent)` }} />
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `linear-gradient(135deg, ${accent}28, ${accent}10)`, border: `1px solid ${accent}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: '14px', boxShadow: `0 4px 16px ${accent}22` }}>
        {icon}
      </div>
      <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1, marginBottom: '5px', letterSpacing: '-.02em' }}>{value}</p>
      <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,.75)', marginBottom: '3px' }}>{label}</p>
      <p style={{ fontSize: '11px', color: MUTED, fontWeight: 500 }}>{sub}</p>
    </div>
  );
}

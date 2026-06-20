'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { chartingService, parentLinkService, parentChartingService } from '@/lib/database';
import { Session, LinkedChildSummary } from '@/types';
import { ParentChartEntry } from '@/types/charting';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { BarChart3, ChevronRight, CheckCircle2, Clock, Users } from 'lucide-react';

const BLUE  = '#37b5ff';
const GREEN = '#1D9E75';

export default function ParentChartingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [children,  setChildren]  = useState<LinkedChildSummary[]>([]);
  const [sessions,  setSessions]  = useState<Session[]>([]);
  const [chartMap,  setChartMap]  = useState<Record<string, ParentChartEntry>>({});
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
    if (!authLoading && user && user.role !== 'parent') router.push('/dashboard');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;
    (async () => {
      try {
        setLoading(true);
        const childResult = await parentLinkService.getLinkedChildren(user.id);
        if (!childResult.success || !childResult.data?.length) {
          setChildren([]);
          return;
        }
        const linked = childResult.data;
        setChildren(linked);

        // Use the first linked goalie (most parents have one)
        const studentId = linked[0].childId;

        const [sessionsResult, chartsResult] = await Promise.all([
          chartingService.getSessionsByStudent(studentId, { sessionType: 'game', orderBy: 'date', orderDirection: 'desc' }),
          parentChartingService.getChartsByStudent(studentId),
        ]);

        if (sessionsResult.success && sessionsResult.data) {
          setSessions(sessionsResult.data);
        }

        if (chartsResult.success && chartsResult.data) {
          const map: Record<string, ParentChartEntry> = {};
          chartsResult.data.forEach(entry => { map[entry.sessionId] = entry; });
          setChartMap(map);
        }
      } catch {
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (authLoading || loading) return <SkeletonDarkPage />;
  if (!user || user.role !== 'parent') return null;

  const goalieName = children[0]?.displayName;

  return (
    <div style={{ minHeight: '100vh', padding: 'clamp(20px,3vw,32px) clamp(16px,4vw,32px)', maxWidth: '800px', margin: '0 auto' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `rgba(55,181,255,0.12)`, border: `1px solid rgba(55,181,255,0.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart3 size={17} color={BLUE} />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#fff' }}>Charting</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.6 }}>
          {goalieName
            ? `Fill in your perspective on ${goalieName}'s games. Your observations cross-reference with their self-chart.`
            : 'Link a goalie to start charting their games.'}
        </p>
      </div>

      {/* ── No linked goalie ─────────────────────────────────────────────── */}
      {children.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(2,18,44,.7)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px' }}>
          <Users size={28} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>No linked goalies</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginBottom: '20px' }}>
            Link your goalie's account first to see their game sessions here.
          </p>
          <button
            onClick={() => router.push('/parent/link-child')}
            style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #158C64 100%)`, border: 'none', borderRadius: '10px', padding: '10px 22px', color: '#fff', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
          >
            Link Your Goalie
          </button>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div style={{ padding: '13px 16px', borderRadius: '12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)', marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
        </div>
      )}

      {/* ── Session list ─────────────────────────────────────────────────── */}
      {children.length > 0 && sessions.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'rgba(2,18,44,.7)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '20px' }}>
          <Clock size={28} color="rgba(255,255,255,0.12)" style={{ margin: '0 auto 14px' }} />
          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>No game sessions yet</p>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            Sessions will appear here once {goalieName} has logged a game.
          </p>
        </div>
      )}

      {sessions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map(session => {
            const entry    = chartMap[session.id];
            const done     = entry?.completedSections?.length === 3;
            const started  = !!entry && !done;
            const dateObj  = (() => {
              const raw = session.date as unknown;
              if (raw && typeof raw === 'object' && 'toDate' in raw && typeof (raw as { toDate?: unknown }).toDate === 'function') {
                return (raw as { toDate: () => Date }).toDate();
              }
              return raw instanceof Date ? raw : null;
            })();

            return (
              <button
                key={session.id}
                type="button"
                onClick={() => router.push(`/charting/sessions/${session.id}/parent-chart`)}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: done ? 'rgba(55,181,255,0.06)' : 'rgba(2,18,44,0.7)',
                  border: `1px solid ${done ? 'rgba(55,181,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: '16px', padding: '16px 18px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = done ? 'rgba(55,181,255,0.1)' : 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = done ? 'rgba(55,181,255,0.06)' : 'rgba(2,18,44,0.7)'; }}
              >
                {/* Status dot */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: done ? 'rgba(55,181,255,0.15)' : started ? 'rgba(251,146,60,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${done ? 'rgba(55,181,255,0.3)' : started ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  {done
                    ? <CheckCircle2 size={18} color={BLUE} />
                    : started
                      ? <Clock size={18} color="#fb923c" />
                      : <BarChart3 size={18} color="rgba(255,255,255,0.3)" />
                  }
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>
                      Game{session.opponent ? ` vs ${session.opponent}` : ''}
                    </p>
                    {done && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: BLUE, background: 'rgba(55,181,255,0.12)', border: '1px solid rgba(55,181,255,0.25)', borderRadius: '20px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        Complete
                      </span>
                    )}
                    {started && !done && (
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#fb923c', background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)', borderRadius: '20px', padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                        In Progress
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>
                    {dateObj ? dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    {entry && ` · ${entry.completedSections.length}/3 sections`}
                  </p>
                </div>

                <ChevronRight size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      {sessions.length > 0 && (
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '28px' }}>
          The Smarter Goalie Way™ · Four charts, one mirror
        </p>
      )}
    </div>
  );
}

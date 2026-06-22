'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LineChart, Trophy, Check, Plus, Loader2, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import { userService, chartingService } from '@/lib/database';
import { coachChartingService } from '@/lib/database/services/coach-charting.service';
import { User as UserType, Session, CoachChartEntry } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { GoalieChartingHistory } from '@/components/charting/GoalieChartingHistory';

const BLUE  = '#37b5ff';
const GOLD  = '#D4A93B';
const GREEN = '#4ade80';
const cardBg = 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)';
const border  = '1px solid rgba(55,181,255,0.22)';

export default function CoachStudentChartingPage() {
  const { user }  = useAuth();
  const router    = useRouter();
  const params    = useParams();
  const studentId = params.studentId as string;

  const [student,       setStudent]       = useState<UserType | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [gameSessions,  setGameSessions]  = useState<Session[]>([]);
  const [coachCharts,   setCoachCharts]   = useState<CoachChartEntry[]>([]);
  const [chartLoading,  setChartLoading]  = useState(true);

  // ── Load student ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!studentId || !user) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await userService.getUser(studentId);
        if (result.success && result.data) {
          if (user.role === 'coach' && result.data.assignedCoachId !== user.id) {
            toast.error('This goalie is not on your roster');
            router.push('/coach/students');
            return;
          }
          setStudent(result.data);
        } else {
          toast.error('Goalie not found');
          router.push('/coach/students');
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load goalie');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId, user, router]);

  // ── Load game sessions + coach charts ────────────────────────────────────

  useEffect(() => {
    if (!studentId || !user) return;
    const loadChartData = async () => {
      setChartLoading(true);
      try {
        const [sessionsResult, chartsResult] = await Promise.all([
          chartingService.getSessionsByStudent(studentId, {
            sessionType: 'game',
            orderBy: 'date',
            orderDirection: 'desc',
            limit: 50,
          }),
          coachChartingService.getChartsByStudent(studentId, user.id),
        ]);
        if (sessionsResult.success) setGameSessions(sessionsResult.data ?? []);
        if (chartsResult.success)   setCoachCharts(chartsResult.data ?? []);
      } catch (err) {
        console.error('Failed to load coach chart data', err);
      } finally {
        setChartLoading(false);
      }
    };
    loadChartData();
  }, [studentId, user]);

  if (loading) return <SkeletonContentPage />;

  if (!student) {
    return (
      <div style={{ maxWidth: '560px', margin: '80px auto', padding: '0 16px', textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '16px' }}>Goalie not found</p>
        <Link href="/coach/students" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(55,181,255,0.08)', border: '1px solid rgba(55,181,255,0.2)', color: BLUE, padding: '9px 18px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
          Back to Goalies
        </Link>
      </div>
    );
  }

  const initials = (student.displayName || student.email || 'G')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  // Map sessionId → coach chart entry
  const chartBySession = new Map<string, CoachChartEntry>();
  coachCharts.forEach(c => chartBySession.set(c.sessionId, c));

  const getChartStatus = (entry: CoachChartEntry | undefined) => {
    if (!entry) return 'none';
    if (entry.completedSections.length === 3) return 'complete';
    return 'partial';
  };

  return (
    <>
      <style>{`
        .sc-back:hover { color: ${BLUE} !important; background: rgba(55,181,255,0.08) !important; }
        .cc-row:hover   { background: rgba(55,181,255,0.04) !important; }
        .cc-btn:hover   { background: rgba(55,181,255,0.15) !important; border-color: ${BLUE} !important; }
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(20px,3vw,32px) clamp(14px,3vw,24px) 56px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        <Link href="/coach/students" className="sc-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, borderRadius: '8px', padding: '6px 10px', width: 'fit-content', transition: 'all 0.2s' }}>
          <ArrowLeft size={15} /> Back to Goalies
        </Link>

        {/* ── Header ── */}
        <div style={{ position: 'relative', borderRadius: '20px', background: 'linear-gradient(135deg, #04213f 0%, #0b3460 50%, #0d1f40 100%)', border, boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(55,181,255,0.12)', padding: '24px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(212,169,59,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, transparent, ${GOLD}, ${BLUE}44, transparent)` }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `linear-gradient(135deg, ${GOLD} 0%, #B8891E 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: '#0c0800', flexShrink: 0, border: '2px solid rgba(212,169,59,0.35)' }}>
              {student.profileImage
                ? <img src={student.profileImage} alt={student.displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : initials}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <LineChart size={15} color={GOLD} />
                <span style={{ color: GOLD, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px' }}>Charting</span>
              </div>
              <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '22px' }}>{student.displayName}</h1>
              {student.email && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginTop: '2px' }}>{student.email}</p>}
            </div>
          </div>
        </div>

        {/* ── Goalie's Charts ── */}
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(55,181,255,0.3), transparent)' }} />
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>Goalie's Self-Charts</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              Every session the goalie has charted. Expand a row to read the full reflection, Mind Vault entries, and ratings.
            </p>
          </div>
          <div style={{ padding: '16px' }}>
            <GoalieChartingHistory studentId={studentId} onOpenSession={sid => router.push(`/charting/sessions/${sid}`)} />
          </div>
        </div>

        {/* ── Coach Charts ── */}
        <div style={{ position: 'relative', background: cardBg, border, borderRadius: '16px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(212,169,59,0.3), transparent)' }} />
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(55,181,255,0.1)' }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>My Coach Charts</h2>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
              Add your evaluation for any game. Charts cross-reference with the goalie's self-assessment — alignment confirms, gaps reveal where coaching begins.
            </p>
          </div>

          <div style={{ padding: '12px 16px 16px' }}>
            {chartLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '32px' }}>
                <Loader2 size={18} color="rgba(255,255,255,0.3)" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>Loading sessions…</span>
              </div>
            ) : gameSessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Trophy size={22} color="rgba(255,255,255,0.2)" />
                </div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>No game sessions yet</p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', lineHeight: 1.6 }}>Game sessions will appear here once the goalie logs them.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {gameSessions.map(session => {
                  const chart   = chartBySession.get(session.id);
                  const status  = getChartStatus(chart);
                  const dateStr = session.date?.toDate ? format(session.date.toDate(), 'EEE, MMM d, yyyy') : '';

                  const statusBadge = {
                    none:     { label: 'Not Charted', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)',    color: 'rgba(255,255,255,0.35)' },
                    partial:  { label: 'Partial',      bg: 'rgba(251,191,36,0.1)',    border: 'rgba(251,191,36,0.3)',     color: '#fbbf24' },
                    complete: { label: '✓ Complete',   bg: 'rgba(74,222,128,0.1)',    border: 'rgba(74,222,128,0.3)',     color: GREEN },
                  }[status];

                  return (
                    <div
                      key={session.id}
                      className="cc-row"
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 14px', borderRadius: '12px', background: 'rgba(2,18,44,0.5)', border: '1px solid rgba(55,181,255,0.1)', transition: 'background 0.15s', cursor: 'default' }}
                    >
                      {/* Icon */}
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: `${BLUE}12`, border: `1px solid ${BLUE}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Trophy size={16} color={BLUE} />
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                            Game
                            {session.opponent && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}> vs {session.opponent}</span>}
                          </p>
                          <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', padding: '2px 8px', borderRadius: '20px', background: statusBadge.bg, border: `1px solid ${statusBadge.border}`, color: statusBadge.color }}>
                            {statusBadge.label}
                          </span>
                          {session.result && (
                            <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 7px', borderRadius: '20px', background: session.result === 'win' ? 'rgba(74,222,128,0.1)' : session.result === 'loss' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.06)', color: session.result === 'win' ? GREEN : session.result === 'loss' ? '#f87171' : 'rgba(255,255,255,0.4)', border: `1px solid ${session.result === 'win' ? 'rgba(74,222,128,0.25)' : session.result === 'loss' ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                              {session.result.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={10} /> {dateStr}
                          </span>
                          {session.location && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <MapPin size={10} /> {session.location}
                            </span>
                          )}
                          {status === 'partial' && chart && (
                            <span style={{ color: 'rgba(255,255,255,0.25)' }}>
                              {chart.completedSections.length}/3 sections
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button */}
                      <button
                        type="button"
                        className="cc-btn"
                        onClick={() => router.push(`/coach/students/${studentId}/charting/sessions/${session.id}`)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '7px 14px', borderRadius: '8px',
                          background: status === 'none' ? `${BLUE}12` : 'rgba(255,255,255,0.06)',
                          border: status === 'none' ? `1px solid ${BLUE}30` : '1px solid rgba(255,255,255,0.12)',
                          color: status === 'none' ? BLUE : 'rgba(255,255,255,0.6)',
                          fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', flexShrink: 0,
                        }}
                      >
                        {status === 'none'
                          ? <><Plus size={13} /> Add Chart</>
                          : status === 'complete'
                          ? <><Check size={13} color={GREEN} style={{ color: GREEN }} /> View / Edit</>
                          : <><Plus size={13} /> Continue</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

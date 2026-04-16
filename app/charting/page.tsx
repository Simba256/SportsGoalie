'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { dynamicChartingService } from '@/lib/database/services/dynamic-charting.service';
import { Session, SessionStats, StreakData, DynamicChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, Flame, CheckCircle2, X, ArrowRight } from 'lucide-react';
import { SkeletonBannerLight, SkeletonStatCards, SkeletonChart } from '@/components/ui/skeletons';
import { format } from 'date-fns';
import { CalendarHeatmap } from '@/components/charting/CalendarHeatmap';

export default function ChartingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartingEntries, setChartingEntries] = useState<any[]>([]);
  const [dynamicEntries, setDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  // Calculate charting completion stats
  const chartingStats = {
    totalSessions: sessions.length,
    chartedSessions: sessions.filter(session => {
      const hasDynamicEntry = dynamicEntries.some(e => e.sessionId === session.id);
      const hasLegacyEntry = chartingEntries.some(e => e.sessionId === session.id);
      return hasDynamicEntry || hasLegacyEntry;
    }).length,
    get completionRate() {
      return this.totalSessions > 0 ? Math.round((this.chartedSessions / this.totalSessions) * 100) : 0;
    }
  };

  // Selected day modal state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDaySessions, setSelectedDaySessions] = useState<Session[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [sessionsResult, analyticsResult, entriesResult, dynamicEntriesResult] = await Promise.all([
        chartingService.getSessionsByStudent(user.id, { limit: 500, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getStudentAnalytics(user.id),
        chartingService.getChartingEntriesByStudent(user.id),
        dynamicChartingService.getDynamicEntriesByStudent(user.id),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      if (analyticsResult.success && analyticsResult.data) {
        setStats(analyticsResult.data.sessionStats);
        setStreak(analyticsResult.data.streak);
      }

      if (entriesResult.success && entriesResult.data) {
        setChartingEntries(entriesResult.data);
      }

      if (dynamicEntriesResult.success && dynamicEntriesResult.data) {
        setDynamicEntries(dynamicEntriesResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDayClick = (date: Date, daySessions: Session[]) => {
    setSelectedDate(date);
    setSelectedDaySessions(daySessions);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSelectedDaySessions([]);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      default:
        return 'outline';
    }
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

  if (!user) {
    return null;
  }

  const sparklinePath = 'M5,40 L20,25 L40,35 L60,15 L80,25 L95,5';

  return (
    <div className="bg-gray-50">
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[430px] md:h-[450px] flex items-start justify-center text-center px-4 pt-16 md:pt-20 overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/goalie.avif')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-gray-100" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />
        <div className="relative z-10 max-w-4xl w-full mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Chart Every
            <br />
            Ice Session
          </h1>

          <p className="mt-5 max-w-3xl text-base md:text-lg text-gray-200 leading-relaxed font-light px-4">
            Build consistency with structured tracking, daily momentum, and clear analytics from your game and practice sessions.
          </p>

        </div>
      </section>

      <main className="relative z-20 max-w-6xl mx-auto px-4 pb-6 -mt-24 space-y-6 md:space-y-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 md:gap-7">
        <Card className="rounded-2xl bg-blue-50 border-blue-100 shadow-sm h-[190px] md:h-[200px]">
          <div className="relative p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 leading-tight">Total Sessions</p>
              <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-5xl md:text-6xl font-extrabold text-slate-900 tabular-nums tracking-tight">
              {stats?.totalSessions || 0}
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl bg-white border-slate-200 shadow-sm h-[190px] md:h-[200px]">
          <div className="relative p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Charted</p>
                <p className="text-[30px] font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight leading-none">
                  {chartingStats.chartedSessions}/{chartingStats.totalSessions}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center ml-4">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="mt-auto self-center relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  className="text-slate-100"
                  strokeWidth="4.5"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  className="text-blue-500"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeDasharray={`${chartingStats.completionRate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                {chartingStats.completionRate}%
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl bg-white border-slate-200 shadow-sm h-[190px] md:h-[200px]">
          <div className="relative p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 leading-tight">Current Streak</p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Flame className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-[40px] font-extrabold text-slate-900 leading-none tracking-tight">
              {streak?.currentStreak || 0}
              <span className="text-[28px] align-baseline ml-1">Days</span>
            </p>
          </div>
        </Card>

        <Card className="rounded-2xl bg-blue-50 border-blue-100 shadow-sm h-[190px] md:h-[200px] overflow-hidden">
          <div className="relative p-6 h-full flex flex-col">
            <div className="flex items-center justify-between z-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">This Month</p>
                <p className="text-5xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {stats?.thisMonthSessions || 0}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>

            <div className="absolute bottom-4 left-0 right-0 h-20 px-2 opacity-80">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50" aria-hidden="true">
                <path
                  d={sparklinePath}
                  fill="none"
                  stroke="#4299E1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl bg-white border-slate-200 shadow-sm h-[190px] md:h-[200px]">
          <div className="relative p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Quick Action</p>
              
            </div>

            <div className="flex-1 flex items-center">
              <Button
                onClick={() => router.push('/charting/sessions/new')}
                className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-4">
          <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">Activity Calendar</h2>

          <CalendarHeatmap
            sessions={sessions}
            chartingEntries={chartingEntries}
            dynamicEntries={dynamicEntries}
            colorScheme="blue"
            onDayClick={handleDayClick}
          />
        </div>
      </Card>
      </main>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {selectedDaySessions.length} session{selectedDaySessions.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={closeModal} className="rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {selectedDaySessions.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium">No sessions on this day</p>
                  <p className="text-sm text-muted-foreground mt-1">Tap &quot;New Session&quot; to create one</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDaySessions.map((session) => (
                    <Card
                      key={session.id}
                      className="p-4 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => router.push(`/charting/sessions/${session.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-foreground">
                              {session.type === 'game' ? 'Game' : 'Practice'}
                              {session.opponent && ` vs ${session.opponent}`}
                            </h4>
                            <Badge variant={getStatusBadgeVariant(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          {session.location && (
                            <p className="text-sm text-muted-foreground mt-1">{session.location}</p>
                          )}
                          {session.tags && session.tags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {session.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          View <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

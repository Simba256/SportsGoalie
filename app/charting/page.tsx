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
import { Plus, Calendar, TrendingUp, Flame, CheckCircle2, X, BarChart3, Target, ArrowRight } from 'lucide-react';
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Banner */}
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 rounded-b-none overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1515703407324-5f753afd8be8?auto=format&fit=crop&w=1920&q=80')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/65 to-slate-900/85" />
        <div className="relative z-10 px-6 py-7 md:px-8 md:py-9">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                Chart Every Ice Session,
                <span className="block text-red-600">Own the Crease.</span>
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/80 max-w-xl leading-relaxed">
                Build consistency with structured tracking, daily momentum, and clear analytics from your game and practice sessions.
              </p>
          
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:pb-1">
              <Button
                variant="outline"
                onClick={() => router.push('/charting/analytics')}
                className="border-blue-300/60 bg-blue-500/15 text-blue-100 hover:bg-blue-500/25 hover:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics & Trends
              </Button>
              <Button
                onClick={() => router.push('/charting/sessions/new')}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </section>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Sessions */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-300">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] bg-blue-100 text-blue-700 border-blue-200">Total Sessions</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {stats?.totalSessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          {/* Charted */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-300">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] bg-blue-100 text-blue-700 border-blue-200">Charted</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {chartingStats.chartedSessions}
                    <span className="text-lg text-muted-foreground font-normal ml-1">/ {chartingStats.totalSessions}</span>
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">{chartingStats.completionRate}% complete</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${chartingStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center ml-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-300">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] bg-blue-100 text-blue-700 border-blue-200">Current Streak</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {streak?.currentStreak || 0}
                  </p>
                  {(streak?.longestStreak ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Best: {streak?.longestStreak} days
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          {/* This Month */}
          <Card className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/60 hover:border-blue-300">
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em] bg-blue-100 text-blue-700 border-blue-200">This Month</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {stats?.thisMonthSessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar Heatmap */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-700">Activity Calendar</h2>
              {(streak?.longestStreak ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                  <Target className="w-4 h-4" />
                  Longest streak: {streak?.longestStreak} days
                </div>
              )}
            </div>

            <CalendarHeatmap
              sessions={sessions}
              chartingEntries={chartingEntries}
              dynamicEntries={dynamicEntries}
              colorScheme="blue"
              onDayClick={handleDayClick}
            />
          </div>
        </Card>

        {/* Day Detail Modal */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={closeModal}>
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto border-0 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 space-y-4">
                {/* Modal Header */}
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

                {/* Sessions List */}
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

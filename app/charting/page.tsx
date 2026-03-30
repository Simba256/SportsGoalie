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
import { Plus, Calendar, TrendingUp, Flame, CheckCircle2, Clock, X, BarChart3, Target, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading your charting data...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Performance Charting</h1>
            <p className="text-muted-foreground mt-1">Track your goaltending progress and consistency</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/charting/analytics')}
              className="border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Trends
            </Button>
            <Button
              onClick={() => router.push('/charting/sessions/new')}
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/25"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {stats?.totalSessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </Card>

          {/* Charted */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-500/10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">Charted</p>
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
                        className="h-full bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${chartingStats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center ml-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
          </Card>

          {/* Current Streak */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent/10"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {streak?.currentStreak || 0}
                  </p>
                  {(streak?.longestStreak ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Best: {streak?.longestStreak} days
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>
          </Card>

          {/* This Month */}
          <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">This Month</p>
                  <p className="text-4xl font-bold text-foreground mt-2 tabular-nums">
                    {stats?.thisMonthSessions || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Calendar Heatmap */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Activity Calendar</h2>
              {(streak?.longestStreak ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-accent font-medium bg-accent/10 px-3 py-1 rounded-full">
                  <Target className="w-4 h-4" />
                  Longest streak: {streak?.longestStreak} days
                </div>
              )}
            </div>

            <CalendarHeatmap
              sessions={sessions}
              chartingEntries={chartingEntries}
              dynamicEntries={dynamicEntries}
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
                        className="p-4 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
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
                            className="opacity-0 group-hover:opacity-100 transition-opacity border-primary/30 text-primary hover:bg-primary/5"
                          >
                            View
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
    </div>
  );
}

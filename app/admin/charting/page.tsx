'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { chartingService, dynamicChartingService, userService } from '@/lib/database';
import { ChartingEntry, DynamicChartingEntry, Session, User } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminRoute } from '@/components/auth/protected-route';
import { CalendarHeatmap } from '@/components/charting/CalendarHeatmap';
import { ChartingPerformanceSection } from '@/components/admin/charting/ChartingPerformanceSection';
import {
  Calendar,
  Eye,
  Search,
  RefreshCw,
  Target,
  Activity,
  Users,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { startOfWeek, startOfMonth, subMonths, isAfter, format, startOfDay } from 'date-fns';

type TimeRange = 'week' | 'month' | '3months' | 'all';

export default function AdminChartingPage() {
  return (
    <AdminRoute>
      <AdminChartingContent />
    </AdminRoute>
  );
}

function AdminChartingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deepLinkedSessionId = searchParams.get('session');
  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allEntries, setAllEntries] = useState<ChartingEntry[]>([]);
  const [allDynamicEntries, setAllDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChartingEntry[]>([]);
  const [filteredDynamicEntries, setFilteredDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  // Calendar day click → show sessions for that date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDateSessions, setSelectedDateSessions] = useState<Session[]>([]);
  const [focusedSessionId, setFocusedSessionId] = useState<string | null>(null);
  const [hasAppliedDeepLink, setHasAppliedDeepLink] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeRange, searchQuery, selectedStudent, allEntries, allDynamicEntries, allSessions]);

  useEffect(() => {
    if (loading || hasAppliedDeepLink || !deepLinkedSessionId) return;

    const targetSession = allSessions.find((session) => session.id === deepLinkedSessionId);
    if (!targetSession) {
      setHasAppliedDeepLink(true);
      return;
    }

    const targetDate = targetSession.date?.toDate?.();
    if (!targetDate) {
      setHasAppliedDeepLink(true);
      return;
    }

    // Force visibility for historical sessions and scope to the selected goalie.
    setTimeRange('all');
    setSelectedStudent(targetSession.studentId);
    setSelectedDate(startOfDay(targetDate));
    setSelectedDateSessions([targetSession]);
    setFocusedSessionId(targetSession.id);
    setHasAppliedDeepLink(true);
  }, [loading, hasAppliedDeepLink, deepLinkedSessionId, allSessions]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [sessionsResult, entriesResult, dynamicResult] = await Promise.all([
        chartingService.getAllSessions({ limit: 1000 }),
        chartingService.getAllChartingEntries({ limit: 1000 }),
        dynamicChartingService.getAllDynamicEntries({ limit: 1000 }),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setAllSessions(sessionsResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        setAllEntries(entriesResult.data);
        setFilteredEntries(entriesResult.data);
      }

      if (dynamicResult.success && dynamicResult.data) {
        setAllDynamicEntries(dynamicResult.data);
        setFilteredDynamicEntries(dynamicResult.data);
      }

      // Load user data for all unique students from both legacy and dynamic entries
      const uniqueStudentIds = Array.from(
        new Set([
          ...(entriesResult.data || []).map((e) => e.studentId),
          ...(dynamicResult.data || []).map((e) => e.studentId),
        ])
      );

      const userMap = new Map<string, User>();
      await Promise.all(
        uniqueStudentIds.map(async (studentId) => {
          const userResult = await userService.getUser(studentId);
          if (userResult.success && userResult.data) {
            userMap.set(studentId, userResult.data);
          }
        })
      );
      setUsers(userMap);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load charting data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEntries];
    let filteredDynamic = [...allDynamicEntries];

    // Student filter
    if (selectedStudent !== 'all') {
      filtered = filtered.filter((entry) => entry.studentId === selectedStudent);
      filteredDynamic = filteredDynamic.filter((entry) => entry.studentId === selectedStudent);
    }

    // Time filter
    if (timeRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = startOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case '3months':
          startDate = subMonths(now, 3);
          break;
        default:
          startDate = new Date(0);
      }

      filtered = filtered.filter((entry) => {
        const entryDate = entry.submittedAt?.toDate?.() ?? new Date();
        return isAfter(entryDate, startDate);
      });

      filteredDynamic = filteredDynamic.filter((entry) => {
        const entryDate = entry.submittedAt?.toDate?.() ?? new Date();
        return isAfter(entryDate, startDate);
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const session = allSessions.find((s) => s.id === entry.sessionId);
        return (
          session?.opponent?.toLowerCase().includes(query) ||
          session?.location?.toLowerCase().includes(query) ||
          entry.additionalComments?.toLowerCase().includes(query)
        );
      });

      filteredDynamic = filteredDynamic.filter((entry) => {
        const session = allSessions.find((s) => s.id === entry.sessionId);
        return (
          session?.opponent?.toLowerCase().includes(query) ||
          session?.location?.toLowerCase().includes(query) ||
          entry.additionalComments?.toLowerCase().includes(query)
        );
      });
    }

    setFilteredEntries(filtered);
    setFilteredDynamicEntries(filteredDynamic);
  };

  // Get unique students
  const uniqueStudents = Array.from(
    new Set([
      ...allEntries.map((e) => e.studentId),
      ...allDynamicEntries.map((e) => e.studentId),
    ])
  );

  // Helper to get student display name
  const getStudentName = (studentId: string): string => {
    const user = users.get(studentId);
    if (user) {
      return user.displayName || user.email || `Student ${studentId.slice(-6)}`;
    }
    return `Student ${studentId.slice(-6)}`;
  };

  const isLegacyEntryComplete = (entry: ChartingEntry | undefined) => {
    if (!entry) return false;
    return !!(entry.preGame && entry.gameOverview && entry.period1 && entry.period2 && entry.period3 && entry.postGame);
  };

  const getDynamicEntryTimestamp = (entry: DynamicChartingEntry) =>
    entry.submittedAt?.toDate?.()?.getTime() || 0;

  const getBestDynamicEntryForSession = (
    dynamicEntries: DynamicChartingEntry[]
  ): DynamicChartingEntry | undefined => {
    if (dynamicEntries.length === 0) return undefined;

    const completeEntries = dynamicEntries.filter((entry) => entry.isComplete);
    if (completeEntries.length > 0) {
      return [...completeEntries].sort(
        (a, b) => getDynamicEntryTimestamp(b) - getDynamicEntryTimestamp(a)
      )[0];
    }

    return [...dynamicEntries].sort((a, b) => {
      if (b.completionPercentage !== a.completionPercentage) {
        return b.completionPercentage - a.completionPercentage;
      }
      return getDynamicEntryTimestamp(b) - getDynamicEntryTimestamp(a);
    })[0];
  };

  const getSessionChartingStatus = (
    legacyEntry?: ChartingEntry,
    dynamicEntry?: DynamicChartingEntry
  ): 'complete' | 'partial' | 'not_charted' => {
    const legacyStatus: 'complete' | 'partial' | 'not_charted' = legacyEntry
      ? isLegacyEntryComplete(legacyEntry)
        ? 'complete'
        : 'partial'
      : 'not_charted';

    const dynamicStatus: 'complete' | 'partial' | 'not_charted' = dynamicEntry
      ? dynamicEntry.isComplete
        ? 'complete'
        : dynamicEntry.completionPercentage > 0
        ? 'partial'
        : 'not_charted'
      : 'not_charted';

    const rank = { not_charted: 0, partial: 1, complete: 2 } as const;
    return rank[dynamicStatus] >= rank[legacyStatus] ? dynamicStatus : legacyStatus;
  };

  // Handle day click on heatmap
  const handleDayClick = (date: Date, sessions: Session[]) => {
    setSelectedDate(date);
    setSelectedDateSessions(sessions);
  };


  const filteredSessionIds = new Set([
    ...filteredEntries.map((e) => e.sessionId),
    ...filteredDynamicEntries.map((e) => e.sessionId),
  ]);

  const legacyEntryBySession = new Map(filteredEntries.map((entry) => [entry.sessionId, entry]));
  const dynamicEntriesBySession = filteredDynamicEntries.reduce((acc, entry) => {
    const existing = acc.get(entry.sessionId) || [];
    existing.push(entry);
    acc.set(entry.sessionId, existing);
    return acc;
  }, new Map<string, DynamicChartingEntry[]>());

  const totalSessions = filteredSessionIds.size;
  const completeEntries = Array.from(filteredSessionIds).filter((sessionId) => {
    const status = getSessionChartingStatus(
      legacyEntryBySession.get(sessionId),
      getBestDynamicEntryForSession(dynamicEntriesBySession.get(sessionId) || [])
    );
    return status === 'complete';
  }).length;
  const completionRate = totalSessions > 0 ? (completeEntries / totalSessions) * 100 : 0;

  // Calendar data: when a specific student is filtered, show their sessions only; otherwise aggregate all.
  const calendarStudentId = selectedStudent !== 'all' ? selectedStudent : '';
  const calendarSessions = calendarStudentId
    ? allSessions.filter((session) => session.studentId === calendarStudentId)
    : [];
  const calendarEntries = calendarStudentId
    ? allEntries.filter((entry) => entry.studentId === calendarStudentId)
    : [];
  const calendarDynamicEntries = calendarStudentId
    ? allDynamicEntries.filter((entry) => entry.studentId === calendarStudentId)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <SkeletonDarkPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto max-w-7xl px-4 pt-4 md:px-6">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.55_0.18_238)] px-5 py-8 text-primary-foreground shadow-xl sm:px-6 sm:py-10 md:px-10 md:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_42%),radial-gradient(circle_at_85%_25%,rgba(255,255,255,0.14),transparent_38%)]" />
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">Performance Module</span>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">Charting Analytics</h1>
            <p className="mt-2 max-w-2xl text-sm text-primary-foreground/85 md:text-base">
              Overall goalie performance and session statistics across all charting activity.
            </p>
          </div>
        </section>

        <div className="-mt-10 space-y-6">
          <Card className="border-border bg-card/95 p-5 shadow-lg backdrop-blur">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Student</label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="h-11 bg-muted/40">
                    <SelectValue placeholder="All Students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students ({uniqueStudents.length})</SelectItem>
                    {uniqueStudents.map((studentId) => (
                      <SelectItem key={studentId} value={studentId}>
                        {getStudentName(studentId)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Time Period</label>
                <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                  <SelectTrigger className="h-11 bg-muted/40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-2 md:col-span-2">
                <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Search Sessions</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by drill name, location, or comments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-11 bg-muted/40 pl-10"
                  />
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-emerald-600">{uniqueStudents.length > 0 ? '+active' : 'no data'}</span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total Sessions</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{totalSessions}</p>
            </Card>

            <Card className="border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-accent/10 p-2 text-accent">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Overall Completion</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{completionRate.toFixed(1)}%</p>
            </Card>

            <Card className="border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-muted p-2 text-foreground">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Completed Sessions</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{completeEntries}</p>
            </Card>

            <Card className="border-border bg-card p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Users className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-emerald-600">Goalies</span>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Active Goalies</p>
              <p className="mt-2 text-3xl font-extrabold text-foreground">{uniqueStudents.length}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Session Activity Calendar</h2>
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {selectedStudent === 'all'
                      ? `All goalies · ${allSessions.length} total sessions`
                      : `${getStudentName(selectedStudent)} · ${calendarSessions.length} sessions`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                </div>
              </div>

              {(selectedStudent === 'all' ? allSessions.length > 0 : calendarStudentId) ? (
                <div className="overflow-x-auto">
                  <CalendarHeatmap
                    sessions={selectedStudent === 'all' ? allSessions : calendarSessions}
                    chartingEntries={selectedStudent === 'all' ? allEntries : calendarEntries}
                    dynamicEntries={selectedStudent === 'all' ? allDynamicEntries : calendarDynamicEntries}
                    onDayClick={handleDayClick}
                    colorScheme="blue"
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No charting data available yet.</p>
              )}
            </Card>

            <Card className="flex flex-col justify-between gap-4 border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 shadow-sm">
              <div className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">Browse Individual Goalies</h2>
                <p className="text-sm text-muted-foreground">
                  View a specific goalie's charting history, sessions, and performance progression.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {uniqueStudents.length} goalie{uniqueStudents.length === 1 ? '' : 's'}
                  </span>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
                    {completeEntries + allSessions.filter((s) => s.status !== 'completed').length} sessions tracked
                  </span>
                </div>
              </div>

              <Button asChild className="w-full">
                <Link href="/admin/charting/goalies">
                  View All Goalies
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>

          {/* Sessions for selected date (from calendar click) */}
          {selectedDate && (
            <Card className="border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground sm:text-xl">
                  Sessions on {format(selectedDate, 'MMMM d, yyyy')}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedDateSessions([]);
                    setFocusedSessionId(null);
                  }}
                >
                  Clear
                </Button>
              </div>
              {focusedSessionId && (
                <p className="mb-3 text-xs text-muted-foreground">
                  Showing details for selected session.
                </p>
              )}
              {selectedDateSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sessions on this day.</p>
              ) : (
                <div className="space-y-3">
                  {selectedDateSessions.map((session) => {
                    const entry = allEntries.find((e) => e.sessionId === session.id);
                    const dynamicEntriesForSession = allDynamicEntries.filter((e) => e.sessionId === session.id);
                    const dynamicEntry = getBestDynamicEntryForSession(dynamicEntriesForSession);
                    const status = getSessionChartingStatus(entry, dynamicEntry);
                    const isComplete = status === 'complete';
                    const isPartial = status === 'partial';

                    return (
                      <div
                        key={session.id}
                        className={`flex flex-col gap-3 rounded-lg border p-4 transition-all sm:flex-row sm:items-center sm:justify-between ${
                          focusedSessionId === session.id
                            ? 'border-primary/50 bg-primary/5 shadow-sm'
                            : 'border-border hover:border-primary/40 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {session.type === 'game' ? '🥅' : '🏒'}{' '}
                              {session.opponent || 'Practice Session'}
                            </h3>
                            {(entry || dynamicEntry) ? (
                              <Badge variant={isComplete ? 'default' : 'secondary'}>
                                {isComplete ? 'Complete' : isPartial ? 'Partial' : 'Not Charted'}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Not Charted</Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {getStudentName(session.studentId)}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            {session.location && <span>📍 {session.location}</span>}
                            {(entry || dynamicEntry) && (
                              <span>
                                Submitted{' '}
                                {(entry?.submittedAt?.toDate
                                  ? entry.submittedAt.toDate()
                                  : dynamicEntry?.submittedAt?.toDate
                                  ? dynamicEntry.submittedAt.toDate()
                                  : null)?.toLocaleDateString() || 'Unknown'}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/charting/entries/${entry.id}`)}
                            className="shrink-0"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* Aggregate performance metrics (legacy charting entries) */}
          <ChartingPerformanceSection entries={filteredEntries} />
        </div>
      </div>
    </div>
  );
}

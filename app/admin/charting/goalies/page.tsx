'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { chartingService, dynamicChartingService, userService } from '@/lib/database';
import { ChartingEntry, DynamicChartingEntry, Session, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminRoute } from '@/components/auth/protected-route';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Users,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

type SortKey = 'completion' | 'sessions' | 'recent' | 'name';

export default function AdminChartingGoaliesPage() {
  return (
    <AdminRoute>
      <GoaliesContent />
    </AdminRoute>
  );
}

interface GoalieSummary {
  studentId: string;
  name: string;
  email?: string;
  avatar?: string;
  totalSessions: number;
  completeSessions: number;
  partialSessions: number;
  chartedSessions: number;
  completionRate: number;
  lastActive: Date | null;
}

function GoaliesContent() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [dynamicEntries, setDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('completion');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [sessionsResult, entriesResult, dynamicResult] = await Promise.all([
        chartingService.getAllSessions({ limit: 1000 }),
        chartingService.getAllChartingEntries({ limit: 1000 }),
        dynamicChartingService.getAllDynamicEntries({ limit: 1000 }),
      ]);

      const sessionsData = sessionsResult.success ? sessionsResult.data || [] : [];
      const entriesData = entriesResult.success ? entriesResult.data || [] : [];
      const dynamicData = dynamicResult.success ? dynamicResult.data || [] : [];

      setSessions(sessionsData);
      setEntries(entriesData);
      setDynamicEntries(dynamicData);

      const uniqueStudentIds = Array.from(
        new Set([
          ...entriesData.map((e) => e.studentId),
          ...dynamicData.map((e) => e.studentId),
          ...sessionsData.map((s) => s.studentId),
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
      console.error('Failed to load goalies:', error);
      toast.error('Failed to load goalies');
    } finally {
      setLoading(false);
    }
  };

  const isLegacyEntryComplete = (entry: ChartingEntry | undefined) => {
    if (!entry) return false;
    return !!(
      entry.preGame &&
      entry.gameOverview &&
      entry.period1 &&
      entry.period2 &&
      entry.period3 &&
      entry.postGame
    );
  };

  const getBestDynamicEntry = (
    items: DynamicChartingEntry[]
  ): DynamicChartingEntry | undefined => {
    if (items.length === 0) return undefined;
    const complete = items.filter((i) => i.isComplete);
    const pool = complete.length > 0 ? complete : items;
    return [...pool].sort((a, b) => {
      const timeA = a.submittedAt?.toDate?.()?.getTime() || 0;
      const timeB = b.submittedAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    })[0];
  };

  const getStatus = (
    legacy?: ChartingEntry,
    dynamic?: DynamicChartingEntry
  ): 'complete' | 'partial' | 'not_charted' => {
    const legacyStatus: 'complete' | 'partial' | 'not_charted' = legacy
      ? isLegacyEntryComplete(legacy)
        ? 'complete'
        : 'partial'
      : 'not_charted';
    const dynamicStatus: 'complete' | 'partial' | 'not_charted' = dynamic
      ? dynamic.isComplete
        ? 'complete'
        : dynamic.completionPercentage > 0
        ? 'partial'
        : 'not_charted'
      : 'not_charted';
    const rank = { not_charted: 0, partial: 1, complete: 2 } as const;
    return rank[dynamicStatus] >= rank[legacyStatus] ? dynamicStatus : legacyStatus;
  };

  const legacyBySession = new Map(entries.map((e) => [e.sessionId, e]));
  const dynamicBySession = dynamicEntries.reduce((acc, e) => {
    const existing = acc.get(e.sessionId) || [];
    existing.push(e);
    acc.set(e.sessionId, existing);
    return acc;
  }, new Map<string, DynamicChartingEntry[]>());

  const buildGoalieSummary = (studentId: string): GoalieSummary => {
    const studentSessions = sessions.filter((s) => s.studentId === studentId);

    let complete = 0;
    let partial = 0;
    let lastActive: Date | null = null;

    studentSessions.forEach((session) => {
      const status = getStatus(
        legacyBySession.get(session.id),
        getBestDynamicEntry(dynamicBySession.get(session.id) || [])
      );
      if (status === 'complete') complete++;
      if (status === 'partial') partial++;

      const sessionDate = session.date?.toDate?.() ?? null;
      if (sessionDate && (!lastActive || sessionDate > lastActive)) {
        lastActive = sessionDate;
      }
    });

    const user = users.get(studentId);
    const completion = studentSessions.length > 0 ? (complete / studentSessions.length) * 100 : 0;

    return {
      studentId,
      name: user?.displayName || user?.email || `Student ${studentId.slice(-6)}`,
      email: user?.email,
      avatar: user?.profileImage,
      totalSessions: studentSessions.length,
      completeSessions: complete,
      partialSessions: partial,
      chartedSessions: complete + partial,
      completionRate: completion,
      lastActive,
    };
  };

  const uniqueStudentIds = Array.from(
    new Set([
      ...entries.map((e) => e.studentId),
      ...dynamicEntries.map((e) => e.studentId),
      ...sessions.map((s) => s.studentId),
    ])
  );

  const goalies: GoalieSummary[] = uniqueStudentIds
    .map(buildGoalieSummary)
    .filter((g) => g.chartedSessions > 0 || g.totalSessions > 0);

  const filtered = goalies.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q);
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'completion':
        return b.completionRate - a.completionRate;
      case 'sessions':
        return b.totalSessions - a.totalSessions;
      case 'recent':
        return (b.lastActive?.getTime() || 0) - (a.lastActive?.getTime() || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const totalGoalies = goalies.length;
  const totalSessionsAcross = goalies.reduce((sum, g) => sum + g.totalSessions, 0);
  const totalChartedAcross = goalies.reduce((sum, g) => sum + g.chartedSessions, 0);

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
        {/* Back link */}
        <Link
          href="/admin/charting"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Charting Analytics
        </Link>

        {/* Header */}
        <div className="mt-4 space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Goalies with Charting Activity
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Select a goalie to view their full charting performance and progress.
          </p>
        </div>

        {/* Summary strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Active Goalies
                </p>
                <p className="text-2xl font-bold text-foreground">{totalGoalies}</p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total Sessions
                </p>
                <p className="text-2xl font-bold text-foreground">{totalSessionsAcross}</p>
              </div>
            </div>
          </Card>

          <Card className="border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Charted Sessions
                </p>
                <p className="text-2xl font-bold text-foreground">{totalChartedAcross}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mt-6 border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {(
                [
                  { key: 'completion', label: 'Top completion' },
                  { key: 'sessions', label: 'Most sessions' },
                  { key: 'recent', label: 'Recently active' },
                  { key: 'name', label: 'Name' },
                ] as { key: SortKey; label: string }[]
              ).map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSortBy(opt.key)}
                  className={`shrink-0 transition-colors ${
                    sortBy === opt.key
                      ? 'border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Goalies list */}
        {sorted.length === 0 ? (
          <Card className="mt-6 border-border bg-card p-12 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-semibold text-foreground">No goalies found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery
                ? 'Try adjusting your search.'
                : 'No goalies have charted any sessions yet.'}
            </p>
          </Card>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {sorted.map((goalie) => (
              <Card
                key={goalie.studentId}
                className="group flex flex-col border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={goalie.avatar} />
                      <AvatarFallback>
                        {goalie.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-tight truncate">{goalie.name}</CardTitle>
                      {goalie.email && (
                        <CardDescription className="truncate text-xs">{goalie.email}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Completion rate</span>
                      <span className="text-lg font-bold text-foreground">
                        {goalie.completionRate.toFixed(0)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${Math.min(goalie.completionRate, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="text-sm font-bold text-foreground">{goalie.totalSessions}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-xs text-muted-foreground">Complete</p>
                      <p className="text-sm font-bold text-foreground">{goalie.completeSessions}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-2 py-2">
                      <p className="text-xs text-muted-foreground">Partial</p>
                      <p className="text-sm font-bold text-foreground">{goalie.partialSessions}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    {goalie.lastActive && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last session {goalie.lastActive.toLocaleDateString()}
                      </span>
                    )}
                    {goalie.chartedSessions === 0 && (
                      <Badge variant="outline" className="text-[10px]">
                        No entries yet
                      </Badge>
                    )}
                  </div>

                  <Button
                    asChild
                    className="w-full border border-red-600 bg-red-600 text-white hover:bg-red-700"
                  >
                    <Link href={`/admin/users/${goalie.studentId}?tab=charting`}>
                      View Performance
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

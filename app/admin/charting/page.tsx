'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chartingService, userService } from '@/lib/database';
import { ChartingEntry, Session, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminRoute } from '@/components/auth/protected-route';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Download,
  Eye,
  Search,
  RefreshCw,
  Target,
  Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { startOfWeek, startOfMonth, subMonths, isAfter } from 'date-fns';

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
  const [loading, setLoading] = useState(true);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [allEntries, setAllEntries] = useState<ChartingEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<ChartingEntry[]>([]);
  const [users, setUsers] = useState<Map<string, User>>(new Map());
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [timeRange, searchQuery, selectedStudent, allEntries]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [sessionsResult, entriesResult] = await Promise.all([
        chartingService.getAllSessions({ limit: 1000 }),
        chartingService.getAllChartingEntries({ limit: 1000 }),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setAllSessions(sessionsResult.data);
      }

      if (entriesResult.success && entriesResult.data) {
        setAllEntries(entriesResult.data);
        setFilteredEntries(entriesResult.data);

        // Load user data for all unique students
        const uniqueStudentIds = Array.from(new Set(entriesResult.data.map((e) => e.studentId)));
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
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load charting data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allEntries];

    // Student filter
    if (selectedStudent !== 'all') {
      filtered = filtered.filter((entry) => entry.studentId === selectedStudent);
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
        const entryDate = entry.submittedAt?.toDate ? entry.submittedAt.toDate() : new Date(entry.submittedAt);
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
    }

    setFilteredEntries(filtered);
  };

  // Get unique students
  const uniqueStudents = Array.from(new Set(allEntries.map((e) => e.studentId)));

  // Helper to get student display name
  const getStudentName = (studentId: string): string => {
    const user = users.get(studentId);
    if (user) {
      return user.displayName || user.email || `Student ${studentId.slice(-6)}`;
    }
    return `Student ${studentId.slice(-6)}`;
  };

  // Calculate comprehensive stats
  const calculateGoalsStats = () => {
    const withOverview = filteredEntries.filter((e) => e.gameOverview);
    if (withOverview.length === 0) return null;

    const totalGoodGoals = withOverview.reduce((sum, e) => {
      return sum + (e.gameOverview?.goodGoals.period1 || 0) + (e.gameOverview?.goodGoals.period2 || 0) + (e.gameOverview?.goodGoals.period3 || 0);
    }, 0);

    const totalBadGoals = withOverview.reduce((sum, e) => {
      return sum + (e.gameOverview?.badGoals.period1 || 0) + (e.gameOverview?.badGoals.period2 || 0) + (e.gameOverview?.badGoals.period3 || 0);
    }, 0);

    const avgGoodGoals = totalGoodGoals / withOverview.length;
    const avgBadGoals = totalBadGoals / withOverview.length;

    // Calculate trend
    const midPoint = Math.floor(withOverview.length / 2);
    const firstHalf = withOverview.slice(0, midPoint);
    const secondHalf = withOverview.slice(midPoint);

    const firstHalfBadGoals =
      firstHalf.reduce((sum, e) => sum + (e.gameOverview?.badGoals.period1 || 0) + (e.gameOverview?.badGoals.period2 || 0) + (e.gameOverview?.badGoals.period3 || 0), 0) /
      (firstHalf.length || 1);
    const secondHalfBadGoals =
      secondHalf.reduce((sum, e) => sum + (e.gameOverview?.badGoals.period1 || 0) + (e.gameOverview?.badGoals.period2 || 0) + (e.gameOverview?.badGoals.period3 || 0), 0) /
      (secondHalf.length || 1);

    const improvement = ((firstHalfBadGoals - secondHalfBadGoals) / (firstHalfBadGoals || 1)) * 100;

    return {
      avgGoodGoals: avgGoodGoals.toFixed(1),
      avgBadGoals: avgBadGoals.toFixed(1),
      totalGames: withOverview.length,
      improvement: improvement.toFixed(0),
      trend: improvement > 5 ? 'up' : improvement < -5 ? 'down' : 'stable',
    };
  };

  const calculateChallengeStats = () => {
    const withOverview = filteredEntries.filter((e) => e.gameOverview);
    if (withOverview.length === 0) return null;

    const avgChallenge =
      withOverview.reduce((sum, e) => {
        return (
          sum +
          ((e.gameOverview?.degreeOfChallenge.period1 || 0) +
            (e.gameOverview?.degreeOfChallenge.period2 || 0) +
            (e.gameOverview?.degreeOfChallenge.period3 || 0)) /
            3
        );
      }, 0) / withOverview.length;

    // Calculate consistency (standard deviation)
    const challenges = withOverview.map(
      (e) =>
        ((e.gameOverview?.degreeOfChallenge.period1 || 0) +
          (e.gameOverview?.degreeOfChallenge.period2 || 0) +
          (e.gameOverview?.degreeOfChallenge.period3 || 0)) /
        3
    );

    const variance =
      challenges.reduce((sum, c) => sum + Math.pow(c - avgChallenge, 2), 0) /
      challenges.length;
    const stdDev = Math.sqrt(variance);

    return {
      avgChallenge: avgChallenge.toFixed(1),
      consistency: stdDev < 1 ? 'High' : stdDev < 2 ? 'Medium' : 'Low',
      stdDev: stdDev.toFixed(1),
    };
  };

  const calculateFocusConsistency = () => {
    const periods = [
      ...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const consistentCount = periods.filter(
      (p: any) => p?.mindSet?.focusConsistent?.value
    ).length;
    const inconsistentCount = periods.filter(
      (p: any) => p?.mindSet?.focusInconsistent?.value
    ).length;

    const total = consistentCount + inconsistentCount;
    const percentage = total > 0 ? (consistentCount / total) * 100 : 0;

    // Calculate trend
    const midPoint = Math.floor(periods.length / 2);
    const firstHalf = periods.slice(0, midPoint);
    const secondHalf = periods.slice(midPoint);

    const firstHalfConsistent =
      firstHalf.filter((p: any) => p?.mindSet?.focusConsistent?.value).length /
      (firstHalf.length || 1);
    const secondHalfConsistent =
      secondHalf.filter((p: any) => p?.mindSet?.focusConsistent?.value).length /
      (secondHalf.length || 1);

    const trend =
      secondHalfConsistent > firstHalfConsistent + 0.1
        ? 'up'
        : secondHalfConsistent < firstHalfConsistent - 0.1
        ? 'down'
        : 'stable';

    return {
      percentage: percentage.toFixed(0),
      consistentCount,
      inconsistentCount,
      trend,
    };
  };

  const calculateSkatingPerformance = () => {
    const periods = [
      ...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const inSyncCount = periods.filter((p: any) => p?.skating?.inSync?.value).length;
    const notInSyncCount = periods.filter(
      (p: any) => p?.skating?.notInSync?.value
    ).length;

    const total = inSyncCount + notInSyncCount;
    const percentage = total > 0 ? (inSyncCount / total) * 100 : 0;

    // Calculate trend
    const midPoint = Math.floor(periods.length / 2);
    const firstHalf = periods.slice(0, midPoint);
    const secondHalf = periods.slice(midPoint);

    const firstHalfInSync =
      firstHalf.filter((p: any) => p?.skating?.inSync?.value).length /
      (firstHalf.length || 1);
    const secondHalfInSync =
      secondHalf.filter((p: any) => p?.skating?.inSync?.value).length /
      (secondHalf.length || 1);

    const trend =
      secondHalfInSync > firstHalfInSync + 0.1
        ? 'up'
        : secondHalfInSync < firstHalfInSync - 0.1
        ? 'down'
        : 'stable';

    return {
      percentage: percentage.toFixed(0),
      inSyncCount,
      notInSyncCount,
      trend,
    };
  };

  const calculatePositionalPerformance = () => {
    const periods = [
      ...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const goodCount = periods.filter(
      (p: any) =>
        p?.positionalAboveIcing?.good?.value || p?.positionalBelowIcing?.good?.value || p?.positionalBelowIcing?.strong?.value
    ).length;

    const needsWorkCount = periods.filter(
      (p: any) =>
        p?.positionalAboveIcing?.poor?.value ||
        p?.positionalAboveIcing?.improving?.value ||
        p?.positionalBelowIcing?.poor?.value ||
        p?.positionalBelowIcing?.improving?.value
    ).length;

    const total = goodCount + needsWorkCount;
    const percentage = total > 0 ? (goodCount / total) * 100 : 0;

    return {
      percentage: percentage.toFixed(0),
      goodCount,
      needsWorkCount,
    };
  };

  const calculateTeamPlay = () => {
    const period3s = filteredEntries.map((e) => e.period3).filter(Boolean);

    if (period3s.length === 0) return null;

    const defenseGoodCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpDefense?.good?.value
    ).length;
    const defenseImprovingCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpDefense?.improving?.value
    ).length;
    const defensePoorCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpDefense?.poor?.value
    ).length;

    const forwardsGoodCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpForwards?.good?.value
    ).length;
    const forwardsImprovingCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpForwards?.improving?.value
    ).length;
    const forwardsPoorCount = period3s.filter(
      (p: any) => p?.teamPlay?.settingUpForwards?.poor?.value
    ).length;

    const defenseTotal = defenseGoodCount + defenseImprovingCount + defensePoorCount;
    const forwardsTotal = forwardsGoodCount + forwardsImprovingCount + forwardsPoorCount;

    const defensePercentage = defenseTotal > 0 ? (defenseGoodCount / defenseTotal) * 100 : 0;
    const forwardsPercentage = forwardsTotal > 0 ? (forwardsGoodCount / forwardsTotal) * 100 : 0;

    return {
      defensePercentage: defensePercentage.toFixed(0),
      forwardsPercentage: forwardsPercentage.toFixed(0),
      defenseGoodCount,
      defenseImprovingCount,
      defensePoorCount,
      forwardsGoodCount,
      forwardsImprovingCount,
      forwardsPoorCount,
    };
  };

  const calculateDecisionMaking = () => {
    const periods = [...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean)];
    if (periods.length === 0) return null;

    const strongCount = periods.filter((p: any) => p?.mindSet?.decisionMakingStrong?.value).length;
    const improvingCount = periods.filter((p: any) => p?.mindSet?.decisionMakingImproving?.value).length;
    const needsWorkCount = periods.filter((p: any) => p?.mindSet?.decisionMakingNeedsWork?.value).length;
    const total = strongCount + improvingCount + needsWorkCount;

    return {
      strongPercentage: total > 0 ? ((strongCount / total) * 100).toFixed(0) : '0',
      improvingPercentage: total > 0 ? ((improvingCount / total) * 100).toFixed(0) : '0',
      needsWorkPercentage: total > 0 ? ((needsWorkCount / total) * 100).toFixed(0) : '0',
      strongCount,
      improvingCount,
      needsWorkCount,
      total,
    };
  };

  const calculateBodyLanguage = () => {
    const periods = [...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean)];
    if (periods.length === 0) return null;

    const consistentCount = periods.filter((p: any) => p?.mindSet?.bodyLanguageConsistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.mindSet?.bodyLanguageInconsistent?.value).length;
    const total = consistentCount + inconsistentCount;

    return {
      consistentPercentage: total > 0 ? ((consistentCount / total) * 100).toFixed(0) : '0',
      inconsistentPercentage: total > 0 ? ((inconsistentCount / total) * 100).toFixed(0) : '0',
      consistentCount,
      inconsistentCount,
      total,
    };
  };

  const calculateReboundControl = () => {
    const periods = [...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean)];
    if (periods.length === 0) return null;

    const poorCount = periods.filter((p: any) => p?.reboundControl?.poor?.value).length;
    const improvingCount = periods.filter((p: any) => p?.reboundControl?.improving?.value).length;
    const goodCount = periods.filter((p: any) => p?.reboundControl?.good?.value).length;
    const qualityTotal = poorCount + improvingCount + goodCount;

    const consistentCount = periods.filter((p: any) => p?.reboundControl?.consistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.reboundControl?.inconsistent?.value).length;
    const consistencyTotal = consistentCount + inconsistentCount;

    return {
      qualityGood: qualityTotal > 0 ? ((goodCount / qualityTotal) * 100).toFixed(0) : '0',
      consistencyPercentage: consistencyTotal > 0 ? ((consistentCount / consistencyTotal) * 100).toFixed(0) : '0',
      goodCount,
      consistentCount,
      totalQuality: qualityTotal,
      totalConsistency: consistencyTotal,
    };
  };

  const calculateFreezingPuck = () => {
    const periods = [...filteredEntries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean)];
    if (periods.length === 0) return null;

    const poorCount = periods.filter((p: any) => p?.freezingPuck?.poor?.value).length;
    const improvingCount = periods.filter((p: any) => p?.freezingPuck?.improving?.value).length;
    const goodCount = periods.filter((p: any) => p?.freezingPuck?.good?.value).length;
    const qualityTotal = poorCount + improvingCount + goodCount;

    const consistentCount = periods.filter((p: any) => p?.freezingPuck?.consistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.freezingPuck?.inconsistent?.value).length;
    const consistencyTotal = consistentCount + inconsistentCount;

    return {
      qualityGood: qualityTotal > 0 ? ((goodCount / qualityTotal) * 100).toFixed(0) : '0',
      consistencyPercentage: consistencyTotal > 0 ? ((consistentCount / consistencyTotal) * 100).toFixed(0) : '0',
      goodCount,
      consistentCount,
      totalQuality: qualityTotal,
      totalConsistency: consistencyTotal,
    };
  };

  const calculatePreGameStats = () => {
    const preGames = filteredEntries.filter((e) => e.preGame).map((e) => e.preGame!);
    if (preGames.length === 0) return null;

    const equipmentReady = preGames.filter((p) => p.gameReadiness?.wellRested?.value && p.gameReadiness?.fueledForGame?.value).length;
    const mentalPrep = preGames.filter((p) => p.mindSet?.mindCleared?.value && p.mindSet?.mentalImagery?.value).length;
    const warmup = preGames.filter((p) => p.warmUp?.lookedEngaged?.value && !p.warmUp?.lackedFocus?.value).length;
    const physical = preGames.filter((p) => p.preGameRoutine?.ballExercises?.value && p.preGameRoutine?.stretching?.value).length;

    return {
      equipment: ((equipmentReady / preGames.length) * 100).toFixed(0),
      mental: ((mentalPrep / preGames.length) * 100).toFixed(0),
      warmup: ((warmup / preGames.length) * 100).toFixed(0),
      physical: ((physical / preGames.length) * 100).toFixed(0),
      total: preGames.length,
    };
  };

  const calculatePostGameStats = () => {
    const postGames = filteredEntries.filter((e) => e.postGame);
    if (postGames.length === 0) return null;

    const completed = postGames.filter((e) => e.postGame?.reviewCompleted?.value).length;
    return {
      completionRate: ((completed / postGames.length) * 100).toFixed(0),
      completed,
      total: postGames.length,
    };
  };

  const goalsStats = calculateGoalsStats();
  const challengeStats = calculateChallengeStats();
  const focusStats = calculateFocusConsistency();
  const skatingStats = calculateSkatingPerformance();
  const positionalStats = calculatePositionalPerformance();
  const teamPlayStats = calculateTeamPlay();
  const decisionMaking = calculateDecisionMaking();
  const bodyLanguage = calculateBodyLanguage();
  const reboundControl = calculateReboundControl();
  const freezingPuck = calculateFreezingPuck();
  const preGameStats = calculatePreGameStats();
  const postGameStats = calculatePostGameStats();

  const totalSessions = new Set(filteredEntries.map((e) => e.sessionId)).size;
  const completeEntries = filteredEntries.filter((e) => e.preGame && e.gameOverview && e.period1 && e.period2 && e.period3 && e.postGame).length;
  const completionRate = filteredEntries.length > 0 ? (completeEntries / filteredEntries.length) * 100 : 0;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-600" />;
    return <Minus className="w-5 h-5 text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading admin charting analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Charting Analytics (Admin)</h1>
            <p className="text-gray-600">Comprehensive charting statistics and student performance data</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
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
              <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
              <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
                <SelectTrigger>
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

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by opponent, location, or comments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
            <TabsTrigger value="entries">All Entries</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{totalSessions}</p>
                <p className="text-sm text-gray-500 mt-1">{filteredEntries.length} charting entries</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <Activity className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{completionRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {completeEntries} complete entries
                </p>
              </Card>

              {goalsStats && (
                <>
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Avg Goals/Game</p>
                      <Target className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      <span className="text-green-600">{goalsStats.avgGoodGoals}</span> /{' '}
                      <span className="text-red-600">{goalsStats.avgBadGoals}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Good / Bad</p>
                  </Card>

                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Improvement</p>
                      {getTrendIcon(goalsStats.trend)}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {goalsStats.improvement}%
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Bad goals reduction</p>
                  </Card>
                </>
              )}
            </div>

            {/* Goals Performance */}
            {goalsStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Goals Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Avg Good Goals/Game</p>
                    </div>
                    <p className="text-3xl font-bold text-green-700">
                      {goalsStats.avgGoodGoals}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Across {goalsStats.totalGames} games
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-600">Avg Bad Goals/Game</p>
                      {getTrendIcon(goalsStats.trend)}
                    </div>
                    <p className="text-3xl font-bold text-red-700">{goalsStats.avgBadGoals}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {goalsStats.trend === 'up' && '📈 Improving! '}
                      {goalsStats.trend === 'down' && '📉 Needs attention '}
                      {goalsStats.improvement}% vs earlier period
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Good/Bad Ratio</p>
                    <p className="text-3xl font-bold text-blue-700">
                      {(parseFloat(goalsStats.avgGoodGoals) / parseFloat(goalsStats.avgBadGoals) || 0).toFixed(2)}:1
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(goalsStats.avgGoodGoals) > parseFloat(goalsStats.avgBadGoals)
                        ? '✓ More good than bad'
                        : '⚠ Work on reducing bad goals'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Challenge & Consistency */}
            {challengeStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Level & Consistency</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Average Challenge Rating</p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {challengeStats.avgChallenge}<span className="text-base">/10</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {parseFloat(challengeStats.avgChallenge) < 4 && 'Easier games'}
                      {parseFloat(challengeStats.avgChallenge) >= 4 && parseFloat(challengeStats.avgChallenge) < 7 && 'Moderate difficulty'}
                      {parseFloat(challengeStats.avgChallenge) >= 7 && 'High difficulty games'}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Challenge Consistency</p>
                    <p className="text-3xl font-bold text-purple-700">
                      {challengeStats.consistency}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      σ = {challengeStats.stdDev} (standard deviation)
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Mind-Set Performance */}
            {focusStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mind-Set Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-900">Focus Consistency</p>
                      {getTrendIcon(focusStats.trend)}
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-teal-700">{focusStats.percentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">consistent</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-teal-600 h-3 rounded-full transition-all"
                        style={{ width: `${focusStats.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {focusStats.consistentCount} consistent / {focusStats.inconsistentCount} inconsistent periods
                    </p>
                  </div>

                  {skatingStats && (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">Skating In Sync</p>
                        {getTrendIcon(skatingStats.trend)}
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-bold text-cyan-700">{skatingStats.percentage}%</p>
                        <p className="text-sm text-gray-600 mb-1">in sync</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-cyan-600 h-3 rounded-full transition-all"
                          style={{ width: `${skatingStats.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {skatingStats.inSyncCount} in sync / {skatingStats.notInSyncCount} not in sync periods
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Positional Performance */}
            {positionalStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Positional Performance</h2>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Strong Positioning</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-4xl font-bold text-amber-700">{positionalStats.percentage}%</p>
                    <p className="text-sm text-gray-600 mb-1">good/strong</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-amber-600 h-3 rounded-full transition-all"
                      style={{ width: `${positionalStats.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {positionalStats.goodCount} good/strong / {positionalStats.needsWorkCount} needs work periods
                  </p>
                </div>
              </Card>
            )}

            {/* Pre-Game Preparation */}
            {preGameStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-Game Preparation</h2>
                <p className="text-sm text-gray-600 mb-4">Adherence rates across {preGameStats.total} sessions</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Equipment Ready</p>
                      <Badge>{preGameStats.equipment}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${preGameStats.equipment}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Mental Prep</p>
                      <Badge>{preGameStats.mental}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${preGameStats.mental}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Warm-Up</p>
                      <Badge>{preGameStats.warmup}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${preGameStats.warmup}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Physical</p>
                      <Badge>{preGameStats.physical}%</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${preGameStats.physical}%` }} />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Post-Game Review */}
            {postGameStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Post-Game Review</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Review Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">{postGameStats.completionRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {postGameStats.completed} of {postGameStats.total} sessions reviewed
                    </p>
                  </div>
                  <div className="w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e5e7eb"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#3b82f6"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${(parseFloat(postGameStats.completionRate) / 100) * 352} 352`}
                      />
                    </svg>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Performance Metrics Tab */}
          <TabsContent value="performance" className="space-y-6">
            {/* Decision Making & Body Language */}
            {(decisionMaking || bodyLanguage) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Decision Making & Body Language</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decisionMaking && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Decision Making - Strong</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-bold text-emerald-700">{decisionMaking.strongPercentage}%</p>
                        <p className="text-sm text-gray-600 mb-1">strong</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${decisionMaking.strongPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {decisionMaking.strongCount} strong / {decisionMaking.improvingCount} improving / {decisionMaking.needsWorkCount} needs work
                      </p>
                    </div>
                  )}
                  {bodyLanguage && (
                    <div className="bg-lime-50 border border-lime-200 rounded-lg p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Body Language</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-bold text-lime-700">{bodyLanguage.consistentPercentage}%</p>
                        <p className="text-sm text-gray-600 mb-1">consistent</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-lime-600 h-3 rounded-full transition-all"
                          style={{ width: `${bodyLanguage.consistentPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {bodyLanguage.consistentCount} consistent / {bodyLanguage.inconsistentCount} inconsistent
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Rebound Control */}
            {reboundControl && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rebound Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Quality</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-violet-700">{reboundControl.qualityGood}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-violet-600 h-3 rounded-full transition-all"
                        style={{ width: `${reboundControl.qualityGood}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {reboundControl.goodCount} good / {reboundControl.totalQuality} total
                    </p>
                  </div>
                  <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Consistency</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-fuchsia-700">{reboundControl.consistencyPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">consistent</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-fuchsia-600 h-3 rounded-full transition-all"
                        style={{ width: `${reboundControl.consistencyPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {reboundControl.consistentCount} consistent / {reboundControl.totalConsistency} total
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Freezing Puck */}
            {freezingPuck && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Freezing Puck</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Quality</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-pink-700">{freezingPuck.qualityGood}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${freezingPuck.qualityGood}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {freezingPuck.goodCount} good / {freezingPuck.totalQuality} total
                    </p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Consistency</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-rose-700">{freezingPuck.consistencyPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">consistent</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-rose-600 h-3 rounded-full transition-all"
                        style={{ width: `${freezingPuck.consistencyPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {freezingPuck.consistentCount} consistent / {freezingPuck.totalConsistency} total
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Team Play (Period 3 only) */}
            {teamPlayStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Team Play (Period 3)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Setting Up Defense</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-sky-700">{teamPlayStats.defensePercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-sky-600 h-3 rounded-full transition-all"
                        style={{ width: `${teamPlayStats.defensePercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {teamPlayStats.defenseGoodCount} good / {teamPlayStats.defenseImprovingCount} improving / {teamPlayStats.defensePoorCount} poor
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Setting Up Forwards</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-slate-700">{teamPlayStats.forwardsPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-slate-600 h-3 rounded-full transition-all"
                        style={{ width: `${teamPlayStats.forwardsPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {teamPlayStats.forwardsGoodCount} good / {teamPlayStats.forwardsImprovingCount} improving / {teamPlayStats.forwardsPoorCount} poor
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* All Entries Tab */}
          <TabsContent value="entries">
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                All Charting Entries ({filteredEntries.length})
              </h2>

              <div className="space-y-3">
                {filteredEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No charting entries found</p>
                    <p className="text-sm text-gray-500 mt-2">Try adjusting your filters</p>
                  </div>
                ) : (
                  filteredEntries.map((entry) => {
                    const session = allSessions.find((s) => s.id === entry.sessionId);
                    const isComplete = !!(entry.preGame && entry.gameOverview && entry.period1 && entry.period2 && entry.period3 && entry.postGame);

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {session?.type === 'game' ? '🥅' : '🏒'}{' '}
                              {session?.opponent || 'Practice Session'}
                            </h3>
                            <Badge variant={isComplete ? 'default' : 'secondary'}>
                              {isComplete ? 'Complete' : 'Partial'}
                            </Badge>
                            {entry.submitterRole === 'admin' && (
                              <Badge variant="outline">Admin Entry</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>
                              📅{' '}
                              {session?.date.toDate
                                ? session.date.toDate().toLocaleDateString()
                                : 'Unknown date'}
                            </span>
                            {session?.location && <span>📍 {session.location}</span>}
                            <span>👤 {getStudentName(entry.studentId)}</span>
                            <span>
                              Submitted{' '}
                              {entry.submittedAt?.toDate
                                ? entry.submittedAt.toDate().toLocaleDateString()
                                : 'Unknown'}
                            </span>
                          </div>
                          {entry.gameOverview && (
                            <div className="flex items-center gap-4 text-sm mt-2">
                              <span className="text-green-600">
                                ✅ Good Goals:{' '}
                                {(entry.gameOverview.goodGoals.period1 || 0) +
                                  (entry.gameOverview.goodGoals.period2 || 0) +
                                  (entry.gameOverview.goodGoals.period3 || 0)}
                              </span>
                              <span className="text-red-600">
                                ❌ Bad Goals:{' '}
                                {(entry.gameOverview.badGoals.period1 || 0) +
                                  (entry.gameOverview.badGoals.period2 || 0) +
                                  (entry.gameOverview.badGoals.period3 || 0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/admin/charting/entries/${entry.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

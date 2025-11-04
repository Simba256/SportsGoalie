'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { ChartingEntry, Session } from '@/types';
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
    const avgChallenge =
      withOverview.reduce((sum, e) => {
        return sum + ((e.gameOverview?.degreeOfChallenge.period1 || 0) + (e.gameOverview?.degreeOfChallenge.period2 || 0) + (e.gameOverview?.degreeOfChallenge.period3 || 0)) / 3;
      }, 0) / withOverview.length;

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
      avgChallenge: avgChallenge.toFixed(1),
      totalGames: withOverview.length,
      improvement: improvement.toFixed(0),
      trend: improvement > 5 ? 'up' : improvement < -5 ? 'down' : 'stable',
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
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
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
                      Student {studentId.slice(-6)}
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

            {/* Goals & Challenge */}
            {goalsStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Goals & Challenge Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Good Goals</p>
                    <p className="text-4xl font-bold text-green-700">{goalsStats.avgGoodGoals}</p>
                    <p className="text-xs text-gray-500 mt-2">{goalsStats.totalGames} games analyzed</p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Bad Goals</p>
                    <p className="text-4xl font-bold text-red-700">{goalsStats.avgBadGoals}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {getTrendIcon(goalsStats.trend)}
                      <p className="text-xs text-gray-600">{goalsStats.improvement}% improvement</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Challenge</p>
                    <p className="text-4xl font-bold text-blue-700">
                      {goalsStats.avgChallenge}
                      <span className="text-lg">/10</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Difficulty rating</p>
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {decisionMaking && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Decision Making</h2>
                    <p className="text-sm text-gray-600 mb-4">Across {decisionMaking.total} rated periods</p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Strong</p>
                          <Badge variant="default">
                            {decisionMaking.strongPercentage}% ({decisionMaking.strongCount})
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${decisionMaking.strongPercentage}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Improving</p>
                          <Badge variant="secondary">
                            {decisionMaking.improvingPercentage}% ({decisionMaking.improvingCount})
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${decisionMaking.improvingPercentage}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Needs Work</p>
                          <Badge variant="secondary">
                            {decisionMaking.needsWorkPercentage}% ({decisionMaking.needsWorkCount})
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${decisionMaking.needsWorkPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {bodyLanguage && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Body Language</h2>
                    <p className="text-sm text-gray-600 mb-4">Across {bodyLanguage.total} rated periods</p>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Consistent</p>
                          <Badge variant="default">
                            {bodyLanguage.consistentPercentage}% ({bodyLanguage.consistentCount})
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full" style={{ width: `${bodyLanguage.consistentPercentage}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-gray-700">Inconsistent</p>
                          <Badge variant="secondary">
                            {bodyLanguage.inconsistentPercentage}% ({bodyLanguage.inconsistentCount})
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: `${bodyLanguage.inconsistentPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Rebound Control & Freezing Puck */}
            {(reboundControl || freezingPuck) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reboundControl && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Rebound Control</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Quality</p>
                        <p className="text-4xl font-bold text-gray-900">{reboundControl.qualityGood}%</p>
                        <p className="text-xs text-gray-500 mt-1">Good ratings</p>
                        <p className="text-xs text-gray-400">({reboundControl.goodCount}/{reboundControl.totalQuality})</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Consistency</p>
                        <p className="text-4xl font-bold text-gray-900">{reboundControl.consistencyPercentage}%</p>
                        <p className="text-xs text-gray-500 mt-1">Consistent</p>
                        <p className="text-xs text-gray-400">({reboundControl.consistentCount}/{reboundControl.totalConsistency})</p>
                      </div>
                    </div>
                  </Card>
                )}

                {freezingPuck && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Freezing Puck</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Quality</p>
                        <p className="text-4xl font-bold text-gray-900">{freezingPuck.qualityGood}%</p>
                        <p className="text-xs text-gray-500 mt-1">Good ratings</p>
                        <p className="text-xs text-gray-400">({freezingPuck.goodCount}/{freezingPuck.totalQuality})</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Consistency</p>
                        <p className="text-4xl font-bold text-gray-900">{freezingPuck.consistencyPercentage}%</p>
                        <p className="text-xs text-gray-500 mt-1">Consistent</p>
                        <p className="text-xs text-gray-400">({freezingPuck.consistentCount}/{freezingPuck.totalConsistency})</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
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
                            <span>👤 Student {entry.studentId.slice(-6)}</span>
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

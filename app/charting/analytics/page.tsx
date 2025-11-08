'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { chartingService } from '@/lib/database';
import { Session, ChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Filter,
  BarChart3,
} from 'lucide-react';
import { startOfWeek, startOfMonth, subDays, subMonths, isAfter } from 'date-fns';
import { DynamicAnalyticsDisplay } from '@/components/charting/DynamicAnalyticsDisplay';

type TimeRange = 'week' | 'month' | '3months' | 'all';

interface StatTrend {
  name: string;
  current: number;
  previous: number;
  trend: 'up' | 'down' | 'stable';
  consistency: number; // 0-100
}

export default function ChartingAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [sessionsResult, allEntriesResult] = await Promise.all([
        chartingService.getSessionsByStudent(user.id, { limit: 500, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getChartingEntriesByStudent(user.id),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      if (allEntriesResult.success && allEntriesResult.data) {
        setEntries(allEntriesResult.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredSessions = () => {
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
        return sessions;
    }

    return sessions.filter((s) => isAfter(s.date.toDate(), startDate));
  };

  const getFilteredEntries = () => {
    const filteredSessions = getFilteredSessions();
    const sessionIds = new Set(filteredSessions.map((s) => s.id));
    return entries.filter((e) => sessionIds.has(e.sessionId));
  };

  const calculateGoalsStats = () => {
    const filtered = getFilteredEntries();
    const withOverview = filtered.filter((e) => e.gameOverview);

    if (withOverview.length === 0) return null;

    const totalGoodGoals = withOverview.reduce((sum, e) => {
      return (
        sum +
        (e.gameOverview?.goodGoals.period1 || 0) +
        (e.gameOverview?.goodGoals.period2 || 0) +
        (e.gameOverview?.goodGoals.period3 || 0)
      );
    }, 0);

    const totalBadGoals = withOverview.reduce((sum, e) => {
      return (
        sum +
        (e.gameOverview?.badGoals.period1 || 0) +
        (e.gameOverview?.badGoals.period2 || 0) +
        (e.gameOverview?.badGoals.period3 || 0)
      );
    }, 0);

    const avgGoodGoals = totalGoodGoals / withOverview.length;
    const avgBadGoals = totalBadGoals / withOverview.length;

    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(withOverview.length / 2);
    const firstHalf = withOverview.slice(0, midPoint);
    const secondHalf = withOverview.slice(midPoint);

    const firstHalfBadGoals =
      firstHalf.reduce(
        (sum, e) =>
          sum +
          (e.gameOverview?.badGoals.period1 || 0) +
          (e.gameOverview?.badGoals.period2 || 0) +
          (e.gameOverview?.badGoals.period3 || 0),
        0
      ) / (firstHalf.length || 1);

    const secondHalfBadGoals =
      secondHalf.reduce(
        (sum, e) =>
          sum +
          (e.gameOverview?.badGoals.period1 || 0) +
          (e.gameOverview?.badGoals.period2 || 0) +
          (e.gameOverview?.badGoals.period3 || 0),
        0
      ) / (secondHalf.length || 1);

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
    const filtered = getFilteredEntries();
    const withOverview = filtered.filter((e) => e.gameOverview);

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
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
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
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
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
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
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

  const calculateDecisionMaking = () => {
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const strongCount = periods.filter((p: any) => p?.mindSet?.decisionMakingStrong?.value).length;
    const improvingCount = periods.filter((p: any) => p?.mindSet?.decisionMakingImproving?.value).length;
    const needsWorkCount = periods.filter((p: any) => p?.mindSet?.decisionMakingNeedsWork?.value).length;

    const total = strongCount + improvingCount + needsWorkCount;
    const strongPercentage = total > 0 ? (strongCount / total) * 100 : 0;

    return {
      strongPercentage: strongPercentage.toFixed(0),
      strongCount,
      improvingCount,
      needsWorkCount,
      total,
    };
  };

  const calculateBodyLanguage = () => {
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const consistentCount = periods.filter((p: any) => p?.mindSet?.bodyLanguageConsistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.mindSet?.bodyLanguageInconsistent?.value).length;

    const total = consistentCount + inconsistentCount;
    const percentage = total > 0 ? (consistentCount / total) * 100 : 0;

    return {
      percentage: percentage.toFixed(0),
      consistentCount,
      inconsistentCount,
    };
  };

  const calculateReboundControl = () => {
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const goodCount = periods.filter((p: any) => p?.reboundControl?.reboundQualityGood?.value).length;
    const improvingCount = periods.filter((p: any) => p?.reboundControl?.reboundQualityImproving?.value).length;
    const poorCount = periods.filter((p: any) => p?.reboundControl?.reboundQualityPoor?.value).length;

    const consistentCount = periods.filter((p: any) => p?.reboundControl?.reboundConsistencyConsistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.reboundControl?.reboundConsistencyInconsistent?.value).length;

    const qualityTotal = goodCount + improvingCount + poorCount;
    const consistencyTotal = consistentCount + inconsistentCount;

    const qualityPercentage = qualityTotal > 0 ? (goodCount / qualityTotal) * 100 : 0;
    const consistencyPercentage = consistencyTotal > 0 ? (consistentCount / consistencyTotal) * 100 : 0;

    return {
      qualityPercentage: qualityPercentage.toFixed(0),
      consistencyPercentage: consistencyPercentage.toFixed(0),
      goodCount,
      improvingCount,
      poorCount,
      consistentCount,
      inconsistentCount,
    };
  };

  const calculateFreezingPuck = () => {
    const filtered = getFilteredEntries();
    const periods = [
      ...filtered.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean),
    ];

    if (periods.length === 0) return null;

    const goodCount = periods.filter((p: any) => p?.freezingPuck?.freezingQualityGood?.value).length;
    const improvingCount = periods.filter((p: any) => p?.freezingPuck?.freezingQualityImproving?.value).length;
    const poorCount = periods.filter((p: any) => p?.freezingPuck?.freezingQualityPoor?.value).length;

    const consistentCount = periods.filter((p: any) => p?.freezingPuck?.freezingConsistencyConsistent?.value).length;
    const inconsistentCount = periods.filter((p: any) => p?.freezingPuck?.freezingConsistencyInconsistent?.value).length;

    const qualityTotal = goodCount + improvingCount + poorCount;
    const consistencyTotal = consistentCount + inconsistentCount;

    const qualityPercentage = qualityTotal > 0 ? (goodCount / qualityTotal) * 100 : 0;
    const consistencyPercentage = consistencyTotal > 0 ? (consistentCount / consistencyTotal) * 100 : 0;

    return {
      qualityPercentage: qualityPercentage.toFixed(0),
      consistencyPercentage: consistencyPercentage.toFixed(0),
      goodCount,
      improvingCount,
      poorCount,
      consistentCount,
      inconsistentCount,
    };
  };

  const calculateTeamPlay = () => {
    const filtered = getFilteredEntries();
    const period3s = filtered.map((e) => e.period3).filter(Boolean);

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

  const calculatePreGameStats = () => {
    const filtered = getFilteredEntries();
    const preGameEntries = filtered.filter((e) => e.preGame);

    if (preGameEntries.length === 0) return null;

    const equipmentYes = preGameEntries.filter((e) => e.preGame?.equipment?.value).length;
    const mentalPrepYes = preGameEntries.filter((e) => e.preGame?.mentalPrep?.value).length;
    const warmupYes = preGameEntries.filter((e) => e.preGame?.warmup?.value).length;
    const physicalYes = preGameEntries.filter((e) => e.preGame?.physical?.value).length;

    const total = preGameEntries.length;

    return {
      equipmentPercentage: ((equipmentYes / total) * 100).toFixed(0),
      mentalPrepPercentage: ((mentalPrepYes / total) * 100).toFixed(0),
      warmupPercentage: ((warmupYes / total) * 100).toFixed(0),
      physicalPercentage: ((physicalYes / total) * 100).toFixed(0),
      total,
    };
  };

  const calculatePostGameStats = () => {
    const filtered = getFilteredEntries();
    const postGameEntries = filtered.filter((e) => e.postGame);

    if (postGameEntries.length === 0) return null;

    const reviewCompletedYes = postGameEntries.filter((e) => e.postGame?.reviewCompleted?.value).length;
    const total = postGameEntries.length;

    return {
      reviewCompletionRate: ((reviewCompletedYes / total) * 100).toFixed(0),
      completed: reviewCompletedYes,
      total,
    };
  };

  const goalsStats = calculateGoalsStats();
  const challengeStats = calculateChallengeStats();
  const focusStats = calculateFocusConsistency();
  const skatingStats = calculateSkatingPerformance();
  const positionalStats = calculatePositionalPerformance();
  const decisionMakingStats = calculateDecisionMaking();
  const bodyLanguageStats = calculateBodyLanguage();
  const reboundControlStats = calculateReboundControl();
  const freezingPuckStats = calculateFreezingPuck();
  const teamPlayStats = calculateTeamPlay();
  const preGameStats = calculatePreGameStats();
  const postGameStats = calculatePostGameStats();

  const filteredSessions = getFilteredSessions();
  const filteredEntries = getFilteredEntries();

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.push('/charting')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="text-gray-600">Track your progress and trends over time</p>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Time Period:</span>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                This Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                This Month
              </Button>
              <Button
                variant={timeRange === '3months' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('3months')}
              >
                Last 3 Months
              </Button>
              <Button
                variant={timeRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('all')}
              >
                All Time
              </Button>
            </div>
            <div className="ml-auto text-sm text-gray-600">
              <Calendar className="w-4 h-4 inline mr-1" />
              {filteredSessions.length} sessions analyzed
            </div>
          </div>
        </Card>

        {/* Dynamic Analytics */}
        {user && <DynamicAnalyticsDisplay studentId={user.id} />}

        {/* Legacy Analytics Header */}
        {filteredEntries.length > 0 && (
          <div className="pt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Legacy Analytics</h2>
            <p className="text-gray-600 mb-4">Historical data from hardcoded forms</p>
          </div>
        )}

        {filteredEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">
              No charting data found for the selected time period.
            </p>
            <Button onClick={() => router.push('/charting')}>Go to Sessions</Button>
          </Card>
        ) : (
          <>
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

            {/* Decision Making & Body Language */}
            {(decisionMakingStats || bodyLanguageStats) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Decision Making & Body Language</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {decisionMakingStats && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Decision Making - Strong</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-bold text-emerald-700">{decisionMakingStats.strongPercentage}%</p>
                        <p className="text-sm text-gray-600 mb-1">strong</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-emerald-600 h-3 rounded-full transition-all"
                          style={{ width: `${decisionMakingStats.strongPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {decisionMakingStats.strongCount} strong / {decisionMakingStats.improvingCount} improving / {decisionMakingStats.needsWorkCount} needs work
                      </p>
                    </div>
                  )}
                  {bodyLanguageStats && (
                    <div className="bg-lime-50 border border-lime-200 rounded-lg p-6">
                      <p className="text-sm font-semibold text-gray-900 mb-3">Body Language</p>
                      <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-bold text-lime-700">{bodyLanguageStats.percentage}%</p>
                        <p className="text-sm text-gray-600 mb-1">consistent</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                        <div
                          className="bg-lime-600 h-3 rounded-full transition-all"
                          style={{ width: `${bodyLanguageStats.percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {bodyLanguageStats.consistentCount} consistent / {bodyLanguageStats.inconsistentCount} inconsistent
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Rebound Control */}
            {reboundControlStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Rebound Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Quality</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-violet-700">{reboundControlStats.qualityPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-violet-600 h-3 rounded-full transition-all"
                        style={{ width: `${reboundControlStats.qualityPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {reboundControlStats.goodCount} good / {reboundControlStats.improvingCount} improving / {reboundControlStats.poorCount} poor
                    </p>
                  </div>
                  <div className="bg-fuchsia-50 border border-fuchsia-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Consistency</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-fuchsia-700">{reboundControlStats.consistencyPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">consistent</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-fuchsia-600 h-3 rounded-full transition-all"
                        style={{ width: `${reboundControlStats.consistencyPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {reboundControlStats.consistentCount} consistent / {reboundControlStats.inconsistentCount} inconsistent
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Freezing Puck */}
            {freezingPuckStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Freezing Puck</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Quality</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-pink-700">{freezingPuckStats.qualityPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">good</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-pink-600 h-3 rounded-full transition-all"
                        style={{ width: `${freezingPuckStats.qualityPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {freezingPuckStats.goodCount} good / {freezingPuckStats.improvingCount} improving / {freezingPuckStats.poorCount} poor
                    </p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
                    <p className="text-sm font-semibold text-gray-900 mb-3">Consistency</p>
                    <div className="flex items-end gap-2 mb-2">
                      <p className="text-4xl font-bold text-rose-700">{freezingPuckStats.consistencyPercentage}%</p>
                      <p className="text-sm text-gray-600 mb-1">consistent</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                      <div
                        className="bg-rose-600 h-3 rounded-full transition-all"
                        style={{ width: `${freezingPuckStats.consistencyPercentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {freezingPuckStats.consistentCount} consistent / {freezingPuckStats.inconsistentCount} inconsistent
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

            {/* Pre-Game Preparation */}
            {preGameStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Pre-Game Preparation Adherence</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Equipment Check</p>
                    <p className="text-3xl font-bold text-orange-700">{preGameStats.equipmentPercentage}%</p>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Mental Prep</p>
                    <p className="text-3xl font-bold text-yellow-700">{preGameStats.mentalPrepPercentage}%</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Warmup</p>
                    <p className="text-3xl font-bold text-green-700">{preGameStats.warmupPercentage}%</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Physical Prep</p>
                    <p className="text-3xl font-bold text-blue-700">{preGameStats.physicalPercentage}%</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Based on {preGameStats.total} sessions with pre-game data
                </p>
              </Card>
            )}

            {/* Post-Game Review */}
            {postGameStats && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Post-Game Review Completion</h2>
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Review Completion Rate</p>
                  <div className="flex items-end gap-2 mb-2">
                    <p className="text-4xl font-bold text-gray-700">{postGameStats.reviewCompletionRate}%</p>
                    <p className="text-sm text-gray-600 mb-1">completed</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-gray-600 h-3 rounded-full transition-all"
                      style={{ width: `${postGameStats.reviewCompletionRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {postGameStats.completed} completed / {postGameStats.total} total sessions
                  </p>
                </div>
              </Card>
            )}

            {/* Session Timeline */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
              <div className="space-y-3">
                {filteredSessions.slice(0, 10).map((session) => {
                  const entry = entries.find((e) => e.sessionId === session.id);
                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                      onClick={() => router.push(`/charting/sessions/${session.id}`)}
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {session.type === 'game' ? '🥅' : '🏒'} {session.opponent || 'Practice'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {session.date.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {entry?.gameOverview && (
                          <div className="text-xs text-gray-600">
                            <span className="text-green-600 font-semibold">
                              {(entry.gameOverview.goodGoals.period1 || 0) +
                                (entry.gameOverview.goodGoals.period2 || 0) +
                                (entry.gameOverview.goodGoals.period3 || 0)}
                            </span>
                            /
                            <span className="text-red-600 font-semibold">
                              {(entry.gameOverview.badGoals.period1 || 0) +
                                (entry.gameOverview.badGoals.period2 || 0) +
                                (entry.gameOverview.badGoals.period3 || 0)}
                            </span>
                          </div>
                        )}
                        {entry && (
                          <Badge variant="outline" className="text-xs">
                            Charted
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

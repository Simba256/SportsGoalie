'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { SkeletonAnalytics } from '@/components/ui/skeletons';
import { chartingService, dynamicChartingService } from '@/lib/database';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import { Session, ChartingEntry, FormTemplate, DynamicChartingEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  CheckCircle,
  Type,
  Brain,
  Target,
  Video,
  Eye,
  Flame,
  Sparkles,
  ShieldCheck,
  Timer,
  Dumbbell,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { startOfWeek, startOfMonth, subMonths } from 'date-fns';

type TimeRange = 'week' | 'month' | '3months' | 'all';

export default function ChartingAnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [entries, setEntries] = useState<ChartingEntry[]>([]);
  const [dynamicEntries, setDynamicEntries] = useState<DynamicChartingEntry[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [openV2Game, setOpenV2Game] = useState(false);
  const [openV2Practice, setOpenV2Practice] = useState(false);
  const [openFormAnalytics, setOpenFormAnalytics] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [sessionsResult, allEntriesResult, dynamicEntriesResult, templateResult] = await Promise.all([
        chartingService.getSessionsByStudent(user.id, { limit: 500, orderBy: 'date', orderDirection: 'desc' }),
        chartingService.getChartingEntriesByStudent(user.id),
        dynamicChartingService.getDynamicEntriesByStudent(user.id),
        formTemplateService.getActiveTemplate(),
      ]);

      if (sessionsResult.success && sessionsResult.data) {
        setSessions(sessionsResult.data);
      }

      if (allEntriesResult.success && allEntriesResult.data) {
        setEntries(allEntriesResult.data);
      }

      if (dynamicEntriesResult.success && dynamicEntriesResult.data) {
        setDynamicEntries(dynamicEntriesResult.data);
      }

      if (templateResult.success && templateResult.data) {
        setActiveTemplate(templateResult.data);
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

    return sessions.filter((s) => {
      const sessionDate = toDateSafe((s as unknown as { date?: unknown }).date);
      return sessionDate ? sessionDate >= startDate : false;
    });
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

  const toDateSafe = (value: unknown): Date | null => {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : value;
    }
    if (
      value &&
      typeof value === 'object' &&
      'toDate' in value &&
      typeof (value as { toDate?: unknown }).toDate === 'function'
    ) {
      const converted = (value as { toDate: () => Date }).toDate();
      return Number.isNaN(converted.getTime()) ? null : converted;
    }
    if (value && typeof value === 'object') {
      const maybeSeconds =
        (value as { seconds?: unknown; _seconds?: unknown }).seconds ??
        (value as { seconds?: unknown; _seconds?: unknown })._seconds;
      if (typeof maybeSeconds === 'number') {
        const parsed = new Date(maybeSeconds * 1000);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      }
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  };

  const hasLegacyEntry = (sessionId: string) => entries.some((e) => e.sessionId === sessionId);
  const hasDynamicEntry = (sessionId: string) => dynamicEntries.some((e) => e.sessionId === sessionId);
  const getSessionDisplayStatus = (session: Session): 'completed' | 'charted' | 'in-progress' | 'scheduled' => {
    // Always trust canonical session status first.
    if (session.status === 'completed') return 'completed';
    if (session.status === 'in-progress') return 'in-progress';
    if (session.status === 'pre-game' || session.status === 'scheduled') return 'scheduled';

    // Fallback for legacy or unexpected statuses.
    if (hasLegacyEntry(session.id) || hasDynamicEntry(session.id)) return 'charted';
    return 'in-progress';
  };

  const getStatusBadgeClasses = (status: ReturnType<typeof getSessionDisplayStatus>) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'charted':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
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

  // ─── V2 Analytics (client-side, time-filtered) ─────────────────────────────

  const extractV2 = (entry: ChartingEntry) => {
    const raw = entry as unknown as Record<string, unknown>;
    return {
      preGame: raw.v2PreGame as
        | { routineCompleted: boolean; anxietyPresent: boolean; targetStateAchieved: boolean; mentalStateRating: number }
        | undefined,
      periods: raw.v2Periods as
        | Record<
            'period1' | 'period2' | 'period3' | 'overtime',
            | {
                mindControlRating: number;
                periodFactorRatio: number;
                goalsAgainst: number;
                goals?: { isGoodGoal: boolean }[];
              }
            | undefined
          >
        | undefined,
      postGame: raw.v2PostGame as
        | { overallGameFactorRating: number; gameRetentionRating: number; goodDecisionRate: number; mindVaultEntry?: string }
        | undefined,
      practice: raw.v2Practice as
        | {
            practiceValueRating: number;
            technicalEyeDevelopmentRating: number;
            designatedTrainingReceived: boolean;
            designatedTrainingDuration?: number;
            videoCaptured: boolean;
            practiceIndex?: { category: 'immediate_development' | 'refinement' | 'maintenance' }[];
            indexItemsWorkedOn?: string[];
            improvementRatings?: { rating: number }[];
            mindVaultEntry?: string;
          }
        | undefined,
    };
  };

  const calculateV2GameStats = () => {
    const filtered = getFilteredEntries();
    let totalV2 = 0;
    let mindSample = 0;
    let routine = 0;
    let anxiety = 0;
    let targetState = 0;
    let mentalStateSum = 0;

    let periodSamples = 0;
    let mindSum = 0;
    let factorSum = 0;
    let goalsAgainst = 0;
    let goodGoals = 0;
    let badGoals = 0;

    let postSample = 0;
    let overallFactorSum = 0;
    let retentionSum = 0;
    let decisionSum = 0;
    let vaultCount = 0;

    filtered.forEach((entry) => {
      const v2 = extractV2(entry);
      if (!v2.preGame && !v2.periods && !v2.postGame) return;
      totalV2++;

      if (v2.preGame) {
        mindSample++;
        if (v2.preGame.routineCompleted) routine++;
        if (v2.preGame.anxietyPresent) anxiety++;
        if (v2.preGame.targetStateAchieved) targetState++;
        mentalStateSum += v2.preGame.mentalStateRating || 0;
      }

      if (v2.periods) {
        (['period1', 'period2', 'period3', 'overtime'] as const).forEach((key) => {
          const p = v2.periods?.[key];
          if (!p) return;
          periodSamples++;
          mindSum += p.mindControlRating || 0;
          factorSum += p.periodFactorRatio || 0;
          goalsAgainst += p.goalsAgainst || 0;
          const good = p.goals?.filter((g) => g.isGoodGoal).length || 0;
          const bad = (p.goals?.length || 0) - good;
          goodGoals += good;
          badGoals += bad;
        });
      }

      if (v2.postGame) {
        postSample++;
        overallFactorSum += v2.postGame.overallGameFactorRating || 0;
        retentionSum += v2.postGame.gameRetentionRating || 0;
        decisionSum += v2.postGame.goodDecisionRate || 0;
        if (v2.postGame.mindVaultEntry && v2.postGame.mindVaultEntry.trim().length > 0) vaultCount++;
      }
    });

    if (totalV2 === 0) return null;

    const avg = (sum: number, count: number) => (count > 0 ? sum / count : 0);

    return {
      totalV2,
      mindSample,
      routinePct: avg(routine, mindSample) * 100,
      anxietyPct: avg(anxiety, mindSample) * 100,
      targetStatePct: avg(targetState, mindSample) * 100,
      avgMentalState: avg(mentalStateSum, mindSample),
      periodSamples,
      avgMindControl: avg(mindSum, periodSamples),
      avgFactorRatio: avg(factorSum, periodSamples),
      goalsAgainst,
      goodGoals,
      badGoals,
      goodBadRatio: badGoals > 0 ? goodGoals / badGoals : goodGoals,
      postSample,
      avgOverallFactor: avg(overallFactorSum, postSample),
      avgRetention: avg(retentionSum, postSample),
      avgGoodDecisionRate: avg(decisionSum, postSample),
      vaultCount,
    };
  };

  const calculateV2PracticeStats = () => {
    const filtered = getFilteredEntries();
    let total = 0;
    let valueSum = 0;
    let eyeSum = 0;
    let designatedCount = 0;
    let designatedMinutes = 0;
    let designatedMinutesCount = 0;
    let videoCount = 0;
    const indexCounts = { immediate_development: 0, refinement: 0, maintenance: 0 };
    let workedOnTotal = 0;
    let improvementSum = 0;
    let improvementCount = 0;
    let vaultCount = 0;

    filtered.forEach((entry) => {
      const { practice } = extractV2(entry);
      if (!practice) return;
      total++;
      valueSum += practice.practiceValueRating || 0;
      eyeSum += practice.technicalEyeDevelopmentRating || 0;

      if (practice.designatedTrainingReceived) {
        designatedCount++;
        if (typeof practice.designatedTrainingDuration === 'number') {
          designatedMinutes += practice.designatedTrainingDuration;
          designatedMinutesCount++;
        }
      }

      if (practice.videoCaptured) videoCount++;

      (practice.practiceIndex || []).forEach((it) => {
        if (it.category in indexCounts) indexCounts[it.category]++;
      });
      workedOnTotal += (practice.indexItemsWorkedOn || []).length;

      (practice.improvementRatings || []).forEach((r) => {
        improvementSum += r.rating || 0;
        improvementCount++;
      });

      if (practice.mindVaultEntry && practice.mindVaultEntry.trim().length > 0) vaultCount++;
    });

    if (total === 0) return null;

    const avg = (sum: number, count: number) => (count > 0 ? sum / count : 0);

    return {
      total,
      avgValue: avg(valueSum, total),
      avgEye: avg(eyeSum, total),
      designatedPct: avg(designatedCount, total) * 100,
      totalMinutes: designatedMinutes,
      avgMinutes: avg(designatedMinutes, designatedMinutesCount),
      videoPct: avg(videoCount, total) * 100,
      indexCounts,
      workedOnTotal,
      avgImprovement: avg(improvementSum, improvementCount),
      improvementCount,
      vaultCount,
    };
  };

  const v2GameStats = calculateV2GameStats();
  const v2PracticeStats = calculateV2PracticeStats();

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

  const getTimeButtonClass = (range: TimeRange) => {
    if (timeRange === range) {
      return 'rounded-xl border border-red-600 bg-red-600 px-4 text-white shadow-sm hover:bg-red-700';
    }
    return 'rounded-xl border border-transparent bg-transparent px-4 text-slate-700 hover:border-slate-200 hover:bg-slate-100/90 hover:text-slate-900';
  };

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
    return <SkeletonAnalytics />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden border border-red-100 bg-red-50 p-6 md:p-8 shadow-sm">
          <div className="absolute top-0 right-0 w-72 h-72 bg-red-500/12 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-red-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #dc2626 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                className="border-red-200 bg-white/80 text-red-700 hover:bg-red-50"
                onClick={() => router.push('/charting')}
              >
              <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-black text-slate-900">Performance Analytics</h1>
                <p className="text-slate-600">Track trends, consistency, and growth with a clearer view of your game.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Filter */}
        <Card className="border border-red-100/80 bg-red-50/70 p-3 md:p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Analytics Window</p>
              <p className="text-sm text-slate-700">Choose the period you want to compare.</p>
            </div>
            <div className="inline-flex w-full flex-wrap gap-1.5 rounded-2xl border border-slate-200/90 bg-white/80 p-1.5 md:w-auto md:flex-nowrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('week')}
                className={getTimeButtonClass('week')}
              >
                This Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('month')}
                className={getTimeButtonClass('month')}
              >
                This Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('3months')}
                className={getTimeButtonClass('3months')}
              >
                Last 3 Months
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTimeRange('all')}
                className={getTimeButtonClass('all')}
              >
                All Time
              </Button>
            </div>
          </div>
        </Card>

        {/* ── V2 Game Analytics ─────────────────────────────────────────── */}
        {v2GameStats && (
          <div className="space-y-3">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setOpenV2Game((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenV2Game((prev) => !prev);
                }
              }}
              className="p-5 border-red-100 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900">Game Chart Analytics</h2>
                    <p className="text-xs text-slate-500">
                      {v2GameStats.totalV2} session{v2GameStats.totalV2 === 1 ? '' : 's'} • Mind {v2GameStats.avgMindControl.toFixed(1)}/5 • Good/Bad {v2GameStats.goodGoals}/{v2GameStats.badGoals}
                    </p>
                  </div>
                </div>
                {openV2Game ? (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
            </Card>

            {openV2Game && (
              <Card className="p-6 border-red-100 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Game Chart Analytics</h2>
                    <p className="text-xs text-slate-500">
                      Across {v2GameStats.totalV2} charted game session{v2GameStats.totalV2 === 1 ? '' : 's'} in this window
                    </p>
                  </div>
                </div>

            {/* Hero stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Mind Control Avg</p>
                <p className="mt-1 text-3xl font-bold text-blue-900 tabular-nums">
                  {v2GameStats.avgMindControl.toFixed(1)}
                  <span className="text-base font-medium text-blue-600 ml-1">/ 5</span>
                </p>
                <p className="text-[11px] text-blue-700/70 mt-1">{v2GameStats.periodSamples} periods</p>
              </div>
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Factor Ratio Avg</p>
                <p className="mt-1 text-3xl font-bold text-indigo-900 tabular-nums">
                  {v2GameStats.avgFactorRatio.toFixed(1)}
                  <span className="text-base font-medium text-indigo-600 ml-1">/ 5</span>
                </p>
                <p className="text-[11px] text-indigo-700/70 mt-1">Across periods</p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Good / Bad Goals</p>
                <p className="mt-1 text-3xl font-bold text-emerald-900 tabular-nums">
                  {v2GameStats.goodGoals}
                  <span className="text-base font-medium text-emerald-600 mx-1">/</span>
                  <span className="text-red-700">{v2GameStats.badGoals}</span>
                </p>
                <p className="text-[11px] text-emerald-700/70 mt-1">
                  Ratio {v2GameStats.goodBadRatio.toFixed(2)}:1
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Goals Against</p>
                <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
                  {v2GameStats.goalsAgainst}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Total across sessions</p>
              </div>
            </div>

            {/* Mind Management */}
            {v2GameStats.mindSample > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-slate-800">Pre-Game Mind Management</p>
                  <span className="text-[11px] text-slate-500">({v2GameStats.mindSample} sessions)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Routine Completed</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{v2GameStats.routinePct.toFixed(0)}%</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${v2GameStats.routinePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Target State Achieved</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{v2GameStats.targetStatePct.toFixed(0)}%</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${v2GameStats.targetStatePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Anxiety Present</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">{v2GameStats.anxietyPct.toFixed(0)}%</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${v2GameStats.anxietyPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Avg Mental State</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {v2GameStats.avgMentalState.toFixed(1)}
                      <span className="text-xs font-medium text-slate-500 ml-1">/ 5</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Post-Game */}
            {v2GameStats.postSample > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-slate-800">Post-Game Review</p>
                  <span className="text-[11px] text-slate-500">({v2GameStats.postSample} sessions)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Overall Game Factor</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {v2GameStats.avgOverallFactor.toFixed(1)}
                      <span className="text-xs font-medium text-slate-500 ml-1">/ 5</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Game Retention</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {v2GameStats.avgRetention.toFixed(1)}
                      <span className="text-xs font-medium text-slate-500 ml-1">/ 5</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Good Decision Rate</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {v2GameStats.avgGoodDecisionRate.toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Mind Vault Entries</p>
                    <p className="text-2xl font-bold text-slate-900 tabular-nums">
                      {v2GameStats.vaultCount}
                    </p>
                  </div>
                </div>
              </div>
            )}
              </Card>
            )}
          </div>
        )}

        {/* ── V2 Practice Analytics ─────────────────────────────────────── */}
        {v2PracticeStats && (
          <div className="space-y-3">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setOpenV2Practice((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenV2Practice((prev) => !prev);
                }
              }}
              className="p-5 border-red-100 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900">Practice Chart Analytics</h2>
                    <p className="text-xs text-slate-500">
                      {v2PracticeStats.total} session{v2PracticeStats.total === 1 ? '' : 's'} • Value {v2PracticeStats.avgValue.toFixed(1)}/5 • Tech Eye {v2PracticeStats.avgEye.toFixed(1)}/5
                    </p>
                  </div>
                </div>
                {openV2Practice ? (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
            </Card>

            {openV2Practice && (
              <Card className="p-6 border-red-100 shadow-sm bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Practice Chart Analytics</h2>
                    <p className="text-xs text-slate-500">
                      Across {v2PracticeStats.total} charted practice session{v2PracticeStats.total === 1 ? '' : 's'} in this window
                    </p>
                  </div>
                </div>

            {/* Core ratings */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Practice Value Avg</p>
                <p className="mt-1 text-3xl font-bold text-blue-900 tabular-nums">
                  {v2PracticeStats.avgValue.toFixed(1)}
                  <span className="text-base font-medium text-blue-600 ml-1">/ 5</span>
                </p>
              </div>
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">Technical Eye Avg</p>
                <p className="mt-1 text-3xl font-bold text-indigo-900 tabular-nums">
                  {v2PracticeStats.avgEye.toFixed(1)}
                  <span className="text-base font-medium text-indigo-600 ml-1">/ 5</span>
                </p>
              </div>
              <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Designated Training</p>
                <p className="mt-1 text-3xl font-bold text-emerald-900 tabular-nums">
                  {v2PracticeStats.designatedPct.toFixed(0)}%
                </p>
                <p className="text-[11px] text-emerald-700/70 mt-1">
                  {v2PracticeStats.totalMinutes} total min
                  {v2PracticeStats.avgMinutes > 0 && ` · avg ${v2PracticeStats.avgMinutes.toFixed(0)}m`}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <Video className="w-3 h-3 text-slate-500" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Video Capture Rate</p>
                </div>
                <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
                  {v2PracticeStats.videoPct.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* Practice Index breakdown */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-bold text-slate-800">Practice Index Breakdown</p>
                <span className="text-[11px] text-slate-500">
                  ({v2PracticeStats.workedOnTotal} items worked on total)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Flame className="w-3.5 h-3.5 text-red-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Immediate Development</p>
                  </div>
                  <p className="text-2xl font-bold text-red-900 tabular-nums">
                    {v2PracticeStats.indexCounts.immediate_development}
                  </p>
                  <p className="text-[11px] text-red-700/70 mt-0.5">Item occurrences</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Refinement</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900 tabular-nums">
                    {v2PracticeStats.indexCounts.refinement}
                  </p>
                  <p className="text-[11px] text-blue-700/70 mt-0.5">Item occurrences</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Maintenance</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-900 tabular-nums">
                    {v2PracticeStats.indexCounts.maintenance}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Item occurrences</p>
                </div>
              </div>
            </div>

            {/* Improvement + Mind Vault */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-slate-800">Did it improve?</p>
                </div>
                <p className="text-3xl font-bold text-slate-900 tabular-nums">
                  {v2PracticeStats.avgImprovement.toFixed(1)}
                  <span className="text-sm font-medium text-slate-500 ml-1">/ 5 avg</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {v2PracticeStats.improvementCount} rated improvements
                </p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-bold text-slate-800">Mind Vault Entries</p>
                </div>
                <p className="text-3xl font-bold text-blue-900 tabular-nums">
                  {v2PracticeStats.vaultCount}
                </p>
                <p className="text-[11px] text-blue-700/70 mt-1">
                  From {v2PracticeStats.total} practice session{v2PracticeStats.total === 1 ? '' : 's'}
                </p>
              </div>
            </div>
              </Card>
            )}
          </div>
        )}

        {/* Form Analytics */}
        {dynamicEntries.length > 0 && activeTemplate && (
          <div className="space-y-4">
            <Card
              role="button"
              tabIndex={0}
              onClick={() => setOpenFormAnalytics((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setOpenFormAnalytics((prev) => !prev);
                }
              }}
              className="p-5 border-red-100 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Type className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-gray-900">Form Analytics</h2>
                    <p className="text-xs text-slate-500">
                      Template {activeTemplate.name} • {dynamicEntries.length} entries • {Math.round((dynamicEntries.filter(e => e.isComplete).length / dynamicEntries.length) * 100)}% complete
                    </p>
                  </div>
                </div>
                {openFormAnalytics ? (
                  <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                )}
              </div>
            </Card>

            {openFormAnalytics && (
              <>
                <div className="rounded-2xl border border-red-100 bg-red-50/70 px-5 py-4">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Form Analytics</h2>
                  <p className="text-muted-foreground">Data from active form template: <span className="font-semibold text-blue-700">{activeTemplate.name}</span></p>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-6 border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                        <p className="text-3xl font-black text-foreground mt-2">{dynamicEntries.length}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card className="p-6 border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Complete Entries</p>
                        <p className="text-3xl font-black text-foreground mt-2">
                          {dynamicEntries.filter(e => e.isComplete).length}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.round((dynamicEntries.filter(e => e.isComplete).length / dynamicEntries.length) * 100)}% completion rate
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-red-600" />
                    </div>
                  </Card>

                  <Card className="p-6 border border-border bg-card shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                        <p className="text-3xl font-black text-foreground mt-2">
                          {Math.round(dynamicEntries.reduce((sum, e) => sum + e.completionPercentage, 0) / dynamicEntries.length)}%
                        </p>
                      </div>
                      <Type className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                </div>

                {/* Field-by-Field Stats */}
                <Card className="p-6 border border-border bg-card shadow-sm">
                  <h3 className="text-xl font-bold text-foreground mb-4">Field Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeTemplate.sections.map(section =>
                      section.fields
                        .filter(field => ['number', 'checkbox', 'select', 'radio'].includes(field.type))
                        .map(field => {
                          // Aggregate field data
                          const values: any[] = [];
                          dynamicEntries.forEach(entry => {
                            const sectionData = entry.responses[section.id];
                            if (!sectionData) return;

                            if (section.isRepeatable && Array.isArray(sectionData)) {
                              sectionData.forEach((instance: any) => {
                                const val = instance[field.id];
                                if (val !== undefined && val !== null) {
                                  values.push(typeof val === 'object' ? val.value : val);
                                }
                              });
                            } else {
                              const val = (sectionData as any)[field.id];
                              if (val !== undefined && val !== null) {
                                values.push(typeof val === 'object' ? val.value : val);
                              }
                            }
                          });

                          if (values.length === 0) return null;

                          // Calculate stats based on field type
                          let displayValue = '';
                          let subtitle = '';

                          if (field.type === 'numeric' || field.type === 'scale') {
                            const nums = values.map(Number).filter(n => !isNaN(n));
                            const avg = nums.reduce((sum, n) => sum + n, 0) / nums.length;
                            displayValue = avg.toFixed(1);
                            subtitle = `Avg across ${nums.length} entries`;
                          } else if (field.type === 'checkbox' || field.type === 'yesno') {
                            const trueCount = values.filter(v => v === true || v === 'yes').length;
                            const percentage = Math.round((trueCount / values.length) * 100);
                            displayValue = `${percentage}%`;
                            subtitle = `${trueCount}/${values.length} checked`;
                          } else if (field.type === 'radio') {
                            // Find most common value
                            const counts: Record<string, number> = {};
                            values.forEach(v => {
                              const key = String(v);
                              counts[key] = (counts[key] || 0) + 1;
                            });
                            const mostCommon = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
                            displayValue = mostCommon[0];
                            subtitle = `${mostCommon[1]}/${values.length} times`;
                          }

                          return (
                            <Card key={`${section.id}-${field.id}`} className="p-4 bg-red-50/50 border border-red-100">
                              <p className="text-xs text-slate-500 mb-1">{section.title}</p>
                              <p className="text-sm font-semibold text-slate-900 mb-2">{field.label}</p>
                              <p className="text-2xl font-bold text-blue-600">{displayValue}</p>
                              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
                            </Card>
                          );
                        })
                    )}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {filteredSessions.length === 0 ? (
          <Card className="p-12 text-center border-red-100 shadow-sm bg-white">
            <BarChart3 className="w-16 h-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Sessions Found</h3>
            <p className="text-slate-600 mb-4">
              No sessions found for the selected time period.
            </p>
            <Button onClick={() => router.push('/charting')} className="bg-red-600 hover:bg-red-700 text-white">Go to Sessions</Button>
          </Card>
        ) : (
          <>
            {/* Goals Performance */}
            {goalsStats && (
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
              <Card className="p-6 border-red-100 shadow-sm bg-white">
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
            <Card className="p-6 border-red-100 shadow-sm bg-white">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions ({filteredSessions.length})</h2>
              <div className="space-y-3">
                {filteredSessions.slice(0, 10).map((session) => {
                  const entry = entries.find((e) => e.sessionId === session.id);
                  const status = getSessionDisplayStatus(session);
                  const sessionDate = toDateSafe((session as unknown as { date?: unknown }).date);
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
                          {sessionDate ? sessionDate.toLocaleDateString() : 'Date unavailable'}
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
                        <Badge variant="outline" className={`text-xs capitalize ${getStatusBadgeClasses(status)}`}>
                          {status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
    </div>
  );
}

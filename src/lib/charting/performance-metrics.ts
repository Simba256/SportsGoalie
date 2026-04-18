import { ChartingEntry } from '@/types';

/**
 * Pure calculators for charting performance metrics.
 * Used by both /admin/charting (aggregate across all goalies) and
 * /admin/users/[id] (scoped to a single goalie). Each function accepts a
 * ChartingEntry[] and returns either a stats object or null when there is
 * not enough data to compute a meaningful value.
 */

type Trend = 'up' | 'down' | 'stable';

export interface GoalsStats {
  avgGoodGoals: string;
  avgBadGoals: string;
  totalGames: number;
  improvement: string;
  trend: Trend;
}

export interface ChallengeStats {
  avgChallenge: string;
  consistency: 'High' | 'Medium' | 'Low';
  stdDev: string;
}

export interface BinaryPerformance {
  percentage: string;
  positiveCount: number;
  negativeCount: number;
  trend: Trend;
}

export interface PositionalStats {
  percentage: string;
  goodCount: number;
  needsWorkCount: number;
}

export interface TeamPlayStats {
  defensePercentage: string;
  forwardsPercentage: string;
  defenseGoodCount: number;
  defenseImprovingCount: number;
  defensePoorCount: number;
  forwardsGoodCount: number;
  forwardsImprovingCount: number;
  forwardsPoorCount: number;
}

export interface ThreeWayStats {
  strongPercentage: string;
  improvingPercentage: string;
  needsWorkPercentage: string;
  strongCount: number;
  improvingCount: number;
  needsWorkCount: number;
  total: number;
}

export interface BodyLanguageStats {
  consistentPercentage: string;
  inconsistentPercentage: string;
  consistentCount: number;
  inconsistentCount: number;
  total: number;
}

export interface QualityConsistencyStats {
  qualityGood: string;
  consistencyPercentage: string;
  goodCount: number;
  consistentCount: number;
  totalQuality: number;
  totalConsistency: number;
}

export interface PreGameStats {
  equipment: string;
  mental: string;
  warmup: string;
  physical: string;
  total: number;
}

export interface PostGameStats {
  completionRate: string;
  completed: number;
  total: number;
}

const flatPeriods = (entries: ChartingEntry[]) =>
  entries.flatMap((e) => [e.period1, e.period2, e.period3]).filter(Boolean) as any[];

export const calculateGoalsStats = (entries: ChartingEntry[]): GoalsStats | null => {
  const withOverview = entries.filter((e) => e.gameOverview);
  if (withOverview.length === 0) return null;

  const sumGoals = (list: ChartingEntry[], key: 'goodGoals' | 'badGoals') =>
    list.reduce(
      (sum, e) =>
        sum +
        (e.gameOverview?.[key].period1 || 0) +
        (e.gameOverview?.[key].period2 || 0) +
        (e.gameOverview?.[key].period3 || 0),
      0
    );

  const totalGood = sumGoals(withOverview, 'goodGoals');
  const totalBad = sumGoals(withOverview, 'badGoals');
  const avgGood = totalGood / withOverview.length;
  const avgBad = totalBad / withOverview.length;

  const midPoint = Math.floor(withOverview.length / 2);
  const firstHalf = withOverview.slice(0, midPoint);
  const secondHalf = withOverview.slice(midPoint);

  const firstHalfBad = sumGoals(firstHalf, 'badGoals') / (firstHalf.length || 1);
  const secondHalfBad = sumGoals(secondHalf, 'badGoals') / (secondHalf.length || 1);
  const improvement = ((firstHalfBad - secondHalfBad) / (firstHalfBad || 1)) * 100;

  return {
    avgGoodGoals: avgGood.toFixed(1),
    avgBadGoals: avgBad.toFixed(1),
    totalGames: withOverview.length,
    improvement: improvement.toFixed(0),
    trend: improvement > 5 ? 'up' : improvement < -5 ? 'down' : 'stable',
  };
};

export const calculateChallengeStats = (entries: ChartingEntry[]): ChallengeStats | null => {
  const withOverview = entries.filter((e) => e.gameOverview);
  if (withOverview.length === 0) return null;

  const perEntry = withOverview.map(
    (e) =>
      ((e.gameOverview?.degreeOfChallenge.period1 || 0) +
        (e.gameOverview?.degreeOfChallenge.period2 || 0) +
        (e.gameOverview?.degreeOfChallenge.period3 || 0)) /
      3
  );

  const avg = perEntry.reduce((s, v) => s + v, 0) / perEntry.length;
  const variance = perEntry.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / perEntry.length;
  const stdDev = Math.sqrt(variance);

  return {
    avgChallenge: avg.toFixed(1),
    consistency: stdDev < 1 ? 'High' : stdDev < 2 ? 'Medium' : 'Low',
    stdDev: stdDev.toFixed(1),
  };
};

const binaryMetric = (
  periods: any[],
  positiveSelector: (p: any) => any,
  negativeSelector: (p: any) => any
): BinaryPerformance | null => {
  if (periods.length === 0) return null;

  const positiveCount = periods.filter((p) => positiveSelector(p)?.value).length;
  const negativeCount = periods.filter((p) => negativeSelector(p)?.value).length;
  const total = positiveCount + negativeCount;
  const percentage = total > 0 ? (positiveCount / total) * 100 : 0;

  const midPoint = Math.floor(periods.length / 2);
  const firstHalf = periods.slice(0, midPoint);
  const secondHalf = periods.slice(midPoint);

  const firstRatio =
    firstHalf.filter((p) => positiveSelector(p)?.value).length / (firstHalf.length || 1);
  const secondRatio =
    secondHalf.filter((p) => positiveSelector(p)?.value).length / (secondHalf.length || 1);

  const trend: Trend =
    secondRatio > firstRatio + 0.1 ? 'up' : secondRatio < firstRatio - 0.1 ? 'down' : 'stable';

  return {
    percentage: percentage.toFixed(0),
    positiveCount,
    negativeCount,
    trend,
  };
};

export const calculateFocusConsistency = (entries: ChartingEntry[]) =>
  binaryMetric(
    flatPeriods(entries),
    (p) => p?.mindSet?.focusConsistent,
    (p) => p?.mindSet?.focusInconsistent
  );

export const calculateSkatingPerformance = (entries: ChartingEntry[]) =>
  binaryMetric(
    flatPeriods(entries),
    (p) => p?.skating?.inSync,
    (p) => p?.skating?.notInSync
  );

export const calculatePositionalPerformance = (entries: ChartingEntry[]): PositionalStats | null => {
  const periods = flatPeriods(entries);
  if (periods.length === 0) return null;

  const goodCount = periods.filter(
    (p: any) =>
      p?.positionalAboveIcing?.good?.value ||
      p?.positionalBelowIcing?.good?.value ||
      p?.positionalBelowIcing?.strong?.value
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

export const calculateTeamPlay = (entries: ChartingEntry[]): TeamPlayStats | null => {
  const period3s = entries.map((e) => e.period3).filter(Boolean) as any[];
  if (period3s.length === 0) return null;

  const count = (selector: (p: any) => any) => period3s.filter((p) => selector(p)?.value).length;

  const defenseGoodCount = count((p) => p?.teamPlay?.settingUpDefense?.good);
  const defenseImprovingCount = count((p) => p?.teamPlay?.settingUpDefense?.improving);
  const defensePoorCount = count((p) => p?.teamPlay?.settingUpDefense?.poor);

  const forwardsGoodCount = count((p) => p?.teamPlay?.settingUpForwards?.good);
  const forwardsImprovingCount = count((p) => p?.teamPlay?.settingUpForwards?.improving);
  const forwardsPoorCount = count((p) => p?.teamPlay?.settingUpForwards?.poor);

  const defenseTotal = defenseGoodCount + defenseImprovingCount + defensePoorCount;
  const forwardsTotal = forwardsGoodCount + forwardsImprovingCount + forwardsPoorCount;

  return {
    defensePercentage: (defenseTotal > 0 ? (defenseGoodCount / defenseTotal) * 100 : 0).toFixed(0),
    forwardsPercentage: (forwardsTotal > 0 ? (forwardsGoodCount / forwardsTotal) * 100 : 0).toFixed(0),
    defenseGoodCount,
    defenseImprovingCount,
    defensePoorCount,
    forwardsGoodCount,
    forwardsImprovingCount,
    forwardsPoorCount,
  };
};

export const calculateDecisionMaking = (entries: ChartingEntry[]): ThreeWayStats | null => {
  const periods = flatPeriods(entries);
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

export const calculateBodyLanguage = (entries: ChartingEntry[]): BodyLanguageStats | null => {
  const periods = flatPeriods(entries);
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

const qualityConsistencyMetric = (
  periods: any[],
  qualityKey: 'reboundControl' | 'freezingPuck'
): QualityConsistencyStats | null => {
  if (periods.length === 0) return null;

  const poorCount = periods.filter((p: any) => p?.[qualityKey]?.poor?.value).length;
  const improvingCount = periods.filter((p: any) => p?.[qualityKey]?.improving?.value).length;
  const goodCount = periods.filter((p: any) => p?.[qualityKey]?.good?.value).length;
  const qualityTotal = poorCount + improvingCount + goodCount;

  const consistentCount = periods.filter((p: any) => p?.[qualityKey]?.consistent?.value).length;
  const inconsistentCount = periods.filter((p: any) => p?.[qualityKey]?.inconsistent?.value).length;
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

export const calculateReboundControl = (entries: ChartingEntry[]) =>
  qualityConsistencyMetric(flatPeriods(entries), 'reboundControl');

export const calculateFreezingPuck = (entries: ChartingEntry[]) =>
  qualityConsistencyMetric(flatPeriods(entries), 'freezingPuck');

export const calculatePreGameStats = (entries: ChartingEntry[]): PreGameStats | null => {
  const preGames = entries.filter((e) => e.preGame).map((e) => e.preGame!);
  if (preGames.length === 0) return null;

  const equipmentReady = preGames.filter(
    (p) => p.gameReadiness?.wellRested?.value && p.gameReadiness?.fueledForGame?.value
  ).length;
  const mentalPrep = preGames.filter(
    (p) => p.mindSet?.mindCleared?.value && p.mindSet?.mentalImagery?.value
  ).length;
  const warmup = preGames.filter(
    (p) => p.warmUp?.lookedEngaged?.value && !p.warmUp?.lackedFocus?.value
  ).length;
  const physical = preGames.filter(
    (p) => p.preGameRoutine?.ballExercises?.value && p.preGameRoutine?.stretching?.value
  ).length;

  return {
    equipment: ((equipmentReady / preGames.length) * 100).toFixed(0),
    mental: ((mentalPrep / preGames.length) * 100).toFixed(0),
    warmup: ((warmup / preGames.length) * 100).toFixed(0),
    physical: ((physical / preGames.length) * 100).toFixed(0),
    total: preGames.length,
  };
};

export const calculatePostGameStats = (entries: ChartingEntry[]): PostGameStats | null => {
  const postGames = entries.filter((e) => e.postGame);
  if (postGames.length === 0) return null;

  const completed = postGames.filter((e) => e.postGame?.reviewCompleted?.value).length;
  return {
    completionRate: ((completed / postGames.length) * 100).toFixed(0),
    completed,
    total: postGames.length,
  };
};

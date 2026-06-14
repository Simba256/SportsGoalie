import { TrainingLogEntry, TrainingItemLog, TrainingCategory, VMPRating } from '@/types/charting';

/** Convert V.M.P. rating to 1-5 numeric scale */
function vmpToScore(vmp: VMPRating | undefined): number | null {
  if (!vmp) return null;
  const map: Record<VMPRating, number> = {
    low: 1.67,
    medium_spotty: 3.33,
    high_consistent: 5,
  };
  return map[vmp];
}

/** Score a single logged item: average of consistency star + VMP (if both present) */
function scoreItem(item: TrainingItemLog): number | null {
  if (!item.done) return null;
  const scores: number[] = [];
  if (item.consistencyRating) scores.push(item.consistencyRating);
  const vmpScore = vmpToScore(item.vmpRating);
  if (vmpScore !== null) scores.push(vmpScore);
  if (scores.length === 0) return 3; // done but no rating — assume average
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export interface CategoryScore {
  category: TrainingCategory;
  label: string;
  score: number; // 1-5
  itemCount: number;
  doneCount: number;
}

export interface TrainingAnalytics {
  categoryScores: CategoryScore[];
  overallScore: number; // 1-5 average across categories
  masteryPercent: number; // 0-100, progress toward 95-100 Club
  periodRange: { from: string; to: string } | null;
}

const CATEGORY_LABELS: Record<TrainingCategory, string> = {
  ice: 'Ice',
  puck_machine: 'Puck Machine',
  land_conditioning: 'Land / Conditioning',
  lifestyle_foundations: 'Lifestyle Foundations',
  games_tourneys: 'Games / Tourneys',
};

/**
 * Compute analytics roll-up from an array of training log entries.
 * Pass the last 30 days of logs for a meaningful rolling average.
 */
export function computeTrainingAnalytics(logs: TrainingLogEntry[]): TrainingAnalytics {
  if (logs.length === 0) {
    return {
      categoryScores: [],
      overallScore: 0,
      masteryPercent: 0,
      periodRange: null,
    };
  }

  // Group all items by category across all logs
  const byCategory: Record<TrainingCategory, TrainingItemLog[]> = {
    ice: [],
    puck_machine: [],
    land_conditioning: [],
    lifestyle_foundations: [],
    games_tourneys: [],
  };

  logs.forEach(log => {
    log.items.forEach(item => {
      if (byCategory[item.category]) {
        byCategory[item.category].push(item);
      }
    });
  });

  const categoryScores: CategoryScore[] = Object.entries(byCategory).map(([cat, items]) => {
    const done = items.filter(i => i.done);
    const scores = done.map(scoreItem).filter((s): s is number => s !== null);
    const avg = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    return {
      category: cat as TrainingCategory,
      label: CATEGORY_LABELS[cat as TrainingCategory],
      score: avg,
      itemCount: items.length,
      doneCount: done.length,
    };
  });

  const nonZeroScores = categoryScores.filter(c => c.score > 0);
  const overallScore = nonZeroScores.length > 0
    ? nonZeroScores.reduce((a, c) => a + c.score, 0) / nonZeroScores.length
    : 0;

  // Mastery % toward the 95-100 Club: overall score / 5 * 100
  // The 95-100 Club threshold = score of 4.75 (95%)
  const masteryPercent = Math.min(100, Math.round((overallScore / 5) * 100));

  const dates = logs.map(l => l.date).sort();

  return {
    categoryScores,
    overallScore,
    masteryPercent,
    periodRange: dates.length > 0 ? { from: dates[0], to: dates[dates.length - 1] } : null,
  };
}

/** Check if a goalie has reached a milestone (used for Task 6 notifications) */
export interface TrainingMilestone {
  type: 'mastery_level' | 'category_peak' | 'streak';
  label: string;
  description: string;
  threshold: number;
  value: number;
}

export function detectTrainingMilestones(
  prev: TrainingAnalytics,
  next: TrainingAnalytics,
): TrainingMilestone[] {
  const milestones: TrainingMilestone[] = [];

  const MASTERY_TIERS = [25, 50, 75, 90, 95, 100];
  for (const tier of MASTERY_TIERS) {
    if (prev.masteryPercent < tier && next.masteryPercent >= tier) {
      milestones.push({
        type: 'mastery_level',
        label: `${tier}% Mastery`,
        description: `You hit ${tier}% on your mastery climb — ${tier === 100 ? 'Welcome to the 95–100 Club!' : 'keep going!'}`,
        threshold: tier,
        value: next.masteryPercent,
      });
    }
  }

  return milestones;
}

import { Timestamp } from 'firebase/firestore';
import {
  IntelligenceProfile,
  IntelligenceScore,
  PacingLevel,
  QuestionnaireRole,
  CategoryWeight,
  CategoryScoreResult,
  GapAnalysis,
  StrengthAnalysis,
  ContentRecommendation,
  AssessmentResponseV2,
  AssessmentQuestion,
  GoalieAgeRange,
  DEFAULT_PACING_THRESHOLDS,
  PacingThresholds,
  calculatePacingLevel,
  getCategoryWeights,
} from '@/types';
import { GOALIE_ASSESSMENT_QUESTIONS } from '@/data/goalie-assessment-questions';

/**
 * Intelligence Profile Scoring Engine
 *
 * Implements Michael's scoring algorithm from 05-assessment-scoring-engine.md:
 * 1. Calculate category averages (1.0-4.0)
 * 2. Apply category weights
 * 3. Sum weighted scores for overall Intelligence Profile Score
 * 4. Map to pacing level (Introduction/Development/Refinement)
 * 5. Identify gaps (below average) and strengths (above average)
 */

/**
 * Calculate the average score for a category
 */
function calculateCategoryAverage(
  responses: AssessmentResponseV2[],
  categorySlug: string
): { average: number; count: number; total: number } {
  const categoryResponses = responses.filter(r => r.categorySlug === categorySlug);

  if (categoryResponses.length === 0) {
    return { average: 0, count: 0, total: 0 };
  }

  const totalScore = categoryResponses.reduce((sum, r) => sum + r.score, 0);
  const count = categoryResponses.length;
  const average = totalScore / count;

  return { average, count, total: totalScore };
}

/**
 * Calculate all category scores
 */
export function calculateCategoryScores(
  responses: AssessmentResponseV2[],
  questions: AssessmentQuestion[],
  categoryWeights: CategoryWeight[]
): CategoryScoreResult[] {
  const results: CategoryScoreResult[] = [];

  for (const weight of categoryWeights) {
    const { average, count, total } = calculateCategoryAverage(responses, weight.categorySlug);

    // Calculate max possible score (4.0 * number of questions)
    const categoryQuestions = questions.filter(q => q.categorySlug === weight.categorySlug);
    const maxPossibleScore = categoryQuestions.length * 4.0;

    // Calculate weighted score
    const weightedScore = average * (weight.weight / 100);

    // Identify strengths and gaps from individual question scores
    const categoryResponses = responses.filter(r => r.categorySlug === weight.categorySlug);
    const strengths: string[] = [];
    const gaps: string[] = [];

    for (const response of categoryResponses) {
      const question = questions.find(q => q.id === response.questionId);
      if (question) {
        if (response.score >= 3.5) {
          strengths.push(question.question);
        } else if (response.score < 2.0) {
          gaps.push(question.question);
        }
      }
    }

    results.push({
      categorySlug: weight.categorySlug,
      categoryName: weight.name,
      rawScore: total,
      maxPossibleScore,
      averageScore: average as IntelligenceScore,
      weight: weight.weight,
      weightedScore,
      questionCount: count,
      strengths,
      gaps,
    });
  }

  return results;
}

/**
 * Calculate overall Intelligence Profile Score
 */
export function calculateOverallScore(categoryScores: CategoryScoreResult[]): IntelligenceScore {
  // Sum all weighted scores
  const totalWeightedScore = categoryScores.reduce((sum, cs) => sum + cs.weightedScore, 0);

  // Since weights sum to 100, divide by 100 to get back to 1.0-4.0 scale
  // But our weighted scores already account for this, so we need to normalize
  const totalWeight = categoryScores.reduce((sum, cs) => sum + cs.weight, 0);

  if (totalWeight === 0) {
    return 1.0;
  }

  // The overall score is the weighted average
  return totalWeightedScore / (totalWeight / 100);
}

/**
 * Identify significant gaps (categories scoring below average)
 */
function identifyGaps(
  categoryScores: CategoryScoreResult[],
  overallScore: IntelligenceScore
): GapAnalysis[] {
  const gaps: GapAnalysis[] = [];

  for (const cs of categoryScores) {
    const deviation = cs.averageScore - overallScore;

    // Gap if more than 0.5 below average, or below 2.0 regardless
    if (deviation < -0.5 || cs.averageScore < 2.0) {
      let priority: 'high' | 'medium' | 'low';
      if (deviation < -1.0 || cs.averageScore < 1.5) {
        priority = 'high';
      } else if (deviation < -0.5 || cs.averageScore < 2.0) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      // Generate suggested content areas based on category
      const suggestedContent = getSuggestedContentForCategory(cs.categorySlug, priority);

      gaps.push({
        categorySlug: cs.categorySlug,
        categoryName: cs.categoryName,
        score: cs.averageScore,
        deviationFromAverage: deviation,
        priority,
        relatedQuestions: cs.gaps,
        suggestedContent,
      });
    }
  }

  // Sort by priority (high first) and then by deviation
  return gaps.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.deviationFromAverage - b.deviationFromAverage;
  });
}

/**
 * Identify strengths (categories scoring above average)
 */
function identifyStrengths(
  categoryScores: CategoryScoreResult[],
  overallScore: IntelligenceScore
): StrengthAnalysis[] {
  const strengths: StrengthAnalysis[] = [];

  for (const cs of categoryScores) {
    const deviation = cs.averageScore - overallScore;

    // Strength if more than 0.3 above average, or above 3.5 regardless
    if (deviation > 0.3 || cs.averageScore >= 3.5) {
      strengths.push({
        categorySlug: cs.categorySlug,
        categoryName: cs.categoryName,
        score: cs.averageScore,
        deviationFromAverage: deviation,
        relatedQuestions: cs.strengths,
      });
    }
  }

  // Sort by score descending
  return strengths.sort((a, b) => b.score - a.score);
}

/**
 * Get suggested content areas based on category and priority
 */
function getSuggestedContentForCategory(categorySlug: string, priority: 'high' | 'medium' | 'low'): string[] {
  const contentMap: Record<string, string[]> = {
    feelings: ['Mindset Fundamentals', 'Building Confidence', 'Handling Pressure'],
    knowledge: ['Position Fundamentals', 'Technical Understanding', 'Self-Evaluation Basics'],
    pre_game: ['Pre-Game Routines', 'Mental Preparation', 'Warm-Up Optimization'],
    in_game: ['Tracking and Awareness', 'Competing as a Goalie', 'Period-by-Period Performance'],
    post_game: ['Self-Evaluation', 'Constructive Reflection', 'Processing Performance'],
    training: ['Independent Training', 'Practice Optimization', 'Off-Ice Development'],
    learning: ['Learning Preferences', 'Video Analysis Introduction', 'Progress Tracking'],
  };

  const allContent = contentMap[categorySlug] || ['General Fundamentals'];

  // Return more content for higher priority gaps
  if (priority === 'high') {
    return allContent;
  } else if (priority === 'medium') {
    return allContent.slice(0, 2);
  }
  return allContent.slice(0, 1);
}

/**
 * Generate content recommendations based on profile
 */
function generateContentRecommendations(
  gaps: GapAnalysis[],
  pacingLevel: PacingLevel
): ContentRecommendation[] {
  const recommendations: ContentRecommendation[] = [];

  // Add recommendations based on gaps
  for (const gap of gaps) {
    recommendations.push({
      contentArea: gap.categoryName,
      priority: gap.priority,
      reason: `${gap.categoryName} score of ${gap.score.toFixed(1)} indicates room for growth`,
      suggestedModules: gap.suggestedContent,
    });
  }

  // Add universal recommendations based on pacing level
  if (pacingLevel === 'introduction') {
    recommendations.push({
      contentArea: 'Foundation Overview',
      priority: 'high',
      reason: 'Building foundational understanding of goaltending',
      suggestedModules: ['Position Basics', 'The Goalie Mindset', 'Understanding Your Role'],
    });
  }

  return recommendations;
}

/**
 * Determine charting emphasis based on gaps
 */
function determineChartingEmphasis(gaps: GapAnalysis[]): string[] {
  const emphasisMap: Record<string, string[]> = {
    feelings: ['Mindset tracking', 'Confidence monitoring', 'Emotional response patterns'],
    knowledge: ['Technical breakdown', 'Positioning analysis', 'Decision evaluation'],
    pre_game: ['Pre-game routine adherence', 'Warm-up quality', 'Mental readiness'],
    in_game: ['Puck tracking', 'Period-by-period awareness', 'Refocus timing'],
    post_game: ['Self-evaluation accuracy', 'Reflection quality', 'Learning extraction'],
    training: ['Practice engagement', 'Training consistency', 'Independent work'],
    learning: ['Content engagement', 'Progress tracking', 'Feedback response'],
  };

  const emphases: string[] = [];

  for (const gap of gaps.filter(g => g.priority === 'high' || g.priority === 'medium')) {
    const categoryEmphasis = emphasisMap[gap.categorySlug];
    if (categoryEmphasis) {
      emphases.push(...categoryEmphasis.slice(0, 2));
    }
  }

  // Default emphases if no specific gaps
  if (emphases.length === 0) {
    emphases.push('General performance tracking', 'Consistency monitoring');
  }

  return [...new Set(emphases)]; // Remove duplicates
}

/**
 * Generate complete Intelligence Profile from assessment responses
 */
export function generateIntelligenceProfile(
  userId: string,
  role: QuestionnaireRole,
  responses: AssessmentResponseV2[],
  questions: AssessmentQuestion[],
  ageRange?: GoalieAgeRange,
  thresholds: PacingThresholds = DEFAULT_PACING_THRESHOLDS
): IntelligenceProfile {
  const categoryWeights = getCategoryWeights(role);

  // Calculate category scores
  const categoryScores = calculateCategoryScores(responses, questions, categoryWeights);

  // Calculate overall score
  const overallScore = calculateOverallScore(categoryScores);

  // Determine pacing level
  const pacingLevel = calculatePacingLevel(overallScore, thresholds);

  // Identify gaps and strengths
  const identifiedGaps = identifyGaps(categoryScores, overallScore);
  const identifiedStrengths = identifyStrengths(categoryScores, overallScore);

  // Generate recommendations
  const contentRecommendations = generateContentRecommendations(identifiedGaps, pacingLevel);
  const chartingEmphasis = determineChartingEmphasis(identifiedGaps);

  const now = Timestamp.now();

  return {
    userId,
    role,
    overallScore,
    pacingLevel,
    categoryScores,
    identifiedGaps,
    identifiedStrengths,
    contentRecommendations,
    chartingEmphasis,
    assessmentCompletedAt: now,
    profileGeneratedAt: now,
    ageRange,
  };
}

/**
 * Generate Intelligence Profile for a goalie
 */
export function generateGoalieIntelligenceProfile(
  userId: string,
  responses: AssessmentResponseV2[],
  ageRange?: GoalieAgeRange
): IntelligenceProfile {
  return generateIntelligenceProfile(
    userId,
    'goalie',
    responses,
    GOALIE_ASSESSMENT_QUESTIONS,
    ageRange
  );
}

/**
 * Get a text summary of the pacing level assignment
 */
export function getPacingLevelDescription(pacingLevel: PacingLevel): string {
  switch (pacingLevel) {
    case 'introduction':
      return 'You are starting at Introduction level. Every goalie begins with the fundamentals — the foundation is where everything builds from. Smarter Goalie will guide you through each layer at a pace that ensures you truly understand before moving forward.';
    case 'development':
      return 'You are starting at Development level. You have some foundation in place. Smarter Goalie will move through familiar concepts efficiently while spending more time on areas where you can grow.';
    case 'refinement':
      return 'You are starting at Refinement level. You bring strong awareness to your game. Smarter Goalie will present concepts efficiently and focus on advanced applications and deeper analysis.';
  }
}

/**
 * Generate age-appropriate profile summary message
 */
export function generateProfileSummary(
  profile: IntelligenceProfile,
  ageRange?: GoalieAgeRange
): string {
  const { pacingLevel, identifiedStrengths, identifiedGaps } = profile;

  // Base message varies by pacing level
  let baseMessage = '';

  if (pacingLevel === 'introduction') {
    if (ageRange === '8-10' || ageRange === '11-13') {
      baseMessage = `Welcome to Smarter Goalie! You're just getting started on your goalie journey, and that's exciting. We're going to show you what this position is really all about, step by step. No rush — just solid learning that will help you every time you get in the net.`;
    } else {
      baseMessage = `Welcome to Smarter Goalie. You're building your foundation as a goaltender, and that foundation is where everything else comes from. We're going to take you through the layers of this position systematically, ensuring you understand not just what to do, but why.`;
    }
  } else if (pacingLevel === 'development') {
    baseMessage = `Welcome to Smarter Goalie. You've got some experience under your belt and some awareness of what this position demands. That's a great place to be. We're going to build on what you already know and fill in the gaps that will take your game to the next level.`;
  } else {
    baseMessage = `Welcome to Smarter Goalie. You bring strong awareness and understanding to your game. We're going to work efficiently through the fundamentals and spend our energy on the advanced concepts and analytics that will sharpen your edge.`;
  }

  // Add strength acknowledgment if any
  if (identifiedStrengths.length > 0) {
    const topStrength = identifiedStrengths[0];
    baseMessage += ` Your ${topStrength.categoryName.toLowerCase()} stands out as a strength — we'll build on that.`;
  }

  // Add gentle gap acknowledgment
  if (identifiedGaps.length > 0 && identifiedGaps[0].priority !== 'low') {
    const topGap = identifiedGaps[0];
    baseMessage += ` We'll pay special attention to ${topGap.categoryName.toLowerCase()} as we work together.`;
  }

  baseMessage += ` Let's get started.`;

  return baseMessage;
}

/**
 * Convert legacy responses to V2 format for scoring
 */
export function convertLegacyResponses(
  legacyResponses: Array<{
    questionId: string;
    pillarSlug: string;
    points: number;
    maxPoints: number;
    answeredAt: Timestamp;
  }>,
  questions: AssessmentQuestion[]
): AssessmentResponseV2[] {
  return legacyResponses.map(lr => {
    const question = questions.find(q => q.id === lr.questionId);

    // Convert points-based score to 1.0-4.0 scale
    // Assuming max points was 5, scale proportionally
    const score = lr.maxPoints > 0
      ? 1.0 + ((lr.points / lr.maxPoints) * 3.0) // Maps 0-maxPoints to 1.0-4.0
      : 2.5; // Default middle score

    return {
      questionId: lr.questionId,
      questionCode: question?.questionCode || lr.questionId,
      categorySlug: question?.categorySlug || lr.pillarSlug,
      value: lr.questionId,
      score: Math.min(4.0, Math.max(1.0, score)) as IntelligenceScore,
      answeredAt: lr.answeredAt,
    };
  });
}

import { Timestamp } from 'firebase/firestore';
import {
  CrossReferenceResult,
  CrossReferenceFlag,
  CrossReferenceType,
  CrossReferenceRule,
  IntelligenceScore,
  AssessmentResponse,
} from '@/types';

/**
 * Cross-Reference Engine
 *
 * Compares goalie/parent/coach assessments to identify:
 * - Alignments: Where perceptions match
 * - Gaps: Where perceptions differ significantly
 *
 * Based on Michael's Assessment Scoring Engine specification (05-assessment-scoring-engine.md)
 */

/**
 * Default cross-reference rules
 * Maps comparable questions across questionnaires
 */
export const DEFAULT_CROSS_REFERENCE_RULES: CrossReferenceRule[] = [
  // Confidence Gap - Parent vs Goalie
  {
    id: 'confidence-gap-parent',
    name: 'Confidence Perception Gap',
    description: "Parent rates goalie's confidence differently than goalie rates themselves",
    goalieQuestionId: 'goalie-q1-3',    // How would you describe your confidence level right now?
    parentQuestionId: 'parent-q1-3',    // How would you describe your goalie's confidence level right now?
    scoreDifferenceThreshold: 1.0,
    resultType: 'confidence_gap',
    severity: 'high',
    isActive: true,
  },

  // Post-Game Communication Gap - Coach vs Goalie
  {
    id: 'feedback-gap-coach',
    name: 'Post-Game Feedback Gap',
    description: 'Coach says they give feedback, goalie says nobody talks to them',
    goalieQuestionId: 'goalie-q5-3',    // Does anyone talk to you after the game about your performance?
    coachQuestionId: 'coach-q5-1',      // After a game, do you talk to your goalie specifically?
    scoreDifferenceThreshold: 1.5,
    resultType: 'feedback_gap',
    severity: 'high',
    isActive: true,
  },

  // Car Ride Home Gap - Parent vs Goalie
  {
    id: 'car-ride-gap',
    name: 'Car Ride Home Perception Gap',
    description: 'Parent and goalie have different views of post-game conversations',
    goalieQuestionId: 'goalie-q5-1',    // After a game, do you think about how you played?
    parentQuestionId: 'parent-q4-4',    // How would you rate your post-game approach right now?
    scoreDifferenceThreshold: 1.0,
    resultType: 'car_ride_gap',
    severity: 'medium',
    isActive: true,
  },

  // Development Gap - Coach vs Goalie on practice value
  {
    id: 'development-gap-coach',
    name: 'Practice Development Perception Gap',
    description: 'Coach and goalie have different views on practice value for goalie development',
    goalieQuestionId: 'goalie-q6-2',    // Do you feel like you're developing during team practice?
    coachQuestionId: 'coach-q2-1',      // During team practices, what does your goalie typically do?
    scoreDifferenceThreshold: 1.5,
    resultType: 'development_gap',
    severity: 'medium',
    isActive: true,
  },

  // Pre-Game Communication Gap - Parent/Coach vs Goalie
  {
    id: 'pre-game-communication-gap',
    name: 'Pre-Game Communication Gap',
    description: 'Different perceptions of pre-game communication and preparation',
    goalieQuestionId: 'goalie-q3-4',    // Does anyone talk to you before the game?
    parentQuestionId: 'parent-q3-4',    // Do you play any role in helping your goalie prepare mentally?
    scoreDifferenceThreshold: 1.0,
    resultType: 'communication_gap',
    severity: 'medium',
    isActive: true,
  },

  // Attitude/Feelings Gap - Parent vs Goalie
  {
    id: 'attitude-gap',
    name: 'Attitude Perception Gap',
    description: "Parent's perception of goalie's attitude differs from goalie's self-assessment",
    goalieQuestionId: 'goalie-q1-1',    // How do you feel about playing goalie right now?
    parentQuestionId: 'parent-q1-1',    // How would you describe your goalie's overall attitude?
    scoreDifferenceThreshold: 1.0,
    resultType: 'confidence_gap',
    severity: 'medium',
    isActive: true,
  },
];

/**
 * Find response for a specific question ID
 */
function findResponse(
  responses: AssessmentResponse[],
  questionId: string
): AssessmentResponse | undefined {
  return responses.find(r => r.questionId === questionId);
}

/**
 * Get question text for a question ID
 */
function getQuestionDescription(questionId: string): string {
  // Map question IDs to descriptions for flag generation
  const descriptions: Record<string, string> = {
    'goalie-q1-1': 'feelings about playing goalie',
    'goalie-q1-3': 'confidence level',
    'goalie-q3-4': 'pre-game communication',
    'goalie-q5-1': 'post-game reflection',
    'goalie-q5-3': 'post-game feedback received',
    'goalie-q6-2': 'practice development value',
    'parent-q1-1': "goalie's attitude",
    'parent-q1-3': "goalie's confidence",
    'parent-q3-4': 'mental preparation role',
    'parent-q4-4': 'post-game approach',
    'coach-q2-1': 'goalie activities during practice',
    'coach-q5-1': 'post-game feedback given',
  };

  return descriptions[questionId] || questionId;
}

/**
 * Generate recommendation based on gap type
 */
function generateRecommendation(type: CrossReferenceType, severity: 'high' | 'medium' | 'low'): string {
  const recommendations: Record<CrossReferenceType, string> = {
    confidence_gap: 'Consider having an open conversation about confidence perceptions. The goalie and their support system may be seeing different things.',
    feedback_gap: 'There may be a disconnect in communication. Ensure post-game feedback is reaching the goalie in a way they recognize and process.',
    car_ride_gap: 'The car ride home is a critical development moment. Review the Car Ride Home module to align expectations.',
    development_gap: 'Perceptions of practice value differ. Consider discussing what goalie-specific development looks like during team practice.',
    communication_gap: 'Communication expectations may need realignment. Review pre-game preparation content together.',
    alignment: 'This area shows strong alignment between perspectives.',
  };

  let recommendation = recommendations[type] || 'Review this area for potential perception differences.';

  if (severity === 'high') {
    recommendation = 'PRIORITY: ' + recommendation;
  }

  return recommendation;
}

/**
 * Compare two scores and determine if they represent a gap or alignment
 */
function compareScores(
  score1: IntelligenceScore,
  score2: IntelligenceScore,
  threshold: number
): { isGap: boolean; difference: number } {
  const difference = Math.abs(score1 - score2);
  return {
    isGap: difference >= threshold,
    difference,
  };
}

/**
 * Create a cross-reference flag
 */
function createFlag(
  rule: CrossReferenceRule,
  goalieScore?: IntelligenceScore,
  parentScore?: IntelligenceScore,
  coachScore?: IntelligenceScore,
  scoreDifference?: number
): CrossReferenceFlag {
  const isAlignment = scoreDifference !== undefined && scoreDifference < rule.scoreDifferenceThreshold;

  return {
    id: `${rule.id}-${Date.now()}`,
    type: isAlignment ? 'alignment' : rule.resultType,
    severity: isAlignment ? 'low' : rule.severity,

    goalieQuestionId: rule.goalieQuestionId,
    goalieScore,

    parentQuestionId: rule.parentQuestionId,
    parentScore,

    coachQuestionId: rule.coachQuestionId,
    coachScore,

    scoreDifference,
    description: isAlignment
      ? `Strong alignment on ${getQuestionDescription(rule.goalieQuestionId || '')} (difference: ${scoreDifference?.toFixed(1)})`
      : `Perception gap detected on ${getQuestionDescription(rule.goalieQuestionId || '')} (difference: ${scoreDifference?.toFixed(1)})`,
    recommendation: generateRecommendation(isAlignment ? 'alignment' : rule.resultType, rule.severity),

    detectedAt: Timestamp.now(),
  };
}

/**
 * Run cross-reference comparison between goalie and parent assessments
 */
export function compareGoalieAndParent(
  goalieResponses: AssessmentResponse[],
  parentResponses: AssessmentResponse[],
  rules: CrossReferenceRule[] = DEFAULT_CROSS_REFERENCE_RULES
): CrossReferenceFlag[] {
  const flags: CrossReferenceFlag[] = [];

  for (const rule of rules.filter(r => r.isActive && r.goalieQuestionId && r.parentQuestionId)) {
    const goalieResponse = findResponse(goalieResponses, rule.goalieQuestionId!);
    const parentResponse = findResponse(parentResponses, rule.parentQuestionId!);

    if (goalieResponse && parentResponse) {
      const { isGap, difference } = compareScores(
        goalieResponse.score,
        parentResponse.score,
        rule.scoreDifferenceThreshold
      );

      // Create flag for both gaps and significant alignments
      if (isGap || difference < 0.5) {
        flags.push(createFlag(
          rule,
          goalieResponse.score,
          parentResponse.score,
          undefined,
          difference
        ));
      }
    }
  }

  return flags;
}

/**
 * Run cross-reference comparison between goalie and coach assessments
 */
export function compareGoalieAndCoach(
  goalieResponses: AssessmentResponse[],
  coachResponses: AssessmentResponse[],
  rules: CrossReferenceRule[] = DEFAULT_CROSS_REFERENCE_RULES
): CrossReferenceFlag[] {
  const flags: CrossReferenceFlag[] = [];

  for (const rule of rules.filter(r => r.isActive && r.goalieQuestionId && r.coachQuestionId)) {
    const goalieResponse = findResponse(goalieResponses, rule.goalieQuestionId!);
    const coachResponse = findResponse(coachResponses, rule.coachQuestionId!);

    if (goalieResponse && coachResponse) {
      const { isGap, difference } = compareScores(
        goalieResponse.score,
        coachResponse.score,
        rule.scoreDifferenceThreshold
      );

      if (isGap || difference < 0.5) {
        flags.push(createFlag(
          rule,
          goalieResponse.score,
          undefined,
          coachResponse.score,
          difference
        ));
      }
    }
  }

  return flags;
}

/**
 * Generate complete cross-reference result for a goalie
 */
export function generateCrossReferenceResult(
  goalieUserId: string,
  goalieResponses: AssessmentResponse[],
  parentUserId?: string,
  parentResponses?: AssessmentResponse[],
  coachUserId?: string,
  coachResponses?: AssessmentResponse[],
  rules: CrossReferenceRule[] = DEFAULT_CROSS_REFERENCE_RULES
): CrossReferenceResult {
  const allFlags: CrossReferenceFlag[] = [];

  // Compare with parent if available
  if (parentResponses && parentResponses.length > 0) {
    const parentFlags = compareGoalieAndParent(goalieResponses, parentResponses, rules);
    allFlags.push(...parentFlags);
  }

  // Compare with coach if available
  if (coachResponses && coachResponses.length > 0) {
    const coachFlags = compareGoalieAndCoach(goalieResponses, coachResponses, rules);
    allFlags.push(...coachFlags);
  }

  // Separate gaps from alignments
  const gaps = allFlags.filter(f => f.type !== 'alignment');
  const alignments = allFlags.filter(f => f.type === 'alignment');

  // Calculate alignment score (percentage of comparisons that aligned)
  const totalComparisons = allFlags.length;
  const alignmentCount = alignments.length;
  const overallAlignmentScore = totalComparisons > 0
    ? Math.round((alignmentCount / totalComparisons) * 100)
    : 100;

  // Count critical gaps (high severity)
  const criticalGapsCount = gaps.filter(g => g.severity === 'high').length;

  return {
    goalieUserId,
    parentUserId,
    coachUserId,
    flags: gaps,
    alignments,
    overallAlignmentScore,
    criticalGapsCount,
    lastUpdated: Timestamp.now(),
    goalieAssessmentDate: goalieResponses.length > 0 ? goalieResponses[0].answeredAt : undefined,
    parentAssessmentDate: parentResponses && parentResponses.length > 0 ? parentResponses[0].answeredAt : undefined,
    coachAssessmentDate: coachResponses && coachResponses.length > 0 ? coachResponses[0].answeredAt : undefined,
  };
}

/**
 * Get summary text for cross-reference result
 */
export function getCrossReferenceSummary(result: CrossReferenceResult): string {
  const { flags, alignments, overallAlignmentScore, criticalGapsCount } = result;

  if (flags.length === 0 && alignments.length === 0) {
    return 'Cross-reference analysis is pending. Complete assessments from linked accounts to see comparisons.';
  }

  let summary = `Alignment Score: ${overallAlignmentScore}%\n`;

  if (criticalGapsCount > 0) {
    summary += `⚠️ ${criticalGapsCount} critical perception gap${criticalGapsCount > 1 ? 's' : ''} detected.\n`;
  }

  if (alignments.length > 0) {
    summary += `✓ ${alignments.length} area${alignments.length > 1 ? 's' : ''} of strong alignment.\n`;
  }

  if (flags.length > 0) {
    summary += `\nKey Gaps:\n`;
    for (const flag of flags.slice(0, 3)) {
      summary += `• ${flag.description}\n`;
    }
  }

  return summary;
}

/**
 * Get priority recommendations based on cross-reference result
 */
export function getPriorityRecommendations(result: CrossReferenceResult): string[] {
  const recommendations: string[] = [];

  // Add recommendations for high-severity gaps first
  for (const flag of result.flags.filter(f => f.severity === 'high')) {
    recommendations.push(flag.recommendation);
  }

  // Add recommendations for medium-severity gaps
  for (const flag of result.flags.filter(f => f.severity === 'medium').slice(0, 2)) {
    recommendations.push(flag.recommendation);
  }

  if (recommendations.length === 0 && result.overallAlignmentScore >= 80) {
    recommendations.push('Strong alignment across perspectives. Continue with current communication patterns.');
  }

  return recommendations;
}

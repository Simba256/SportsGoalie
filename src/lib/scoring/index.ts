/**
 * Scoring Module
 *
 * Intelligence Profile generation and scoring algorithms
 * Based on Michael's Phase 2 Assessment Scoring Engine specification
 */

// Intelligence Profile generation
export {
  calculateCategoryScores,
  calculateOverallScore,
  generateIntelligenceProfile,
  generateGoalieIntelligenceProfile,
  getPacingLevelDescription,
  generateProfileSummary,
  convertLegacyResponses,
} from './intelligence-profile';

// Cross-reference engine
export {
  DEFAULT_CROSS_REFERENCE_RULES,
  compareGoalieAndParent,
  compareGoalieAndCoach,
  generateCrossReferenceResult,
  getCrossReferenceSummary,
  getPriorityRecommendations,
} from './cross-reference-engine';

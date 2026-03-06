/**
 * Data Module Index
 *
 * Centralized exports for all questionnaire data
 */

// Goalie questionnaire data
export {
  GOALIE_INTAKE_QUESTIONS,
  getIntakeQuestionsByScreen,
  getTotalIntakeScreens,
  extractAgeRange,
  requiresParentalConsent,
  extractExperienceLevel,
  extractPlayingLevel,
  extractGoalieCoachStatus,
  extractPrimaryReasons,
} from './goalie-intake-questions';

export {
  GOALIE_ASSESSMENT_QUESTIONS,
  GOALIE_ASSESSMENT_WEIGHTS,
  getQuestionsByCategory,
  getQuestionsForCategory,
  getTotalQuestionCount,
  getQuestionCountByCategory,
  getCategoryOrder,
  getQuestionsRequiringReview,
} from './goalie-assessment-questions';

// Parent questionnaire data
export {
  PARENT_INTAKE_QUESTIONS,
  getParentIntakeQuestionsByScreen,
  getParentTotalIntakeScreens,
} from './parent-intake-questions';

export {
  PARENT_ASSESSMENT_QUESTIONS,
  PARENT_ASSESSMENT_WEIGHTS,
  getParentQuestionsByCategory,
  getParentCategoryOrder,
  getParentTotalQuestionCount,
} from './parent-assessment-questions';

// Coach questionnaire data
export {
  COACH_INTAKE_QUESTIONS,
  getCoachIntakeQuestionsByScreen,
  getCoachTotalIntakeScreens,
} from './coach-intake-questions';

export {
  COACH_ASSESSMENT_QUESTIONS,
  COACH_ASSESSMENT_WEIGHTS,
  getCoachQuestionsByCategory,
  getCoachCategoryOrder,
  getCoachTotalQuestionCount,
} from './coach-assessment-questions';

// Legacy onboarding questions (backward compatibility)
export {
  ONBOARDING_QUESTIONS,
  getQuestionsByPillar,
  getTotalQuestionCount as getLegacyTotalQuestionCount,
  getQuestionCountByPillar,
} from './onboarding-questions';

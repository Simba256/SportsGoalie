import { Timestamp } from 'firebase/firestore';

// ==========================================
// ONBOARDING EVALUATION SYSTEM TYPES
// ==========================================

/**
 * Assessment levels for pillar evaluations
 */
export type AssessmentLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * The 6 Ice Hockey Goalie Pillars
 */
export type PillarSlug =
  | 'mindset'      // Mind-Set Development
  | 'skating'      // Skating as a Skill
  | 'form'         // Form & Structure
  | 'positioning'  // Positional Systems
  | 'seven_point'  // 7 Point System Below Icing Line
  | 'training';    // Game/Practice/Off-Ice

/**
 * Types of questions in the onboarding assessment
 */
export type OnboardingQuestionType =
  | 'rating'           // 1-5 scale slider
  | 'multiple_choice'  // Card-based options
  | 'true_false'       // True/False selection
  | 'video_scenario';  // Video + question

/**
 * Pillar metadata with display information
 */
export interface PillarInfo {
  slug: PillarSlug;
  name: string;
  shortName: string;
  description: string;
  icon: string;  // Lucide icon name
  color: string; // Tailwind color class
}

/**
 * Option for multiple choice questions
 */
export interface OnboardingQuestionOption {
  id: string;
  text: string;
  points: number;
}

/**
 * Onboarding assessment question
 */
export interface OnboardingQuestion {
  id: string;
  pillarSlug: PillarSlug;
  type: OnboardingQuestionType;
  question: string;
  description?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  options?: OnboardingQuestionOption[];
  ratingMin?: number;
  ratingMax?: number;
  ratingLabels?: { min: string; max: string };
  maxPoints: number;
  order: number;
}

/**
 * User's response to an onboarding question
 */
export interface AssessmentResponse {
  questionId: string;
  pillarSlug: PillarSlug;
  questionType: OnboardingQuestionType;
  value: string | number;  // Option ID for MC, boolean for T/F, number for rating
  points: number;
  maxPoints: number;
  answeredAt: Timestamp;
}

/**
 * Calculated result for a single pillar
 */
export interface PillarAssessmentResult {
  pillarSlug: PillarSlug;
  pillarName: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  level: AssessmentLevel;
  strengths: string[];
  weaknesses: string[];
}

/**
 * Coach review data for an evaluation
 */
export interface CoachReview {
  reviewedAt: Timestamp;
  reviewedBy: string;
  reviewerName?: string;
  notes: string;
  adjustedLevel?: AssessmentLevel;
  adjustedPillarLevels?: Partial<Record<PillarSlug, AssessmentLevel>>;
}

/**
 * Complete onboarding evaluation record
 */
export interface OnboardingEvaluation {
  id: string;
  userId: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  duration?: number; // Seconds
  status: 'in_progress' | 'completed' | 'reviewed';

  // Current progress (for resuming)
  currentPillarIndex: number;
  currentQuestionIndex: number;

  // Results (populated on completion)
  overallLevel?: AssessmentLevel;
  overallPercentage?: number;
  pillarAssessments?: Record<PillarSlug, PillarAssessmentResult>;
  responses: AssessmentResponse[];

  // Coach review
  coachReview?: CoachReview;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Input for creating a new evaluation
 */
export interface CreateEvaluationInput {
  userId: string;
}

/**
 * Input for saving a response
 */
export interface SaveResponseInput {
  evaluationId: string;
  questionId: string;
  pillarSlug: PillarSlug;
  questionType: OnboardingQuestionType;
  value: string | number;
  points: number;
  maxPoints: number;
}

/**
 * Input for completing an evaluation
 */
export interface CompleteEvaluationInput {
  evaluationId: string;
  userId: string;
}

/**
 * Input for coach review
 */
export interface CoachReviewInput {
  evaluationId: string;
  coachId: string;
  coachName: string;
  notes: string;
  adjustedLevel?: AssessmentLevel;
  adjustedPillarLevels?: Partial<Record<PillarSlug, AssessmentLevel>>;
}

/**
 * Summary of a student's evaluation for coach dashboard
 */
export interface EvaluationSummary {
  evaluationId: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  completedAt: Timestamp;
  overallLevel: AssessmentLevel;
  overallPercentage: number;
  hasCoachReview: boolean;
  reviewedAt?: Timestamp;
}

/**
 * Pillar definitions with metadata
 */
export const PILLARS: PillarInfo[] = [
  {
    slug: 'mindset',
    name: 'Mind-Set Development',
    shortName: 'Mindset',
    description: 'Mental resilience, focus, and emotional regulation skills',
    icon: 'Brain',
    color: 'purple',
  },
  {
    slug: 'skating',
    name: 'Skating as a Skill',
    shortName: 'Skating',
    description: 'Movement confidence and skating knowledge',
    icon: 'Footprints',
    color: 'blue',
  },
  {
    slug: 'form',
    name: 'Form & Structure',
    shortName: 'Form',
    description: 'Stance awareness and positioning fundamentals',
    icon: 'Shapes',
    color: 'green',
  },
  {
    slug: 'positioning',
    name: 'Positional Systems',
    shortName: 'Positioning',
    description: 'Understanding of positioning concepts',
    icon: 'Target',
    color: 'orange',
  },
  {
    slug: 'seven_point',
    name: '7 Point System Below Icing Line',
    shortName: '7 Point',
    description: 'Zone awareness and coverage patterns',
    icon: 'Grid3X3',
    color: 'red',
  },
  {
    slug: 'training',
    name: 'Game/Practice/Off-Ice',
    shortName: 'Training',
    description: 'Training habits and preparation routines',
    icon: 'Dumbbell',
    color: 'cyan',
  },
];

/**
 * Helper to get pillar info by slug
 */
export function getPillarInfo(slug: PillarSlug): PillarInfo {
  const pillar = PILLARS.find(p => p.slug === slug);
  if (!pillar) {
    throw new Error(`Unknown pillar slug: ${slug}`);
  }
  return pillar;
}

/**
 * Calculate assessment level from percentage score
 */
export function calculateLevel(percentage: number): AssessmentLevel {
  if (percentage >= 70) return 'advanced';
  if (percentage >= 40) return 'intermediate';
  return 'beginner';
}

/**
 * Get display text for assessment level
 */
export function getLevelDisplayText(level: AssessmentLevel): string {
  switch (level) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Intermediate';
    case 'advanced': return 'Advanced';
  }
}

/**
 * Get color class for assessment level
 */
export function getLevelColor(level: AssessmentLevel): string {
  switch (level) {
    case 'beginner': return 'text-amber-500 bg-amber-50 border-amber-200';
    case 'intermediate': return 'text-blue-500 bg-blue-50 border-blue-200';
    case 'advanced': return 'text-green-500 bg-green-50 border-green-200';
  }
}

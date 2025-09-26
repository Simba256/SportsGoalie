import { DifficultyLevel } from './index';
import { Timestamp } from 'firebase/firestore';

// Question Types - Import from main types to ensure consistency
export { QuestionType } from './index';

// Media Types for Questions
export interface QuestionMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  alt?: string;
  caption?: string;
  thumbnail?: string; // For videos
  duration?: number; // For videos in seconds
  order: number;
}

// Base Question Interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  title: string;
  content: string;
  media?: QuestionMedia[]; // Support for multiple images/videos
  points: number;
  difficulty: DifficultyLevel;
  explanation?: string;
  timeLimit?: number; // In seconds, optional per-question time limit
  order: number;
  tags?: string[];
  isRequired: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// Multiple Choice Question
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  media?: QuestionMedia; // Option can have media too
  order: number;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  options: MultipleChoiceOption[];
  allowMultiple: boolean;
  shuffleOptions: boolean;
}

// True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  correctAnswer: boolean;
  trueExplanation?: string;
  falseExplanation?: string;
}

// Descriptive Question
export interface DescriptiveQuestion extends BaseQuestion {
  type: 'descriptive';
  maxWords?: number;
  minWords?: number;
  sampleAnswer?: string;
  rubric?: string[]; // Grading criteria
  autoGrade: boolean; // Whether to attempt automatic grading
}

// Fill in the Blank Question
export interface FillInBlankQuestion extends BaseQuestion {
  type: 'fill_in_blank';
  correctAnswers: string[];
  caseSensitive: boolean;
}

// Union type for all question types
export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | DescriptiveQuestion
  | FillInBlankQuestion;

// Quiz Configuration
export interface QuizSettings {
  timeLimit?: number; // Total quiz time in minutes
  shuffleQuestions: boolean;
  showProgressBar: boolean;
  allowReview: boolean;
  allowBacktrack: boolean;
  passingScore: number; // Percentage (0-100)
  maxAttempts: number;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  showScoreImmediately: boolean;
  requireAllQuestions: boolean;
}

// Quiz Metadata
export interface QuizMetadata {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTimeSpent: number; // minutes
  passRate: number; // percentage
}

// Main Quiz Interface
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  sportId: string; // MANDATORY: Every quiz must be associated with a sport
  skillId: string; // MANDATORY: Every quiz must be associated with a skill
  coverImage?: string;
  instructions?: string;
  questions: Question[];
  settings: QuizSettings;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // In minutes
  tags: string[];
  isActive: boolean;
  isPublished: boolean;
  category: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  metadata: QuizMetadata;
}


// Quiz Attempt & Answers
export interface QuestionAnswer {
  questionId: string;
  questionType?: QuestionType; // Optional for backward compatibility
  answer: string | number | string[]; // Support multiple answer types but avoid 'any'
  isCorrect?: boolean;
  pointsEarned?: number; // Optional for compatibility
  timeSpent: number; // In seconds
  attempts?: number; // Optional for compatibility
  skipped?: boolean; // Optional for compatibility
}

// Alias for compatibility with existing code
export type QuizAnswer = QuestionAnswer;

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  skillId: string;
  sportId: string;
  answers: QuestionAnswer[];
  score: number; // Points earned
  maxScore: number; // Total points possible
  percentage: number; // Score as percentage
  pointsEarned: number; // Same as score for compatibility
  totalPoints: number; // Same as maxScore for compatibility
  passed: boolean;
  timeSpent: number; // Total time in seconds
  attemptNumber: number;
  isCompleted: boolean;
  status: 'in-progress' | 'submitted' | 'timed-out' | 'abandoned';
  passingScore: number;
  startedAt: Timestamp;
  submittedAt?: Timestamp;
  feedback?: string;
  reviewData?: QuizReview;
}

export interface QuizReview {
  questionsReviewed: string[];
  flaggedQuestions: string[];
  timeSpentInReview: number;
  finalSubmissionTime: Date;
}

// Quiz Analytics
export interface QuizAnalytics {
  quizId: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  averageTimeSpent: number;
  questionAnalytics: QuestionAnalytics[];
  difficultyDistribution: Record<DifficultyLevel, number>;
  completionRate: number;
  abandonment: {
    rate: number;
    commonExitPoints: string[]; // Question IDs where users commonly exit
  };
}

export interface QuestionAnalytics {
  questionId: string;
  totalAttempts: number;
  correctAttempts: number;
  averageTimeSpent: number;
  skipRate: number;
  difficultyRating: number; // Based on performance (1-5)
  commonWrongAnswers: string[];
}

// Quiz Builder Types
export interface QuizTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: Question[];
  defaultSettings: QuizSettings;
  tags: string[];
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
}

// Export utility types
export type QuizStatus = 'draft' | 'published' | 'archived';
export type AttemptStatus = 'in-progress' | 'submitted' | 'timed-out' | 'abandoned';
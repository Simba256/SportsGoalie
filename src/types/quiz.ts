import { Timestamp } from 'firebase/firestore';

/**
 * Re-export common types from main index
 */
export { QuestionType, DifficultyLevel } from './index';

/**
 * Base question interface for all quiz types
 */
export interface Question {
  id: string;
  type: QuestionType;
  question: string;
  points: number;
  required: boolean;
  explanation?: string;
  hint?: string;
  media?: QuestionMedia;

  // Type-specific fields
  options?: QuestionOption[]; // For multiple choice
  correctAnswer?: boolean | string | number; // For true/false or simple answers
  correctAnswers?: string[]; // For fill-in-blank with multiple correct answers
  caseSensitive?: boolean; // For fill-in-blank
  partialCredit?: boolean;
}

/**
 * Question option for multiple choice questions
 */
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  allowMultiple?: boolean; // Allow multiple selections
}

/**
 * Media associated with a question
 */
export interface QuestionMedia {
  type: 'image' | 'video' | 'audio';
  url: string;
  alt?: string;
  caption?: string;
}

/**
 * Quiz settings
 */
export interface QuizSettings {
  timeLimit?: number; // in minutes
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showExplanations: boolean;
  allowRetry: boolean;
  maxAttempts: number;
  passingScore: number; // percentage (0-100)
  showCorrectAnswers: boolean;
  instantFeedback: boolean;
}

/**
 * Base quiz interface
 */
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: DifficultyLevel;
  tags: string[];
  questions: Question[];
  settings: QuizSettings;
  isActive: boolean;
  isPublished: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  metadata?: QuizMetadata;
}

/**
 * Quiz metadata for analytics
 */
export interface QuizMetadata {
  totalAttempts: number;
  totalCompletions: number;
  averageScore: number;
  averageTimeSpent: number; // in minutes
  passRate: number; // percentage
  difficultyRating?: number; // user-rated difficulty
}

/**
 * Quiz attempt/progress
 */
export interface QuizProgress {
  id: string;
  userId: string;
  quizId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number; // in seconds
  attemptNumber: number;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastAccessedAt?: Timestamp;
}

/**
 * Individual answer in a quiz attempt
 */
export interface QuizAnswer {
  questionId: string;
  answer: string | number | boolean | string[]; // Flexible to support different answer types
  isCorrect: boolean;
  pointsEarned: number;
  timeSpent?: number; // seconds spent on this question
  attempts?: number; // if retries are allowed
}

/**
 * Quiz result summary
 */
export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  percentage: number;
  passed: boolean;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number; // in seconds
  completedAt: Timestamp;
  feedback?: string;
  certificate?: string; // URL to certificate if applicable
}
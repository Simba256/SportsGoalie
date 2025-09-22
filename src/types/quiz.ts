import { DifficultyLevel } from './index';

// Question Types
export type QuestionType = 'multiple-choice' | 'true-false' | 'descriptive' | 'fill-in-blank' | 'matching';

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
  description?: string;
  media?: QuestionMedia[]; // Support for multiple images/videos
  points: number;
  difficulty: DifficultyLevel;
  explanation?: string;
  timeLimit?: number; // In seconds, optional per-question time limit
  order: number;
  tags?: string[];
  isRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// Multiple Choice Question
export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
  media?: QuestionMedia; // Option can have media too
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
  allowMultipleAnswers: boolean;
  shuffleOptions: boolean;
}

// True/False Question
export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
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
  type: 'fill-in-blank';
  template: string; // Text with {blank} placeholders
  blanks: {
    id: string;
    acceptedAnswers: string[]; // Multiple acceptable answers
    caseSensitive: boolean;
    exactMatch: boolean;
  }[];
}

// Matching Question
export interface MatchingPair {
  id: string;
  left: {
    text: string;
    media?: QuestionMedia;
  };
  right: {
    text: string;
    media?: QuestionMedia;
  };
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
  shuffleLeft: boolean;
  shuffleRight: boolean;
}

// Union type for all question types
export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | DescriptiveQuestion
  | FillInBlankQuestion
  | MatchingQuestion;

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

// Main Quiz Interface
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  sportId?: string; // Optional: associate with a sport
  skillId?: string; // Optional: associate with a skill
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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  metadata: QuizMetadata;
}

export interface QuizMetadata {
  totalQuestions: number;
  totalPoints: number;
  averageScore: number;
  completionRate: number;
  averageDuration: number; // In minutes
  totalAttempts: number;
  ratings: {
    average: number;
    count: number;
  };
}

// Quiz Attempt & Answers
export interface QuestionAnswer {
  questionId: string;
  questionType: QuestionType;
  answer: any; // Different types based on question type
  isCorrect?: boolean;
  pointsEarned: number;
  timeSpent: number; // In seconds
  attempts: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuestionAnswer[];
  startedAt: Date;
  submittedAt?: Date;
  timeSpent: number; // Total time in seconds
  score: number; // Percentage (0-100)
  pointsEarned: number;
  totalPoints: number;
  status: 'in-progress' | 'submitted' | 'timed-out' | 'abandoned';
  passingScore: number;
  passed: boolean;
  attemptNumber: number;
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
// Re-export auth types from the centralized location
export type {
  User,
  UserPreferences,
  AuthState,
  LoginCredentials,
  RegisterCredentials,
  ProfileUpdateData,
} from './auth';

export interface Sport {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  id: string;
  sportId: string;
  name: string;
  description: string;
  difficulty: 'introduction' | 'development' | 'refinement';
  videoUrl?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  skillId: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: string;
  skillId: string;
  name: string;
  description: string;
  questions: Question[];
  timeLimit?: number;
  passingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  answers: QuizAnswer[];
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

export interface QuizAnswer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface UserSkillProgress {
  id: string;
  userId: string;
  skillId: string;
  completedQuizzes: string[];
  bestScore: number;
  totalAttempts: number;
  lastAttemptAt?: Date;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

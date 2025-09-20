export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'student' | 'admin';
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    quiz: boolean;
    progress: boolean;
  };
  privacy: {
    profileVisible: boolean;
    progressVisible: boolean;
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role?: 'student' | 'admin';
  agreeToTerms: boolean;
}

export interface PasswordResetData {
  email: string;
}

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  preferences?: Partial<UserPreferences>;
}

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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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

export interface UserProgress {
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

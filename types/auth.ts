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

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'student' | 'admin';
  photoURL?: string;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
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
  role: 'student' | 'admin';
  agreeToTerms: boolean;
}

export interface ProfileUpdateData {
  displayName?: string;
  photoURL?: string;
  preferences?: Partial<UserPreferences>;
}
import { User } from './index';

// Authentication state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// Registration credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  role: 'student' | 'admin' | 'coach' | 'parent';
  firstName?: string;
  lastName?: string;
}

// Profile update data
export interface ProfileUpdateData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

// Auth error types
export interface AuthError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider } from '@/lib/auth/context';
import { User } from '@/types/auth';

// Mock user data for testing
export const mockUsers = {
  verifiedStudent: {
    id: 'user-1',
    email: 'student@test.com',
    displayName: 'Test Student',
    role: 'student' as const,
    emailVerified: true,
    photoURL: 'https://example.com/photo.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-01'),
    preferences: {
      theme: 'light' as const,
      notifications: {
        email: true,
        push: true,
        quiz: true,
        progress: true,
      },
      privacy: {
        profileVisible: true,
        progressVisible: true,
      },
    },
  },
  verifiedAdmin: {
    id: 'admin-1',
    email: 'admin@test.com',
    displayName: 'Test Admin',
    role: 'admin' as const,
    emailVerified: true,
    photoURL: undefined,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    lastLoginAt: new Date('2024-01-01'),
  },
  unverifiedUser: {
    id: 'user-2',
    email: 'unverified@test.com',
    displayName: 'Unverified User',
    role: 'student' as const,
    emailVerified: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
} as const;

// Mock AuthContext provider for testing
interface MockAuthProviderProps {
  children: React.ReactNode;
  user?: User | null;
  loading?: boolean;
  error?: string | null;
  isAuthenticated?: boolean;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({
  children,
  user = null,
  loading = false,
  error = null,
  isAuthenticated = !!user,
}) => {
  const mockAuthValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    updateUserProfile: vi.fn(),
    resendEmailVerification: vi.fn(),
  };

  // Mock the AuthContext directly
  const MockedAuthContext = React.createContext(mockAuthValue);

  return (
    <MockedAuthContext.Provider value={mockAuthValue}>
      {children}
    </MockedAuthContext.Provider>
  );
};

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authState?: {
    user?: User | null;
    loading?: boolean;
    error?: string | null;
    isAuthenticated?: boolean;
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { authState = {}, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockAuthProvider {...authState}>
        {children}
      </MockAuthProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Utility functions for testing
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

export const mockConsoleError = () => {
  const originalError = console.error;
  console.error = vi.fn();
  return () => {
    console.error = originalError;
  };
};

export const mockConsoleWarn = () => {
  const originalWarn = console.warn;
  console.warn = vi.fn();
  return () => {
    console.warn = originalWarn;
  };
};

// Firebase mock helpers
export const mockFirebaseAuth = {
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
};

export const mockFirebaseFirestore = {
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
};

// Helper to create mock Firebase user
export const createMockFirebaseUser = (overrides: Partial<any> = {}) => ({
  uid: 'firebase-user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  photoURL: null,
  ...overrides,
});

// Form testing utilities
export const mockFormSubmission = (formData: Record<string, any>) => {
  const form = document.createElement('form');
  Object.entries(formData).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });
  return form;
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
import { beforeAll, afterEach, afterAll, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Firebase configuration first
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({
    name: 'test-app',
    options: {},
  })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({
    name: 'test-app',
    options: {},
  })),
}));

// Enhanced Firebase Firestore mocks
const mockFirestore = {
  _delegate: {
    _databaseId: {
      isDefaultDatabase: true,
    },
  },
};

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  connectFirestoreEmulator: vi.fn(),
  collection: vi.fn((db, name) => ({ _path: name })),
  doc: vi.fn((collection, id) => ({
    id,
    _collection: collection,
    _path: `${collection._path}/${id}`
  })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  setDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  Timestamp: {
    now: vi.fn(() => new Date()),
    fromDate: vi.fn((date) => date),
  },
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(() => Promise.resolve()),
  })),
  runTransaction: vi.fn(),
  increment: vi.fn((value) => ({ _methodName: 'increment', _value: value })),
  arrayUnion: vi.fn((value) => ({ _methodName: 'arrayUnion', _value: value })),
  arrayRemove: vi.fn((value) => ({ _methodName: 'arrayRemove', _value: value })),
  enableNetwork: vi.fn(),
  disableNetwork: vi.fn(),
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
    authStateReady: vi.fn(() => Promise.resolve()),
  })),
  connectAuthEmulator: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  updateProfile: vi.fn(),
  onAuthStateChanged: vi.fn(),
  EmailAuthProvider: {
    credential: vi.fn(),
  },
}));

// Mock Firebase Storage
vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({
    app: {},
  })),
  connectStorageEmulator: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  uploadBytesResumable: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
}));

// Mock Firebase config
vi.mock('@/lib/firebase/config', () => ({
  auth: {
    currentUser: null,
    signOut: vi.fn(),
    authStateReady: vi.fn(() => Promise.resolve()),
  },
  db: mockFirestore,
  storage: {
    app: {},
  },
  default: {
    name: 'test-app',
    options: {},
  },
  firebaseEnv: {
    projectId: 'test-project',
    isEmulator: false,
    isDevelopment: true,
    isProduction: false,
  },
  validateFirebaseConfig: vi.fn(() => ({
    isValid: true,
    missingVars: [],
    warnings: [],
  })),
  checkFirebaseConnection: vi.fn(() => Promise.resolve({
    connected: true,
    services: {
      firestore: true,
      auth: true,
      storage: true,
    },
  })),
}));

// Mock Auth Context if it exists
vi.mock('@/lib/auth/context', () => {
  const mockUseAuth = vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
    updateUserProfile: vi.fn(),
    resendEmailVerification: vi.fn(),
  }));

  return {
    useAuth: mockUseAuth,
    AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Test utilities and mocks
export const createMockFirestoreDoc = (id: string, data: any) => ({
  id,
  data: () => data,
  exists: () => true,
  ref: { id },
  metadata: {
    hasPendingWrites: false,
    fromCache: false,
  },
});

export const createMockFirestoreQuerySnapshot = (docs: any[]) => ({
  docs,
  size: docs.length,
  empty: docs.length === 0,
  forEach: (callback: (doc: any) => void) => docs.forEach(callback),
});

export const createMockUser = (overrides: any = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'student' as const,
  emailVerified: true,
  preferences: {
    notifications: true,
    theme: 'light' as const,
    language: 'en',
    timezone: 'UTC',
    emailNotifications: {
      progress: true,
      quizResults: true,
      newContent: true,
      reminders: true,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockSport = (overrides: any = {}) => ({
  id: 'test-sport-id',
  name: 'Test Sport',
  description: 'A test sport for unit testing',
  icon: '🏀',
  color: '#FF8C00',
  category: 'Team Sports',
  difficulty: 'beginner' as const,
  estimatedTimeToComplete: 40,
  skillsCount: 0,
  tags: ['test'],
  prerequisites: [],
  isActive: true,
  isFeatured: false,
  order: 1,
  metadata: {
    totalEnrollments: 0,
    totalCompletions: 0,
    averageRating: 0,
    totalRatings: 0,
    averageCompletionTime: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-admin-id',
  ...overrides,
});

export const createMockSkill = (overrides: any = {}) => ({
  id: 'test-skill-id',
  sportId: 'test-sport-id',
  name: 'Test Skill',
  description: 'A test skill for unit testing',
  difficulty: 'beginner' as const,
  estimatedTimeToComplete: 30,
  content: '<p>Test content</p>',
  externalResources: [],
  prerequisites: [],
  learningObjectives: ['Learn test skill'],
  tags: ['test'],
  hasVideo: false,
  hasQuiz: false,
  isActive: true,
  order: 1,
  metadata: {
    totalCompletions: 0,
    averageCompletionTime: 30,
    averageRating: 0,
    totalRatings: 0,
    difficulty: 'beginner' as const,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-admin-id',
  ...overrides,
});

export const createMockQuiz = (overrides: any = {}) => ({
  id: 'test-quiz-id',
  skillId: 'test-skill-id',
  sportId: 'test-sport-id',
  title: 'Test Quiz',
  description: 'A test quiz for unit testing',
  difficulty: 'beginner' as const,
  timeLimit: 10,
  passingScore: 70,
  maxAttempts: 3,
  allowReview: true,
  shuffleQuestions: false,
  showAnswersAfterCompletion: true,
  isActive: true,
  metadata: {
    totalAttempts: 0,
    totalCompletions: 0,
    averageScore: 0,
    averageTimeSpent: 0,
    passRate: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'test-admin-id',
  ...overrides,
});

export const createMockApiResponse = <T>(data: T, success = true) => ({
  success,
  data,
  timestamp: new Date(),
  ...(success ? {} : { error: { code: 'TEST_ERROR', message: 'Test error' } }),
});

// Mock environment variables
Object.defineProperty(process, 'env', {
  value: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-project',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'test-api-key',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-project.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-project.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '123456789',
    NEXT_PUBLIC_FIREBASE_APP_ID: 'test-app-id',
    NEXT_PUBLIC_USE_FIREBASE_EMULATOR: 'false',
  },
});

// Global test setup
beforeAll(() => {
  // Setup any global test configuration
});

beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

afterAll(() => {
  // Cleanup any global test resources
});

// Console override for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  // Keep error for actual test failures
  error: originalConsole.error,
};
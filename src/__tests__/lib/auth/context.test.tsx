import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/context';
import { mockFirebaseAuth, mockFirebaseFirestore, createMockFirebaseUser } from '../../utils/test-utils';

// Mock Firebase modules
vi.mock('firebase/auth');
vi.mock('firebase/firestore');

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth Hook', () => {
    it('should provide default auth state', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(true); // Initially loading
      expect(result.current.error).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should provide auth methods', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.updateUserProfile).toBe('function');
      expect(typeof result.current.resendEmailVerification).toBe('function');
      expect(typeof result.current.refreshUser).toBe('function');
    });
  });

  describe('Login Function', () => {
    it('should successfully log in verified user', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          displayName: 'Test User',
          role: 'student',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com',
        'password123'
      );
      expect(result.current.user).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should reject unverified user login', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let errorThrown = false;
      await act(async () => {
        try {
          await result.current.login({
            email: 'unverified@example.com',
            password: 'password123',
          });
        } catch {
          errorThrown = true;
        }
      });

      expect(errorThrown).toBe(true);
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle invalid credentials error', async () => {
      const firebaseError = { code: 'auth/invalid-credential' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let errorThrown = false;
      await act(async () => {
        try {
          await result.current.login({
            email: 'invalid@example.com',
            password: 'wrongpassword',
          });
        } catch {
          errorThrown = true;
        }
      });

      expect(errorThrown).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Register Function', () => {
    it('should successfully register new user', async () => {
      const mockFirebaseUser = createMockFirebaseUser();
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseAuth.updateProfile.mockResolvedValue(undefined);
      mockFirebaseAuth.sendEmailVerification.mockResolvedValue(undefined);
      mockFirebaseFirestore.setDoc.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register({
          email: 'newuser@example.com',
          password: 'password123',
          displayName: 'New User',
          role: 'student',
        });
      });

      expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      );
      expect(mockFirebaseAuth.sendEmailVerification).toHaveBeenCalled();
      expect(mockFirebaseFirestore.setDoc).toHaveBeenCalled();
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
    });

    it('should handle email already exists error', async () => {
      const firebaseError = { code: 'auth/email-already-in-use' };
      mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      let errorThrown = false;
      await act(async () => {
        try {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            displayName: 'Test User',
            role: 'student',
          });
        } catch {
          errorThrown = true;
        }
      });

      expect(errorThrown).toBe(true);
      expect(result.current.user).toBeNull();
    });
  });

  describe('Logout Function', () => {
    it('should successfully log out user', async () => {
      mockFirebaseAuth.signOut.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });
  });

  describe('Reset Password Function', () => {
    it('should successfully send reset password email', async () => {
      mockFirebaseAuth.sendPasswordResetEmail.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.resetPassword('test@example.com');
      });

      expect(mockFirebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(
        expect.anything(),
        'test@example.com'
      );
    });
  });
});

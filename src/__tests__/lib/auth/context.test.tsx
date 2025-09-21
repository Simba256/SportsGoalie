import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/lib/auth/context';
import { mockFirebaseAuth, mockFirebaseFirestore, createMockFirebaseUser } from '../../utils/test-utils';
import { EmailVerificationRequiredError, InvalidCredentialsError } from '@/lib/errors/auth-errors';

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

      await expect(
        act(async () => {
          await result.current.login({
            email: 'unverified@example.com',
            password: 'password123',
          });
        })
      ).rejects.toThrow(EmailVerificationRequiredError);

      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle invalid credentials error', async () => {
      const firebaseError = { code: 'auth/invalid-credential' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login({
            email: 'invalid@example.com',
            password: 'wrongpassword',
          });
        })
      ).rejects.toThrow(InvalidCredentialsError);

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle network errors', async () => {
      const networkError = { code: 'auth/network-request-failed' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(networkError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login({
            email: 'test@example.com',
            password: 'password123',
          });
        })
      ).rejects.toThrow();

      expect(result.current.user).toBeNull();
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
          confirmPassword: 'password123',
          displayName: 'New User',
          role: 'student',
          agreeToTerms: true,
        });
      });

      expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        'newuser@example.com',
        'password123'
      );
      expect(mockFirebaseAuth.sendEmailVerification).toHaveBeenCalled();
      expect(mockFirebaseFirestore.setDoc).toHaveBeenCalled();
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled(); // Should sign out after registration
      expect(result.current.user).toBeNull(); // User should be null after registration
    });

    it('should handle email already exists error', async () => {
      const firebaseError = { code: 'auth/email-already-in-use' };
      mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.register({
            email: 'existing@example.com',
            password: 'password123',
            confirmPassword: 'password123',
            displayName: 'Test User',
            role: 'student',
            agreeToTerms: true,
          });
        })
      ).rejects.toThrow();

      expect(result.current.user).toBeNull();
    });

    it('should handle weak password error', async () => {
      const firebaseError = { code: 'auth/weak-password' };
      mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.register({
            email: 'test@example.com',
            password: '123',
            confirmPassword: '123',
            displayName: 'Test User',
            role: 'student',
            agreeToTerms: true,
          });
        })
      ).rejects.toThrow();
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

    it('should handle logout errors gracefully', async () => {
      mockFirebaseAuth.signOut.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.logout();
        })
      ).rejects.toThrow('Failed to log out');
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

    it('should handle invalid email error', async () => {
      const firebaseError = { code: 'auth/invalid-email' };
      mockFirebaseAuth.sendPasswordResetEmail.mockRejectedValue(firebaseError);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.resetPassword('invalid-email');
        })
      ).rejects.toThrow();
    });
  });

  describe('Update User Profile Function', () => {
    it('should successfully update user profile', async () => {
      // Set up an authenticated user first
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        displayName: 'Test User',
        role: 'student' as const,
        emailVerified: true,
      };

      mockFirebaseFirestore.updateDoc.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });

      // Mock the user state
      act(() => {
        // This would normally be set by successful login
        (result.current as any).user = mockUser;
      });

      await act(async () => {
        await result.current.updateUserProfile({
          displayName: 'Updated Name',
          photoURL: 'https://example.com/photo.jpg',
        });
      });

      expect(mockFirebaseFirestore.updateDoc).toHaveBeenCalled();
    });

    it('should handle update errors', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.updateUserProfile({
            displayName: 'Updated Name',
          });
        })
      ).rejects.toThrow('No user logged in');
    });
  });

  describe('Resend Email Verification Function', () => {
    it('should successfully resend verification email', async () => {
      mockFirebaseAuth.sendEmailVerification.mockResolvedValue(undefined);

      // Mock Firebase auth currentUser
      const mockCurrentUser = createMockFirebaseUser();
      vi.mocked(mockFirebaseAuth as any).currentUser = mockCurrentUser;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.resendEmailVerification();
      });

      expect(mockFirebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockCurrentUser);
    });

    it('should handle no user logged in error', async () => {
      vi.mocked(mockFirebaseAuth as any).currentUser = null;

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.resendEmailVerification();
        })
      ).rejects.toThrow('No user logged in');
    });
  });
});
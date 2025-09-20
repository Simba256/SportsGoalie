import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService, createAuthService } from '@/lib/auth/auth-service';
import { mockFirebaseAuth, mockFirebaseFirestore, createMockFirebaseUser } from '../../utils/test-utils';
import {
  EmailVerificationRequiredError,
  FirestorePermissionError,
  InvalidCredentialsError,
} from '@/lib/errors/auth-errors';

// Mock Firebase modules
vi.mock('firebase/auth');
vi.mock('firebase/firestore');
vi.mock('@/lib/errors/error-logger');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = AuthService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = AuthService.getInstance();
      const instance2 = AuthService.getInstance();

      expect(instance1).toBe(instance2);
    });

    it('should create service via factory function', () => {
      const service = createAuthService();
      expect(service).toBeInstanceOf(AuthService);
    });
  });

  describe('User Registration', () => {
    const mockCredentials = {
      email: 'newuser@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      displayName: 'New User',
      role: 'student' as const,
      agreeToTerms: true,
    };

    it('should successfully register a new user', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseAuth.sendEmailVerification.mockResolvedValue(undefined);
      mockFirebaseFirestore.setDoc.mockResolvedValue(undefined);
      mockFirebaseAuth.signOut.mockResolvedValue(undefined);

      const result = await authService.register(mockCredentials);

      expect(mockFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        mockCredentials.email,
        mockCredentials.password
      );
      expect(mockFirebaseAuth.sendEmailVerification).toHaveBeenCalledWith(mockFirebaseUser);
      expect(mockFirebaseFirestore.setDoc).toHaveBeenCalled();
      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();

      expect(result).toMatchObject({
        id: mockFirebaseUser.uid,
        email: mockCredentials.email,
        displayName: mockCredentials.displayName,
        role: mockCredentials.role,
        emailVerified: false,
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle Firebase registration errors', async () => {
      const firebaseError = { code: 'auth/email-already-in-use' };
      mockFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValue(firebaseError);

      await expect(authService.register(mockCredentials)).rejects.toThrow();
    });

    it('should handle email verification sending failure', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseAuth.sendEmailVerification.mockRejectedValue(new Error('Email sending failed'));

      await expect(authService.register(mockCredentials)).rejects.toThrow();
    });

    it('should handle Firestore document creation failure', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseAuth.sendEmailVerification.mockResolvedValue(undefined);
      mockFirebaseFirestore.setDoc.mockRejectedValue(new Error('Firestore error'));

      await expect(authService.register(mockCredentials)).rejects.toThrow();
    });
  });

  describe('User Login', () => {
    const mockCredentials = {
      email: 'user@example.com',
      password: 'password123',
    };

    it('should successfully login verified user', async () => {
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
          lastLoginAt: { toDate: () => new Date() },
        }),
      });
      mockFirebaseFirestore.updateDoc.mockResolvedValue(undefined);

      const result = await authService.login(mockCredentials);

      expect(mockFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        mockCredentials.email,
        mockCredentials.password
      );
      expect(mockFirebaseFirestore.updateDoc).toHaveBeenCalled(); // Last login update

      expect(result).toMatchObject({
        id: mockFirebaseUser.uid,
        email: mockCredentials.email,
        emailVerified: true,
      });
    });

    it('should reject unverified user login', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseAuth.signOut.mockResolvedValue(undefined);

      await expect(authService.login(mockCredentials)).rejects.toThrow(EmailVerificationRequiredError);

      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle missing Firestore user document', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });
      const mockUserCredential = { user: mockFirebaseUser };

      mockFirebaseAuth.signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      mockFirebaseFirestore.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      await expect(authService.login(mockCredentials)).rejects.toThrow(FirestorePermissionError);
    });

    it('should handle invalid credentials', async () => {
      const firebaseError = { code: 'auth/invalid-credential' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

      await expect(authService.login(mockCredentials)).rejects.toThrow(InvalidCredentialsError);
    });

    it('should handle network errors during login', async () => {
      const firebaseError = { code: 'auth/network-request-failed' };
      mockFirebaseAuth.signInWithEmailAndPassword.mockRejectedValue(firebaseError);

      await expect(authService.login(mockCredentials)).rejects.toThrow();
    });
  });

  describe('User Logout', () => {
    it('should successfully logout user', async () => {
      mockFirebaseAuth.signOut.mockResolvedValue(undefined);
      mockFirebaseAuth.currentUser = createMockFirebaseUser();

      await authService.logout();

      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle logout when no user is signed in', async () => {
      mockFirebaseAuth.signOut.mockResolvedValue(undefined);
      mockFirebaseAuth.currentUser = null;

      await authService.logout();

      expect(mockFirebaseAuth.signOut).toHaveBeenCalled();
    });

    it('should handle Firebase logout errors', async () => {
      mockFirebaseAuth.signOut.mockRejectedValue(new Error('Logout failed'));

      await expect(authService.logout()).rejects.toThrow();
    });
  });

  describe('Get Current User', () => {
    it('should return null when no user is authenticated', async () => {
      mockFirebaseAuth.currentUser = null;

      const result = await authService.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return user when authenticated', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });
      mockFirebaseAuth.currentUser = mockFirebaseUser;

      mockFirebaseFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          displayName: 'Test User',
          role: 'student',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      });

      const result = await authService.getCurrentUser();

      expect(result).toMatchObject({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        emailVerified: true,
      });
    });
  });

  describe('Create User From Firebase User', () => {
    it('should return null for unverified users', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: false });

      const result = await authService.createUserFromFirebaseUser(mockFirebaseUser);

      expect(result).toBeNull();
      expect(mockFirebaseFirestore.getDoc).not.toHaveBeenCalled();
    });

    it('should create user from Firebase user when verified', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });

      mockFirebaseFirestore.getDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          displayName: 'Test User',
          role: 'student',
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
          lastLoginAt: { toDate: () => new Date() },
        }),
      });

      const result = await authService.createUserFromFirebaseUser(mockFirebaseUser);

      expect(result).toMatchObject({
        id: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        displayName: 'Test User',
        role: 'student',
        emailVerified: true,
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
      expect(result?.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should return null when Firestore document does not exist', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });

      mockFirebaseFirestore.getDoc.mockResolvedValue({
        exists: () => false,
        data: () => null,
      });

      const result = await authService.createUserFromFirebaseUser(mockFirebaseUser);

      expect(result).toBeNull();
    });

    it('should handle Firestore access errors gracefully', async () => {
      const mockFirebaseUser = createMockFirebaseUser({ emailVerified: true });

      mockFirebaseFirestore.getDoc.mockRejectedValue(new Error('Firestore access denied'));

      const result = await authService.createUserFromFirebaseUser(mockFirebaseUser);

      expect(result).toBeNull();
    });
  });

  describe('Update User Last Login', () => {
    it('should successfully update last login time', async () => {
      const userId = 'user-123';
      mockFirebaseFirestore.updateDoc.mockResolvedValue(undefined);

      await authService.updateUserLastLogin(userId);

      expect(mockFirebaseFirestore.updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
          updatedAt: expect.any(Date),
        })
      );
    });

    it('should handle update errors gracefully without throwing', async () => {
      const userId = 'user-123';
      mockFirebaseFirestore.updateDoc.mockRejectedValue(new Error('Update failed'));

      // Should not throw - errors are logged but not propagated
      await expect(authService.updateUserLastLogin(userId)).resolves.toBeUndefined();
    });
  });
});
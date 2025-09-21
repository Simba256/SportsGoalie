import { describe, it, expect, beforeEach } from 'vitest';
import {
  AuthError,
  AuthErrorCode,
  ErrorSeverity,
  InvalidCredentialsError,
  EmailAlreadyExistsError,
  EmailVerificationRequiredError,
  WeakPasswordError,
  TooManyRequestsError,
  NetworkError,
  UnknownAuthError,
  createAuthErrorFromFirebase,
  createErrorContext,
  isAuthError,
} from '@/lib/errors/auth-errors';

describe('AuthError System', () => {
  let mockContext: any;

  beforeEach(() => {
    mockContext = createErrorContext('test', {
      email: 'test@example.com',
      userId: 'user-123',
    });
  });

  describe('AuthError Base Class', () => {
    it('should create a proper error with all properties', () => {
      const error = new InvalidCredentialsError(mockContext);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(error.userMessage).toContain('Invalid email or password');
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.context).toBe(mockContext);
      expect(error.shouldLog).toBe(false);
    });

    it('should convert to log format correctly', () => {
      const error = new InvalidCredentialsError(mockContext);
      const logFormat = error.toLogFormat();

      expect(logFormat).toMatchObject({
        name: 'InvalidCredentialsError',
        code: AuthErrorCode.INVALID_CREDENTIALS,
        severity: ErrorSeverity.LOW,
        context: mockContext,
        isRetryable: false,
      });
      expect(logFormat.message).toBeDefined();
      expect(logFormat.stack).toBeDefined();
    });

    it('should convert to user format correctly', () => {
      const error = new InvalidCredentialsError(mockContext);
      const userFormat = error.toUserFormat();

      expect(userFormat).toMatchObject({
        message: expect.stringContaining('Invalid email or password'),
        code: AuthErrorCode.INVALID_CREDENTIALS,
        isRetryable: false,
      });
    });
  });

  describe('Specific Error Types', () => {
    it('should create InvalidCredentialsError correctly', () => {
      const error = new InvalidCredentialsError(mockContext);
      expect(error.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
      expect(error.userMessage).toContain('Invalid email or password');
      expect(error.isRetryable).toBe(false);
    });

    it('should create EmailAlreadyExistsError correctly', () => {
      const error = new EmailAlreadyExistsError(mockContext);
      expect(error.code).toBe(AuthErrorCode.EMAIL_ALREADY_EXISTS);
      expect(error.userMessage).toContain('already exists');
      expect(error.isRetryable).toBe(false);
    });

    it('should create EmailVerificationRequiredError correctly', () => {
      const error = new EmailVerificationRequiredError(mockContext);
      expect(error.code).toBe(AuthErrorCode.EMAIL_VERIFICATION_REQUIRED);
      expect(error.userMessage).toContain('verification required');
      expect(error.isRetryable).toBe(false);
    });

    it('should create WeakPasswordError correctly', () => {
      const error = new WeakPasswordError(mockContext);
      expect(error.code).toBe(AuthErrorCode.WEAK_PASSWORD);
      expect(error.userMessage).toContain('stronger password');
      expect(error.isRetryable).toBe(false);
    });

    it('should create TooManyRequestsError correctly', () => {
      const error = new TooManyRequestsError(mockContext);
      expect(error.code).toBe(AuthErrorCode.TOO_MANY_REQUESTS);
      expect(error.userMessage).toContain('Too many');
      expect(error.isRetryable).toBe(true);
    });

    it('should create NetworkError correctly', () => {
      const error = new NetworkError(mockContext);
      expect(error.code).toBe(AuthErrorCode.NETWORK_ERROR);
      expect(error.userMessage).toContain('Network');
      expect(error.isRetryable).toBe(true);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('Firebase Error Conversion', () => {
    it('should convert Firebase auth/invalid-credential error', () => {
      const firebaseError = { code: 'auth/invalid-credential' };
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(InvalidCredentialsError);
      expect(authError.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });

    it('should convert Firebase auth/email-already-in-use error', () => {
      const firebaseError = { code: 'auth/email-already-in-use' };
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(EmailAlreadyExistsError);
      expect(authError.code).toBe(AuthErrorCode.EMAIL_ALREADY_EXISTS);
    });

    it('should convert Firebase auth/weak-password error', () => {
      const firebaseError = { code: 'auth/weak-password' };
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(WeakPasswordError);
      expect(authError.code).toBe(AuthErrorCode.WEAK_PASSWORD);
    });

    it('should handle unknown Firebase error codes', () => {
      const firebaseError = { code: 'auth/unknown-error-code' };
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(UnknownAuthError);
      expect(authError.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
    });

    it('should handle errors without code property', () => {
      const firebaseError = new Error('Some error message');
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(UnknownAuthError);
      expect(authError.code).toBe(AuthErrorCode.UNKNOWN_ERROR);
    });

    it('should detect error patterns in messages', () => {
      const firebaseError = new Error('wrong-password occurred');
      const authError = createAuthErrorFromFirebase(firebaseError, mockContext);

      expect(authError).toBeInstanceOf(InvalidCredentialsError);
      expect(authError.code).toBe(AuthErrorCode.INVALID_CREDENTIALS);
    });
  });

  describe('Type Guards', () => {
    it('should identify AuthError instances correctly', () => {
      const authError = new InvalidCredentialsError(mockContext);
      const regularError = new Error('Regular error');

      expect(isAuthError(authError)).toBe(true);
      expect(isAuthError(regularError)).toBe(false);
      expect(isAuthError(null)).toBe(false);
      expect(isAuthError(undefined)).toBe(false);
      expect(isAuthError('string')).toBe(false);
    });
  });

  describe('Error Context Creation', () => {
    it('should create error context with required fields', () => {
      const context = createErrorContext('login');

      expect(context.operation).toBe('login');
      expect(context.timestamp).toBeInstanceOf(Date);
      expect(context.userAgent).toBeDefined();
    });

    it('should create error context with additional options', () => {
      const context = createErrorContext('register', {
        email: 'test@example.com',
        userId: 'user-123',
        additionalData: { attempt: 1 },
      });

      expect(context.operation).toBe('register');
      expect(context.email).toBe('test@example.com');
      expect(context.userId).toBe('user-123');
      expect(context.additionalData).toEqual({ attempt: 1 });
    });
  });
});
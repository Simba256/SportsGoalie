/**
 * Authentication Service Layer
 *
 * Provides clean business logic for authentication operations,
 * separated from UI concerns and with comprehensive error handling.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendEmailVerification,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, RegisterCredentials, LoginCredentials } from '@/types/auth';
import {
  AuthError,
  EmailVerificationRequiredError,
  createAuthErrorFromFirebase,
  createErrorContext,
  FirestorePermissionError,
} from '@/lib/errors/auth-errors';
import { logAuthError, logInfo, logDebug } from '@/lib/errors/error-logger';
import { generateStudentId, isValidStudentId } from '@/lib/utils/student-id-generator';

/**
 * Authentication Service Interface
 */
export interface IAuthService {
  register(credentials: RegisterCredentials): Promise<User>;
  login(credentials: LoginCredentials): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null>;
  updateUserLastLogin(userId: string): Promise<void>;
}

/**
 * Authentication Service Implementation
 */
export class AuthService implements IAuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  public async register(credentials: RegisterCredentials): Promise<User> {
    const context = createErrorContext('register', { email: credentials.email });

    try {
      logDebug('Starting user registration', { email: credentials.email });

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Send email verification
      await sendEmailVerification(firebaseUser);
      logInfo('Email verification sent', { userId: firebaseUser.uid });

      // Generate unique student number for students
      let studentNumber: string | undefined;
      if (credentials.role === 'student') {
        studentNumber = await this.generateUniqueStudentNumber();
        logInfo('Generated student number', { userId: firebaseUser.uid, studentNumber });
      }

      // Create user document in Firestore
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: credentials.displayName,
        role: credentials.role,
        studentNumber,
        emailVerified: false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: undefined,
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), {
        ...newUser,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });

      logInfo('User profile created successfully', { userId: firebaseUser.uid });

      // Sign out the user immediately - they need to verify email first
      await firebaseSignOut(auth);
      logDebug('User signed out after registration for email verification');

      return newUser;
    } catch (error) {
      const authError = createAuthErrorFromFirebase(error, context);
      logAuthError(authError);
      throw authError;
    }
  }

  /**
   * Login user with email verification check
   */
  public async login(credentials: LoginCredentials): Promise<User> {
    const context = createErrorContext('login', { email: credentials.email });

    try {
      logDebug('Starting user login', { email: credentials.email });

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Check email verification
      if (!firebaseUser.emailVerified) {
        await firebaseSignOut(auth);
        logInfo('Login blocked: email not verified', { userId: firebaseUser.uid });
        throw new EmailVerificationRequiredError({
          ...context,
          userId: firebaseUser.uid,
        });
      }

      // Get user profile from Firestore
      const user = await this.createUserFromFirebaseUser(firebaseUser);
      if (!user) {
        throw new FirestorePermissionError({
          ...context,
          userId: firebaseUser.uid,
        });
      }

      // Update last login time
      await this.updateUserLastLogin(user.id);

      logInfo('User login successful', { userId: user.id });
      return user;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }

      const authError = createAuthErrorFromFirebase(error, context);
      logAuthError(authError);
      throw authError;
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    const context = createErrorContext('logout');

    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        logDebug('Logging out user', { userId: currentUser.uid });
      }

      await firebaseSignOut(auth);
      logInfo('User logout successful');
    } catch (error) {
      const authError = createAuthErrorFromFirebase(error, context);
      logAuthError(authError);
      throw authError;
    }
  }

  /**
   * Get current authenticated user
   */
  public async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      return null;
    }

    return this.createUserFromFirebaseUser(firebaseUser);
  }

  /**
   * Create User object from Firebase user
   */
  public async createUserFromFirebaseUser(firebaseUser: FirebaseUser): Promise<User | null> {
    const context = createErrorContext('createUserFromFirebaseUser', {
      userId: firebaseUser.uid,
    });

    try {
      // Don't attempt Firestore access for unverified users
      if (!firebaseUser.emailVerified) {
        logDebug('Skipping Firestore access for unverified user', {
          userId: firebaseUser.uid,
        });
        return null;
      }

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        logAuthError(
          new FirestorePermissionError({
            ...context,
            additionalData: { reason: 'User document not found' },
          })
        );
        return null;
      }

      const userData = userDoc.data();
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: userData.displayName,
        role: userData.role,
        emailVerified: firebaseUser.emailVerified,
        createdAt: userData.createdAt?.toDate(),
        updatedAt: userData.updatedAt?.toDate(),
        lastLoginAt: userData.lastLoginAt?.toDate(),
      };
    } catch (error) {
      const authError = createAuthErrorFromFirebase(error, context);
      logAuthError(authError);
      return null;
    }
  }

  /**
   * Update user's last login time
   */
  public async updateUserLastLogin(userId: string): Promise<void> {
    const context = createErrorContext('updateUserLastLogin', { userId });

    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      });

      logDebug('Last login time updated', { userId });
    } catch (error) {
      // Don't throw on this failure, just log it
      const authError = createAuthErrorFromFirebase(error, context);
      logAuthError(authError);
    }
  }

  /**
   * Generate a unique student number
   * Ensures the generated ID doesn't already exist in the database
   */
  private async generateUniqueStudentNumber(): Promise<string> {
    const maxAttempts = 10;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const studentNumber = generateStudentId();

      // Check if this student number already exists
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('studentNumber', '==', studentNumber));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // Unique student number found
        return studentNumber;
      }

      attempts++;
      logDebug('Student number collision, regenerating', { studentNumber, attempt: attempts });
    }

    // Fallback: This should be extremely rare given the large ID space
    throw new Error('Failed to generate unique student number after maximum attempts');
  }
}

/**
 * Default authentication service instance
 */
export const authService = AuthService.getInstance();

/**
 * Service factory for testing and dependency injection
 */
export const createAuthService = (): IAuthService => {
  return AuthService.getInstance();
};
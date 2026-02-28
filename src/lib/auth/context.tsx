'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User, AuthState, LoginCredentials, RegisterCredentials, ProfileUpdateData } from '../../types/auth';
import {
  createAuthErrorFromFirebase,
  createErrorContext,
  EmailVerificationRequiredError,
  isAuthError,
  AuthError,
} from '@/lib/errors/auth-errors';
import { userService } from '@/lib/database/services/user.service';
import { normalizeCoachCode } from '@/lib/utils/coach-code-generator';
import { isRegistrationInProgress } from '@/lib/auth/auth-service';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<{ userId: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: ProfileUpdateData) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });
  const isRegisteringRef = useRef(false);

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  const setUser = (user: User | null) => {
    setState({
      user,
      loading: false,
      error: null,
      isAuthenticated: !!user,
    });
  };

  // Convert Firebase user to our User type
  const createUserFromFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          role: userData.role || 'student',
          emailVerified: firebaseUser.emailVerified,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
          preferences: userData.preferences,
          // Include student/coach specific fields from Firestore
          ...(userData.workflowType && { workflowType: userData.workflowType }),
          ...(userData.assignedCoachId && { assignedCoachId: userData.assignedCoachId }),
          ...(userData.studentNumber && { studentNumber: userData.studentNumber }),
          ...(userData.coachCode && { coachCode: userData.coachCode }),
        };

        // Only add photoURL if it exists
        if (firebaseUser.photoURL) {
          user.photoURL = firebaseUser.photoURL;
        }

        return user;
      }

      // If user document doesn't exist, create it
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        role: 'student',
        emailVerified: firebaseUser.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        preferences: {
          theme: 'system',
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
      };

      // Only add photoURL if it has a value
      if (firebaseUser.photoURL) {
        newUser.photoURL = firebaseUser.photoURL;
      }

      // Create the document without undefined fields
      // Don't include 'id' in the document data - it's already the document ID
      const { id, ...userDataWithoutId } = newUser;

      // Remove any undefined fields before saving to Firestore
      const docData = Object.fromEntries(
        Object.entries({
          ...userDataWithoutId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).filter(([_, value]) => value !== undefined)
      );

      await setDoc(userDocRef, docData);

      return newUser;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating user from Firebase user:', error);
      return null;
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    const context = createErrorContext('login', { email: credentials.email });

    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Check if email is verified
      // For invited coaches, we set emailVerified: true in Firestore (Firebase Auth won't have it)
      if (!userCredential.user.emailVerified) {
        // Check Firestore for coaches who were verified via invitation
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userDocRef);
        const firestoreVerified = userDoc.exists() && userDoc.data()?.emailVerified === true;

        if (!firestoreVerified) {
          // Not verified in Firebase Auth or Firestore - block login
          await firebaseSignOut(auth);
          setLoading(false);
          setUser(null);
          throw new EmailVerificationRequiredError(context);
        }
        // Firestore says verified (invited coach) - allow login
      }

      const user = await createUserFromFirebaseUser(userCredential.user);
      if (user) {
        // Update last login time
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        });
      }

      setUser(user);
    } catch (error: unknown) {
      setLoading(false);

      // If it's already an AuthError, just re-throw it
      if (isAuthError(error)) {
        throw error;
      }

      // Convert Firebase errors to AuthError
      const authError = createAuthErrorFromFirebase(error, context);
      throw authError;
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    const context = createErrorContext('register', { email: credentials.email });

    try {
      isRegisteringRef.current = true; // Prevent auth state listener from signing out
      setLoading(true);
      setError(null);

      // Validate coach code for custom workflow students BEFORE creating Firebase user
      let assignedCoachId: string | undefined;
      if (credentials.role === 'student' &&
          credentials.workflowType === 'custom' &&
          credentials.coachCode) {
        const normalizedCode = normalizeCoachCode(credentials.coachCode);
        const coachResult = await userService.getCoachByCode(normalizedCode);

        if (!coachResult.success || !coachResult.data) {
          throw new AuthError(
            'INVALID_COACH_CODE',
            'Invalid coach code. Please check with your coach and try again.',
            'Invalid coach code. Please check with your coach and try again.',
            context
          );
        }

        assignedCoachId = coachResult.data.id;
        console.log('✅ Coach code validated, assigning to coach:', coachResult.data.displayName);
      }

      // Generate coach code for coaches BEFORE creating Firebase user
      let coachCode: string | undefined;
      if (credentials.role === 'coach') {
        coachCode = await userService.generateUniqueCoachCode(credentials.displayName);
        console.log('✅ Generated coach code:', coachCode);
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName,
      });

      // Send email verification (skip for invited coaches - they verified by clicking invitation link)
      if (!credentials.skipEmailVerification) {
        await sendEmailVerification(userCredential.user);
      }

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        role: credentials.role || 'student',
        emailVerified: credentials.skipEmailVerification || false, // Invited coaches are pre-verified
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        // Add workflow type and assigned coach for students
        ...(credentials.role === 'student' && {
          workflowType: credentials.workflowType || 'automated',
          ...(assignedCoachId && { assignedCoachId }),
        }),
        // Add coach code for coaches
        ...(credentials.role === 'coach' && coachCode && { coachCode }),
        preferences: {
          theme: 'system',
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
      };

      // Only add photoURL if it has a value
      if (userCredential.user.photoURL) {
        newUser.photoURL = userCredential.user.photoURL;
      }

      const userDocRef = doc(db, 'users', newUser.id);
      // Create the document without undefined fields
      // Don't include 'id' in the document data - it's already the document ID
      const { id, ...userDataWithoutId } = newUser;

      // Remove any undefined fields before saving to Firestore
      const docData = Object.fromEntries(
        Object.entries({
          ...userDataWithoutId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).filter(([_, value]) => value !== undefined)
      );

      console.log('🔍 Creating Firestore document with data:', {
        ...docData,
        createdAt: 'Date object',
        updatedAt: 'Date object',
      });

      await setDoc(userDocRef, docData);

      console.log('✅ Firestore document created successfully');

      // Register coach code in coach_codes collection for lookup
      if (credentials.role === 'coach' && coachCode) {
        await userService.registerCoachCode(coachCode, newUser.id, credentials.displayName);
        console.log('✅ Coach code registered:', coachCode);
      }

      // Important: Log out the user immediately after registration
      // They need to verify their email before logging in
      await firebaseSignOut(auth);
      setUser(null);
      setLoading(false); // Reset loading state after successful registration

      // Return the user ID for flows that need it (e.g., coach invitation acceptance)
      return { userId: newUser.id };
    } catch (error: unknown) {
      setLoading(false);

      // Log the actual error for debugging
      console.error('❌ Registration error:', error);
      if (error && typeof error === 'object' && 'code' in error) {
        console.error('Error code:', (error as { code: string }).code);
      }

      // If it's already an AuthError, just re-throw it
      if (isAuthError(error)) {
        throw error;
      }

      // Convert Firebase errors to AuthError
      const authError = createAuthErrorFromFirebase(error, context);
      throw authError;
    } finally {
      isRegisteringRef.current = false; // Reset flag
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      // Navigate to landing page after successful logout
      router.push('/');
    } catch {
      throw new Error('Failed to log out');
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    const context = createErrorContext('resetPassword', { email });

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      // Convert Firebase errors to AuthError
      const authError = createAuthErrorFromFirebase(error, context);
      throw authError;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: ProfileUpdateData) => {
    if (!state.user) {
      throw new Error('No user logged in');
    }

    try {
      const userDocRef = doc(db, 'users', state.user.id);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date(),
      });

      // Update local state - only update allowed fields
      const updatedUser: User = {
        ...state.user,
        updatedAt: new Date(),
      };

      if (data.displayName !== undefined) {
        updatedUser.displayName = data.displayName;
      }
      if (data.photoURL !== undefined) {
        updatedUser.photoURL = data.photoURL;
      }
      if (data.preferences && state.user.preferences) {
        updatedUser.preferences = {
          ...state.user.preferences,
          ...data.preferences,
        };
      }

      setUser(updatedUser);
    } catch {
      throw new Error('Failed to update profile');
    }
  };

  // Resend email verification
  const resendEmailVerification = async () => {
    if (!auth.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      await sendEmailVerification(auth.currentUser);
    } catch {
      throw new Error('Failed to send verification email');
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check if email is verified before setting user
        // Skip this check if we're currently registering a new user
        // Check both the context's ref AND the auth-service's flag
        if (!firebaseUser.emailVerified && !isRegisteringRef.current && !isRegistrationInProgress) {
          // Check Firestore for coaches who were verified via invitation
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const firestoreVerified = userDoc.exists() && userDoc.data()?.emailVerified === true;

          if (!firestoreVerified) {
            // Email not verified in Firebase Auth or Firestore, sign out immediately
            await firebaseSignOut(auth);
            setUser(null);
            setLoading(false);
            return;
          }
          // Firestore says verified (invited coach) - allow
        }

        const user = await createUserFromFirebaseUser(firebaseUser);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    updateUserProfile,
    resendEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}


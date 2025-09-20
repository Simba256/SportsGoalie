'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { User, AuthState, LoginCredentials, RegisterCredentials, ProfileUpdateData } from '@/types/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
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
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

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
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          role: userData.role || 'student',
          photoURL: firebaseUser.photoURL || undefined,
          emailVerified: firebaseUser.emailVerified,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
          preferences: userData.preferences,
        };
      }

      // If user document doesn't exist, create it
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: firebaseUser.displayName,
        role: 'student',
        photoURL: firebaseUser.photoURL || undefined,
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

      await setDoc(userDocRef, {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newUser;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating user from Firebase user:', error);
      return null;
    }
  };

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

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
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown';
      throw new Error(getFirebaseErrorMessage(errorCode));
    }
  };

  // Register function
  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update Firebase profile
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Create user document in Firestore
      const newUser: User = {
        id: userCredential.user.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        role: credentials.role || 'student',
        photoURL: undefined,
        emailVerified: false,
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

      const userDocRef = doc(db, 'users', newUser.id);
      await setDoc(userDocRef, {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setUser(newUser);
    } catch (error: unknown) {
      setLoading(false);
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown';
      throw new Error(getFirebaseErrorMessage(errorCode));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch {
      throw new Error('Failed to log out');
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: unknown) {
      const errorCode = error instanceof Error && 'code' in error ? (error as { code: string }).code : 'unknown';
      throw new Error(getFirebaseErrorMessage(errorCode));
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
        const user = await createUserFromFirebaseUser(firebaseUser);
        setUser(user);
      } else {
        setUser(null);
      }
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

// Helper function to convert Firebase error codes to user-friendly messages
function getFirebaseErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password is too weak';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection';
    default:
      return 'An error occurred. Please try again';
  }
}
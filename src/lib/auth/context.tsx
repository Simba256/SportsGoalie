'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
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
  isAuthError
} from '@/lib/errors/auth-errors';

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
  const router = useRouter();
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
      const docData = {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Remove any undefined fields before saving to Firestore
      Object.keys(docData).forEach(key => {
        if (docData[key as keyof typeof docData] === undefined) {
          delete docData[key as keyof typeof docData];
        }
      });

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

      // Check if email is verified BEFORE creating user or setting state
      if (!userCredential.user.emailVerified) {
        // Sign out the user immediately since they can't access the app
        await firebaseSignOut(auth);
        setLoading(false);
        setUser(null);
        throw new EmailVerificationRequiredError(context);
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

      // Only add photoURL if it has a value
      if (userCredential.user.photoURL) {
        newUser.photoURL = userCredential.user.photoURL;
      }

      const userDocRef = doc(db, 'users', newUser.id);
      // Create the document without undefined fields
      const docData = {
        ...newUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Remove any undefined fields before saving to Firestore
      Object.keys(docData).forEach(key => {
        if (docData[key as keyof typeof docData] === undefined) {
          delete docData[key as keyof typeof docData];
        }
      });

      await setDoc(userDocRef, docData);

      // Important: Log out the user immediately after registration
      // They need to verify their email before logging in
      await firebaseSignOut(auth);
      setUser(null);
      setLoading(false); // Reset loading state after successful registration
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
        if (!firebaseUser.emailVerified) {
          // Email not verified, sign out immediately
          await firebaseSignOut(auth);
          setUser(null);
          setLoading(false);
          return;
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


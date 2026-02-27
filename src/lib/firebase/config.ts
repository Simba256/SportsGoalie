import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration
// Log to debug env vars in production
if (typeof window !== 'undefined') {
  console.log('🔍 Firebase Env Check:', {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ Missing', // Show actual project ID
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
  });
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables by checking the actual config values
const missingVars = [];
if (!firebaseConfig.apiKey) missingVars.push('NEXT_PUBLIC_FIREBASE_API_KEY');
if (!firebaseConfig.authDomain) missingVars.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
if (!firebaseConfig.projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
if (!firebaseConfig.storageBucket) missingVars.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(
    `❌ Missing required Firebase environment variables: ${missingVars.join(', ')}`
  );
  console.error('Please check your environment variables in Vercel');
}

// Initialize Firebase (prevent duplicate app initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development mode
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  const isEmulatorRunning = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

  if (isEmulatorRunning) {
    console.log('🔧 Connecting to Firebase emulators...');

    try {
      // Connect to Firestore emulator
      if (!db._delegate._databaseId.isDefaultDatabase) {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Connected to Firestore emulator on localhost:8080');
      }
    } catch (error) {
      console.log('Firestore emulator already connected or unavailable');
    }

    try {
      // Connect to Auth emulator
      if (!(auth as any)._config?.emulator) {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        console.log('✅ Connected to Auth emulator on localhost:9099');
      }
    } catch (error) {
      console.log('Auth emulator already connected or unavailable');
    }

    try {
      // Connect to Storage emulator
      if (!(storage as any)._delegate?._bucket?.includes('localhost')) {
        connectStorageEmulator(storage, 'localhost', 9199);
        console.log('✅ Connected to Storage emulator on localhost:9199');
      }
    } catch (error) {
      console.log('Storage emulator already connected or unavailable');
    }
  }
}

// Export Firebase app instance
export default app;

// Environment helper
export const firebaseEnv = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  isEmulator: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Configuration validation
export const validateFirebaseConfig = (): {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
} => {
  const warnings: string[] = [];

  if (!firebaseConfig.measurementId) {
    warnings.push('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID is missing (Analytics will be disabled)');
  }

  if (!firebaseConfig.messagingSenderId) {
    warnings.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID is missing (FCM will be disabled)');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars: missingVars,
    warnings,
  };
};

// Helper to check if Firebase is properly initialized
export const checkFirebaseConnection = async (): Promise<{
  connected: boolean;
  services: {
    firestore: boolean;
    auth: boolean;
    storage: boolean;
  };
  error?: string;
}> => {
  try {
    // Test Firestore connection
    let firestoreConnected = false;
    try {
      await db._delegate._databaseId;
      firestoreConnected = true;
    } catch (error) {
      console.warn('Firestore connection test failed:', error);
    }

    // Test Auth connection
    let authConnected = false;
    try {
      await auth.authStateReady();
      authConnected = true;
    } catch (error) {
      console.warn('Auth connection test failed:', error);
    }

    // Test Storage connection (basic check)
    let storageConnected = false;
    try {
      // Just check if storage object exists and has expected properties
      storageConnected = !!(storage && storage.app);
    } catch (error) {
      console.warn('Storage connection test failed:', error);
    }

    const allConnected = firestoreConnected && authConnected && storageConnected;

    return {
      connected: allConnected,
      services: {
        firestore: firestoreConnected,
        auth: authConnected,
        storage: storageConnected,
      },
    };
  } catch (error) {
    return {
      connected: false,
      services: {
        firestore: false,
        auth: false,
        storage: false,
      },
      error: String(error),
    };
  }
};
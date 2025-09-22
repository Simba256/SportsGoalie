#!/usr/bin/env node

/**
 * Create a test user for testing the enrollment functionality
 */

const admin = require('firebase-admin');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_ADMIN_PROJECT_ID,
    client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
  });
}

const auth = admin.auth();
const db = admin.firestore();

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...');

    const testEmail = 'test@sportscoach.com';
    const testPassword = 'test123456';

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: testEmail,
        password: testPassword,
        displayName: 'Test User',
        emailVerified: true,
      });
      console.log(`✅ Created Firebase Auth user: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        userRecord = await auth.getUserByEmail(testEmail);
        console.log(`✅ Test user already exists: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // Create Firestore user document
    const userData = {
      email: testEmail,
      displayName: 'Test User',
      role: 'student',
      isActive: true,
      emailVerified: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
      lastLoginAt: admin.firestore.Timestamp.now(),
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    };

    await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
    console.log(`✅ Created/updated Firestore user document`);

    console.log('🎉 Test user ready!');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}`);
    console.log(`🆔 UID: ${userRecord.uid}`);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✨ Test user creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test user creation failed:', error);
      process.exit(1);
    });
}

module.exports = { createTestUser };
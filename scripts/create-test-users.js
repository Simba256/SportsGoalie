#!/usr/bin/env node

// Script to create test users with proper Firestore user documents
// This script creates users in both Firebase Auth and Firestore

const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
const app = initializeApp({
  projectId: 'sportscoach-2a84d'
});

const auth = getAuth(app);
const db = getFirestore(app);

const testUsers = [
  {
    email: 'admin@sportscoach.com',
    password: 'admin123456',
    displayName: 'Admin User',
    role: 'admin',
    emailVerified: true
  },
  {
    email: 'student@sportscoach.com',
    password: 'student123456',
    displayName: 'Student User',
    role: 'student',
    emailVerified: true
  },
  {
    email: 'test@sportscoach.com',
    password: 'test123456',
    displayName: 'Test User',
    role: 'student',
    emailVerified: true
  }
];

async function createTestUsers() {
  console.log('👥 Creating test users with proper authentication and Firestore documents...\n');

  for (const userData of testUsers) {
    try {
      console.log(`📧 Processing user: ${userData.email}`);

      // Try to get existing user first
      let userRecord;
      try {
        userRecord = await auth.getUserByEmail(userData.email);
        console.log(`   ℹ️  User already exists in Firebase Auth: ${userRecord.uid}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          // Create new user in Firebase Auth
          userRecord = await auth.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
            emailVerified: userData.emailVerified
          });
          console.log(`   ✅ Created new user in Firebase Auth: ${userRecord.uid}`);
        } else {
          throw error;
        }
      }

      // Set custom claims for role
      await auth.setCustomUserClaims(userRecord.uid, {
        role: userData.role,
        admin: userData.role === 'admin'
      });
      console.log(`   🔑 Set custom claims: role=${userData.role}`);

      // Create or update user document in Firestore
      const userDoc = {
        id: userRecord.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        emailVerified: userData.emailVerified,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en',
          timezone: 'UTC',
          emailNotifications: {
            progress: true,
            quizResults: true,
            newContent: true,
            reminders: true
          }
        },
        profile: {
          firstName: userData.displayName.split(' ')[0],
          lastName: userData.displayName.split(' ')[1] || '',
          sportsInterests: [],
          experienceLevel: 'beginner',
          goals: []
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        lastLoginAt: Timestamp.fromDate(new Date())
      };

      // Use the user's UID as the document ID
      await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
      console.log(`   📄 Created/updated Firestore user document`);

      console.log(`   ✅ Successfully set up user: ${userData.email}\n`);

    } catch (error) {
      console.error(`   ❌ Error creating user ${userData.email}:`, error.message);

      // If it's a duplicate email error, try to fix the Firestore document
      if (error.code === 'auth/email-already-exists') {
        try {
          const existingUser = await auth.getUserByEmail(userData.email);
          console.log(`   🔧 Attempting to fix existing user: ${existingUser.uid}`);

          // Set custom claims
          await auth.setCustomUserClaims(existingUser.uid, {
            role: userData.role,
            admin: userData.role === 'admin'
          });

          // Create Firestore document
          const userDoc = {
            id: existingUser.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: userData.role,
            emailVerified: true,
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en',
              timezone: 'UTC',
              emailNotifications: {
                progress: true,
                quizResults: true,
                newContent: true,
                reminders: true
              }
            },
            profile: {
              firstName: userData.displayName.split(' ')[0],
              lastName: userData.displayName.split(' ')[1] || '',
              sportsInterests: [],
              experienceLevel: 'beginner',
              goals: []
            },
            createdAt: Timestamp.fromDate(new Date()),
            updatedAt: Timestamp.fromDate(new Date()),
            lastLoginAt: Timestamp.fromDate(new Date())
          };

          await db.collection('users').doc(existingUser.uid).set(userDoc, { merge: true });
          console.log(`   ✅ Fixed existing user: ${userData.email}\n`);
        } catch (fixError) {
          console.error(`   ❌ Could not fix existing user:`, fixError.message);
        }
      }
    }
  }

  console.log('🎉 Test user setup completed!\n');
  console.log('📋 Test User Credentials:');
  console.log('');
  testUsers.forEach(user => {
    console.log(`👤 ${user.role.toUpperCase()} USER:`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Role: ${user.role}`);
    console.log('');
  });

  console.log('🔑 You can now log in with any of these credentials.');
  console.log('🛡️  The admin user has full access to admin features.');
}

async function cleanupAuth() {
  console.log('🧹 Cleaning up existing authentication issues...\n');

  try {
    // List all users and check for orphaned auth records
    const listUsersResult = await auth.listUsers();
    console.log(`📊 Found ${listUsersResult.users.length} users in Firebase Auth`);

    for (const userRecord of listUsersResult.users) {
      console.log(`🔍 Checking user: ${userRecord.email} (${userRecord.uid})`);

      // Check if user document exists in Firestore
      const userDoc = await db.collection('users').doc(userRecord.uid).get();
      if (!userDoc.exists) {
        console.log(`   ⚠️  Missing Firestore document for ${userRecord.email}`);

        // If this is one of our test emails, we'll fix it later
        const isTestUser = testUsers.some(tu => tu.email === userRecord.email);
        if (!isTestUser) {
          console.log(`   ❓ Non-test user without Firestore doc: ${userRecord.email}`);
        }
      } else {
        console.log(`   ✅ Firestore document exists for ${userRecord.email}`);
      }
    }
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

async function main() {
  try {
    await cleanupAuth();
    await createTestUsers();
    console.log('\n✅ Authentication setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
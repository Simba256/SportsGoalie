/**
 * Script to set up Basim as admin using Firebase Admin SDK directly
 * This bypasses the API and sets custom claims directly
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function setupBasimAsAdmin() {
  try {
    console.log('🔧 Setting up Basim as admin...');

    // Initialize Firebase Admin if not already done
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (!privateKey) {
        throw new Error('FIREBASE_ADMIN_PRIVATE_KEY not found in environment variables');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });

      console.log('✅ Firebase Admin initialized');
    }

    // Find user by email
    const email = 'syedbasimmehmood@gmail.com';
    console.log(`🔍 Looking for user: ${email}`);

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`✅ Found user: ${userRecord.uid}`);
    } catch (error) {
      console.log('❌ User not found. Please make sure the account exists and is registered.');
      console.log('You can register at: http://localhost:3001/auth/register');
      process.exit(1);
    }

    // Set custom claims for admin role
    console.log('🛠️  Setting admin custom claims...');

    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      admin: true,
      setupDate: new Date().toISOString(),
      setupBy: 'setup-script'
    });

    console.log('✅ Custom claims set successfully!');

    // Verify the claims were set
    console.log('🔍 Verifying custom claims...');
    const updatedUser = await admin.auth().getUser(userRecord.uid);

    console.log('\n📋 Admin Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 User: ${updatedUser.email}`);
    console.log(`🆔 UID: ${updatedUser.uid}`);
    console.log(`👑 Role: ${updatedUser.customClaims?.role || 'not set'}`);
    console.log(`🔑 Admin: ${updatedUser.customClaims?.admin ? 'Yes' : 'No'}`);
    console.log(`📅 Setup Date: ${updatedUser.customClaims?.setupDate || 'N/A'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (updatedUser.customClaims?.role === 'admin') {
      console.log('\n🎉 SUCCESS! Basim is now an admin.');
      console.log('🔄 Note: You may need to sign out and sign back in for changes to take effect.');
      console.log('📱 Admin Dashboard: http://localhost:3001/admin');
    } else {
      console.log('\n❌ ERROR: Custom claims not set properly.');
    }

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  }
}

// Run the setup
setupBasimAsAdmin()
  .then(() => {
    console.log('\n✅ Setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
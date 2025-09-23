#!/usr/bin/env node

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found. Please add serviceAccountKey.json to the project root.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath)),
  projectId: 'sportscoach-2a84d'
});

const db = admin.firestore();

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing collection: ${collectionName}`);

  const batch = db.batch();
  const querySnapshot = await db.collection(collectionName).get();

  if (querySnapshot.empty) {
    console.log(`   ℹ️  Collection ${collectionName} is already empty`);
    return;
  }

  let count = 0;
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
    count++;
  });

  if (count > 0) {
    await batch.commit();
    console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
  }
}

async function clearInconsistentData() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Collections to clear completely for fresh start
    const collectionsToClean = [
      'sports',
      'skills',
      'quizzes',
      'quiz_questions',
      'quiz_attempts',
      'sport_progress',
      'skill_progress',
      'user_progress',
      'user_achievements',
      'analytics_events',
      'user_sessions'
    ];

    for (const collection of collectionsToClean) {
      await clearCollection(collection);
    }

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('📝 All sports, skills, quizzes, and related data have been cleared.');
    console.log('🔄 Ready for seeding with properly structured data.');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the cleanup
clearInconsistentData()
  .then(() => {
    console.log('\n🎉 Cleanup process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
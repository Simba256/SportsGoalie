#!/usr/bin/env node

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with project ID
const app = initializeApp({
  projectId: 'sportscoach-2a84d'
});

const db = getFirestore(app);

async function clearCollection(collectionName) {
  console.log(`🗑️  Clearing collection: ${collectionName}`);

  try {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log(`   ℹ️  Collection ${collectionName} is already empty`);
      return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    if (count > 0) {
      await batch.commit();
      console.log(`   ✅ Deleted ${count} documents from ${collectionName}`);
    }
  } catch (error) {
    console.error(`   ❌ Error clearing ${collectionName}:`, error.message);
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

    console.log(`📋 Will clear ${collectionsToClean.length} collections:`);
    collectionsToClean.forEach(name => console.log(`   - ${name}`));
    console.log('');

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
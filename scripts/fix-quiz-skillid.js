const admin = require('firebase-admin');
const { applicationDefault } = require('firebase-admin/app');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
  });
}

const db = admin.firestore();

async function fixQuizSkillId() {
  try {
    console.log('🔧 Fixing quiz association with basketball-dribbling skill...');

    const quizId = 'pPhNB853W1AUQIv876sm';
    const targetSkillId = 'basketball-dribbling';

    console.log(`📋 Quiz ID: ${quizId}`);
    console.log(`🎯 Target Skill ID: ${targetSkillId}`);

    // Update the quiz with the correct skillId
    const updates = {
      skillId: targetSkillId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('⚡ Updating quiz with skillId...');
    await db.collection('quizzes').doc(quizId).update(updates);

    console.log('✅ Quiz updated successfully!');

    // Verify the update
    const updatedDoc = await db.collection('quizzes').doc(quizId).get();
    const updatedData = updatedDoc.data();

    console.log('\n🎯 Verification:');
    console.log(`Final skillId: ${updatedData.skillId}`);
    console.log(`Final sportId: ${updatedData.sportId}`);
    console.log(`Quiz title: ${updatedData.title}`);

    console.log('\n🎉 Quiz association fixed successfully!');
    console.log('The "Take Quiz" button should now work for basketball dribbling skill.');

  } catch (error) {
    console.error('❌ Error fixing quiz association:', error);
  } finally {
    console.log('\n✨ Script completed.');
  }
}

// Run the script if called directly
if (require.main === module) {
  fixQuizSkillId().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixQuizSkillId };
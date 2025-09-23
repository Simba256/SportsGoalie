const admin = require('firebase-admin');
const { applicationDefault } = require('firebase-admin/app');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: applicationDefault(),
  });
}

const db = admin.firestore();

async function fixQuizAssociation() {
  try {
    console.log('🔍 Searching for Basketball Dribbling quiz...');

    // Find the quiz I created with title "Basketball Dribbling Fundamentals"
    const quizzesSnapshot = await db.collection('quizzes')
      .where('title', '==', 'Basketball Dribbling Fundamentals')
      .get();

    if (quizzesSnapshot.empty) {
      console.log('❌ No quiz found with title "Basketball Dribbling Fundamentals"');

      // Let's check for any recent quiz
      console.log('🔍 Looking for recent quizzes...');
      const recentQuizzes = await db.collection('quizzes')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      console.log('Recent quizzes:');
      recentQuizzes.forEach(doc => {
        const data = doc.data();
        console.log(`- ${doc.id}: "${data.title}" (skillId: ${data.skillId || 'none'})`);
      });
      return;
    }

    const quizDoc = quizzesSnapshot.docs[0];
    const quizData = quizDoc.data();

    console.log(`✅ Found quiz: "${quizData.title}" (ID: ${quizDoc.id})`);
    console.log(`Current skillId: ${quizData.skillId || 'none'}`);
    console.log(`Current sportId: ${quizData.sportId || 'none'}`);

    // Update the quiz with the correct skill and sport IDs
    const updates = {
      skillId: 'basketball-dribbling',
      sportId: 'basketball',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    console.log('🔧 Updating quiz with correct associations...');
    await db.collection('quizzes').doc(quizDoc.id).update(updates);

    console.log('✅ Quiz updated successfully!');
    console.log(`New skillId: ${updates.skillId}`);
    console.log(`New sportId: ${updates.sportId}`);

    // Verify the update
    const updatedDoc = await db.collection('quizzes').doc(quizDoc.id).get();
    const updatedData = updatedDoc.data();

    console.log('\n🎯 Verification:');
    console.log(`Final skillId: ${updatedData.skillId}`);
    console.log(`Final sportId: ${updatedData.sportId}`);

    console.log('\n🎉 Quiz association fixed successfully!');
    console.log('The "Take Quiz" button should now work for basketball dribbling skill.');

  } catch (error) {
    console.error('❌ Error fixing quiz association:', error);
  } finally {
    // Don't call process.exit() in case this is being imported
    console.log('\n✨ Script completed.');
  }
}

// Run the script if called directly
if (require.main === module) {
  fixQuizAssociation().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

module.exports = { fixQuizAssociation };
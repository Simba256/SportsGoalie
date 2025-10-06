// Debug script to check quiz data
// Run this in browser console on the skill page

const skillId = 'F4gi4Rvnm8apaa7IeimV';

console.log('🔍 Debugging Quiz Detection');
console.log('Skill ID:', skillId);
console.log('---');

// Check if quizService is available
if (typeof quizService !== 'undefined') {
  quizService.getQuizzesBySkill(skillId).then(result => {
    console.log('📊 Quiz Query Result:', result);
    if (result.success && result.data.items.length > 0) {
      console.log('✅ Found quizzes:', result.data.items);
      result.data.items.forEach(quiz => {
        console.log('Quiz:', {
          id: quiz.id,
          title: quiz.title,
          skillId: quiz.skillId,
          isActive: quiz.isActive,
          isPublished: quiz.isPublished
        });
      });
    } else {
      console.log('❌ No quizzes found for this skill');
      console.log('Checking ALL quizzes for this skill (including inactive)...');

      // Manual Firestore query to find ALL quizzes
      const db = firebase.firestore();
      db.collection('quizzes')
        .where('skillId', '==', skillId)
        .get()
        .then(snapshot => {
          console.log(`Found ${snapshot.size} total quizzes (active + inactive):`);
          snapshot.forEach(doc => {
            const quiz = doc.data();
            console.log({
              id: doc.id,
              title: quiz.title,
              skillId: quiz.skillId,
              isActive: quiz.isActive,
              isPublished: quiz.isPublished,
              '⚠️ Problem?': !quiz.isActive ? 'Quiz is INACTIVE' : !quiz.isPublished ? 'Quiz is UNPUBLISHED' : 'Should be visible'
            });
          });
        });
    }
  });
} else {
  console.log('❌ quizService not available in console');
  console.log('Please run this on the skill page');
}

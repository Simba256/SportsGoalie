// Simple script to create a quiz directly in the database with correct skill association
// This script simulates what the web interface should do

console.log('🎯 Creating basketball dribbling quiz with correct skill association...');

const quizData = {
  title: 'Basketball Dribbling Skills Test',
  description: 'Test your knowledge of basketball dribbling techniques and fundamentals',
  instructions: 'Answer each question to the best of your ability. This quiz covers basic dribbling skills.',
  category: 'Skills Assessment',
  sportId: 'basketball',
  skillId: 'basketball-dribbling',
  difficulty: 'medium',
  estimatedDuration: 10,
  isActive: true,
  isPublished: true,
  tags: ['basketball', 'dribbling', 'fundamentals'],
  questions: [
    {
      id: `q_${Date.now()}_1`,
      type: 'multiple-choice',
      title: 'Basketball Dribbling Fundamentals',
      content: 'What is the most important aspect of proper dribbling technique?',
      options: [
        {
          id: 'opt1',
          text: 'Keeping your head up to see the court',
          isCorrect: true,
          explanation: 'Correct! Keeping your head up allows you to see teammates, opponents, and opportunities.',
          order: 0
        },
        {
          id: 'opt2',
          text: 'Dribbling as fast as possible',
          isCorrect: false,
          explanation: 'Incorrect. Speed without control leads to turnovers.',
          order: 1
        },
        {
          id: 'opt3',
          text: 'Using only your dominant hand',
          isCorrect: false,
          explanation: 'Incorrect. You should be able to dribble with both hands.',
          order: 2
        }
      ],
      points: 10,
      difficulty: 'medium',
      order: 0,
      isRequired: true,
      allowMultiple: false,
      shuffleOptions: true,
      explanation: 'Proper court vision is fundamental to effective ball handling and basketball success.'
    }
  ],
  settings: {
    timeLimit: 10,
    shuffleQuestions: false,
    showProgressBar: true,
    allowReview: true,
    allowBacktrack: true,
    passingScore: 70,
    maxAttempts: 3,
    showCorrectAnswers: true,
    showExplanations: true,
    showScoreImmediately: true,
    requireAllQuestions: true
  },
  metadata: {
    totalQuestions: 1,
    totalPoints: 10,
    averageScore: 0,
    completionRate: 0,
    averageDuration: 10,
    totalAttempts: 0,
    ratings: {
      average: 0,
      count: 0
    }
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'admin'
};

// Print the quiz data for verification
console.log('📋 Quiz data prepared:');
console.log(`- Title: ${quizData.title}`);
console.log(`- Sport ID: ${quizData.sportId}`);
console.log(`- Skill ID: ${quizData.skillId}`);
console.log(`- Questions: ${quizData.questions.length}`);
console.log(`- Active: ${quizData.isActive}`);
console.log(`- Published: ${quizData.isPublished}`);

console.log('\n✅ Quiz data is ready for database insertion.');
console.log('This quiz should be discoverable by skillId "basketball-dribbling"');

// Export the data for use in other scripts
module.exports = { quizData };
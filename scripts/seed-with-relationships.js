#!/usr/bin/env node

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK with project ID
const app = initializeApp({
  projectId: 'sportscoach-2a84d'
});

const db = getFirestore(app);

// Create proper seed data with mandatory relationships
const seedData = {
  sports: [
    {
      name: 'Basketball',
      description: 'Learn basketball fundamentals including shooting, dribbling, and game strategy',
      icon: '🏀',
      color: '#FF7F00',
      category: 'team-sports',
      difficulty: 'beginner',
      estimatedTimeToComplete: 180,
      skillsCount: 0, // Will be updated as skills are added
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      tags: ['team', 'indoor', 'ball-game', 'competitive'],
      prerequisites: [],
      isActive: true,
      isFeatured: true,
      order: 1,
    },
    {
      name: 'Soccer',
      description: 'Master soccer skills from basic ball control to advanced techniques',
      icon: '⚽',
      color: '#00AA00',
      category: 'team-sports',
      difficulty: 'beginner',
      estimatedTimeToComplete: 240,
      skillsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      tags: ['team', 'outdoor', 'ball-game', 'endurance'],
      prerequisites: [],
      isActive: true,
      isFeatured: true,
      order: 2,
    },
    {
      name: 'Tennis',
      description: 'Learn tennis from grip fundamentals to match strategy',
      icon: '🎾',
      color: '#FFFF00',
      category: 'racket-sports',
      difficulty: 'intermediate',
      estimatedTimeToComplete: 200,
      skillsCount: 0,
      imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
      tags: ['individual', 'outdoor', 'racket', 'precision'],
      prerequisites: [],
      isActive: true,
      isFeatured: false,
      order: 3,
    }
  ],
  skills: [
    // Basketball Skills
    {
      sportName: 'Basketball',
      name: 'Basic Shooting Technique',
      description: 'Learn proper shooting form, stance, and follow-through for consistent basketball shots',
      difficulty: 'beginner',
      estimatedTimeToComplete: 45,
      content: '<h2>Basic Shooting Technique</h2><p>Master the fundamentals of basketball shooting including proper stance, grip, and follow-through.</p>',
      externalResources: [],
      learningObjectives: [
        'Master proper shooting stance',
        'Develop consistent follow-through',
        'Understand arc and release point',
        'Practice shooting rhythm'
      ],
      tags: ['shooting', 'fundamentals', 'technique'],
      hasVideo: true,
      hasQuiz: true,
      isActive: true,
      order: 1,
      prerequisites: []
    },
    {
      sportName: 'Basketball',
      name: 'Ball Handling Fundamentals',
      description: 'Develop essential dribbling skills and ball control techniques',
      difficulty: 'beginner',
      estimatedTimeToComplete: 40,
      content: '<h2>Ball Handling Fundamentals</h2><p>Learn essential dribbling techniques for better ball control on the court.</p>',
      externalResources: [],
      learningObjectives: [
        'Master basic dribbling motions',
        'Develop hand-eye coordination',
        'Learn protective dribbling',
        'Practice change of pace'
      ],
      tags: ['dribbling', 'ball-control', 'fundamentals'],
      hasVideo: true,
      hasQuiz: true,
      isActive: true,
      order: 2,
      prerequisites: []
    },
    // Soccer Skills
    {
      sportName: 'Soccer',
      name: 'Ball Control Basics',
      description: 'Master fundamental ball control techniques including first touch and close control',
      difficulty: 'beginner',
      estimatedTimeToComplete: 35,
      content: '<h2>Ball Control Basics</h2><p>Learn essential ball control skills that form the foundation of soccer technique.</p>',
      externalResources: [],
      learningObjectives: [
        'Develop soft first touch',
        'Master close ball control',
        'Learn juggling techniques',
        'Practice receiving with both feet'
      ],
      tags: ['ball-control', 'touch', 'fundamentals'],
      hasVideo: true,
      hasQuiz: true,
      isActive: true,
      order: 1,
      prerequisites: []
    },
    {
      sportName: 'Soccer',
      name: 'Basic Passing Techniques',
      description: 'Learn accurate short and medium-range passing techniques',
      difficulty: 'beginner',
      estimatedTimeToComplete: 40,
      content: '<h2>Basic Passing Techniques</h2><p>Master the fundamentals of accurate passing in soccer.</p>',
      externalResources: [],
      learningObjectives: [
        'Master inside foot passing',
        'Develop passing accuracy',
        'Learn weight of pass',
        'Practice one-touch passing'
      ],
      tags: ['passing', 'accuracy', 'fundamentals'],
      hasVideo: true,
      hasQuiz: true,
      isActive: true,
      order: 2,
      prerequisites: []
    },
    // Tennis Skills
    {
      sportName: 'Tennis',
      name: 'Grip Fundamentals',
      description: 'Learn proper tennis grips for forehand, backhand, and serve',
      difficulty: 'beginner',
      estimatedTimeToComplete: 30,
      content: '<h2>Grip Fundamentals</h2><p>Understanding proper grip is essential for all tennis strokes.</p>',
      externalResources: [],
      learningObjectives: [
        'Master eastern forehand grip',
        'Learn two-handed backhand grip',
        'Understand continental grip for serves',
        'Practice grip changes'
      ],
      tags: ['grip', 'fundamentals', 'technique'],
      hasVideo: true,
      hasQuiz: true,
      isActive: true,
      order: 1,
      prerequisites: []
    }
  ],
  quizzes: [
    // Basketball Quizzes
    {
      sportName: 'Basketball',
      skillName: 'Basic Shooting Technique',
      title: 'Basketball Shooting Fundamentals Quiz',
      description: 'Test your knowledge of basic basketball shooting technique',
      difficulty: 'beginner',
      estimatedDuration: 10,
      tags: ['shooting', 'fundamentals'],
      isActive: true,
      isPublished: true,
      category: 'skills-assessment',
      instructions: 'Answer all questions about basketball shooting fundamentals. You need 70% to pass.',
      settings: {
        timeLimit: 15,
        shuffleQuestions: false,
        showProgressBar: true,
        allowReview: true,
        allowBacktrack: true,
        passingScore: 70,
        maxAttempts: 3,
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        requireAllQuestions: true,
      },
      questions: [
        {
          type: 'multiple-choice',
          title: 'Shooting Stance',
          content: 'What is the correct stance for shooting a basketball?',
          points: 10,
          difficulty: 'beginner',
          explanation: 'A balanced stance with feet shoulder-width apart provides the best foundation for accurate shooting.',
          timeLimit: 30,
          order: 1,
          tags: ['stance', 'fundamentals'],
          isRequired: true,
          options: [
            { id: '1', text: 'Feet shoulder-width apart, balanced stance', isCorrect: true, explanation: 'Correct! This provides stability and balance.', order: 1 },
            { id: '2', text: 'Feet together, narrow stance', isCorrect: false, explanation: 'Too narrow - lacks stability.', order: 2 },
            { id: '3', text: 'Wide stance with feet far apart', isCorrect: false, explanation: 'Too wide - reduces mobility and balance.', order: 3 },
            { id: '4', text: 'One foot forward, staggered stance', isCorrect: false, explanation: 'Creates imbalance for shooting.', order: 4 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        },
        {
          type: 'true-false',
          title: 'Follow-Through',
          content: 'The follow-through should end with your wrist snapping downward and fingers pointing toward the basket.',
          points: 10,
          difficulty: 'beginner',
          explanation: 'True! The proper follow-through includes a downward wrist snap with fingers pointing at the basket.',
          timeLimit: 20,
          order: 2,
          tags: ['follow-through', 'technique'],
          isRequired: true,
          correctAnswer: true,
          trueExplanation: 'Correct! This follow-through creates proper arc and rotation.',
          falseExplanation: 'Incorrect. The wrist should snap down with fingers pointing at the basket.'
        }
      ]
    },
    {
      sportName: 'Basketball',
      skillName: 'Ball Handling Fundamentals',
      title: 'Basketball Dribbling Skills Quiz',
      description: 'Test your understanding of basketball ball handling fundamentals',
      difficulty: 'beginner',
      estimatedDuration: 8,
      tags: ['dribbling', 'ball-handling'],
      isActive: true,
      isPublished: true,
      category: 'skills-assessment',
      instructions: 'Test your knowledge of basketball dribbling fundamentals.',
      settings: {
        timeLimit: 12,
        shuffleQuestions: false,
        showProgressBar: true,
        allowReview: true,
        allowBacktrack: true,
        passingScore: 70,
        maxAttempts: 3,
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        requireAllQuestions: true,
      },
      questions: [
        {
          type: 'multiple-choice',
          title: 'Dribbling Hand Position',
          content: 'Where should your hand be positioned when dribbling the basketball?',
          points: 10,
          difficulty: 'beginner',
          explanation: 'The hand should be on top of the ball with fingers spread for better control.',
          timeLimit: 25,
          order: 1,
          tags: ['hand-position', 'control'],
          isRequired: true,
          options: [
            { id: '1', text: 'On top of the ball with fingers spread', isCorrect: true, explanation: 'Correct! This provides maximum control.', order: 1 },
            { id: '2', text: 'On the side of the ball', isCorrect: false, explanation: 'This reduces control and can cause turnovers.', order: 2 },
            { id: '3', text: 'Under the ball', isCorrect: false, explanation: 'This is a carrying violation.', order: 3 },
            { id: '4', text: 'Doesn\'t matter as long as you dribble', isCorrect: false, explanation: 'Hand position is crucial for control.', order: 4 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        }
      ]
    },
    // Soccer Quizzes
    {
      sportName: 'Soccer',
      skillName: 'Ball Control Basics',
      title: 'Soccer Ball Control Quiz',
      description: 'Test your knowledge of soccer ball control fundamentals',
      difficulty: 'beginner',
      estimatedDuration: 10,
      tags: ['ball-control', 'fundamentals'],
      isActive: true,
      isPublished: true,
      category: 'skills-assessment',
      instructions: 'Answer questions about soccer ball control techniques.',
      settings: {
        timeLimit: 15,
        shuffleQuestions: false,
        showProgressBar: true,
        allowReview: true,
        allowBacktrack: true,
        passingScore: 70,
        maxAttempts: 3,
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        requireAllQuestions: true,
      },
      questions: [
        {
          type: 'multiple-choice',
          title: 'First Touch Technique',
          content: 'What is the key to a good first touch in soccer?',
          points: 10,
          difficulty: 'beginner',
          explanation: 'A soft, cushioned touch that brings the ball under control is essential.',
          timeLimit: 30,
          order: 1,
          tags: ['first-touch', 'control'],
          isRequired: true,
          options: [
            { id: '1', text: 'Soft, cushioned contact that brings ball under control', isCorrect: true, explanation: 'Correct! This maintains possession effectively.', order: 1 },
            { id: '2', text: 'Hard contact to stop the ball quickly', isCorrect: false, explanation: 'Too hard - ball will bounce away.', order: 2 },
            { id: '3', text: 'Let the ball bounce first', isCorrect: false, explanation: 'This reduces control and wastes time.', order: 3 },
            { id: '4', text: 'Always use your strongest foot', isCorrect: false, explanation: 'Use the most appropriate foot for the situation.', order: 4 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        }
      ]
    },
    // Tennis Quiz
    {
      sportName: 'Tennis',
      skillName: 'Grip Fundamentals',
      title: 'Tennis Grip Fundamentals Quiz',
      description: 'Test your understanding of proper tennis grips',
      difficulty: 'beginner',
      estimatedDuration: 8,
      tags: ['grip', 'fundamentals'],
      isActive: true,
      isPublished: true,
      category: 'skills-assessment',
      instructions: 'Answer questions about tennis grip fundamentals.',
      settings: {
        timeLimit: 12,
        shuffleQuestions: false,
        showProgressBar: true,
        allowReview: true,
        allowBacktrack: true,
        passingScore: 70,
        maxAttempts: 3,
        showCorrectAnswers: true,
        showExplanations: true,
        showScoreImmediately: true,
        requireAllQuestions: true,
      },
      questions: [
        {
          type: 'multiple-choice',
          title: 'Forehand Grip',
          content: 'Which grip is most commonly used for forehand shots in tennis?',
          points: 10,
          difficulty: 'beginner',
          explanation: 'The eastern forehand grip is the most common and versatile for beginners.',
          timeLimit: 25,
          order: 1,
          tags: ['forehand', 'grip-type'],
          isRequired: true,
          options: [
            { id: '1', text: 'Eastern forehand grip', isCorrect: true, explanation: 'Correct! This is the standard grip for most players.', order: 1 },
            { id: '2', text: 'Continental grip', isCorrect: false, explanation: 'Better for serves and volleys, not forehand.', order: 2 },
            { id: '3', text: 'Western grip', isCorrect: false, explanation: 'Too extreme for beginners.', order: 3 },
            { id: '4', text: 'Semi-western grip', isCorrect: false, explanation: 'Good but not the most common.', order: 4 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        }
      ]
    }
  ]
};

async function createSeedData() {
  console.log('🌱 Starting comprehensive seed data creation with mandatory relationships...\n');

  try {
    const sportIds = {};
    const skillIds = {};

    // Step 1: Create Sports
    console.log('📋 Creating Sports...');
    for (const sportData of seedData.sports) {
      const sport = {
        ...sportData,
        metadata: {
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: sportData.estimatedTimeToComplete
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: 'seed-script'
      };

      const docRef = await db.collection('sports').add(sport);
      sportIds[sportData.name] = docRef.id;
      console.log(`   ✅ Created sport: ${sportData.name} (${docRef.id})`);
    }

    // Step 2: Create Skills (with mandatory sportId)
    console.log('\n🎯 Creating Skills...');
    for (const skillData of seedData.skills) {
      const sportId = sportIds[skillData.sportName];
      if (!sportId) {
        console.error(`   ❌ Sport not found for skill: ${skillData.name}`);
        continue;
      }

      const skill = {
        ...skillData,
        sportId, // MANDATORY relationship
        metadata: {
          totalCompletions: 0,
          averageCompletionTime: skillData.estimatedTimeToComplete,
          averageRating: 0,
          totalRatings: 0,
          difficulty: skillData.difficulty
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: 'seed-script'
      };

      // Remove sportName as it's not part of the schema
      delete skill.sportName;

      const docRef = await db.collection('skills').add(skill);
      skillIds[`${skillData.sportName}::${skillData.name}`] = docRef.id;
      console.log(`   ✅ Created skill: ${skillData.name} for ${skillData.sportName} (${docRef.id})`);

      // Update sport's skillsCount
      await db.collection('sports').doc(sportId).update({
        skillsCount: FieldValue.increment(1)
      });
    }

    // Step 3: Create Quizzes (with mandatory sportId AND skillId)
    console.log('\n❓ Creating Quizzes...');
    for (const quizData of seedData.quizzes) {
      const sportId = sportIds[quizData.sportName];
      const skillId = skillIds[`${quizData.sportName}::${quizData.skillName}`];

      if (!sportId) {
        console.error(`   ❌ Sport not found for quiz: ${quizData.title}`);
        continue;
      }

      if (!skillId) {
        console.error(`   ❌ Skill not found for quiz: ${quizData.title}`);
        continue;
      }

      const quiz = {
        ...quizData,
        sportId, // MANDATORY relationship
        skillId, // MANDATORY relationship
        metadata: {
          totalQuestions: quizData.questions.length,
          totalPoints: quizData.questions.reduce((sum, q) => sum + q.points, 0),
          averageScore: 0,
          completionRate: 0,
          averageDuration: quizData.estimatedDuration,
          totalAttempts: 0,
          ratings: {
            average: 0,
            count: 0
          }
        },
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        createdBy: 'seed-script'
      };

      // Remove sportName and skillName as they're not part of the schema
      delete quiz.sportName;
      delete quiz.skillName;

      const docRef = await db.collection('quizzes').add(quiz);
      console.log(`   ✅ Created quiz: ${quizData.title} (${docRef.id})`);
      console.log(`      🔗 Linked to sport: ${quizData.sportName} (${sportId})`);
      console.log(`      🔗 Linked to skill: ${quizData.skillName} (${skillId})`);
    }

    console.log('\n✅ Seed data creation completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   🏈 Sports created: ${Object.keys(sportIds).length}`);
    console.log(`   🎯 Skills created: ${Object.keys(skillIds).length}`);
    console.log(`   ❓ Quizzes created: ${seedData.quizzes.length}`);
    console.log('\n🔄 All relationships properly established:');
    console.log('   ✅ Every skill is associated with a sport');
    console.log('   ✅ Every quiz is associated with both a sport AND a skill');
    console.log('   ✅ All data follows the new mandatory relationship rules');

  } catch (error) {
    console.error('❌ Error during seed data creation:', error);
    process.exit(1);
  }
}

// Run the seed script
createSeedData()
  .then(() => {
    console.log('\n🎉 Seeding process completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
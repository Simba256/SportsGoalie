// Script to add test data via browser console when on the SportsCoach app
// This bypasses the authentication issue by using the app's own Firebase instance

// Run this in browser console when logged in as admin to sportscoach app

const testData = {
  sports: [
    {
      name: 'Basketball',
      description: 'Learn basketball fundamentals including shooting, dribbling, and game strategy',
      icon: '🏀',
      color: '#FF7F00',
      category: 'team-sports',
      difficulty: 'beginner',
      estimatedTimeToComplete: 180,
      skillsCount: 0,
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
    }
  ],
  skills: [
    {
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
    {
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
    }
  ]
};

async function addTestDataViaApp() {
  console.log('🌱 Adding test data via app...');

  try {
    // First, add sports
    const sportIds = {};
    for (const sport of testData.sports) {
      const sportData = {
        ...sport,
        metadata: {
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: sport.estimatedTimeToComplete
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-script'
      };

      // Use Firebase service from the app
      const docRef = await window.firebaseService.addDocument('sports', sportData);
      sportIds[sport.name] = docRef;
      console.log(`✅ Added sport: ${sport.name} (${docRef})`);
    }

    // Then add skills with proper sportId relationships
    const skillIds = {};
    for (let i = 0; i < testData.skills.length; i++) {
      const skill = testData.skills[i];
      const sportName = i < 2 ? 'Basketball' : 'Soccer'; // First 2 skills for Basketball, rest for Soccer
      const sportId = sportIds[sportName];

      const skillData = {
        ...skill,
        sportId, // MANDATORY relationship
        metadata: {
          totalCompletions: 0,
          averageCompletionTime: skill.estimatedTimeToComplete,
          averageRating: 0,
          totalRatings: 0,
          difficulty: skill.difficulty
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'test-script'
      };

      const docRef = await window.firebaseService.addDocument('skills', skillData);
      skillIds[`${sportName}::${skill.name}`] = docRef;
      console.log(`✅ Added skill: ${skill.name} for ${sportName} (${docRef})`);
    }

    // Create some basic quizzes
    const basketballShootingQuiz = {
      sportId: sportIds['Basketball'],
      skillId: skillIds['Basketball::Basic Shooting Technique'],
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
            { id: '2', text: 'Feet together, narrow stance', isCorrect: false, explanation: 'Too narrow - lacks stability.', order: 2 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        }
      ],
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
      createdBy: 'test-script'
    };

    const basketballQuizRef = await window.firebaseService.addDocument('quizzes', basketballShootingQuiz);
    console.log(`✅ Added quiz: Basketball Shooting Fundamentals Quiz (${basketballQuizRef})`);

    const soccerControlQuiz = {
      sportId: sportIds['Soccer'],
      skillId: skillIds['Soccer::Ball Control Basics'],
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
            { id: '2', text: 'Hard contact to stop the ball quickly', isCorrect: false, explanation: 'Too hard - ball will bounce away.', order: 2 }
          ],
          allowMultiple: false,
          shuffleOptions: false
        }
      ],
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
      createdBy: 'test-script'
    };

    const soccerQuizRef = await window.firebaseService.addDocument('quizzes', soccerControlQuiz);
    console.log(`✅ Added quiz: Soccer Ball Control Quiz (${soccerQuizRef})`);

    console.log('\n🎉 Test data successfully added with proper relationships!');
    console.log('\n📊 Summary:');
    console.log(`   🏈 Sports: ${Object.keys(sportIds).length}`);
    console.log(`   🎯 Skills: ${Object.keys(skillIds).length}`);
    console.log(`   ❓ Quizzes: 2`);
    console.log('\n✅ All mandatory relationships properly established!');

  } catch (error) {
    console.error('❌ Error adding test data:', error);
  }
}

// Instructions for use
console.log(`
🚀 Test Data Script Ready!

To use this script:
1. Go to your SportsCoach application in the browser
2. Log in as an admin user
3. Open the browser console (F12)
4. Copy and paste this entire script
5. Run: addTestDataViaApp()

This will create sports, skills, and quizzes with proper mandatory relationships.
`);

// Auto-run if firebaseService is available
if (typeof window !== 'undefined' && window.firebaseService) {
  console.log('🔥 Firebase service detected! Running automatically...');
  addTestDataViaApp();
}
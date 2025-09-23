// Browser Console Script to Fix Authentication Issues
// Run this in the browser console on your SportsCoach app

// First, let's check if we can create a user document manually
async function fixAuthAndCreateTestData() {
  console.log('🔧 Fixing authentication and creating test data...');

  try {
    // Let's check if firebaseService is available
    if (!window.firebaseService) {
      console.error('❌ Firebase service not available. Make sure you\'re on the SportsCoach app.');
      return;
    }

    console.log('✅ Firebase service is available');

    // Create test data first (since we need an admin to create users)
    console.log('\n🌱 Creating test sports data...');

    // Create Basketball sport
    const basketballSport = {
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
      metadata: {
        totalEnrollments: 0,
        totalCompletions: 0,
        averageRating: 0,
        totalRatings: 0,
        averageCompletionTime: 180
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-script'
    };

    const basketballId = await window.firebaseService.addDocument('sports', basketballSport);
    console.log(`✅ Created Basketball sport: ${basketballId}`);

    // Create Soccer sport
    const soccerSport = {
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
      metadata: {
        totalEnrollments: 0,
        totalCompletions: 0,
        averageRating: 0,
        totalRatings: 0,
        averageCompletionTime: 240
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-script'
    };

    const soccerId = await window.firebaseService.addDocument('sports', soccerSport);
    console.log(`✅ Created Soccer sport: ${soccerId}`);

    // Create Basketball skills
    const basketballShootingSkill = {
      sportId: basketballId,
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
      prerequisites: [],
      metadata: {
        totalCompletions: 0,
        averageCompletionTime: 45,
        averageRating: 0,
        totalRatings: 0,
        difficulty: 'beginner'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-script'
    };

    const shootingSkillId = await window.firebaseService.addDocument('skills', basketballShootingSkill);
    console.log(`✅ Created Basketball shooting skill: ${shootingSkillId}`);

    // Create Soccer skill
    const soccerControlSkill = {
      sportId: soccerId,
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
      prerequisites: [],
      metadata: {
        totalCompletions: 0,
        averageCompletionTime: 35,
        averageRating: 0,
        totalRatings: 0,
        difficulty: 'beginner'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'test-script'
    };

    const controlSkillId = await window.firebaseService.addDocument('skills', soccerControlSkill);
    console.log(`✅ Created Soccer control skill: ${controlSkillId}`);

    // Create Basketball quiz
    const basketballQuiz = {
      sportId: basketballId,
      skillId: shootingSkillId,
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
            { id: '3', text: 'Wide stance with feet far apart', isCorrect: false, explanation: 'Too wide - reduces mobility and balance.', order: 3 }
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

    const basketballQuizId = await window.firebaseService.addDocument('quizzes', basketballQuiz);
    console.log(`✅ Created Basketball quiz: ${basketballQuizId}`);

    // Create Soccer quiz
    const soccerQuiz = {
      sportId: soccerId,
      skillId: controlSkillId,
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
            { id: '3', text: 'Let the ball bounce first', isCorrect: false, explanation: 'This reduces control and wastes time.', order: 3 }
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

    const soccerQuizId = await window.firebaseService.addDocument('quizzes', soccerQuiz);
    console.log(`✅ Created Soccer quiz: ${soccerQuizId}`);

    console.log('\n🎉 Test data created successfully with proper relationships!');
    console.log('\n📊 Summary:');
    console.log(`   🏈 Sports: 2 (Basketball, Soccer)`);
    console.log(`   🎯 Skills: 2 (each sport has 1 skill)`);
    console.log(`   ❓ Quizzes: 2 (each skill has 1 quiz)`);
    console.log('\n✅ All mandatory relationships properly established!');
    console.log('\n🔗 Relationship structure:');
    console.log(`   Basketball → Shooting Skill → Shooting Quiz`);
    console.log(`   Soccer → Ball Control Skill → Ball Control Quiz`);

    return {
      sports: { basketball: basketballId, soccer: soccerId },
      skills: { shooting: shootingSkillId, control: controlSkillId },
      quizzes: { basketball: basketballQuizId, soccer: soccerQuizId }
    };

  } catch (error) {
    console.error('❌ Error creating test data:', error);
    console.error('Stack:', error.stack);
  }
}

// Simple auth user creation function
async function createTestUser() {
  console.log('👤 Attempting to create test user...');

  try {
    // Check if we have access to Firebase Auth
    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.error('❌ Firebase auth not available in this context');
      return;
    }

    // Try to sign up with a new test user
    const testEmail = 'testuser@sportscoach.com';
    const testPassword = 'testpass123';

    try {
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(testEmail, testPassword);
      console.log('✅ Created test user:', userCredential.user.email);

      // Create user document in Firestore
      const userDoc = {
        id: userCredential.user.uid,
        email: testEmail,
        displayName: 'Test User',
        role: 'admin', // Make this user admin for testing
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
          firstName: 'Test',
          lastName: 'User',
          sportsInterests: [],
          experienceLevel: 'beginner',
          goals: []
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      await window.firebaseService.addDocument('users', userDoc);
      console.log('✅ Created user document in Firestore');

    } catch (authError) {
      if (authError.code === 'auth/email-already-in-use') {
        console.log('ℹ️  User already exists, trying to sign in...');
        const userCredential = await firebase.auth().signInWithEmailAndPassword(testEmail, testPassword);
        console.log('✅ Signed in existing user:', userCredential.user.email);
      } else {
        throw authError;
      }
    }

  } catch (error) {
    console.error('❌ Error with test user:', error);
  }
}

// Instructions
console.log(`
🚀 Authentication & Data Setup Script

To fix your authentication issue and create test data:

1. Make sure you're on your SportsCoach app (localhost:3000)
2. Open browser console (F12)
3. If you can sign in with any account, do so first
4. Run: fixAuthAndCreateTestData()

If you're completely locked out:
1. Go to Firebase Console > Authentication
2. Delete the problematic user manually
3. Try signing up again with a new email
4. Or run: createTestUser()

This script will create:
- 2 sports (Basketball, Soccer)
- 2 skills (1 for each sport)
- 2 quizzes (1 for each skill)

All with proper mandatory relationships enforced!
`);

// Auto-run if on the app
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('🔍 Detected localhost - ready to fix auth and create data!');
  console.log('Run: fixAuthAndCreateTestData()');
}
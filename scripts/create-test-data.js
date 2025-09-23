#!/usr/bin/env node

// This script creates test data through the Firebase CLI
// Using individual JSON files for each collection

const fs = require('fs');
const path = require('path');

// Create test data with proper relationships
const testData = {
  sports: {
    'basketball': {
      name: 'Basketball',
      description: 'Learn basketball fundamentals including shooting, dribbling, and game strategy',
      icon: '🏀',
      color: '#FF7F00',
      category: 'team-sports',
      difficulty: 'beginner',
      estimatedTimeToComplete: 180,
      skillsCount: 2,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    },
    'soccer': {
      name: 'Soccer',
      description: 'Master soccer skills from basic ball control to advanced techniques',
      icon: '⚽',
      color: '#00AA00',
      category: 'team-sports',
      difficulty: 'beginner',
      estimatedTimeToComplete: 240,
      skillsCount: 2,
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    }
  },
  skills: {
    'basketball-shooting': {
      sportId: 'basketball',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    },
    'basketball-dribbling': {
      sportId: 'basketball',
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
      prerequisites: [],
      metadata: {
        totalCompletions: 0,
        averageCompletionTime: 40,
        averageRating: 0,
        totalRatings: 0,
        difficulty: 'beginner'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    },
    'soccer-ball-control': {
      sportId: 'soccer',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    },
    'soccer-passing': {
      sportId: 'soccer',
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
      prerequisites: [],
      metadata: {
        totalCompletions: 0,
        averageCompletionTime: 40,
        averageRating: 0,
        totalRatings: 0,
        difficulty: 'beginner'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    }
  },
  quizzes: {
    'basketball-shooting-quiz': {
      sportId: 'basketball',
      skillId: 'basketball-shooting',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    },
    'soccer-ball-control-quiz': {
      sportId: 'soccer',
      skillId: 'soccer-ball-control',
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'test-script'
    }
  }
};

function createTestData() {
  console.log('📁 Creating test data files with proper relationships...\n');

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, 'test-data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Write sports data
  const sportsFile = path.join(dataDir, 'sports.json');
  fs.writeFileSync(sportsFile, JSON.stringify(testData.sports, null, 2));
  console.log(`✅ Created sports data: ${sportsFile}`);

  // Write skills data
  const skillsFile = path.join(dataDir, 'skills.json');
  fs.writeFileSync(skillsFile, JSON.stringify(testData.skills, null, 2));
  console.log(`✅ Created skills data: ${skillsFile}`);

  // Write quizzes data
  const quizzesFile = path.join(dataDir, 'quizzes.json');
  fs.writeFileSync(quizzesFile, JSON.stringify(testData.quizzes, null, 2));
  console.log(`✅ Created quizzes data: ${quizzesFile}`);

  console.log('\n📋 Data Summary:');
  console.log(`   🏈 Sports: ${Object.keys(testData.sports).length}`);
  console.log(`   🎯 Skills: ${Object.keys(testData.skills).length}`);
  console.log(`   ❓ Quizzes: ${Object.keys(testData.quizzes).length}`);

  console.log('\n🔗 Relationship Validation:');
  Object.values(testData.skills).forEach(skill => {
    const sport = testData.sports[skill.sportId];
    if (sport) {
      console.log(`   ✅ Skill "${skill.name}" → Sport "${sport.name}"`);
    } else {
      console.log(`   ❌ Skill "${skill.name}" → Invalid sport ID "${skill.sportId}"`);
    }
  });

  Object.values(testData.quizzes).forEach(quiz => {
    const sport = testData.sports[quiz.sportId];
    const skill = testData.skills[quiz.skillId];
    if (sport && skill) {
      console.log(`   ✅ Quiz "${quiz.title}" → Sport "${sport.name}" → Skill "${skill.name}"`);
    } else {
      console.log(`   ❌ Quiz "${quiz.title}" has invalid relationships`);
    }
  });

  console.log('\n📝 Next Steps:');
  console.log('   1. Use Firebase CLI to import this data:');
  console.log(`      firebase firestore:delete --all-collections --force`);
  console.log(`      firebase firestore:import ${dataDir}`);
  console.log('   2. Or use the Firebase console to manually import collections');
  console.log('   3. Test the relationships in your application');
}

createTestData();
console.log('\n🎉 Test data creation completed!');
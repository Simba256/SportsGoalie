#!/usr/bin/env node

/**
 * Firebase Admin SDK Data seeder script
 * Uses service account credentials to populate Firebase with real data
 * Run with: node scripts/seed-data-admin.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with service account
const serviceAccount = require('/media/basim/New Volume1/Basim/Saad Bhai/Chamelion Ideas/SportsCoach/sportscoach-2a84d-firebase-adminsdk-fbsvc-fd58b490c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'sportscoach-2a84d'
});

const db = admin.firestore();

// Sample sports data
const sampleSports = [
  {
    id: 'basketball',
    name: 'Basketball',
    description: 'Learn basketball fundamentals and advanced techniques including shooting, dribbling, and team strategies.',
    icon: '🏀',
    color: '#FF6B35',
    category: 'team-sports',
    difficulty: 'intermediate',
    estimatedTimeToComplete: 120,
    skillsCount: 8,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    tags: ['team', 'indoor', 'ball-game', 'cardio'],
    prerequisites: [],
    isActive: true,
    isFeatured: true,
    order: 1,
    metadata: {
      totalEnrollments: 245,
      totalCompletions: 123,
      averageRating: 4.6,
      totalRatings: 178,
      averageCompletionTime: 98,
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    description: 'Master tennis techniques from basic strokes to advanced match strategies and court positioning.',
    icon: '🎾',
    color: '#4CAF50',
    category: 'individual-sports',
    difficulty: 'beginner',
    estimatedTimeToComplete: 80,
    skillsCount: 6,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    tags: ['individual', 'outdoor', 'racket', 'endurance'],
    prerequisites: [],
    isActive: true,
    isFeatured: true,
    order: 2,
    metadata: {
      totalEnrollments: 189,
      totalCompletions: 156,
      averageRating: 4.4,
      totalRatings: 167,
      averageCompletionTime: 75,
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    description: 'Comprehensive swimming program covering all four competitive strokes and water safety techniques.',
    icon: '🏊‍♂️',
    color: '#2196F3',
    category: 'individual-sports',
    difficulty: 'beginner',
    estimatedTimeToComplete: 100,
    skillsCount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
    tags: ['individual', 'water', 'full-body', 'cardio'],
    prerequisites: [],
    isActive: true,
    isFeatured: false,
    order: 3,
    metadata: {
      totalEnrollments: 167,
      totalCompletions: 134,
      averageRating: 4.7,
      totalRatings: 145,
      averageCompletionTime: 92,
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
  {
    id: 'soccer',
    name: 'Soccer (Football)',
    description: 'Master the beautiful game with comprehensive training in ball control, passing, shooting, and tactical awareness.',
    icon: '⚽',
    color: '#8BC34A',
    category: 'team-sports',
    difficulty: 'intermediate',
    estimatedTimeToComplete: 150,
    skillsCount: 12,
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800',
    tags: ['team', 'outdoor', 'ball-game', 'endurance'],
    prerequisites: [],
    isActive: true,
    isFeatured: true,
    order: 4,
    metadata: {
      totalEnrollments: 312,
      totalCompletions: 198,
      averageRating: 4.5,
      totalRatings: 267,
      averageCompletionTime: 142,
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
];

// Sample skills data for Basketball
const basketballSkills = [
  {
    id: 'basketball-dribbling',
    sportId: 'basketball',
    name: 'Basic Dribbling',
    description: 'Master fundamental ball-handling skills and control techniques.',
    difficulty: 'beginner',
    estimatedTimeToComplete: 30,
    content: `
      <h2>Basic Dribbling Fundamentals</h2>
      <p>Learn the essential ball-handling skills that form the foundation of basketball.</p>

      <h3>Key Techniques:</h3>
      <ul>
        <li>Proper hand position and posture</li>
        <li>Stationary dribbling with both hands</li>
        <li>Moving while maintaining ball control</li>
        <li>Changing pace and direction</li>
      </ul>

      <h3>Practice Drills:</h3>
      <ol>
        <li>Stationary dribbling - 2 minutes each hand</li>
        <li>Walking while dribbling - 10 steps forward/backward</li>
        <li>Figure-8 dribbling around legs</li>
        <li>Low to high dribbling variations</li>
      </ol>
    `,
    externalResources: [
      {
        title: 'NBA Dribbling Fundamentals',
        url: 'https://www.youtube.com/watch?v=dribbling-basics',
        type: 'video'
      }
    ],
    media: {
      videoUrl: 'https://example.com/basketball-dribbling.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400'
    },
    prerequisites: [],
    learningObjectives: [
      'Master ball control with both hands',
      'Develop hand-eye coordination',
      'Learn proper dribbling posture',
      'Execute basic dribbling moves'
    ],
    tags: ['fundamentals', 'ball-handling', 'basics'],
    hasVideo: true,
    hasQuiz: true,
    isActive: true,
    order: 1,
    metadata: {
      totalCompletions: 156,
      averageCompletionTime: 28,
      averageRating: 4.5,
      totalRatings: 134,
      difficulty: 'beginner',
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
  {
    id: 'basketball-shooting',
    sportId: 'basketball',
    name: 'Shooting Fundamentals',
    description: 'Learn proper shooting form and techniques for consistent accuracy.',
    difficulty: 'intermediate',
    estimatedTimeToComplete: 45,
    content: `
      <h2>Shooting Fundamentals</h2>
      <p>Develop consistent shooting form and accuracy through proper technique.</p>

      <h3>Shooting Form:</h3>
      <ul>
        <li>Proper stance and balance</li>
        <li>Hand placement and follow-through</li>
        <li>Consistent shooting motion</li>
        <li>Target focus and arc</li>
      </ul>

      <h3>Shot Types:</h3>
      <ol>
        <li>Free throws</li>
        <li>Close-range shots</li>
        <li>Mid-range jumpers</li>
        <li>Three-point shots</li>
      </ol>
    `,
    externalResources: [],
    media: {
      videoUrl: 'https://example.com/basketball-shooting.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400'
    },
    prerequisites: ['basketball-dribbling'],
    learningObjectives: [
      'Perfect shooting form and technique',
      'Increase shooting accuracy',
      'Learn different shot types',
      'Develop muscle memory'
    ],
    tags: ['shooting', 'accuracy', 'form'],
    hasVideo: true,
    hasQuiz: false,
    isActive: true,
    order: 2,
    metadata: {
      totalCompletions: 89,
      averageCompletionTime: 42,
      averageRating: 4.7,
      totalRatings: 76,
      difficulty: 'intermediate',
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  }
];

// Sample skills data for Tennis
const tennisSkills = [
  {
    id: 'tennis-forehand',
    sportId: 'tennis',
    name: 'Forehand Technique',
    description: 'Master the fundamental forehand stroke with proper form and power.',
    difficulty: 'beginner',
    estimatedTimeToComplete: 40,
    content: `
      <h2>Forehand Fundamentals</h2>
      <p>Learn the most important stroke in tennis with proper technique and timing.</p>

      <h3>Key Elements:</h3>
      <ul>
        <li>Proper grip and stance</li>
        <li>Backswing preparation</li>
        <li>Contact point and follow-through</li>
        <li>Footwork and positioning</li>
      </ul>
    `,
    externalResources: [],
    media: {
      videoUrl: 'https://example.com/tennis-forehand.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400'
    },
    prerequisites: [],
    learningObjectives: [
      'Master forehand grip and stance',
      'Develop consistent stroke mechanics',
      'Improve timing and coordination',
      'Generate power and accuracy'
    ],
    tags: ['forehand', 'technique', 'basics'],
    hasVideo: true,
    hasQuiz: true,
    isActive: true,
    order: 1,
    metadata: {
      totalCompletions: 123,
      averageCompletionTime: 38,
      averageRating: 4.3,
      totalRatings: 109,
      difficulty: 'beginner',
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
  {
    id: 'tennis-backhand',
    sportId: 'tennis',
    name: 'Backhand Technique',
    description: 'Develop a powerful and consistent backhand stroke.',
    difficulty: 'intermediate',
    estimatedTimeToComplete: 50,
    content: `
      <h2>Backhand Mastery</h2>
      <p>Learn both one-handed and two-handed backhand techniques.</p>

      <h3>Technique Options:</h3>
      <ul>
        <li>One-handed backhand</li>
        <li>Two-handed backhand</li>
        <li>Slice backhand</li>
        <li>Topspin backhand</li>
      </ul>
    `,
    externalResources: [],
    media: {
      videoUrl: 'https://example.com/tennis-backhand.mp4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
    },
    prerequisites: ['tennis-forehand'],
    learningObjectives: [
      'Choose between one or two-handed backhand',
      'Master backhand grip and preparation',
      'Generate power and spin',
      'Improve court coverage'
    ],
    tags: ['backhand', 'technique', 'advanced'],
    hasVideo: true,
    hasQuiz: true,
    isActive: true,
    order: 2,
    metadata: {
      totalCompletions: 67,
      averageCompletionTime: 47,
      averageRating: 4.6,
      totalRatings: 58,
      difficulty: 'intermediate',
    },
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
    createdBy: 'admin',
  },
];

async function seedData() {
  try {
    console.log('🔥 Starting Firebase Admin seeding...');

    // Add sports data using Admin SDK
    console.log('📊 Adding sports data to Firebase...');
    const batch = db.batch();

    for (const sport of sampleSports) {
      const { id, ...sportData } = sport;
      const sportRef = db.collection('sports').doc(id);
      batch.set(sportRef, sportData);
      console.log(`✅ Queued sport: ${sport.name}`);
    }

    // Add basketball skills
    console.log('🏀 Adding basketball skills...');
    for (const skill of basketballSkills) {
      const { id, ...skillData } = skill;
      const skillRef = db.collection('skills').doc(id);
      batch.set(skillRef, skillData);
      console.log(`✅ Queued skill: ${skill.name}`);
    }

    // Add tennis skills
    console.log('🎾 Adding tennis skills...');
    for (const skill of tennisSkills) {
      const { id, ...skillData } = skill;
      const skillRef = db.collection('skills').doc(id);
      batch.set(skillRef, skillData);
      console.log(`✅ Queued skill: ${skill.name}`);
    }

    // Commit all changes in a single batch
    console.log('💾 Committing all data to Firebase...');
    await batch.commit();

    console.log('🎉 Firebase seeding completed successfully!');
    console.log(`📈 Added ${sampleSports.length} sports and ${basketballSkills.length + tennisSkills.length} skills`);

    // Verify data was written
    console.log('🔍 Verifying data...');
    const sportsSnapshot = await db.collection('sports').get();
    const skillsSnapshot = await db.collection('skills').get();

    console.log(`✅ Verified: ${sportsSnapshot.size} sports in database`);
    console.log(`✅ Verified: ${skillsSnapshot.size} skills in database`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seeder
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✨ Admin seeding process finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
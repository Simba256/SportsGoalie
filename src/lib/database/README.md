# Database Services Documentation

This directory contains the comprehensive database layer for SportsCoach V3, built on Firebase Firestore. The services provide a robust, scalable, and type-safe interface for all database operations.

## 📁 Directory Structure

```
src/lib/database/
├── index.ts                    # Main exports and DatabaseManager
├── base.service.ts            # Base database service with common operations
├── services/                  # Specialized service implementations
│   ├── sports.service.ts      # Sports and skills management
│   ├── quiz.service.ts        # Quiz and assessment management
│   └── user.service.ts        # User and progress management
├── utils/                     # Database utilities and helpers
│   ├── sport-helpers.ts       # Sports-specific utility functions
│   └── error-recovery.ts      # Error handling and recovery strategies
├── migrations/                # Database schema migrations
│   └── migration.service.ts   # Migration management service
└── seeding/                   # Database seeding and sample data
    ├── seeder.service.ts      # Data seeding service
    └── seed-data.ts           # Sample data definitions
```

## 🚀 Quick Start

### Basic Setup

```typescript
import { DatabaseManager, sportsService, userService } from '@/lib/database';

// Initialize the database
const result = await DatabaseManager.initialize({
  runMigrations: true,
  seedData: true,
  adminUserId: 'admin-user-id'
});

if (result.success) {
  console.log('Database ready!');
}
```

### Creating and Managing Sports

```typescript
import { sportsService } from '@/lib/database';

// Create a new sport
const sportResult = await sportsService.createSport({
  name: 'Tennis',
  description: 'Learn tennis fundamentals and advanced techniques',
  difficulty: 'intermediate',
  category: 'racket-sports',
  estimatedTimeToComplete: 180, // minutes
  isActive: true,
  isFeatured: true,
  order: 1,
  imageUrl: 'https://example.com/tennis.jpg',
  prerequisites: [],
  tags: ['individual', 'outdoor', 'racket']
});

if (sportResult.success) {
  const sportId = sportResult.data.id;

  // Add skills to the sport
  const skillResult = await sportsService.createSkill({
    name: 'Forehand Technique',
    description: 'Master the basic forehand stroke',
    sportId: sportId,
    difficulty: 'beginner',
    estimatedTimeToComplete: 30,
    order: 1,
    isActive: true,
    hasVideo: true,
    hasQuiz: true,
    prerequisites: [],
    learningObjectives: [
      'Understand proper grip',
      'Learn correct stance',
      'Practice swing motion'
    ],
    tags: ['technique', 'fundamental']
  });
}
```

### User Progress Tracking

```typescript
import { userService, sportsService } from '@/lib/database';

// Create a new user
const userResult = await userService.createUser({
  email: 'john@example.com',
  displayName: 'John Doe',
  role: 'student',
  emailVerified: true,
  isActive: true,
  profile: {
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1990-01-01'),
    country: 'US',
    favoritesSports: ['tennis', 'basketball']
  }
});

if (userResult.success) {
  const userId = userResult.data.id;

  // Track user progress
  await sportsService.createSportProgress(userId, sportId);

  // Add experience points
  const expResult = await userService.addExperiencePoints(
    userId,
    100,
    'skill_completion'
  );

  if (expResult.success && expResult.data.leveledUp) {
    console.log(`User leveled up to level ${expResult.data.newLevel}!`);
  }
}
```

### Quiz Management

```typescript
import { quizService } from '@/lib/database';

// Create a quiz
const quizResult = await quizService.createQuiz({
  title: 'Tennis Fundamentals Assessment',
  description: 'Test your knowledge of tennis basics',
  skillId: 'tennis-basics-skill',
  sportId: 'tennis-sport',
  difficulty: 'beginner',
  estimatedTimeToComplete: 15,
  passingScore: 70,
  maxAttempts: 3,
  isActive: true,
  questionsCount: 10
});

// Start a quiz attempt
const attemptResult = await quizService.startQuizAttempt(
  'user-id',
  'quiz-id',
  'skill-id',
  'sport-id'
);

if (attemptResult.success) {
  // Submit answers
  await quizService.submitQuizAnswer(
    attemptResult.data.id,
    'question-id',
    'answer-value',
    30 // time spent in seconds
  );

  // Complete the quiz
  const completionResult = await quizService.completeQuizAttempt(
    attemptResult.data.id,
    300 // total time in seconds
  );
}
```

## 📊 Real-time Subscriptions

### Subscribe to Sports Updates

```typescript
import { sportsService } from '@/lib/database';

// Subscribe to sports list
const unsubscribe = sportsService.subscribeToSports(
  (sports) => {
    console.log('Sports updated:', sports);
    // Update your UI here
  },
  { difficulty: ['beginner', 'intermediate'] } // Optional filters
);

// Don't forget to unsubscribe when component unmounts
// unsubscribe();
```

### Subscribe to User Notifications

```typescript
import { userService } from '@/lib/database';

const unsubscribe = userService.subscribeToUserNotifications(
  'user-id',
  (notifications) => {
    console.log('New notifications:', notifications);
    // Update notification UI
  }
);
```

## 🔍 Advanced Querying

### Search and Filtering

```typescript
// Search sports with filters
const searchResult = await sportsService.searchSports('basketball', {
  difficulty: ['beginner', 'intermediate'],
  categories: ['team-sports'],
  tags: ['indoor'],
  duration: { min: 60, max: 180 }
});

// Get paginated results
const sportsResult = await sportsService.getAllSports({
  limit: 20,
  offset: 0,
  orderBy: [
    { field: 'isFeatured', direction: 'desc' },
    { field: 'name', direction: 'asc' }
  ]
});
```

### User Analytics

```typescript
// Get comprehensive user analytics
const analyticsResult = await userService.getUserAnalytics('user-id');

if (analyticsResult.success) {
  const analytics = analyticsResult.data;
  console.log(`Total time spent: ${analytics.totalTimeSpent} minutes`);
  console.log(`Completion rate: ${analytics.completionRate}%`);
}
```

## 🛡️ Error Handling and Recovery

### Automatic Retry with Circuit Breaker

```typescript
import { withRetry, CircuitBreaker } from '@/lib/database/utils/error-recovery';

// Basic retry operation
const result = await withRetry(
  () => sportsService.getSport('sport-id'),
  {
    maxAttempts: 3,
    baseDelay: 1000,
    backoffMultiplier: 2
  }
);

// Circuit breaker for critical operations
const circuitBreaker = new CircuitBreaker('sports-service', {
  failureThreshold: 5,
  resetTimeout: 30000,
  timeout: 5000
});

const protectedResult = await circuitBreaker.execute(
  () => sportsService.createSport(sportData)
);
```

### Graceful Degradation

```typescript
import { createGracefulDegradation } from '@/lib/database/utils/error-recovery';

try {
  const sports = await sportsService.getAllSports();
  return sports;
} catch (error) {
  // Return cached or minimal data on failure
  return createGracefulDegradation(
    { items: [], total: 0, hasMore: false },
    'Primary database unavailable, showing cached data'
  );
}
```

## 🔧 Database Maintenance

### Running Migrations

```typescript
import { migrationService } from '@/lib/database';

// Check migration status
const status = await migrationService.checkMigrationStatus();

if (status.data?.needsMigration) {
  // Run pending migrations
  const migrationResult = await migrationService.runPendingMigrations();

  if (migrationResult.success) {
    console.log(`Ran ${migrationResult.data?.migrationsRun} migrations`);
  }
}
```

### Seeding Development Data

```typescript
import { seederService } from '@/lib/database';

// Seed complete database
const seedResult = await seederService.seedAll({
  adminUserId: 'admin-123',
  force: true, // Clear existing data
  includeAdditionalSports: true
});

// Seed only specific data types
await seederService.seedSports('admin-123', true);
await seederService.seedAchievements();
```

### Cache Management

```typescript
import { DatabaseHelpers } from '@/lib/database';

// Get cache statistics
const cacheStats = DatabaseHelpers.getCacheStats();
console.log('Cache hit rates:', cacheStats);

// Clear all caches
DatabaseHelpers.clearAllCaches();

// Health check all services
const healthStatus = await DatabaseHelpers.healthCheck();
```

## 📝 Best Practices

### 1. Always Handle Errors

```typescript
// ❌ Bad: No error handling
const user = await userService.getUser('user-id');

// ✅ Good: Proper error handling
const userResult = await userService.getUser('user-id');
if (userResult.success) {
  const user = userResult.data;
  // Use user data
} else {
  console.error('Failed to get user:', userResult.error);
  // Handle error appropriately
}
```

### 2. Use Transactions for Related Operations

```typescript
// ❌ Bad: Separate operations that could fail independently
await sportsService.createSport(sportData);
await sportsService.createSkill(skillData);

// ✅ Good: Use batch operations or transactions
const operations = [
  { type: 'create', collection: 'sports', data: sportData },
  { type: 'create', collection: 'skills', data: skillData }
];
await baseDatabaseService.batchWrite(operations, { useTransaction: true });
```

### 3. Implement Proper Caching

```typescript
// Services automatically cache frequently accessed data
// But you can control cache behavior:

const sports = await sportsService.getAllSports({
  useCache: true, // Use cached data if available
  cacheOptions: {
    ttl: 300000, // 5 minutes
    maxSize: 100
  }
});
```

### 4. Monitor Performance

```typescript
import { withPerformanceLogging } from '@/lib/utils/logger';

// Wrap expensive operations with performance logging
const expensiveOperation = withPerformanceLogging(
  async (data) => {
    return await sportsService.searchSports(data.query, data.filters);
  },
  'sports-search',
  'performance'
);
```

### 5. Use Real-time Updates Wisely

```typescript
// ✅ Good: Unsubscribe when component unmounts
useEffect(() => {
  const unsubscribe = sportsService.subscribeToSports(handleSportsUpdate);

  return () => {
    unsubscribe(); // Prevent memory leaks
  };
}, []);
```

## 🔐 Security Considerations

1. **Authentication**: All operations verify user authentication through Firebase Auth
2. **Authorization**: Role-based access control (student/admin) enforced at service level
3. **Data Validation**: All inputs validated using Zod schemas before database operations
4. **Rate Limiting**: Built-in protection against excessive requests
5. **Data Sanitization**: Sensitive data automatically redacted in logs

## 📈 Performance Optimization

1. **Lazy Loading**: Large datasets paginated by default
2. **Caching**: Intelligent caching with TTL and LRU eviction
3. **Indexing**: Optimized Firestore indexes for all query patterns
4. **Batch Operations**: Multiple operations combined for efficiency
5. **Connection Pooling**: Efficient Firebase connection management

## 🐛 Debugging and Monitoring

### Enable Debug Logging

```typescript
import { logger } from '@/lib/utils/logger';

// Set log level to debug in development
logger.updateConfig({ level: 'debug' });

// View recent logs
const recentLogs = logger.getRecentLogs(50, 'error');
```

### Monitor Service Health

```typescript
// Check individual service health
const healthCheck = await sportsService.healthCheck();

// Check all services
const allHealth = await DatabaseHelpers.healthCheck();
```

This database layer provides a robust foundation for the SportsCoach V3 application with comprehensive error handling, performance optimization, and developer-friendly APIs.
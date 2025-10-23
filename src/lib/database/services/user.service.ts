import { BaseDatabaseService } from '../base.service';
import {
  User,
  UserProfile,
  UserPreferences,
  UserProgress,
  OverallStats,
  UserAchievement,
  Notification,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  UserRole,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { TimestampPatterns } from '../../utils/timestamp';

/**
 * Service for managing users, user progress, achievements, and notifications in the SportsCoach application.
 *
 * This service provides comprehensive functionality for:
 * - User account management and profile operations
 * - User progress tracking and statistics
 * - Achievement system and gamification
 * - Notification management
 * - User analytics and reporting
 * - Real-time subscriptions for user data
 *
 * @example
 * ```typescript
 * // Create a new user
 * const result = await userService.createUser({
 *   email: 'john@example.com',
 *   displayName: 'John Doe',
 *   role: 'student',
 *   emailVerified: true,
 *   isActive: true,
 *   profile: {
 *     firstName: 'John',
 *     lastName: 'Doe',
 *     dateOfBirth: new Date('1990-01-01'),
 *     country: 'US'
 *   }
 * });
 *
 * // Track user progress
 * const progress = await userService.getUserProgress('user123');
 * await userService.addExperiencePoints('user123', 50, 'quiz_completion');
 * ```
 */
export class UserService extends BaseDatabaseService {
  private readonly USERS_COLLECTION = 'users';
  private readonly USER_PROGRESS_COLLECTION = 'user_progress';
  private readonly USER_ACHIEVEMENTS_COLLECTION = 'user_achievements';
  private readonly NOTIFICATIONS_COLLECTION = 'notifications';

  // User CRUD operations
  /**
   * Creates a new user account in the database.
   *
   * @param user - User data excluding auto-generated fields
   * @returns Promise resolving to API response with created user ID
   *
   * @example
   * ```typescript
   * const result = await userService.createUser({
   *   email: 'jane@example.com',
   *   displayName: 'Jane Smith',
   *   role: 'student',
   *   emailVerified: true,
   *   isActive: true,
   *   profile: {
   *     firstName: 'Jane',
   *     lastName: 'Smith',
   *     dateOfBirth: new Date('1992-05-15'),
   *     country: 'CA',
   *     favoritesSports: ['tennis', 'swimming']
   *   }
   * });
   * ```
   */
  async createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.USERS_COLLECTION, undefined, { email: user.email, displayName: user.displayName });

    // Check if user with email already exists
    const existingUserResult = await this.getUserByEmail(user.email);
    if (existingUserResult.success && existingUserResult.data) {
      logger.warn('User creation failed - email already exists', 'UserService', { email: user.email });
      return {
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email already exists',
        },
        timestamp: new Date(),
      };
    }

    const userData = {
      ...user,
      preferences: user.preferences || this.getDefaultPreferences(),
    };

    const result = await this.create<User>(this.USERS_COLLECTION, userData);

    if (result.success) {
      // Initialize user progress
      await this.initializeUserProgress(result.data!.id);
      logger.info('User created successfully', 'UserService', {
        userId: result.data!.id,
        email: user.email,
        displayName: user.displayName
      });
    } else {
      logger.error('User creation failed', 'UserService', result.error);
    }

    return result;
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param userId - The ID of the user to retrieve
   * @returns Promise resolving to API response with user data or null if not found
   *
   * @example
   * ```typescript
   * const result = await userService.getUser('user123');
   * if (result.success && result.data) {
   *   console.log(`Found user: ${result.data.displayName}`);
   * }
   * ```
   */
  async getUser(userId: string): Promise<ApiResponse<User | null>> {
    logger.database('read', this.USERS_COLLECTION, userId);
    const result = await this.getById<User>(this.USERS_COLLECTION, userId);

    if (result.success && result.data) {
      logger.debug('User retrieved successfully', 'UserService', {
        userId,
        displayName: result.data.displayName
      });
    } else if (result.success && !result.data) {
      logger.warn('User not found', 'UserService', { userId });
    } else {
      logger.error('User retrieval failed', 'UserService', result.error);
    }

    return result;
  }

  async getUserByEmail(email: string): Promise<ApiResponse<User | null>> {
    const result = await this.query<User>(this.USERS_COLLECTION, {
      where: [{ field: 'email', operator: '==', value: email }],
      limit: 1,
    });

    return {
      success: result.success,
      data: result.data?.items[0] || null,
      error: result.error,
      timestamp: new Date(),
    };
  }

  async updateUser(
    userId: string,
    updates: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'email'>>
  ): Promise<ApiResponse<void>> {
    // Don't allow email updates through this method
    const { email, ...safeUpdates } = updates as Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'email'>>;
    return this.update<User>(this.USERS_COLLECTION, userId, safeUpdates);
  }

  async updateUserProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<ApiResponse<void>> {
    return this.update<User>(this.USERS_COLLECTION, userId, { profile });
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<void>> {
    // Get current preferences and merge
    const userResult = await this.getUser(userId);
    if (!userResult.success || !userResult.data) {
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
        timestamp: new Date(),
      };
    }

    const currentPreferences = userResult.data.preferences || this.getDefaultPreferences();
    const updatedPreferences = { ...currentPreferences, ...preferences };

    // Deep merge email notifications if provided
    if (preferences.emailNotifications) {
      updatedPreferences.emailNotifications = {
        ...currentPreferences.emailNotifications,
        ...preferences.emailNotifications,
      };
    }

    return this.update<User>(this.USERS_COLLECTION, userId, {
      preferences: updatedPreferences,
    });
  }

  async updateLastLogin(userId: string): Promise<ApiResponse<void>> {
    return this.update<User>(this.USERS_COLLECTION, userId, {
      lastLoginAt: TimestampPatterns.forDatabase(),
    });
  }

  async changeUserRole(
    userId: string,
    newRole: UserRole,
    adminUserId: string
  ): Promise<ApiResponse<void>> {
    // Verify admin permissions
    const adminResult = await this.getUser(adminUserId);
    if (!adminResult.success || !adminResult.data || adminResult.data.role !== 'admin') {
      return {
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Only admins can change user roles',
        },
        timestamp: new Date(),
      };
    }

    return this.update<User>(this.USERS_COLLECTION, userId, { role: newRole });
  }

  async deactivateUser(userId: string): Promise<ApiResponse<void>> {
    // Soft delete by marking as inactive
    return this.update<User>(this.USERS_COLLECTION, userId, {
      isActive: false,
      deactivatedAt: Timestamp.fromDate(new Date()),
    });
  }

  async reactivateUser(userId: string): Promise<ApiResponse<void>> {
    return this.update<User>(this.USERS_COLLECTION, userId, {
      isActive: true,
      reactivatedAt: Timestamp.fromDate(new Date()),
    });
  }

  // User listing and search
  async getAllUsers(
    options: QueryOptions & {
      role?: UserRole;
      isActive?: boolean;
      searchTerm?: string;
    } = {}
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const whereClause: Array<{field: string, operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any', value: string | boolean | UserRole}> = [];

    if (options.role) {
      whereClause.push({ field: 'role', operator: '==', value: options.role });
    }

    if (options.isActive !== undefined) {
      whereClause.push({ field: 'isActive', operator: '==', value: options.isActive });
    }

    const queryOptions: QueryOptions = {
      where: whereClause,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      offset: options.offset,
    };

    const result = await this.query<User>(this.USERS_COLLECTION, queryOptions);

    // Client-side search filtering (in production, use proper search engine)
    if (result.success && result.data && options.searchTerm) {
      const searchTerm = options.searchTerm.toLowerCase();
      const filteredItems = result.data.items.filter(user =>
        user.displayName.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.profile?.firstName?.toLowerCase().includes(searchTerm)) ||
        (user.profile?.lastName?.toLowerCase().includes(searchTerm))
      );

      result.data.items = filteredItems;
      result.data.total = filteredItems.length;
    }

    return result;
  }

  async getAdminUsers(): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.getAllUsers({ role: 'admin' });
  }

  async getStudentUsers(options: QueryOptions = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.getAllUsers({ role: 'student', ...options });
  }

  async getActiveUsers(options: QueryOptions = {}): Promise<ApiResponse<PaginatedResponse<User>>> {
    return this.getAllUsers({ isActive: true, ...options });
  }

  // User Progress Management
  async initializeUserProgress(userId: string): Promise<ApiResponse<{ id: string }>> {
    const progressData: Omit<UserProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      overallStats: {
        totalTimeSpent: 0,
        skillsCompleted: 0,
        sportsCompleted: 0,
        quizzesCompleted: 0,
        averageQuizScore: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        level: 1,
        experiencePoints: 0,
      },
      achievements: [],
      lastUpdated: TimestampPatterns.forDatabase(),
    };

    // Use userId as document ID to match security rules expectation: /user_progress/{userId}
    return this.createWithId<UserProgress>(this.USER_PROGRESS_COLLECTION, userId, progressData);
  }

  async getUserProgress(userId: string): Promise<ApiResponse<UserProgress | null>> {
    // Get base progress record
    const progressResult = await this.getById<UserProgress>(this.USER_PROGRESS_COLLECTION, userId);

    if (!progressResult.success || !progressResult.data) {
      return progressResult;
    }

    // Calculate real stats from video quiz attempts
    try {
      const { videoQuizService } = await import('./video-quiz.service');
      const { enrollmentService } = await import('./enrollment.service');

      // Get all user's video quiz attempts
      const attemptsResult = await videoQuizService.getUserVideoQuizAttempts(userId, {
        completed: true,
        limit: 10000
      });

      // Get enrolled sports for skills/sports completed count
      const enrolledSportsResult = await enrollmentService.getUserEnrolledSports(userId);

      const attempts = attemptsResult.success ? attemptsResult.data?.items || [] : [];
      const enrolledSports = enrolledSportsResult.success ? enrolledSportsResult.data || [] : [];

      // Calculate real stats
      const quizzesCompleted = attempts.length; // Total number of video quiz attempts
      const totalTimeSpent = attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0);
      const averageQuizScore = quizzesCompleted > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / quizzesCompleted)
        : 0;

      // Count unique skills attempted (not just passed) for video quizzes
      const attemptedSkillIds = new Set<string>();
      attempts.forEach(attempt => {
        if (attempt.skillId) {
          attemptedSkillIds.add(attempt.skillId);
        }
      });

      const completedSportsCount = enrolledSports.filter(
        ({ progress }) => progress.status === 'completed'
      ).length;

      // Calculate streak from quiz attempt dates
      const attemptDates = attempts
        .map(a => {
          if (a.submittedAt) {
            const date = a.submittedAt.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt);
            return date.toISOString().split('T')[0];
          }
          return null;
        })
        .filter((d): d is string => d !== null)
        .sort()
        .reverse();

      let currentStreak = 0;
      let longestStreak = 0;
      let streakCount = 0;
      let maxStreakCount = 0;
      const today = new Date().toISOString().split('T')[0];

      for (let i = 0; i < attemptDates.length; i++) {
        const date = attemptDates[i];
        const prevDate = i > 0 ? attemptDates[i - 1] : null;

        if (i === 0) {
          const daysDiff = Math.floor(
            (new Date(today).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysDiff <= 1) {
            streakCount = 1;
            currentStreak = 1;
          }
        } else if (prevDate) {
          const daysBetween = Math.floor(
            (new Date(prevDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysBetween === 1) {
            streakCount++;
            if (i === attemptDates.length - 1 || streakCount === attemptDates.length) {
              currentStreak = streakCount;
            }
          } else {
            maxStreakCount = Math.max(maxStreakCount, streakCount);
            streakCount = 1;
          }
        }
        maxStreakCount = Math.max(maxStreakCount, streakCount);
      }
      longestStreak = maxStreakCount;

      // Update progress data with calculated values
      const updatedProgress: UserProgress = {
        ...progressResult.data,
        overallStats: {
          ...progressResult.data.overallStats,
          totalTimeSpent,
          skillsCompleted: attemptedSkillIds.size, // Unique skills for which quizzes were attempted
          sportsCompleted: completedSportsCount,
          quizzesCompleted, // Total video quiz attempts
          averageQuizScore,
          currentStreak,
          longestStreak: Math.max(longestStreak, progressResult.data.overallStats.longestStreak || 0),
        },
      };

      return {
        success: true,
        data: updatedProgress,
        error: progressResult.error,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to calculate real user progress', 'UserService', error);
      // Return base progress if calculation fails
      return progressResult;
    }
  }

  async updateUserProgress(
    userId: string,
    updates: Partial<Omit<UserProgress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getUserProgress(userId);
    if (!progressResult.success || !progressResult.data) {
      // Initialize if doesn't exist
      await this.initializeUserProgress(userId);
    }

    const updateData = {
      ...updates,
      lastUpdated: Timestamp.fromDate(new Date()),
    };

    // Since document ID is userId, we can update directly by userId
    return this.update<UserProgress>(this.USER_PROGRESS_COLLECTION, userId, updateData);
  }

  async updateOverallStats(
    userId: string,
    statsUpdates: Partial<OverallStats>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getUserProgress(userId);
    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'User progress not found',
        },
        timestamp: new Date(),
      };
    }

    const currentStats = progressResult.data.overallStats;
    const updatedStats = { ...currentStats, ...statsUpdates };

    // Calculate level based on experience points
    if (statsUpdates.experiencePoints !== undefined) {
      updatedStats.level = this.calculateUserLevel(updatedStats.experiencePoints);
    }

    return this.updateUserProgress(userId, { overallStats: updatedStats });
  }

  /**
   * Adds experience points to a user and handles level progression.
   *
   * @param userId - The ID of the user to add points to
   * @param points - The number of experience points to add
   * @param source - The source of the experience points (e.g., 'quiz_completion', 'skill_mastery')
   * @returns Promise resolving to API response with new level information
   *
   * @example
   * ```typescript
   * const result = await userService.addExperiencePoints(
   *   'user123',
   *   100,
   *   'quiz_completion'
   * );
   * if (result.success && result.data.leveledUp) {
   *   console.log(`User leveled up to level ${result.data.newLevel}!`);
   * }
   * ```
   */
  async addExperiencePoints(
    userId: string,
    points: number,
    source: string
  ): Promise<ApiResponse<{ newLevel: number; leveledUp: boolean }>> {
    logger.info('Adding experience points', 'UserService', { userId, points, source });
    const progressResult = await this.getUserProgress(userId);
    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'User progress not found',
        },
        timestamp: new Date(),
      };
    }

    const currentStats = progressResult.data.overallStats;
    const oldLevel = currentStats.level;
    const newExperiencePoints = currentStats.experiencePoints + points;
    const newTotalPoints = currentStats.totalPoints + points;
    const newLevel = this.calculateUserLevel(newExperiencePoints);

    await this.updateOverallStats(userId, {
      experiencePoints: newExperiencePoints,
      totalPoints: newTotalPoints,
      level: newLevel,
    });

    const leveledUp = newLevel > oldLevel;

    // Create notification if user leveled up
    if (leveledUp) {
      logger.info('User leveled up', 'UserService', {
        userId,
        oldLevel,
        newLevel,
        points,
        source
      });

      await this.createNotification(userId, {
        type: 'achievement',
        title: 'Level Up!',
        message: `Congratulations! You've reached level ${newLevel}!`,
        data: {
          actionUrl: '/dashboard',
        },
        priority: 'high',
      });
    }

    return {
      success: true,
      data: {
        newLevel,
        leveledUp,
      },
      timestamp: new Date(),
    };
  }

  // User Achievements
  async getUserAchievements(userId: string): Promise<ApiResponse<PaginatedResponse<UserAchievement>>> {
    return this.query<UserAchievement>(this.USER_ACHIEVEMENTS_COLLECTION, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'unlockedAt', direction: 'desc' }],
    });
  }

  async unlockAchievement(
    userId: string,
    achievementId: string,
    progress: number = 100
  ): Promise<ApiResponse<{ id: string }>> {
    // Check if already unlocked
    const existingResult = await this.query<UserAchievement>(this.USER_ACHIEVEMENTS_COLLECTION, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'achievementId', operator: '==', value: achievementId },
      ],
      limit: 1,
    });

    if (existingResult.success && existingResult.data && existingResult.data.items.length > 0) {
      const existing = existingResult.data.items[0];
      if (existing.isCompleted) {
        return {
          success: false,
          error: {
            code: 'ACHIEVEMENT_ALREADY_UNLOCKED',
            message: 'Achievement already unlocked',
          },
          timestamp: new Date(),
        };
      }

      // Update existing achievement
      const achievementData = existing.id;
      await this.update<UserAchievement>(this.USER_ACHIEVEMENTS_COLLECTION, achievementData, {
        progress,
        isCompleted: progress >= 100,
        unlockedAt: progress >= 100 ? Timestamp.fromDate(new Date()) : undefined,
      });

      return {
        success: true,
        data: { id: achievementData },
        timestamp: new Date(),
      };
    }

    // Create new achievement
    const achievementData: Omit<UserAchievement, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      achievementId,
      progress,
      isCompleted: progress >= 100,
      unlockedAt: progress >= 100 ? Timestamp.fromDate(new Date()) : undefined,
      isNotified: false,
    };

    const result = await this.create<UserAchievement>(this.USER_ACHIEVEMENTS_COLLECTION, achievementData);

    if (result.success && progress >= 100) {
      // Add to user progress achievements list
      const progressResult = await this.getUserProgress(userId);
      if (progressResult.success && progressResult.data) {
        const updatedAchievements = [...progressResult.data.achievements, achievementId];
        await this.updateUserProgress(userId, { achievements: updatedAchievements });
      }

      // Create notification
      await this.createNotification(userId, {
        type: 'achievement',
        title: 'Achievement Unlocked!',
        message: 'You\'ve unlocked a new achievement!',
        data: {
          achievementId,
          actionUrl: '/achievements',
        },
        priority: 'medium',
      });
    }

    return result;
  }

  // Notifications
  async createNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'userId' | 'isRead' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    const notificationData = {
      ...notification,
      userId,
      isRead: false,
    };

    return this.create<Notification>(this.NOTIFICATIONS_COLLECTION, notificationData);
  }

  async getUserNotifications(
    userId: string,
    options: {
      isRead?: boolean;
      type?: string;
    } & QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    const whereClause = [
      { field: 'userId', operator: '==' as const, value: userId },
    ];

    if (options.isRead !== undefined) {
      whereClause.push({ field: 'isRead', operator: '==', value: options.isRead });
    }

    if (options.type) {
      whereClause.push({ field: 'type', operator: '==', value: options.type });
    }

    const queryOptions: QueryOptions = {
      where: whereClause,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      offset: options.offset,
    };

    return this.query<Notification>(this.NOTIFICATIONS_COLLECTION, queryOptions);
  }

  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.update<Notification>(this.NOTIFICATIONS_COLLECTION, notificationId, {
      isRead: true,
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<ApiResponse<void>> {
    const notificationsResult = await this.getUserNotifications(userId, { isRead: false });
    if (!notificationsResult.success || !notificationsResult.data) {
      return {
        success: false,
        error: notificationsResult.error,
        timestamp: new Date(),
      };
    }

    const operations = notificationsResult.data.items.map(notification => ({
      type: 'update' as const,
      collection: this.NOTIFICATIONS_COLLECTION,
      id: notification.id,
      data: { isRead: true },
    }));

    return this.batchWrite(operations);
  }

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    return this.delete(this.NOTIFICATIONS_COLLECTION, notificationId);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await this.getUserNotifications(userId, { isRead: false });
    return result.data?.total || 0;
  }

  // Analytics and Statistics
  async getUserAnalytics(userId: string): Promise<ApiResponse<{
    totalTimeSpent: number;
    activeDays: number;
    completionRate: number;
    averageSessionTime: number;
    topSports: Array<{ sportId: string; timeSpent: number }>;
    recentActivity: Array<{
      date: Date;
      activity: string;
      details: string;
    }>;
  }>> {
    // This would typically aggregate data from multiple collections
    // For now, return basic data from user progress
    const progressResult = await this.getUserProgress(userId);
    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'User progress not found',
        },
        timestamp: new Date(),
      };
    }

    const stats = progressResult.data.overallStats;

    return {
      success: true,
      data: {
        totalTimeSpent: stats.totalTimeSpent,
        activeDays: stats.currentStreak, // Simplified
        completionRate: stats.sportsCompleted > 0 ? (stats.skillsCompleted / stats.sportsCompleted) : 0,
        averageSessionTime: 0, // Would need session tracking
        topSports: [], // Would need detailed tracking
        recentActivity: [], // Would need activity logging
      },
      timestamp: new Date(),
    };
  }

  // Helper methods
  private getDefaultPreferences(): UserPreferences {
    return {
      notifications: true,
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      emailNotifications: {
        progress: true,
        quizResults: true,
        newContent: true,
        reminders: true,
      },
    };
  }

  private calculateUserLevel(experiencePoints: number): number {
    // Simple level calculation: every 1000 XP = 1 level
    return Math.floor(experiencePoints / 1000) + 1;
  }

  // Real-time subscriptions
  subscribeToUser(userId: string, callback: (user: User) => void): () => void {
    return this.subscribeToDocument<User>(
      this.USERS_COLLECTION,
      userId,
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }

  subscribeToUserNotifications(
    userId: string,
    callback: (notifications: Notification[]) => void
  ): () => void {
    return this.subscribeToCollection<Notification>(
      this.NOTIFICATIONS_COLLECTION,
      {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: 50,
      },
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }

  /**
   * Retrieves comprehensive user data with progress information.
   * Used for chatbot and analytics that need complete user context.
   *
   * @param userId - The user ID to retrieve data for
   * @returns Promise resolving to user with all progress data
   */
  async getUserWithProgress(userId: string): Promise<ApiResponse<{
    user: User;
    sportProgress: Record<string, unknown>[];
    userProgress: Record<string, unknown>[];
    quizAttempts: Record<string, unknown>[];
  }>> {
    logger.database('read', 'user_with_progress', userId);

    try {
      // Get user data
      const userResult = await this.getUser(userId);
      if (!userResult.success || !userResult.data) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
          timestamp: new Date(),
        };
      }

      // Get all related progress data in parallel
      const [sportProgressResult, userProgressResult, quizAttemptsResult] = await Promise.all([
        this.query('sport_progress', {
          where: [{ field: 'userId', operator: '==', value: userId }],
        }),
        this.query('user_progress', {
          where: [{ field: 'userId', operator: '==', value: userId }],
        }),
        this.query('quiz_attempts', {
          where: [{ field: 'userId', operator: '==', value: userId }],
        }),
      ]);

      const result = {
        user: userResult.data,
        sportProgress: sportProgressResult.success ? sportProgressResult.data?.items || [] : [],
        userProgress: userProgressResult.success ? userProgressResult.data?.items || [] : [],
        quizAttempts: quizAttemptsResult.success ? quizAttemptsResult.data?.items || [] : [],
      };

      logger.info('User with progress retrieved successfully', 'UserService', {
        userId,
        sportProgressCount: result.sportProgress.length,
        userProgressCount: result.userProgress.length,
        quizAttemptsCount: result.quizAttempts.length,
      });

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to retrieve user with progress', 'UserService', { userId, error });
      return {
        success: false,
        error: {
          code: 'USER_PROGRESS_FETCH_ERROR',
          message: 'Failed to retrieve user progress data',
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const userService = new UserService();
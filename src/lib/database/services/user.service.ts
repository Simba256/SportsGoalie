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

export class UserService extends BaseDatabaseService {
  private readonly USERS_COLLECTION = 'users';
  private readonly USER_PROGRESS_COLLECTION = 'user_progress';
  private readonly USER_ACHIEVEMENTS_COLLECTION = 'user_achievements';
  private readonly NOTIFICATIONS_COLLECTION = 'notifications';

  // User CRUD operations
  async createUser(
    user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    // Check if user with email already exists
    const existingUserResult = await this.getUserByEmail(user.email);
    if (existingUserResult.success && existingUserResult.data) {
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
    }

    return result;
  }

  async getUser(userId: string): Promise<ApiResponse<User | null>> {
    return this.getById<User>(this.USERS_COLLECTION, userId);
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
    const { email, ...safeUpdates } = updates as any;
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
      lastLoginAt: new Date() as any,
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
      deactivatedAt: new Date() as any,
    });
  }

  async reactivateUser(userId: string): Promise<ApiResponse<void>> {
    return this.update<User>(this.USERS_COLLECTION, userId, {
      isActive: true,
      reactivatedAt: new Date() as any,
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
    const whereClause: any[] = [];

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
      lastUpdated: new Date() as any,
    };

    return this.create<UserProgress>(this.USER_PROGRESS_COLLECTION, progressData);
  }

  async getUserProgress(userId: string): Promise<ApiResponse<UserProgress | null>> {
    const result = await this.query<UserProgress>(this.USER_PROGRESS_COLLECTION, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      limit: 1,
    });

    return {
      success: result.success,
      data: result.data?.items[0] || null,
      error: result.error,
      timestamp: new Date(),
    };
  }

  async updateUserProgress(
    userId: string,
    updates: Partial<Omit<UserProgress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getUserProgress(userId);
    if (!progressResult.success || !progressResult.data) {
      // Initialize if doesn't exist
      await this.initializeUserProgress(userId);
      const newProgressResult = await this.getUserProgress(userId);
      if (!newProgressResult.success || !newProgressResult.data) {
        return {
          success: false,
          error: {
            code: 'PROGRESS_INIT_FAILED',
            message: 'Failed to initialize user progress',
          },
          timestamp: new Date(),
        };
      }
    }

    const progressData = progressResult.data || (await this.getUserProgress(userId)).data!;
    const progressId = (progressData as any).id;

    const updateData = {
      ...updates,
      lastUpdated: new Date() as any,
    };

    return this.update<UserProgress>(this.USER_PROGRESS_COLLECTION, progressId, updateData);
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

  async addExperiencePoints(
    userId: string,
    points: number,
    source: string
  ): Promise<ApiResponse<{ newLevel: number; leveledUp: boolean }>> {
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
      const achievementData = (existing as any).id;
      await this.update<UserAchievement>(this.USER_ACHIEVEMENTS_COLLECTION, achievementData, {
        progress,
        isCompleted: progress >= 100,
        unlockedAt: progress >= 100 ? new Date() as any : undefined,
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
      unlockedAt: progress >= 100 ? new Date() as any : undefined,
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
      id: (notification as any).id,
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
}

// Export singleton instance
export const userService = new UserService();
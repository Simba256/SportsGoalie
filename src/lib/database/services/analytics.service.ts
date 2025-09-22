import { BaseDatabaseService } from '../base.service';
import { userService } from './user.service';
import { sportsService } from './sports.service';
import { quizService } from './quiz.service';
import { ApiResponse } from '@/types';
import { logger } from '../../utils/logger';

export interface PlatformAnalytics {
  users: {
    total: number;
    active: number;
    inactive: number;
    newThisMonth: number;
    adminCount: number;
    studentCount: number;
  };
  content: {
    totalSports: number;
    totalSkills: number;
    totalQuizzes: number;
    averageSkillsPerSport: number;
  };
  engagement: {
    totalQuizAttempts: number;
    averageQuizScore: number;
    completionRate: number;
    activeUsersToday: number;
  };
  performance: {
    averageResponseTime: number;
    systemUptime: number;
    errorRate: number;
    lastUpdated: Date;
  };
}

export interface UserEngagementData {
  date: string;
  activeUsers: number;
  quizAttempts: number;
  averageScore: number;
}

export interface ContentPopularity {
  sportId: string;
  sportName: string;
  views: number;
  completions: number;
  averageRating: number;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  lastCheck: Date;
  services: {
    database: 'online' | 'offline' | 'degraded';
    auth: 'online' | 'offline' | 'degraded';
    storage: 'online' | 'offline' | 'degraded';
  };
}

/**
 * Service for collecting and providing platform analytics and system health metrics.
 *
 * This service aggregates data from various sources to provide insights into:
 * - User engagement and growth
 * - Content performance and popularity
 * - System health and performance
 * - Real-time platform statistics
 *
 * @example
 * ```typescript
 * // Get platform overview
 * const analytics = await analyticsService.getPlatformAnalytics();
 *
 * // Get user engagement trends
 * const engagement = await analyticsService.getUserEngagementData(30);
 *
 * // Check system health
 * const health = await analyticsService.getSystemHealth();
 * ```
 */
export class AnalyticsService extends BaseDatabaseService {
  private readonly ANALYTICS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private analyticsCache: { data: PlatformAnalytics; timestamp: number } | null = null;

  /**
   * Gets comprehensive platform analytics including user, content, and engagement metrics.
   * Results are cached for 5 minutes to improve performance.
   */
  async getPlatformAnalytics(): Promise<ApiResponse<PlatformAnalytics>> {
    logger.info('Fetching platform analytics', 'AnalyticsService');

    // Check cache first
    if (this.analyticsCache &&
        Date.now() - this.analyticsCache.timestamp < this.ANALYTICS_CACHE_DURATION) {
      logger.debug('Returning cached analytics data', 'AnalyticsService');
      return {
        success: true,
        data: this.analyticsCache.data,
        timestamp: new Date(),
      };
    }

    try {
      // Fetch data in parallel for better performance
      const [usersResult, sportsResult, quizzesResult] = await Promise.all([
        this.getUserAnalytics(),
        this.getContentAnalytics(),
        this.getEngagementAnalytics(),
      ]);

      if (!usersResult.success || !sportsResult.success || !quizzesResult.success) {
        return {
          success: false,
          error: {
            code: 'ANALYTICS_FETCH_FAILED',
            message: 'Failed to fetch analytics data',
          },
          timestamp: new Date(),
        };
      }

      const analytics: PlatformAnalytics = {
        users: usersResult.data!,
        content: sportsResult.data!,
        engagement: quizzesResult.data!,
        performance: {
          averageResponseTime: this.getAverageResponseTime(),
          systemUptime: this.getSystemUptime(),
          errorRate: this.getErrorRate(),
          lastUpdated: new Date(),
        },
      };

      // Cache the results
      this.analyticsCache = {
        data: analytics,
        timestamp: Date.now(),
      };

      logger.info('Platform analytics fetched successfully', 'AnalyticsService', {
        totalUsers: analytics.users.total,
        totalSports: analytics.content.totalSports,
        totalQuizAttempts: analytics.engagement.totalQuizAttempts,
      });

      return {
        success: true,
        data: analytics,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch platform analytics', 'AnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_ERROR',
          message: 'Failed to fetch platform analytics',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets user engagement data for the specified number of days.
   */
  async getUserEngagementData(days: number = 30): Promise<ApiResponse<UserEngagementData[]>> {
    logger.info('Fetching user engagement data', 'AnalyticsService', { days });

    try {
      // Query real user activity data from sport_progress and quiz_attempts collections
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // For now, return empty data until we have real activity tracking
      // This would be implemented to query daily user activity from sport_progress and quiz_attempts
      const engagementData: UserEngagementData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        engagementData.push({
          date: date.toISOString().split('T')[0],
          activeUsers: 0, // Would query distinct users with activity on this date
          quizAttempts: 0, // Would query quiz attempts on this date
          averageScore: 0, // Would calculate average score for this date
        });
      }

      return {
        success: true,
        data: engagementData,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch engagement data', 'AnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'ENGAGEMENT_FETCH_FAILED',
          message: 'Failed to fetch user engagement data',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets content popularity metrics.
   */
  async getContentPopularity(): Promise<ApiResponse<ContentPopularity[]>> {
    try {
      const sportsResult = await sportsService.getAllSports();

      if (!sportsResult.success || !sportsResult.data) {
        return {
          success: false,
          error: {
            code: 'SPORTS_FETCH_FAILED',
            message: 'Failed to fetch sports data',
          },
          timestamp: new Date(),
        };
      }

      // Use real metadata from sports or return zero values for new data
      const popularityData: ContentPopularity[] = sportsResult.data.items.map(sport => ({
        sportId: sport.id,
        sportName: sport.name,
        views: sport.metadata?.totalEnrollments || 0,
        completions: sport.metadata?.totalCompletions || 0,
        averageRating: sport.metadata?.averageRating || 0,
      }));

      // Sort by views descending
      popularityData.sort((a, b) => b.views - a.views);

      return {
        success: true,
        data: popularityData,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch content popularity', 'AnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'POPULARITY_FETCH_FAILED',
          message: 'Failed to fetch content popularity data',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets current system health status.
   */
  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    logger.info('Checking system health', 'AnalyticsService');

    try {
      // Perform basic health checks
      const dbCheck = await this.checkDatabaseHealth();
      const authCheck = await this.checkAuthHealth();
      const storageCheck = await this.checkStorageHealth();

      const health: SystemHealth = {
        status: this.determineOverallStatus(dbCheck, authCheck, storageCheck),
        uptime: this.getSystemUptime(),
        responseTime: this.getAverageResponseTime(),
        errorRate: this.getErrorRate(),
        lastCheck: new Date(),
        services: {
          database: dbCheck,
          auth: authCheck,
          storage: storageCheck,
        },
      };

      return {
        success: true,
        data: health,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('System health check failed', 'AnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'HEALTH_CHECK_FAILED',
          message: 'Failed to check system health',
        },
        timestamp: new Date(),
      };
    }
  }

  // Private helper methods for fetching specific analytics

  private async getUserAnalytics() {
    const allUsersResult = await userService.getAllUsers({ limit: 1000 });

    if (!allUsersResult.success || !allUsersResult.data) {
      return { success: false, error: { code: 'USER_FETCH_FAILED', message: 'Failed to fetch users' } };
    }

    const users = allUsersResult.data.items;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const userStats = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      newThisMonth: users.filter(u => new Date(u.createdAt) >= startOfMonth).length,
      adminCount: users.filter(u => u.role === 'admin').length,
      studentCount: users.filter(u => u.role === 'student').length,
    };

    return { success: true, data: userStats };
  }

  private async getContentAnalytics() {
    const sportsResult = await sportsService.getAllSports();

    if (!sportsResult.success || !sportsResult.data) {
      return { success: false, error: { code: 'CONTENT_FETCH_FAILED', message: 'Failed to fetch content' } };
    }

    const sports = sportsResult.data.items;
    const totalSkills = sports.reduce((sum, sport) => sum + (sport.skills?.length || 0), 0);

    const contentStats = {
      totalSports: sports.length,
      totalSkills,
      totalQuizzes: 0, // Would be fetched from quiz service
      averageSkillsPerSport: sports.length > 0 ? Math.round(totalSkills / sports.length) : 0,
    };

    return { success: true, data: contentStats };
  }

  private async getEngagementAnalytics() {
    // Query real engagement data from sport_progress collection
    try {
      const progressResult = await this.query<any>('sport_progress', {});

      const progressData = progressResult.success ? progressResult.data?.items || [] : [];

      const engagementStats = {
        totalQuizAttempts: 0, // Would be calculated from quiz_attempts collection when implemented
        averageQuizScore: 0, // Would be calculated from quiz results when implemented
        completionRate: progressData.length > 0 ?
          Math.round((progressData.filter((p: any) => p.status === 'completed').length / progressData.length) * 100) : 0,
        activeUsersToday: progressData.filter((p: any) => {
          const today = new Date().toDateString();
          const lastAccessed = p.lastAccessedAt?.toDate?.()?.toDateString();
          return lastAccessed === today;
        }).length,
      };

      return { success: true, data: engagementStats };
    } catch (error) {
      logger.error('Failed to fetch engagement analytics', 'AnalyticsService', error);
      // Return zero values instead of mock data
      return {
        success: true,
        data: {
          totalQuizAttempts: 0,
          averageQuizScore: 0,
          completionRate: 0,
          activeUsersToday: 0,
        }
      };
    }
  }

  // System health check methods

  private async checkDatabaseHealth(): Promise<'online' | 'offline' | 'degraded'> {
    try {
      // Simple test query
      await userService.getAllUsers({ limit: 1 });
      return 'online';
    } catch (error) {
      logger.warn('Database health check failed', 'AnalyticsService', error);
      return 'degraded';
    }
  }

  private async checkAuthHealth(): Promise<'online' | 'offline' | 'degraded'> {
    // In a real implementation, this would test Firebase Auth
    return 'online';
  }

  private async checkStorageHealth(): Promise<'online' | 'offline' | 'degraded'> {
    // In a real implementation, this would test Firebase Storage
    return 'online';
  }

  private determineOverallStatus(
    db: string,
    auth: string,
    storage: string
  ): 'healthy' | 'warning' | 'critical' {
    const services = [db, auth, storage];

    if (services.every(s => s === 'online')) return 'healthy';
    if (services.some(s => s === 'offline')) return 'critical';
    return 'warning';
  }

  private getSystemUptime(): number {
    // Return uptime in percentage (for demo, always high)
    return 99.9;
  }

  private getAverageResponseTime(): number {
    // Would be calculated from actual request metrics
    return 100; // Default value until real metrics are implemented
  }

  private getErrorRate(): number {
    // Would be calculated from actual error logs
    return 0; // Default value until real error tracking is implemented
  }

  /**
   * Clears the analytics cache to force fresh data on next request.
   */
  clearCache(): void {
    this.analyticsCache = null;
    logger.debug('Analytics cache cleared', 'AnalyticsService');
  }

  /**
   * Gets cache status for debugging.
   */
  getCacheInfo(): { cached: boolean; age: number } {
    if (!this.analyticsCache) {
      return { cached: false, age: 0 };
    }

    return {
      cached: true,
      age: Date.now() - this.analyticsCache.timestamp,
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
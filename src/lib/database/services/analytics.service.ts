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
      // In a real implementation, this would query actual usage data
      // For now, generate sample data that looks realistic
      const engagementData: UserEngagementData[] = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Generate realistic sample data
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const baseUsers = isWeekend ? 15 : 25;
        const variation = Math.random() * 10 - 5; // ±5 variation

        engagementData.push({
          date: date.toISOString().split('T')[0],
          activeUsers: Math.max(1, Math.round(baseUsers + variation)),
          quizAttempts: Math.round((baseUsers + variation) * 1.5),
          averageScore: Math.round(75 + Math.random() * 20), // 75-95%
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

      // Generate sample popularity data
      const popularityData: ContentPopularity[] = sportsResult.data.items.map(sport => ({
        sportId: sport.id,
        sportName: sport.name,
        views: Math.round(Math.random() * 500 + 100), // 100-600 views
        completions: Math.round(Math.random() * 50 + 10), // 10-60 completions
        averageRating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0-5.0 rating
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
    // In a real implementation, this would query quiz attempts and user activity
    // For now, return sample data
    const engagementStats = {
      totalQuizAttempts: Math.round(Math.random() * 1000 + 500),
      averageQuizScore: Math.round(Math.random() * 20 + 75), // 75-95%
      completionRate: Math.round(Math.random() * 30 + 60), // 60-90%
      activeUsersToday: Math.round(Math.random() * 50 + 20), // 20-70
    };

    return { success: true, data: engagementStats };
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
    // Return average response time in ms (for demo)
    return Math.round(Math.random() * 100 + 50); // 50-150ms
  }

  private getErrorRate(): number {
    // Return error rate as percentage (for demo, always low)
    return Math.round(Math.random() * 2 * 100) / 100; // 0-2%
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
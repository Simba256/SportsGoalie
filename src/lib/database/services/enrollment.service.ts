import { BaseDatabaseService } from '../base.service';
import {
  Sport,
  SportProgress,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { sportsService } from './sports.service';

/**
 * Service for managing sports enrollment and progress.
 * Handles enrollment (creating SportProgress), retrieving enrolled sports, and progress tracking.
 */
export class EnrollmentService extends BaseDatabaseService {
  private readonly SPORT_PROGRESS_COLLECTION = 'sport_progress';
  private readonly SPORTS_COLLECTION = 'sports';

  /**
   * Enroll a user in a sport by creating SportProgress record
   */
  async enrollInSport(
    userId: string,
    sportId: string
  ): Promise<ApiResponse<{ id: string }>> {
    console.log('EnrollmentService: Starting enrollment for user', userId, 'in sport', sportId);
    logger.database('create', this.SPORT_PROGRESS_COLLECTION, undefined, { userId, sportId });

    // Check if user is already enrolled
    console.log('EnrollmentService: Checking existing enrollment...');
    const existingProgress = await this.getUserSportProgress(userId, sportId);
    console.log('EnrollmentService: Existing progress check result:', existingProgress);

    if (existingProgress.success && existingProgress.data) {
      console.log('EnrollmentService: User already enrolled');
      return {
        success: false,
        error: {
          code: 'ALREADY_ENROLLED',
          message: 'User is already enrolled in this sport',
        },
        timestamp: new Date(),
      };
    }

    // Get sport to validate it exists and get skills count
    console.log('EnrollmentService: Getting sport data...');
    const sportResult = await sportsService.getSport(sportId);
    console.log('EnrollmentService: Sport result:', sportResult);

    if (!sportResult.success || !sportResult.data) {
      console.log('EnrollmentService: Sport not found');
      return {
        success: false,
        error: {
          code: 'SPORT_NOT_FOUND',
          message: 'Sport not found',
        },
        timestamp: new Date(),
      };
    }

    // Get total skills count for this sport
    const skillsResult = await sportsService.getSkillsBySport(sportId);
    const totalSkills = skillsResult.success ? skillsResult.data?.total || 0 : 0;

    const progressData: Omit<SportProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      sportId,
      status: 'not_started',
      completedSkills: [],
      totalSkills,
      progressPercentage: 0,
      timeSpent: 0,
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: Timestamp.fromDate(new Date()),
      },
      startedAt: Timestamp.fromDate(new Date()),
      lastAccessedAt: Timestamp.fromDate(new Date()),
    };

    const result = await this.create<SportProgress>(this.SPORT_PROGRESS_COLLECTION, progressData);

    if (result.success) {
      logger.info('User enrolled in sport successfully', 'EnrollmentService', {
        userId,
        sportId,
        progressId: result.data?.id
      });
    } else {
      logger.error('Sport enrollment failed', 'EnrollmentService', result.error);
    }

    return result;
  }

  /**
   * Get all sports a user is enrolled in with their progress
   */
  async getUserEnrolledSports(
    userId: string,
    options: QueryOptions = {}
  ): Promise<ApiResponse<Array<{ sport: Sport; progress: SportProgress }>>> {
    logger.database('query', this.SPORT_PROGRESS_COLLECTION, undefined, { userId });

    // Get all sport progress records for user
    const progressResult = await this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'lastAccessedAt', direction: 'desc' }],
      ...options,
    });

    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: progressResult.error || { message: 'Failed to fetch enrolled sports' },
        timestamp: new Date(),
      };
    }

    // Get sport details for each progress record and calculate live progress
    const enrolledSports: Array<{ sport: Sport; progress: SportProgress }> = [];

    for (const progress of progressResult.data.items) {
      const sportResult = await sportsService.getSport(progress.sportId);
      if (!sportResult.success || !sportResult.data) continue;

      const sport = sportResult.data;

      // Get all skills for this sport
      const skillsResult = await sportsService.getSkillsBySport(sport.id);
      const skills = skillsResult.success ? skillsResult.data?.items || [] : [];
      const totalSkills = skills.length;

      // Use stored progress data from the progress record
      // Progress will be calculated and updated when video quizzes are completed
      const progressPercentage = progress.progressPercentage || 0;
      const totalTime = progress.timeSpent || 0;
      const completedSkillIds = progress.completedSkills || [];
      const currentStreak = progress.streak?.current || 0;
      const longestStreak = progress.streak?.longest || 0;

      // Determine status based on completed skills
      let status: 'not_started' | 'in_progress' | 'completed' = 'not_started';
      if (completedSkillIds.length === totalSkills && totalSkills > 0) {
        status = 'completed';
      } else if (completedSkillIds.length > 0) {
        status = 'in_progress';
      }

      // Update progress with calculated values
      const updatedProgress: SportProgress = {
        ...progress,
        progressPercentage: Math.round(progressPercentage * 10) / 10, // Round to 1 decimal
        timeSpent: totalTime,
        completedSkills: completedSkillIds,
        totalSkills,
        status,
        streak: {
          current: currentStreak,
          longest: longestStreak,
          lastActiveDate: progress.streak?.lastActiveDate || Timestamp.fromDate(new Date()),
        },
      };

      enrolledSports.push({
        sport,
        progress: updatedProgress,
      });
    }

    logger.debug('Retrieved enrolled sports with calculated progress', 'EnrollmentService', {
      userId,
      count: enrolledSports.length
    });

    return {
      success: true,
      data: enrolledSports,
      timestamp: new Date(),
    };
  }

  /**
   * Get user's progress for a specific sport
   */
  async getUserSportProgress(
    userId: string,
    sportId: string
  ): Promise<ApiResponse<SportProgress | null>> {
    const result = await this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'sportId', operator: '==', value: sportId },
      ],
      limit: 1,
    });

    return {
      success: result.success,
      data: result.data?.items[0] || null,
      error: result.error,
      timestamp: new Date(),
    };
  }

  /**
   * Check if user is enrolled in a sport
   */
  async isUserEnrolled(userId: string, sportId: string): Promise<boolean> {
    const result = await this.getUserSportProgress(userId, sportId);
    return result.success && result.data !== null;
  }

  /**
   * Unenroll user from a sport (delete progress record)
   */
  async unenrollFromSport(
    userId: string,
    sportId: string
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getUserSportProgress(userId, sportId);

    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in this sport',
        },
        timestamp: new Date(),
      };
    }

    const result = await this.delete(this.SPORT_PROGRESS_COLLECTION, progressResult.data.id);

    if (result.success) {
      logger.info('User unenrolled from sport', 'EnrollmentService', { userId, sportId });
    }

    return result;
  }

  /**
   * Update enrollment progress (when user completes skills, etc.)
   */
  async updateEnrollmentProgress(
    userId: string,
    sportId: string,
    updates: Partial<SportProgress>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getUserSportProgress(userId, sportId);

    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'NOT_ENROLLED',
          message: 'User is not enrolled in this sport',
        },
        timestamp: new Date(),
      };
    }

    // Calculate progress percentage if skills were updated
    if (updates.completedSkills && progressResult.data.totalSkills > 0) {
      updates.progressPercentage = (updates.completedSkills.length / progressResult.data.totalSkills) * 100;

      // Update status based on progress
      if (updates.progressPercentage === 100) {
        updates.status = 'completed';
        updates.completedAt = Timestamp.fromDate(new Date());
      } else if (updates.progressPercentage > 0) {
        updates.status = 'in_progress';
      }
    }

    // Always update last accessed time
    updates.lastAccessedAt = Timestamp.fromDate(new Date());

    return this.update<SportProgress>(this.SPORT_PROGRESS_COLLECTION, progressResult.data.id, updates);
  }

  /**
   * Get enrollment statistics for analytics
   */
  async getEnrollmentStats(sportId?: string): Promise<ApiResponse<{
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    averageProgress: number;
  }>> {
    const whereClause: any[] = [];
    if (sportId) {
      whereClause.push({ field: 'sportId', operator: '==', value: sportId });
    }

    const result = await this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
      where: whereClause,
    });

    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || { message: 'Failed to fetch enrollment stats' },
        timestamp: new Date(),
      };
    }

    const enrollments = result.data.items;
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.status === 'in_progress').length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const averageProgress = enrollments.length > 0
      ? enrollments.reduce((sum, e) => sum + e.progressPercentage, 0) / enrollments.length
      : 0;

    return {
      success: true,
      data: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        averageProgress,
      },
      timestamp: new Date(),
    };
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();
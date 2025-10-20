import { BaseDatabaseService } from '../base.service';
import {
  VideoQuiz,
  VideoQuizProgress,
  VideoQuizMetadata,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  DifficultyLevel,
} from '@/types';
import { logger } from '../../utils/logger';
import { Timestamp } from 'firebase/firestore';

/**
 * Service for managing video quizzes and student progress in the SportsCoach application.
 *
 * This service provides comprehensive functionality for:
 * - CRUD operations for video quizzes
 * - Video quiz progress tracking
 * - Video quiz analytics and reporting
 * - Real-time subscriptions for progress updates
 *
 * @example
 * ```typescript
 * // Create a new video quiz
 * const result = await videoQuizService.createVideoQuiz({
 *   title: 'Shooting Form Analysis',
 *   videoUrl: 'https://storage.../video.mp4',
 *   videoDuration: 480,
 *   skillId: 'shooting-technique',
 *   sportId: 'basketball',
 *   questions: [...],
 *   settings: {...}
 * });
 *
 * // Get user progress
 * const progress = await videoQuizService.getUserProgress('user123', 'quiz456');
 * ```
 */
export class VideoQuizService extends BaseDatabaseService {
  private readonly VIDEO_QUIZZES_COLLECTION = 'video_quizzes';
  private readonly VIDEO_QUIZ_PROGRESS_COLLECTION = 'video_quiz_progress';

  // Video Quiz CRUD operations

  /**
   * Creates a new video quiz in the database.
   */
  async createVideoQuiz(
    quiz: Omit<VideoQuiz, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.VIDEO_QUIZZES_COLLECTION, undefined, {
      title: quiz.title,
      skillId: quiz.skillId,
      sportId: quiz.sportId,
    });

    // Validate required fields
    if (!quiz.sportId || quiz.sportId.trim() === '') {
      logger.warn('Video quiz creation failed: sportId is required', 'VideoQuizService', {
        quizTitle: quiz.title,
      });
      return {
        success: false,
        error: {
          code: 'SPORT_ID_REQUIRED',
          message: 'Every video quiz must be associated with a valid sport',
        },
        timestamp: new Date(),
      };
    }

    if (!quiz.skillId || quiz.skillId.trim() === '') {
      logger.warn('Video quiz creation failed: skillId is required', 'VideoQuizService', {
        quizTitle: quiz.title,
      });
      return {
        success: false,
        error: {
          code: 'SKILL_ID_REQUIRED',
          message: 'Every video quiz must be associated with a valid skill',
        },
        timestamp: new Date(),
      };
    }

    if (!quiz.videoUrl || quiz.videoUrl.trim() === '') {
      return {
        success: false,
        error: {
          code: 'VIDEO_URL_REQUIRED',
          message: 'Video URL is required for video quizzes',
        },
        timestamp: new Date(),
      };
    }

    try {
      // Verify sport exists
      const sportExists = await this.documentExists('sports', quiz.sportId);
      if (!sportExists) {
        logger.warn('Video quiz creation failed: sport not found', 'VideoQuizService', {
          sportId: quiz.sportId,
        });
        return {
          success: false,
          error: {
            code: 'SPORT_NOT_FOUND',
            message: `Sport with ID '${quiz.sportId}' does not exist`,
          },
          timestamp: new Date(),
        };
      }

      // Verify skill exists and belongs to the sport
      const skill = await this.getDocument('skills', quiz.skillId);
      if (!skill) {
        logger.warn('Video quiz creation failed: skill not found', 'VideoQuizService', {
          skillId: quiz.skillId,
        });
        return {
          success: false,
          error: {
            code: 'SKILL_NOT_FOUND',
            message: `Skill with ID '${quiz.skillId}' does not exist`,
          },
          timestamp: new Date(),
        };
      }

      if (skill.sportId !== quiz.sportId) {
        logger.warn('Video quiz creation failed: skill does not belong to sport', 'VideoQuizService', {
          skillId: quiz.skillId,
          skillSportId: skill.sportId,
          quizSportId: quiz.sportId,
        });
        return {
          success: false,
          error: {
            code: 'SKILL_SPORT_MISMATCH',
            message: `Skill '${quiz.skillId}' does not belong to sport '${quiz.sportId}'`,
          },
          timestamp: new Date(),
        };
      }

      // Initialize metadata
      const metadata: VideoQuizMetadata = {
        totalAttempts: 0,
        totalCompletions: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        averageCompletionTime: 0,
        passRate: 0,
        dropOffPoints: [],
      };

      // Create the video quiz
      const now = Timestamp.now();
      const videoQuizData = {
        ...quiz,
        metadata,
        createdAt: now,
        updatedAt: now,
      };

      const docId = await this.addDocument(this.VIDEO_QUIZZES_COLLECTION, videoQuizData);

      logger.success('Video quiz created successfully', 'VideoQuizService', {
        quizId: docId,
        title: quiz.title,
      });

      return {
        success: true,
        data: { id: docId },
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create video quiz', 'VideoQuizService', error as Error, {
        title: quiz.title,
      });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZ_CREATE_FAILED',
          message: 'Failed to create video quiz',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Retrieves a video quiz by ID.
   */
  async getVideoQuiz(quizId: string): Promise<ApiResponse<VideoQuiz | null>> {
    logger.database('read', this.VIDEO_QUIZZES_COLLECTION, quizId);

    try {
      const quiz = await this.getDocument<VideoQuiz>(this.VIDEO_QUIZZES_COLLECTION, quizId);

      if (!quiz) {
        return {
          success: true,
          data: null,
          timestamp: new Date(),
        };
      }

      return {
        success: true,
        data: quiz,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch video quiz', 'VideoQuizService', error as Error, { quizId });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZ_FETCH_FAILED',
          message: 'Failed to fetch video quiz',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Updates a video quiz.
   */
  async updateVideoQuiz(
    quizId: string,
    updates: Partial<Omit<VideoQuiz, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<ApiResponse<void>> {
    logger.database('update', this.VIDEO_QUIZZES_COLLECTION, quizId, updates);

    try {
      await this.updateDocument(this.VIDEO_QUIZZES_COLLECTION, quizId, {
        ...updates,
        updatedAt: Timestamp.now(),
      });

      logger.success('Video quiz updated successfully', 'VideoQuizService', { quizId });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to update video quiz', 'VideoQuizService', error as Error, { quizId });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZ_UPDATE_FAILED',
          message: 'Failed to update video quiz',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Deletes a video quiz.
   */
  async deleteVideoQuiz(quizId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.VIDEO_QUIZZES_COLLECTION, quizId);

    try {
      await this.deleteDocument(this.VIDEO_QUIZZES_COLLECTION, quizId);

      logger.success('Video quiz deleted successfully', 'VideoQuizService', { quizId });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to delete video quiz', 'VideoQuizService', error as Error, { quizId });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZ_DELETE_FAILED',
          message: 'Failed to delete video quiz',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets all published video quizzes.
   */
  async getPublishedVideoQuizzes(
    options?: QueryOptions
  ): Promise<ApiResponse<PaginatedResponse<VideoQuiz>>> {
    logger.database('query', this.VIDEO_QUIZZES_COLLECTION, undefined, { published: true });

    try {
      const whereConditions = [
        { field: 'isActive', operator: '==' as const, value: true },
        { field: 'isPublished', operator: '==' as const, value: true },
      ];

      const result = await this.queryDocuments<VideoQuiz>(
        this.VIDEO_QUIZZES_COLLECTION,
        {
          ...options,
          where: [...(options?.where || []), ...whereConditions],
        }
      );

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch published video quizzes', 'VideoQuizService', error as Error);
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZZES_FETCH_FAILED',
          message: 'Failed to fetch published video quizzes',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets video quizzes by skill.
   */
  async getVideoQuizzesBySkill(
    skillId: string,
    options?: QueryOptions
  ): Promise<ApiResponse<PaginatedResponse<VideoQuiz>>> {
    logger.database('query', this.VIDEO_QUIZZES_COLLECTION, undefined, { skillId });

    try {
      const result = await this.queryDocuments<VideoQuiz>(
        this.VIDEO_QUIZZES_COLLECTION,
        {
          ...options,
          where: [
            ...(options?.where || []),
            { field: 'skillId', operator: '==' as const, value: skillId },
            { field: 'isActive', operator: '==' as const, value: true },
          ],
        }
      );

      return {
        success: true,
        data: result,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch video quizzes by skill', 'VideoQuizService', error as Error, {
        skillId,
      });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZZES_FETCH_FAILED',
          message: 'Failed to fetch video quizzes by skill',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  // Progress Management

  /**
   * Gets or creates user progress for a video quiz.
   */
  async getUserProgress(
    userId: string,
    quizId: string
  ): Promise<ApiResponse<VideoQuizProgress>> {
    logger.database('read', this.VIDEO_QUIZ_PROGRESS_COLLECTION, `progress_${userId}_${quizId}`);

    try {
      const progressId = `progress_${userId}_${quizId}`;
      let progress = await this.getDocument<VideoQuizProgress>(
        this.VIDEO_QUIZ_PROGRESS_COLLECTION,
        progressId
      );

      if (!progress) {
        // Get quiz to initialize progress
        const quizResult = await this.getVideoQuiz(quizId);
        if (!quizResult.success || !quizResult.data) {
          return {
            success: false,
            error: {
              code: 'VIDEO_QUIZ_NOT_FOUND',
              message: 'Video quiz not found',
            },
            timestamp: new Date(),
          };
        }

        const quiz = quizResult.data;

        // Create initial progress
        progress = {
          id: progressId,
          userId,
          videoQuizId: quizId,
          skillId: quiz.skillId,
          sportId: quiz.sportId,
          currentTime: 0,
          questionsAnswered: [],
          questionsRemaining: quiz.questions.length,
          score: 0,
          maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
          percentage: 0,
          passed: false,
          isCompleted: false,
          status: 'in-progress',
          attemptNumber: 1,
          startedAt: Timestamp.now(),
          watchTime: 0,
          totalTimeSpent: 0,
        };

        await this.setDocument(this.VIDEO_QUIZ_PROGRESS_COLLECTION, progressId, progress);
        logger.success('Video quiz progress initialized', 'VideoQuizService', {
          userId,
          quizId,
        });
      }

      return {
        success: true,
        data: progress,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get user progress', 'VideoQuizService', error as Error, {
        userId,
        quizId,
      });
      return {
        success: false,
        error: {
          code: 'PROGRESS_FETCH_FAILED',
          message: 'Failed to get user progress',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Saves user progress.
   */
  async saveProgress(progress: VideoQuizProgress): Promise<ApiResponse<void>> {
    logger.database('update', this.VIDEO_QUIZ_PROGRESS_COLLECTION, progress.id, {
      currentTime: progress.currentTime,
      questionsAnswered: progress.questionsAnswered.length,
    });

    try {
      await this.setDocument(this.VIDEO_QUIZ_PROGRESS_COLLECTION, progress.id, {
        ...progress,
        lastAccessedAt: Timestamp.now(),
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to save progress', 'VideoQuizService', error as Error, {
        progressId: progress.id,
      });
      return {
        success: false,
        error: {
          code: 'PROGRESS_SAVE_FAILED',
          message: 'Failed to save progress',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Completes a video quiz attempt.
   */
  async completeQuiz(progress: VideoQuizProgress): Promise<ApiResponse<void>> {
    logger.database('update', this.VIDEO_QUIZ_PROGRESS_COLLECTION, progress.id, {
      completed: true,
    });

    try {
      const completedProgress = {
        ...progress,
        isCompleted: true,
        status: 'submitted' as const,
        completedAt: Timestamp.now(),
        lastAccessedAt: Timestamp.now(),
      };

      await this.setDocument(
        this.VIDEO_QUIZ_PROGRESS_COLLECTION,
        progress.id,
        completedProgress
      );

      // Update quiz metadata
      await this.updateQuizMetadata(progress.videoQuizId, progress);

      logger.success('Video quiz completed', 'VideoQuizService', {
        progressId: progress.id,
        score: progress.percentage,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to complete quiz', 'VideoQuizService', error as Error, {
        progressId: progress.id,
      });
      return {
        success: false,
        error: {
          code: 'QUIZ_COMPLETE_FAILED',
          message: 'Failed to complete quiz',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Updates quiz metadata based on completion.
   */
  private async updateQuizMetadata(
    quizId: string,
    progress: VideoQuizProgress
  ): Promise<void> {
    try {
      const quiz = await this.getDocument<VideoQuiz>(this.VIDEO_QUIZZES_COLLECTION, quizId);
      if (!quiz) return;

      const metadata = quiz.metadata || {
        totalAttempts: 0,
        totalCompletions: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        averageCompletionTime: 0,
        passRate: 0,
        dropOffPoints: [],
      };

      // Update metadata
      metadata.totalAttempts += 1;
      metadata.totalCompletions += progress.isCompleted ? 1 : 0;

      // Recalculate averages
      if (metadata.totalCompletions > 0) {
        const currentAvgScore = metadata.averageScore * (metadata.totalCompletions - 1);
        metadata.averageScore = (currentAvgScore + progress.percentage) / metadata.totalCompletions;

        const currentAvgTime = metadata.averageTimeSpent * (metadata.totalCompletions - 1);
        metadata.averageTimeSpent =
          (currentAvgTime + progress.totalTimeSpent / 60) / metadata.totalCompletions;

        metadata.passRate = (metadata.averageScore >= quiz.settings.passingScore ? 1 : 0) * 100;
      }

      await this.updateDocument(this.VIDEO_QUIZZES_COLLECTION, quizId, {
        metadata,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      logger.error('Failed to update quiz metadata', 'VideoQuizService', error as Error, {
        quizId,
      });
      // Don't throw - metadata update failure shouldn't block quiz completion
    }
  }
}

// Export singleton instance
export const videoQuizService = new VideoQuizService();

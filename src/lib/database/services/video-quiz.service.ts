import { BaseDatabaseService } from '../base.service';
import {
  VideoQuiz,
  VideoQuizProgress,
  VideoQuizMetadata,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  WhereClause,
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

      // DEBUG: Log the exact data being sent to Firestore
      console.log('📦 [VideoQuizService] Preparing to save quiz:', {
        hasQuestions: !!videoQuizData.questions,
        questionsCount: videoQuizData.questions?.length,
        questionsIsArray: Array.isArray(videoQuizData.questions),
        firstQuestion: videoQuizData.questions?.[0],
        questionsField: videoQuizData.questions,
      });

      logger.debug('Creating video quiz with data', 'VideoQuizService', {
        videoQuizData: JSON.stringify(videoQuizData, (key, value) => {
          if (value === undefined) {
            return `[UNDEFINED_FIELD: ${key}]`;
          }
          return value;
        }, 2),
        undefinedFields: Object.keys(videoQuizData).filter(key => videoQuizData[key] === undefined),
      });

      // Check for undefined fields
      const undefinedFields = Object.keys(videoQuizData).filter(key => videoQuizData[key] === undefined);
      if (undefinedFields.length > 0) {
        logger.error('Found undefined fields in video quiz data', 'VideoQuizService', new Error('Undefined fields detected'), {
          undefinedFields,
          allFields: Object.keys(videoQuizData),
        });
      }

      const docId = await this.addDocument(this.VIDEO_QUIZZES_COLLECTION, videoQuizData);

      // DEBUG: Verify what was saved
      console.log('✅ [VideoQuizService] Quiz created with ID:', docId);

      // Immediately read it back to verify
      const verifyQuiz = await this.getDocument<VideoQuiz>(this.VIDEO_QUIZZES_COLLECTION, docId);
      console.log('🔄 [VideoQuizService] Verification read after create:', {
        docId,
        hasQuiz: !!verifyQuiz,
        hasQuestions: !!verifyQuiz?.questions,
        questionsCount: verifyQuiz?.questions?.length,
        firstQuestion: verifyQuiz?.questions?.[0],
      });

      logger.info('Video quiz created successfully', 'VideoQuizService', {
        quizId: docId,
        title: quiz.title,
        questionsCount: verifyQuiz?.questions?.length || 0,
      });

      return {
        success: true,
        data: { id: docId },
        timestamp: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code || 'VIDEO_QUIZ_CREATE_FAILED';

      logger.error('Failed to create video quiz', 'VideoQuizService', error as Error, {
        title: quiz.title,
        errorMessage,
        errorCode,
        sportId: quiz.sportId,
        skillId: quiz.skillId,
      });

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage || 'Failed to create video quiz',
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

      // DEBUG: Log what was fetched from Firestore
      console.log('🔍 [VideoQuizService] Raw quiz from Firestore:', {
        quizId,
        hasQuestions: !!quiz.questions,
        questionsIsArray: Array.isArray(quiz.questions),
        questionsLength: quiz.questions?.length,
        questionsType: typeof quiz.questions,
        firstQuestion: quiz.questions?.[0],
        allFields: Object.keys(quiz),
        rawQuestions: quiz.questions,
      });

      // Ensure questions field exists and is an array
      if (!quiz.questions) {
        console.warn('⚠️ Quiz has no questions field, initializing as empty array');
        quiz.questions = [];
      } else if (!Array.isArray(quiz.questions)) {
        console.warn('⚠️ Questions field is not an array:', typeof quiz.questions);
        // Try to convert if it's an object with numeric keys (like from Firestore)
        if (typeof quiz.questions === 'object') {
          const questionsArray = Object.values(quiz.questions);
          console.log('📋 Converting questions object to array:', questionsArray);
          quiz.questions = questionsArray as any;
        } else {
          quiz.questions = [];
        }
      }

      // Ensure each question has required fields
      quiz.questions = quiz.questions.map((q: any, index: number) => {
        // Make sure question has an ID
        if (!q.id) {
          q.id = `q_${quizId}_${index}`;
        }
        // Make sure question has points
        if (q.points === undefined || q.points === null) {
          q.points = 10; // Default points
        }
        // Make sure question has required field
        if (q.required === undefined) {
          q.required = true;
        }
        return q;
      });

      logger.debug('Video quiz processed', 'VideoQuizService', {
        quizId,
        finalQuestionsCount: quiz.questions.length,
      });

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

    // Debug logging
    console.log('🔧 [VideoQuizService] updateVideoQuiz called:', {
      quizId,
      updatesKeys: Object.keys(updates),
      questionsCount: updates.questions?.length,
      settingsKeys: updates.settings ? Object.keys(updates.settings) : [],
      settings: updates.settings,
    });

    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now(),
      };

      console.log('📦 [VideoQuizService] Calling updateDocument with:', {
        collection: this.VIDEO_QUIZZES_COLLECTION,
        quizId,
        dataKeys: Object.keys(updateData),
      });

      await this.updateDocument(this.VIDEO_QUIZZES_COLLECTION, quizId, updateData);

      console.log('✅ [VideoQuizService] Update successful');
      logger.info('Video quiz updated successfully', 'VideoQuizService', { quizId });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('❌ [VideoQuizService] Update failed with error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined,
      });

      logger.error('Failed to update video quiz', 'VideoQuizService', error as Error, { quizId });
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZ_UPDATE_FAILED',
          message: error instanceof Error ? error.message : 'Failed to update video quiz',
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

      logger.info('Video quiz deleted successfully', 'VideoQuizService', { quizId });

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
   * Gets all video quizzes (for admin).
   */
  async getVideoQuizzes(
    options?: QueryOptions
  ): Promise<ApiResponse<PaginatedResponse<VideoQuiz>>> {
    logger.database('query', this.VIDEO_QUIZZES_COLLECTION, undefined, { admin: true });

    try {
      const result = await this.query<VideoQuiz>(
        this.VIDEO_QUIZZES_COLLECTION,
        options || {}
      );

      if (!result.success) {
        logger.error('Query failed', 'VideoQuizService', result.error);
        return result;
      }

      return result;
    } catch (error) {
      logger.error('Failed to fetch video quizzes', 'VideoQuizService', error as Error);
      return {
        success: false,
        error: {
          code: 'VIDEO_QUIZZES_FETCH_FAILED',
          message: 'Failed to fetch video quizzes',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets all published video quizzes (for students).
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

      const result = await this.query<VideoQuiz>(
        this.VIDEO_QUIZZES_COLLECTION,
        {
          ...options,
          where: [...(options?.where || []), ...whereConditions],
        }
      );

      if (!result.success) {
        logger.error('Query failed', 'VideoQuizService', result.error);
        return result;
      }

      return result;
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
      const result = await this.query<VideoQuiz>(
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

      if (!result.success) {
        logger.error('Query failed', 'VideoQuizService', result.error);
        return result;
      }

      return result;
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
          isCompleted: false,
          status: 'in-progress',
          startedAt: Timestamp.now(),
          watchTime: 0,
          totalTimeSpent: 0,
        };

        await this.setDocument(this.VIDEO_QUIZ_PROGRESS_COLLECTION, progressId, progress);
        logger.info('Video quiz progress initialized', 'VideoQuizService', {
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

      logger.info('Video quiz completed', 'VideoQuizService', {
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
   * Gets user's video quiz attempts with filters.
   */
  async getUserVideoQuizAttempts(
    userId: string,
    filters?: {
      skillId?: string;
      sportId?: string;
      completed?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<PaginatedResponse<VideoQuizProgress>>> {
    logger.database('query', this.VIDEO_QUIZ_PROGRESS_COLLECTION, undefined, {
      userId,
      filters,
    });

    try {
      const whereConditions: WhereClause[] = [
        { field: 'userId', operator: '==', value: userId }
      ];

      if (filters?.skillId) {
        whereConditions.push({ field: 'skillId', operator: '==', value: filters.skillId });
      }

      if (filters?.sportId) {
        whereConditions.push({ field: 'sportId', operator: '==', value: filters.sportId });
      }

      if (filters?.completed !== undefined) {
        whereConditions.push({ field: 'isCompleted', operator: '==', value: filters.completed });
      }

      const queryOptions: QueryOptions = {
        where: whereConditions,
        orderBy: [{ field: 'completedAt', direction: 'desc' }],
        limit: filters?.limit || 10,
      };

      // Debug logging
      console.log('🔍 [VideoQuizService] Querying video quiz progress:', {
        collection: this.VIDEO_QUIZ_PROGRESS_COLLECTION,
        whereConditions,
        queryOptions,
      });

      const result = await this.query<VideoQuizProgress>(
        this.VIDEO_QUIZ_PROGRESS_COLLECTION,
        queryOptions
      );

      console.log('📊 [VideoQuizService] Query result:', {
        success: result.success,
        itemsCount: result.data?.items?.length || 0,
        error: result.error,
      });

      return result;
    } catch (error) {
      logger.error('Failed to fetch user video quiz attempts', 'VideoQuizService', error as Error, {
        userId,
        filters,
      });
      return {
        success: false,
        error: {
          code: 'USER_VIDEO_QUIZ_ATTEMPTS_FETCH_FAILED',
          message: 'Failed to fetch user video quiz attempts',
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
      if (!quiz) {
        console.warn('Quiz not found for metadata update:', quizId);
        return;
      }

      const metadata = quiz.metadata || {
        totalAttempts: 0,
        totalCompletions: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        averageCompletionTime: 0,
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

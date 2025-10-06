import { BaseDatabaseService } from '../base.service';
import {
  Quiz,
  QuizQuestion,
  QuizAttempt,
  QuizAnswer,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  DifficultyLevel,
} from '@/types';
import { logger } from '../../utils/logger';
import { TimestampPatterns } from '../../utils/timestamp';

/**
 * Service for managing quizzes, quiz questions, and quiz attempts in the SportsCoach application.
 *
 * This service provides comprehensive functionality for:
 * - CRUD operations for quizzes and quiz questions
 * - Quiz attempt management and scoring
 * - Quiz eligibility checking and validation
 * - Analytics and reporting for quiz performance
 * - Real-time subscriptions for quiz attempts
 *
 * @example
 * ```typescript
 * // Create a new quiz
 * const result = await quizService.createQuiz({
 *   title: 'Basketball Fundamentals Quiz',
 *   description: 'Test your knowledge of basketball basics',
 *   skillId: 'skill123',
 *   sportId: 'sport456',
 *   difficulty: 'beginner',
 *   estimatedTimeToComplete: 15,
 *   passingScore: 70,
 *   maxAttempts: 3,
 *   isActive: true,
 *   questionsCount: 10
 * });
 *
 * // Start a quiz attempt
 * const attempt = await quizService.startQuizAttempt('user123', 'quiz456', 'skill789', 'sport123');
 * ```
 */
export class QuizService extends BaseDatabaseService {
  private readonly QUIZZES_COLLECTION = 'quizzes';
  private readonly QUIZ_QUESTIONS_COLLECTION = 'quiz_questions';
  private readonly QUIZ_ATTEMPTS_COLLECTION = 'quiz_attempts';

  // Quiz CRUD operations
  /**
   * Creates a new quiz in the database.
   *
   * @param quiz - Quiz data excluding auto-generated fields
   * @returns Promise resolving to API response with created quiz ID
   *
   * @example
   * ```typescript
   * const result = await quizService.createQuiz({
   *   title: 'Soccer Skills Assessment',
   *   description: 'Evaluate your soccer technique knowledge',
   *   skillId: 'soccer-dribbling',
   *   sportId: 'soccer',
   *   difficulty: 'intermediate',
   *   estimatedTimeToComplete: 20,
   *   passingScore: 75,
   *   maxAttempts: 2,
   *   isActive: true,
   *   questionsCount: 15
   * });
   * ```
   */
  async createQuiz(
    quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.QUIZZES_COLLECTION, undefined, {
      title: quiz.title,
      skillId: quiz.skillId,
      sportId: quiz.sportId
    });

    // MANDATORY: Validate that both sportId and skillId are provided and exist
    if (!quiz.sportId || quiz.sportId.trim() === '') {
      logger.warn('Quiz creation failed: sportId is required', 'QuizService', { quizTitle: quiz.title });
      return {
        success: false,
        error: {
          code: 'SPORT_ID_REQUIRED',
          message: 'Every quiz must be associated with a valid sport',
        },
        timestamp: new Date(),
      };
    }

    if (!quiz.skillId || quiz.skillId.trim() === '') {
      logger.warn('Quiz creation failed: skillId is required', 'QuizService', { quizTitle: quiz.title });
      return {
        success: false,
        error: {
          code: 'SKILL_ID_REQUIRED',
          message: 'Every quiz must be associated with a valid skill',
        },
        timestamp: new Date(),
      };
    }

    // Import sports service to validate relationships
    const { sportsService } = await import('./sports.service');

    // Check if sport exists
    const sportResult = await sportsService.getSport(quiz.sportId);
    if (!sportResult.success || !sportResult.data) {
      logger.warn('Quiz creation failed: sport not found', 'QuizService', {
        quizTitle: quiz.title,
        sportId: quiz.sportId
      });
      return {
        success: false,
        error: {
          code: 'SPORT_NOT_FOUND',
          message: `Sport with ID ${quiz.sportId} does not exist`,
        },
        timestamp: new Date(),
      };
    }

    // Check if skill exists
    const skillResult = await sportsService.getSkill(quiz.skillId);
    if (!skillResult.success || !skillResult.data) {
      logger.warn('Quiz creation failed: skill not found', 'QuizService', {
        quizTitle: quiz.title,
        skillId: quiz.skillId
      });
      return {
        success: false,
        error: {
          code: 'SKILL_NOT_FOUND',
          message: `Skill with ID ${quiz.skillId} does not exist`,
        },
        timestamp: new Date(),
      };
    }

    // Validate that the skill belongs to the sport
    if (skillResult.data.sportId !== quiz.sportId) {
      logger.warn('Quiz creation failed: skill does not belong to sport', 'QuizService', {
        quizTitle: quiz.title,
        skillId: quiz.skillId,
        skillSportId: skillResult.data.sportId,
        expectedSportId: quiz.sportId
      });
      return {
        success: false,
        error: {
          code: 'SKILL_SPORT_MISMATCH',
          message: `Skill ${quiz.skillId} does not belong to sport ${quiz.sportId}`,
        },
        timestamp: new Date(),
      };
    }

    const quizData = {
      ...quiz,
      metadata: {
        totalAttempts: 0,
        totalCompletions: 0,
        averageScore: 0,
        averageTimeSpent: 0,
        passRate: 0,
      },
    };

    const result = await this.create<Quiz>(this.QUIZZES_COLLECTION, quizData);

    if (result.success) {
      logger.info('Quiz created successfully', 'QuizService', {
        quizId: result.data?.id,
        title: quiz.title,
        sportId: quiz.sportId,
        skillId: quiz.skillId
      });
    } else {
      logger.error('Quiz creation failed', 'QuizService', result.error);
    }

    return result;
  }

  /**
   * Retrieves a quiz by its ID.
   *
   * @param quizId - The ID of the quiz to retrieve
   * @returns Promise resolving to API response with quiz data or null if not found
   *
   * @example
   * ```typescript
   * const result = await quizService.getQuiz('quiz123');
   * if (result.success && result.data) {
   *   console.log(`Found quiz: ${result.data.title}`);
   * }
   * ```
   */
  async getQuiz(quizId: string): Promise<ApiResponse<Quiz | null>> {
    logger.database('read', this.QUIZZES_COLLECTION, quizId);
    const result = await this.getById<Quiz>(this.QUIZZES_COLLECTION, quizId);

    if (result.success && result.data) {
      logger.debug('Quiz retrieved successfully', 'QuizService', { quizId, title: result.data.title });
    } else if (result.success && !result.data) {
      logger.warn('Quiz not found', 'QuizService', { quizId });
    } else {
      logger.error('Quiz retrieval failed', 'QuizService', result.error);
    }

    return result;
  }

  async updateQuiz(
    quizId: string,
    updates: Partial<Omit<Quiz, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>>
  ): Promise<ApiResponse<void>> {
    return this.update<Quiz>(this.QUIZZES_COLLECTION, quizId, updates);
  }

  async deleteQuiz(quizId: string): Promise<ApiResponse<void>> {
    // Delete all quiz questions first
    const questionsResult = await this.getQuizQuestions(quizId);
    if (questionsResult.success && questionsResult.data && questionsResult.data.items.length > 0) {
      const deleteOperations = questionsResult.data.items.map(question => ({
        type: 'delete' as const,
        collection: this.QUIZ_QUESTIONS_COLLECTION,
        id: question.id,
      }));

      await this.batchWrite(deleteOperations);
    }

    return this.delete(this.QUIZZES_COLLECTION, quizId);
  }

  async getQuizzesBySkill(
    skillId: string,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'skillId', operator: '==', value: skillId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'difficulty', direction: 'asc' }],
      ...options,
    };

    return this.query<Quiz>(this.QUIZZES_COLLECTION, queryOptions);
  }

  async getQuizzesBySport(
    sportId: string,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'sportId', operator: '==', value: sportId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'difficulty', direction: 'asc' }],
      ...options,
    };

    return this.query<Quiz>(this.QUIZZES_COLLECTION, queryOptions);
  }

  async getQuizzesByDifficulty(
    difficulty: DifficultyLevel,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'difficulty', operator: '==', value: difficulty },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'title', direction: 'asc' }],
      ...options,
    };

    return this.query<Quiz>(this.QUIZZES_COLLECTION, queryOptions);
  }

  /**
   * Gets all published/active quizzes for public consumption.
   * Used by the quizzes listing page.
   */
  async getPublishedQuizzes(
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Quiz>>> {
    logger.database('query', this.QUIZZES_COLLECTION, undefined, {
      operation: 'getPublishedQuizzes',
      constraints: [{ field: 'isActive', operator: '==', value: true }]
    });

    const queryOptions: QueryOptions = {
      where: [
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'title', direction: 'asc' }],
      ...options,
    };

    const result = await this.query<Quiz>(this.QUIZZES_COLLECTION, queryOptions);

    if (result.success) {
      logger.info('Published quizzes retrieved successfully', 'QuizService', {
        count: result.data?.items.length || 0
      });
    } else {
      logger.error('Failed to retrieve published quizzes', 'QuizService', result.error);
    }

    return result;
  }

  /**
   * Gets quiz with its statistics/analytics data.
   * Used for detailed quiz information with performance metrics.
   */
  async getQuizWithStatistics(quizId: string): Promise<ApiResponse<{
    quiz: Quiz;
    analytics: {
      totalAttempts: number;
      totalCompletions: number;
      completionRate: number;
      passRate: number;
      averageScore: number;
      averageTimeSpent: number;
    };
  } | null>> {
    logger.database('read', this.QUIZZES_COLLECTION, quizId, { includeAnalytics: true });

    // Get quiz and analytics in parallel
    const [quizResult, analyticsResult] = await Promise.all([
      this.getQuiz(quizId),
      this.getQuizAnalytics(quizId)
    ]);

    if (!quizResult.success || !quizResult.data) {
      logger.warn('Quiz not found for statistics', 'QuizService', { quizId });
      return {
        success: false,
        error: {
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found'
        },
        timestamp: new Date()
      };
    }

    if (!analyticsResult.success) {
      logger.warn('Failed to get quiz analytics', 'QuizService', {
        quizId,
        error: analyticsResult.error
      });
      // Return quiz without analytics rather than failing
      return {
        success: true,
        data: {
          quiz: quizResult.data,
          analytics: {
            totalAttempts: 0,
            totalCompletions: 0,
            completionRate: 0,
            passRate: 0,
            averageScore: 0,
            averageTimeSpent: 0,
          }
        },
        timestamp: new Date()
      };
    }

    return {
      success: true,
      data: {
        quiz: quizResult.data,
        analytics: {
          totalAttempts: analyticsResult.data!.totalAttempts,
          totalCompletions: analyticsResult.data!.totalCompletions,
          completionRate: analyticsResult.data!.completionRate,
          passRate: analyticsResult.data!.passRate,
          averageScore: analyticsResult.data!.averageScore,
          averageTimeSpent: analyticsResult.data!.averageTimeSpent,
        }
      },
      timestamp: new Date()
    };
  }

  // Quiz Questions CRUD operations
  async createQuizQuestion(
    question: Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.create<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION, question);
  }

  async getQuizQuestion(questionId: string): Promise<ApiResponse<QuizQuestion | null>> {
    return this.getById<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION, questionId);
  }

  async updateQuizQuestion(
    questionId: string,
    updates: Partial<Omit<QuizQuestion, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<void>> {
    return this.update<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION, questionId, updates);
  }

  async deleteQuizQuestion(questionId: string): Promise<ApiResponse<void>> {
    return this.delete(this.QUIZ_QUESTIONS_COLLECTION, questionId);
  }

  async getQuizQuestions(
    quizId: string,
    options: { includeAnswers?: boolean; shuffle?: boolean } = {}
  ): Promise<ApiResponse<PaginatedResponse<QuizQuestion>>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'quizId', operator: '==', value: quizId }],
      orderBy: [{ field: 'order', direction: 'asc' }],
    };

    const result = await this.query<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION, queryOptions);

    if (result.success && result.data) {
      // Remove correct answers if not explicitly requested
      if (!options.includeAnswers) {
        result.data.items = result.data.items.map(question => ({
          ...question,
          correctAnswer: undefined as any,
          explanation: '',
        }));
      }

      // Shuffle questions if requested
      if (options.shuffle) {
        result.data.items = this.shuffleArray([...result.data.items]);
      }
    }

    return result;
  }

  async reorderQuizQuestions(
    quizId: string,
    questionOrders: Array<{ questionId: string; order: number }>
  ): Promise<ApiResponse<void>> {
    const operations = questionOrders.map(({ questionId, order }) => ({
      type: 'update' as const,
      collection: this.QUIZ_QUESTIONS_COLLECTION,
      id: questionId,
      data: { order },
    }));

    return this.batchWrite(operations);
  }

  // Quiz Attempts
  /**
   * Starts a new quiz attempt for a user.
   *
   * @param userId - The ID of the user taking the quiz
   * @param quizId - The ID of the quiz to attempt
   * @param skillId - The ID of the associated skill
   * @param sportId - The ID of the associated sport
   * @returns Promise resolving to API response with attempt ID and number
   *
   * @example
   * ```typescript
   * const result = await quizService.startQuizAttempt(
   *   'user123',
   *   'quiz456',
   *   'skill789',
   *   'sport123'
   * );
   * if (result.success) {
   *   console.log(`Started attempt #${result.data.attemptNumber}`);
   * }
   * ```
   */
  async startQuizAttempt(
    userId: string,
    quizId: string,
    skillId: string,
    sportId: string
  ): Promise<ApiResponse<{ id: string; attemptNumber: number }>> {
    logger.info('Starting quiz attempt', 'QuizService', { userId, quizId, skillId, sportId });

    // Check if user is eligible to take quiz
    const eligibilityResult = await this.checkQuizEligibility(userId, quizId);

    if (!eligibilityResult.success || !eligibilityResult.data?.eligible) {
      logger.warn('Quiz attempt not eligible', 'QuizService', {
        userId,
        quizId,
        reason: eligibilityResult.data?.reason || 'Eligibility check failed',
        attemptNumber: eligibilityResult.data?.attemptNumber,
        attemptsRemaining: eligibilityResult.data?.attemptsRemaining,
      });
      return {
        success: false,
        error: {
          code: 'QUIZ_NOT_ELIGIBLE',
          message: eligibilityResult.data?.reason || 'Not eligible to take this quiz. You may have exceeded maximum attempts or have an incomplete attempt.',
        },
        timestamp: new Date(),
      };
    }

    // Get quiz to get passing score and calculate max score
    const quizResult = await this.getQuiz(quizId);
    const passingScore = quizResult.success && quizResult.data ? quizResult.data.settings.passingScore : 70;

    // Get quiz questions to calculate max score
    const questionsResult = await this.getQuizQuestions(quizId, { includeAnswers: true });
    const totalPoints = questionsResult.success && questionsResult.data
      ? questionsResult.data.items.reduce((sum, q) => sum + q.points, 0)
      : 0;

    // Create with ONLY required fields first to avoid permission issues
    const attemptData = {
      userId,
      quizId,
      skillId,
      sportId,
      answers: [],
      score: 0,
      maxScore: totalPoints,
      percentage: 0,
      pointsEarned: 0,
      totalPoints: totalPoints,
      passed: false,
      timeSpent: 0,
      attemptNumber: eligibilityResult.data.attemptNumber,
      isCompleted: false,
      status: 'in-progress' as const,
      passingScore,
      startedAt: TimestampPatterns.forDatabase(),
    };

    logger.info('Creating quiz attempt with data', 'QuizService', {
      userId,
      quizId,
      skillId,
      sportId,
      attemptNumber: eligibilityResult.data.attemptNumber,
      totalPoints,
      passingScore,
    });

    const result = await this.create<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptData);

    if (!result.success) {
      logger.error('Failed to create quiz attempt', 'QuizService', {
        error: result.error,
        attemptData: { userId, quizId, skillId, sportId }
      });
    }

    if (result.success) {
      // Update quiz metadata
      await this.incrementField(this.QUIZZES_COLLECTION, quizId, 'metadata.totalAttempts');

      logger.info('Quiz attempt started successfully', 'QuizService', {
        attemptId: result.data!.id,
        userId,
        quizId,
        attemptNumber: attemptData.attemptNumber
      });

      return {
        success: true,
        data: {
          id: result.data!.id,
          attemptNumber: attemptData.attemptNumber,
        },
        timestamp: new Date(),
      };
    }

    logger.error('Quiz attempt creation failed', 'QuizService', result.error);
    return result;
  }

  async submitQuizAnswer(
    attemptId: string,
    questionId: string,
    answer: string | number,
    timeSpent: number
  ): Promise<ApiResponse<{ isCorrect: boolean; correctAnswer?: string | number }>> {
    // Get the attempt
    const attemptResult = await this.getById<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId);
    if (!attemptResult.success || !attemptResult.data) {
      return {
        success: false,
        error: {
          code: 'ATTEMPT_NOT_FOUND',
          message: 'Quiz attempt not found',
        },
        timestamp: new Date(),
      };
    }

    // Get the question to check correct answer
    const questionResult = await this.getQuizQuestion(questionId);
    if (!questionResult.success || !questionResult.data) {
      return {
        success: false,
        error: {
          code: 'QUESTION_NOT_FOUND',
          message: 'Quiz question not found',
        },
        timestamp: new Date(),
      };
    }

    const question = questionResult.data;
    const isCorrect = this.checkAnswer(question, answer);

    // Update attempt with answer
    const attempt = attemptResult.data;
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);

    const quizAnswer: QuizAnswer = {
      questionId,
      answer,
      isCorrect,
      timeSpent,
      skipped: false,
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      attempt.answers[existingAnswerIndex] = quizAnswer;
    } else {
      // Add new answer
      attempt.answers.push(quizAnswer);
    }

    // Calculate current score
    attempt.score = attempt.answers
      .filter(a => a.isCorrect)
      .reduce((sum, a) => {
        const q = questionResult.data;
        return sum + (q ? q.points : 0);
      }, 0);

    await this.update<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId, {
      answers: attempt.answers,
      score: attempt.score,
    });

    return {
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
      },
      timestamp: new Date(),
    };
  }

  async completeQuizAttempt(
    attemptId: string,
    totalTimeSpent: number
  ): Promise<ApiResponse<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  }>> {
    // Get the attempt
    const attemptResult = await this.getById<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId);
    if (!attemptResult.success || !attemptResult.data) {
      return {
        success: false,
        error: {
          code: 'ATTEMPT_NOT_FOUND',
          message: 'Quiz attempt not found',
        },
        timestamp: new Date(),
      };
    }

    const attempt = attemptResult.data;

    // Get quiz to check passing score
    const quizResult = await this.getQuiz(attempt.quizId);
    if (!quizResult.success || !quizResult.data) {
      return {
        success: false,
        error: {
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found',
        },
        timestamp: new Date(),
      };
    }

    const quiz = quizResult.data;

    // Calculate final scores
    const percentage = attempt.maxScore > 0 ? (attempt.score / attempt.maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;
    const correctAnswers = attempt.answers.filter(a => a.isCorrect).length;
    const totalQuestions = attempt.answers.length;

    // Update attempt as completed
    await this.update<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId, {
      percentage,
      passed,
      timeSpent: totalTimeSpent,
      isCompleted: true,
      submittedAt: TimestampPatterns.forDatabase(),
    });

    // Update quiz metadata
    const updates: any = {};
    if (passed) {
      await this.incrementField(this.QUIZZES_COLLECTION, attempt.quizId, 'metadata.totalCompletions');
    }

    // Update average score and time (simplified - in production, use more sophisticated aggregation)
    await this.updateQuizStatistics(attempt.quizId);

    return {
      success: true,
      data: {
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage,
        passed,
        correctAnswers,
        totalQuestions,
      },
      timestamp: new Date(),
    };
  }

  async getQuizAttempt(attemptId: string): Promise<ApiResponse<QuizAttempt | null>> {
    return this.getById<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId);
  }

  async updateQuizAttempt(
    attemptId: string,
    updates: Partial<Omit<QuizAttempt, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<void>> {
    return this.update<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, attemptId, updates);
  }

  /**
   * Gets all quiz attempts for a specific quiz (used for statistics).
   * This is used by frontend pages that need quiz attempt data.
   */
  async getQuizAttempts(
    quizId: string,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<QuizAttempt>>> {
    logger.database('query', this.QUIZ_ATTEMPTS_COLLECTION, undefined, {
      operation: 'getQuizAttempts',
      quizId,
      constraints: [{ field: 'quizId', operator: '==', value: quizId }]
    });

    const queryOptions: QueryOptions = {
      where: [
        { field: 'quizId', operator: '==', value: quizId }
      ],
      orderBy: [{ field: 'startedAt', direction: 'desc' }],
      ...options,
    };

    const result = await this.query<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, queryOptions);

    if (result.success) {
      logger.debug('Quiz attempts retrieved successfully', 'QuizService', {
        quizId,
        count: result.data?.items.length || 0
      });
    } else {
      logger.error('Failed to retrieve quiz attempts', 'QuizService', result.error);
    }

    return result;
  }

  async getUserQuizAttempts(
    userId: string,
    options: {
      quizId?: string;
      skillId?: string;
      sportId?: string;
      completed?: boolean;
    } & QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<QuizAttempt>>> {
    const whereClause = [
      { field: 'userId', operator: '==' as const, value: userId },
    ];

    if (options.quizId) {
      whereClause.push({ field: 'quizId', operator: '==', value: options.quizId });
    }

    if (options.skillId) {
      whereClause.push({ field: 'skillId', operator: '==', value: options.skillId });
    }

    if (options.sportId) {
      whereClause.push({ field: 'sportId', operator: '==', value: options.sportId });
    }

    if (options.completed !== undefined) {
      whereClause.push({ field: 'isCompleted', operator: '==', value: options.completed });
    }

    const queryOptions: QueryOptions = {
      where: whereClause,
      orderBy: [{ field: 'startedAt', direction: 'desc' }],
      limit: options.limit,
      offset: options.offset,
    };

    return this.query<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, queryOptions);
  }

  async checkQuizEligibility(
    userId: string,
    quizId: string
  ): Promise<ApiResponse<{
    eligible: boolean;
    reason?: string;
    attemptNumber: number;
    attemptsRemaining: number;
  }>> {
    // Get quiz details
    const quizResult = await this.getQuiz(quizId);
    if (!quizResult.success || !quizResult.data) {
      return {
        success: false,
        error: {
          code: 'QUIZ_NOT_FOUND',
          message: 'Quiz not found',
        },
        timestamp: new Date(),
      };
    }

    const quiz = quizResult.data;

    // Get user's previous attempts
    const attemptsResult = await this.getUserQuizAttempts(userId, { quizId });
    if (!attemptsResult.success) {
      return {
        success: false,
        error: attemptsResult.error,
        timestamp: new Date(),
      };
    }

    const attempts = attemptsResult.data?.items || [];
    const completedAttempts = attempts.filter(a => a.isCompleted);
    const attemptCount = completedAttempts.length;

    // Check if user has already passed
    const passedAttempt = completedAttempts.find(a => a.passed);
    if (passedAttempt) {
      return {
        success: true,
        data: {
          eligible: false,
          reason: 'Quiz already passed',
          attemptNumber: attemptCount + 1,
          attemptsRemaining: 0,
        },
        timestamp: new Date(),
      };
    }

    // Check max attempts
    if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
      return {
        success: true,
        data: {
          eligible: false,
          reason: 'Maximum attempts exceeded',
          attemptNumber: attemptCount + 1,
          attemptsRemaining: 0,
        },
        timestamp: new Date(),
      };
    }

    // Check for incomplete attempts
    const incompleteAttempt = attempts.find(a => !a.isCompleted);
    if (incompleteAttempt) {
      return {
        success: true,
        data: {
          eligible: false,
          reason: 'Incomplete attempt exists',
          attemptNumber: attemptCount + 1,
          attemptsRemaining: quiz.maxAttempts > 0 ? quiz.maxAttempts - attemptCount : -1,
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: {
        eligible: true,
        attemptNumber: attemptCount + 1,
        attemptsRemaining: quiz.maxAttempts > 0 ? quiz.maxAttempts - attemptCount : -1,
      },
      timestamp: new Date(),
    };
  }

  // Analytics and reporting
  async getQuizAnalytics(quizId: string): Promise<ApiResponse<{
    totalAttempts: number;
    totalCompletions: number;
    completionRate: number;
    passRate: number;
    averageScore: number;
    averageTimeSpent: number;
    questionAnalytics: Array<{
      questionId: string;
      correctRate: number;
      averageTimeSpent: number;
    }>;
  }>> {
    const [quizResult, attemptsResult] = await Promise.all([
      this.getQuiz(quizId),
      this.query<QuizAttempt>(this.QUIZ_ATTEMPTS_COLLECTION, {
        where: [{ field: 'quizId', operator: '==', value: quizId }],
      }),
    ]);

    if (!quizResult.success || !attemptsResult.success) {
      return {
        success: false,
        error: {
          code: 'ANALYTICS_FETCH_ERROR',
          message: 'Failed to fetch quiz analytics',
        },
        timestamp: new Date(),
      };
    }

    const attempts = attemptsResult.data?.items || [];
    const completedAttempts = attempts.filter(a => a.isCompleted);

    const totalAttempts = attempts.length;
    const totalCompletions = completedAttempts.length;
    const completionRate = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0;

    const passedAttempts = completedAttempts.filter(a => a.passed);
    const passRate = totalCompletions > 0 ? (passedAttempts.length / totalCompletions) * 100 : 0;

    const averageScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length
      : 0;

    const averageTimeSpent = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + a.timeSpent, 0) / completedAttempts.length
      : 0;

    // Question-level analytics
    const questionAnalytics: any[] = [];
    const questionsResult = await this.getQuizQuestions(quizId);
    if (questionsResult.success && questionsResult.data) {
      for (const question of questionsResult.data.items) {
        const answers = completedAttempts
          .flatMap(a => a.answers)
          .filter(a => a.questionId === question.id);

        const correctAnswers = answers.filter(a => a.isCorrect);
        const correctRate = answers.length > 0 ? (correctAnswers.length / answers.length) * 100 : 0;
        const avgTimeSpent = answers.length > 0
          ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length
          : 0;

        questionAnalytics.push({
          questionId: question.id,
          correctRate,
          averageTimeSpent: avgTimeSpent,
        });
      }
    }

    return {
      success: true,
      data: {
        totalAttempts,
        totalCompletions,
        completionRate,
        passRate,
        averageScore,
        averageTimeSpent,
        questionAnalytics,
      },
      timestamp: new Date(),
    };
  }

  // Helper methods
  private checkAnswer(question: QuizQuestion, userAnswer: string | number): boolean {
    const correctAnswer = question.correctAnswer;

    if (question.type === 'true_false') {
      return Boolean(userAnswer) === Boolean(correctAnswer);
    }

    if (question.type === 'multiple_choice' || question.type === 'image_choice') {
      return userAnswer === correctAnswer;
    }

    if (question.type === 'descriptive') {
      // For descriptive questions, this would typically require manual grading
      // For now, return false (manual grading required)
      return false;
    }

    return false;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async updateQuizStatistics(quizId: string): Promise<void> {
    // This would typically be done with aggregation functions
    // For now, we'll skip complex statistical updates
    // In production, consider using Cloud Functions for aggregations
  }

  // Real-time subscriptions
  subscribeToQuizAttempts(
    userId: string,
    callback: (attempts: QuizAttempt[]) => void
  ): () => void {
    return this.subscribeToCollection<QuizAttempt>(
      this.QUIZ_ATTEMPTS_COLLECTION,
      {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'startedAt', direction: 'desc' }],
      },
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }

  // Batch operations
  /**
   * Bulk updates multiple quizzes with provided data.
   * Used for admin operations like bulk publishing or status changes.
   *
   * @param updates - Array of quiz updates with ID and data
   * @returns Promise resolving to API response indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await quizService.bulkUpdateQuizzes([
   *   { id: 'quiz1', data: { isPublished: true } },
   *   { id: 'quiz2', data: { isPublished: true, updatedAt: new Date() } }
   * ]);
   * ```
   */
  async bulkUpdateQuizzes(
    updates: Array<{ id: string; data: Partial<Quiz> }>
  ): Promise<ApiResponse<{ updated: number; failed: number; results: Array<{ id: string; success: boolean; error?: string }> }>> {
    logger.database('batch_update', this.QUIZZES_COLLECTION, undefined, { count: updates.length });

    if (updates.length === 0) {
      return {
        success: true,
        data: { updated: 0, failed: 0, results: [] },
        timestamp: new Date(),
      };
    }

    const results: Array<{ id: string; success: boolean; error?: string }> = [];
    let updated = 0;
    let failed = 0;

    // Use batchWrite for atomic operations
    const batchOperations = updates.map(({ id, data }) => ({
      type: 'update' as const,
      collection: this.QUIZZES_COLLECTION,
      id,
      data: {
        ...data,
        updatedAt: new Date(),
      },
    }));

    try {
      const batchResult = await this.batchWrite(batchOperations);

      if (batchResult.success) {
        updated = updates.length;
        results.push(...updates.map(u => ({ id: u.id, success: true })));
        logger.info('Bulk quiz update completed successfully', 'QuizService', { updated });
      } else {
        failed = updates.length;
        results.push(...updates.map(u => ({
          id: u.id,
          success: false,
          error: batchResult.error?.message || 'Unknown error'
        })));
        logger.error('Bulk quiz update failed', 'QuizService', batchResult.error);
      }

      return {
        success: batchResult.success,
        data: { updated, failed, results },
        error: batchResult.error,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Bulk quiz update error', 'QuizService', { error });
      failed = updates.length;
      results.push(...updates.map(u => ({
        id: u.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })));

      return {
        success: false,
        data: { updated: 0, failed, results },
        error: {
          code: 'BULK_UPDATE_ERROR',
          message: 'Failed to perform bulk update',
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const quizService = new QuizService();
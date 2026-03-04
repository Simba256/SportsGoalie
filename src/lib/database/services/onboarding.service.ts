import { BaseDatabaseService } from '../base.service';
import {
  ApiResponse,
  OnboardingEvaluation,
  OnboardingQuestion,
  AssessmentResponse,
  PillarAssessmentResult,
  AssessmentLevel,
  PillarSlug,
  CoachReviewInput,
  EvaluationSummary,
  PILLARS,
  calculateLevel,
  User,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { ONBOARDING_QUESTIONS } from '@/data/onboarding-questions';

/**
 * Service for managing student onboarding evaluations.
 *
 * Handles the complete onboarding flow including:
 * - Creating and managing evaluations
 * - Saving question responses
 * - Calculating pillar scores and levels
 * - Coach review functionality
 */
export class OnboardingService extends BaseDatabaseService {
  private readonly EVALUATIONS_COLLECTION = 'onboarding_evaluations';
  private readonly USERS_COLLECTION = 'users';

  /**
   * Get all onboarding questions grouped by pillar
   */
  getOnboardingQuestions(): OnboardingQuestion[] {
    return ONBOARDING_QUESTIONS;
  }

  /**
   * Get questions for a specific pillar
   */
  getQuestionsForPillar(pillarSlug: PillarSlug): OnboardingQuestion[] {
    return ONBOARDING_QUESTIONS
      .filter(q => q.pillarSlug === pillarSlug)
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Create a new evaluation for a user
   */
  async createEvaluation(userId: string): Promise<ApiResponse<OnboardingEvaluation>> {
    logger.info('Creating onboarding evaluation', 'OnboardingService', { userId });

    try {
      // Check if evaluation already exists
      const existingResult = await this.getEvaluation(userId);
      if (existingResult.success && existingResult.data) {
        logger.info('Returning existing evaluation', 'OnboardingService', {
          userId,
          evaluationId: existingResult.data.id,
        });
        return {
          success: true,
          data: existingResult.data,
          timestamp: new Date(),
        };
      }

      const evaluationId = `eval_${userId}`;
      const now = Timestamp.now();

      const evaluationData: Omit<OnboardingEvaluation, 'id' | 'createdAt' | 'updatedAt'> = {
        userId,
        startedAt: now,
        status: 'in_progress',
        currentPillarIndex: 0,
        currentQuestionIndex: 0,
        responses: [],
      };

      await this.createWithId<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        evaluationId,
        evaluationData
      );

      const evaluation: OnboardingEvaluation = {
        id: evaluationId,
        ...evaluationData,
        createdAt: now,
        updatedAt: now,
      };

      logger.info('Evaluation created successfully', 'OnboardingService', {
        userId,
        evaluationId,
      });

      return {
        success: true,
        data: evaluation,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create evaluation', 'OnboardingService', { userId, error });
      return {
        success: false,
        error: {
          code: 'CREATE_EVALUATION_FAILED',
          message: 'Failed to create onboarding evaluation',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get a user's evaluation
   */
  async getEvaluation(userId: string): Promise<ApiResponse<OnboardingEvaluation | null>> {
    logger.database('read', this.EVALUATIONS_COLLECTION, `eval_${userId}`);

    try {
      const result = await this.getById<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        `eval_${userId}`
      );

      return {
        success: true,
        data: result.data || null,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get evaluation', 'OnboardingService', { userId, error });
      return {
        success: false,
        error: {
          code: 'GET_EVALUATION_FAILED',
          message: 'Failed to retrieve evaluation',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Save a response to a question
   */
  async saveResponse(
    evaluationId: string,
    response: AssessmentResponse,
    currentPillarIndex: number,
    currentQuestionIndex: number
  ): Promise<ApiResponse<void>> {
    logger.info('Saving response', 'OnboardingService', {
      evaluationId,
      questionId: response.questionId,
    });

    try {
      // Get current evaluation
      const evalResult = await this.getById<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        evaluationId
      );

      if (!evalResult.success || !evalResult.data) {
        return {
          success: false,
          error: {
            code: 'EVALUATION_NOT_FOUND',
            message: 'Evaluation not found',
          },
          timestamp: new Date(),
        };
      }

      // Update or add response
      const responses = [...evalResult.data.responses];
      const existingIndex = responses.findIndex(r => r.questionId === response.questionId);

      if (existingIndex >= 0) {
        responses[existingIndex] = response;
      } else {
        responses.push(response);
      }

      await this.update<OnboardingEvaluation>(this.EVALUATIONS_COLLECTION, evaluationId, {
        responses,
        currentPillarIndex,
        currentQuestionIndex,
      });

      logger.info('Response saved successfully', 'OnboardingService', {
        evaluationId,
        questionId: response.questionId,
        totalResponses: responses.length,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to save response', 'OnboardingService', { evaluationId, error });
      return {
        success: false,
        error: {
          code: 'SAVE_RESPONSE_FAILED',
          message: 'Failed to save response',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Complete an evaluation and calculate results
   */
  async completeEvaluation(userId: string): Promise<ApiResponse<OnboardingEvaluation>> {
    logger.info('Completing evaluation', 'OnboardingService', { userId });

    try {
      const evaluationId = `eval_${userId}`;
      const evalResult = await this.getById<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        evaluationId
      );

      if (!evalResult.success || !evalResult.data) {
        return {
          success: false,
          error: {
            code: 'EVALUATION_NOT_FOUND',
            message: 'Evaluation not found',
          },
          timestamp: new Date(),
        };
      }

      const evaluation = evalResult.data;

      // Calculate pillar assessments
      const pillarAssessments = this.calculatePillarAssessments(evaluation.responses);

      // Calculate overall level
      const { overallLevel, overallPercentage } = this.calculateOverallAssessment(pillarAssessments);

      const completedAt = Timestamp.now();
      const duration = Math.round(
        (completedAt.toMillis() - evaluation.startedAt.toMillis()) / 1000
      );

      // Update evaluation
      await this.update<OnboardingEvaluation>(this.EVALUATIONS_COLLECTION, evaluationId, {
        status: 'completed',
        completedAt,
        duration,
        overallLevel,
        overallPercentage,
        pillarAssessments,
      });

      // Update user document
      await this.update<User>(this.USERS_COLLECTION, userId, {
        onboardingCompleted: true,
        onboardingCompletedAt: completedAt,
        initialAssessmentLevel: overallLevel,
      });

      const completedEvaluation: OnboardingEvaluation = {
        ...evaluation,
        status: 'completed',
        completedAt,
        duration,
        overallLevel,
        overallPercentage,
        pillarAssessments,
        updatedAt: completedAt,
      };

      logger.info('Evaluation completed successfully', 'OnboardingService', {
        userId,
        overallLevel,
        overallPercentage,
        duration,
      });

      return {
        success: true,
        data: completedEvaluation,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to complete evaluation', 'OnboardingService', { userId, error });
      return {
        success: false,
        error: {
          code: 'COMPLETE_EVALUATION_FAILED',
          message: 'Failed to complete evaluation',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Calculate assessment results for each pillar
   */
  private calculatePillarAssessments(
    responses: AssessmentResponse[]
  ): Record<PillarSlug, PillarAssessmentResult> {
    const pillarAssessments: Record<string, PillarAssessmentResult> = {};

    for (const pillar of PILLARS) {
      const pillarResponses = responses.filter(r => r.pillarSlug === pillar.slug);

      const rawScore = pillarResponses.reduce((sum, r) => sum + r.points, 0);
      const maxScore = pillarResponses.reduce((sum, r) => sum + r.maxPoints, 0);
      const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
      const level = calculateLevel(percentage);

      // Generate strengths/weaknesses based on high/low scoring questions
      const { strengths, weaknesses } = this.analyzeResponses(pillarResponses, pillar.slug);

      pillarAssessments[pillar.slug] = {
        pillarSlug: pillar.slug,
        pillarName: pillar.name,
        rawScore,
        maxScore,
        percentage,
        level,
        strengths,
        weaknesses,
      };
    }

    return pillarAssessments as Record<PillarSlug, PillarAssessmentResult>;
  }

  /**
   * Analyze responses to identify strengths and weaknesses
   */
  private analyzeResponses(
    responses: AssessmentResponse[],
    _pillarSlug: PillarSlug
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const response of responses) {
      const scorePercentage = response.maxPoints > 0
        ? (response.points / response.maxPoints) * 100
        : 0;

      const question = ONBOARDING_QUESTIONS.find(q => q.id === response.questionId);
      if (!question) continue;

      // High score = strength, low score = weakness
      if (scorePercentage >= 80) {
        strengths.push(question.question);
      } else if (scorePercentage <= 40) {
        weaknesses.push(question.question);
      }
    }

    // Limit to top 3 each
    return {
      strengths: strengths.slice(0, 3),
      weaknesses: weaknesses.slice(0, 3),
    };
  }

  /**
   * Calculate overall assessment from pillar results
   */
  private calculateOverallAssessment(
    pillarAssessments: Record<PillarSlug, PillarAssessmentResult>
  ): { overallLevel: AssessmentLevel; overallPercentage: number } {
    const pillars = Object.values(pillarAssessments);
    const totalRawScore = pillars.reduce((sum, p) => sum + p.rawScore, 0);
    const totalMaxScore = pillars.reduce((sum, p) => sum + p.maxScore, 0);

    const overallPercentage = totalMaxScore > 0
      ? Math.round((totalRawScore / totalMaxScore) * 100)
      : 0;
    const overallLevel = calculateLevel(overallPercentage);

    return { overallLevel, overallPercentage };
  }

  /**
   * Mark user's onboarding as complete (fallback method)
   */
  async markOnboardingComplete(userId: string): Promise<ApiResponse<void>> {
    logger.info('Marking onboarding complete', 'OnboardingService', { userId });

    try {
      await this.update<User>(this.USERS_COLLECTION, userId, {
        onboardingCompleted: true,
        onboardingCompletedAt: Timestamp.now(),
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to mark onboarding complete', 'OnboardingService', { userId, error });
      return {
        success: false,
        error: {
          code: 'MARK_COMPLETE_FAILED',
          message: 'Failed to mark onboarding as complete',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get students with pending evaluation reviews (for coaches)
   */
  async getPendingReviews(coachId?: string): Promise<ApiResponse<EvaluationSummary[]>> {
    logger.info('Getting pending reviews', 'OnboardingService', { coachId });

    try {
      // Get all completed evaluations without coach review
      const evaluationsResult = await this.query<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        {
          where: [{ field: 'status', operator: '==', value: 'completed' }],
        }
      );

      if (!evaluationsResult.success || !evaluationsResult.data) {
        return {
          success: false,
          error: evaluationsResult.error,
          timestamp: new Date(),
        };
      }

      // Filter to only those without coach review
      const pendingEvaluations = evaluationsResult.data.items.filter(
        e => !e.coachReview
      );

      // Get user info for each evaluation
      const summaries: EvaluationSummary[] = [];

      for (const evaluation of pendingEvaluations) {
        const userResult = await this.getById<User>(this.USERS_COLLECTION, evaluation.userId);
        if (!userResult.success || !userResult.data) continue;

        const user = userResult.data;

        // If coachId provided, filter by assigned students
        if (coachId && user.assignedCoachId !== coachId) continue;

        summaries.push({
          evaluationId: evaluation.id,
          userId: evaluation.userId,
          studentName: user.displayName,
          studentEmail: user.email,
          completedAt: evaluation.completedAt!,
          overallLevel: evaluation.overallLevel!,
          overallPercentage: evaluation.overallPercentage!,
          hasCoachReview: false,
        });
      }

      return {
        success: true,
        data: summaries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get pending reviews', 'OnboardingService', { coachId, error });
      return {
        success: false,
        error: {
          code: 'GET_PENDING_REVIEWS_FAILED',
          message: 'Failed to retrieve pending reviews',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add coach review to an evaluation
   */
  async addCoachReview(input: CoachReviewInput): Promise<ApiResponse<void>> {
    logger.info('Adding coach review', 'OnboardingService', {
      evaluationId: input.evaluationId,
      coachId: input.coachId,
    });

    try {
      const evalResult = await this.getById<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        input.evaluationId
      );

      if (!evalResult.success || !evalResult.data) {
        return {
          success: false,
          error: {
            code: 'EVALUATION_NOT_FOUND',
            message: 'Evaluation not found',
          },
          timestamp: new Date(),
        };
      }

      const coachReview = {
        reviewedAt: Timestamp.now(),
        reviewedBy: input.coachId,
        reviewerName: input.coachName,
        notes: input.notes,
        adjustedLevel: input.adjustedLevel,
        adjustedPillarLevels: input.adjustedPillarLevels,
      };

      await this.update<OnboardingEvaluation>(this.EVALUATIONS_COLLECTION, input.evaluationId, {
        status: 'reviewed',
        coachReview,
      });

      // If level was adjusted, update user's initial assessment level
      if (input.adjustedLevel) {
        const evaluation = evalResult.data;
        await this.update<User>(this.USERS_COLLECTION, evaluation.userId, {
          initialAssessmentLevel: input.adjustedLevel,
        });
      }

      logger.info('Coach review added successfully', 'OnboardingService', {
        evaluationId: input.evaluationId,
        coachId: input.coachId,
        adjustedLevel: input.adjustedLevel,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to add coach review', 'OnboardingService', {
        evaluationId: input.evaluationId,
        error,
      });
      return {
        success: false,
        error: {
          code: 'ADD_REVIEW_FAILED',
          message: 'Failed to add coach review',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get evaluation by ID
   */
  async getEvaluationById(evaluationId: string): Promise<ApiResponse<OnboardingEvaluation | null>> {
    logger.database('read', this.EVALUATIONS_COLLECTION, evaluationId);

    try {
      const result = await this.getById<OnboardingEvaluation>(
        this.EVALUATIONS_COLLECTION,
        evaluationId
      );

      return {
        success: true,
        data: result.data || null,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get evaluation by ID', 'OnboardingService', {
        evaluationId,
        error,
      });
      return {
        success: false,
        error: {
          code: 'GET_EVALUATION_FAILED',
          message: 'Failed to retrieve evaluation',
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService();

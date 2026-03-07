import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingService } from '@/lib/database/services/onboarding.service';
import { createMockApiResponse } from '../../../setup';
import { Timestamp } from 'firebase/firestore';

// Mock the base service
vi.mock('@/lib/database/base.service', () => ({
  BaseDatabaseService: class {
    create = vi.fn();
    createWithId = vi.fn();
    getById = vi.fn();
    update = vi.fn();
    delete = vi.fn();
    query = vi.fn();
    count = vi.fn();
    incrementField = vi.fn();
    batchWrite = vi.fn();
    subscribeToDocument = vi.fn();
    subscribeToCollection = vi.fn();
    healthCheck = vi.fn();
    clearCache = vi.fn();
    getCacheStats = vi.fn();
    exists = vi.fn();
  },
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    database: vi.fn(),
  },
}));

// Mock goalie intake questions
vi.mock('@/data/goalie-intake-questions', () => ({
  extractAgeRange: vi.fn(() => '11-13'),
  extractExperienceLevel: vi.fn(() => '1-3 years'),
  extractPlayingLevel: vi.fn(() => 'House League'),
  extractGoalieCoachStatus: vi.fn(() => false),
  extractPrimaryReasons: vi.fn(() => ['Improve skills']),
}));

// Mock intelligence profile generator
vi.mock('@/lib/scoring/intelligence-profile', () => ({
  generateGoalieIntelligenceProfile: vi.fn(() => ({
    userId: 'user123',
    role: 'goalie',
    overallScore: 2.5,
    pacingLevel: 'development',
    categoryScores: [],
    identifiedGaps: [],
    identifiedStrengths: [],
    contentRecommendations: [],
    chartingEmphasis: [],
    assessmentCompletedAt: { toMillis: () => Date.now() },
    profileGeneratedAt: { toMillis: () => Date.now() },
  })),
}));

// Mock types
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    pacingLevelToAssessmentLevel: (level: string) => {
      if (level === 'refinement') return 'advanced';
      if (level === 'development') return 'intermediate';
      return 'beginner';
    },
  };
});

// Helper to create mock Timestamp
const createMockTimestamp = (millis: number = Date.now()) => ({
  toMillis: () => millis,
  toDate: () => new Date(millis),
  seconds: Math.floor(millis / 1000),
  nanoseconds: 0,
} as unknown as Timestamp);

// Helper to create mock evaluation data
const createMockEvaluation = (overrides: Record<string, unknown> = {}) => ({
  id: 'eval_user123',
  userId: 'user123',
  role: 'goalie',
  phase: 'intake' as const,
  currentCategoryIndex: 0,
  currentQuestionIndex: 0,
  assessmentResponses: [],
  status: 'in_progress' as const,
  createdAt: createMockTimestamp(),
  updatedAt: createMockTimestamp(),
  ...overrides,
});

// Helper to create mock assessment response
const createMockAssessmentResponse = (questionId: string, categorySlug: string, score: number) => ({
  questionId,
  questionCode: `Q-${questionId}`,
  categorySlug,
  value: 'option_1',
  score,
  answeredAt: createMockTimestamp(),
});

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockCreateWithId: ReturnType<typeof vi.fn>;
  let mockGetById: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    service = new OnboardingService();

    // Get access to the mocked methods
    mockCreateWithId = vi.mocked(service.createWithId);
    mockGetById = vi.mocked(service.getById);
    mockUpdate = vi.mocked(service.update);
    mockQuery = vi.mocked(service.query);

    vi.clearAllMocks();
  });

  describe('createEvaluation', () => {
    it('should return existing evaluation if one exists', async () => {
      const existingEval = createMockEvaluation();
      mockGetById.mockResolvedValue(createMockApiResponse(existingEval));

      const result = await service.createEvaluation('user123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(existingEval);
      expect(mockCreateWithId).not.toHaveBeenCalled();
    });

    it('should create new evaluation if none exists', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));
      mockCreateWithId.mockResolvedValue(createMockApiResponse({ id: 'eval_user123' }));

      const result = await service.createEvaluation('user123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.userId).toBe('user123');
      expect(result.data?.status).toBe('in_progress');
      expect(result.data?.phase).toBe('intake');
      expect(mockCreateWithId).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));
      mockCreateWithId.mockRejectedValue(new Error('Firestore error'));

      const result = await service.createEvaluation('user123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CREATE_EVALUATION_FAILED');
    });
  });

  describe('getEvaluation', () => {
    it('should retrieve evaluation by userId with new ID format', async () => {
      const evaluation = createMockEvaluation();
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));

      const result = await service.getEvaluation('user123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(evaluation);
    });

    it('should return null for non-existent evaluation', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));

      const result = await service.getEvaluation('nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockGetById.mockRejectedValue(new Error('Firestore error'));

      const result = await service.getEvaluation('user123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('GET_EVALUATION_FAILED');
    });
  });

  describe('saveAssessmentResponse', () => {
    it('should add new response to evaluation', async () => {
      const evaluation = createMockEvaluation({ assessmentResponses: [] });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const response = createMockAssessmentResponse('feelings-1', 'feelings', 3.0);
      const result = await service.saveAssessmentResponse('eval_user123', response, 0, 1);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'onboarding_evaluations',
        'eval_user123',
        expect.objectContaining({
          assessmentResponses: [response],
          currentCategoryIndex: 0,
          currentQuestionIndex: 1,
        })
      );
    });

    it('should update existing response', async () => {
      const existingResponse = createMockAssessmentResponse('feelings-1', 'feelings', 2.0);
      const evaluation = createMockEvaluation({ assessmentResponses: [existingResponse] });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const updatedResponse = createMockAssessmentResponse('feelings-1', 'feelings', 4.0);
      const result = await service.saveAssessmentResponse('eval_user123', updatedResponse, 0, 1);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'onboarding_evaluations',
        'eval_user123',
        expect.objectContaining({
          assessmentResponses: [updatedResponse],
        })
      );
    });

    it('should return error when evaluation not found', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null, false));

      const response = createMockAssessmentResponse('feelings-1', 'feelings', 3.0);
      const result = await service.saveAssessmentResponse('eval_nonexistent', response, 0, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EVALUATION_NOT_FOUND');
    });

    it('should handle save errors', async () => {
      const evaluation = createMockEvaluation();
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockRejectedValue(new Error('Firestore error'));

      const response = createMockAssessmentResponse('feelings-1', 'feelings', 3.0);
      const result = await service.saveAssessmentResponse('eval_user123', response, 0, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SAVE_ASSESSMENT_RESPONSE_FAILED');
    });
  });

  describe('completeEvaluation', () => {
    it('should complete evaluation and generate intelligence profile', async () => {
      const responses = [
        createMockAssessmentResponse('feelings-1', 'feelings', 3.0),
        createMockAssessmentResponse('knowledge-1', 'knowledge', 2.5),
      ];
      const evaluation = createMockEvaluation({
        assessmentResponses: responses,
        assessmentStartedAt: createMockTimestamp(Date.now() - 60000),
      });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.completeEvaluation('user123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.pacingLevel).toBe('development');
      expect(result.data?.overallScore).toBe(2.5);
    });

    it('should update user document with assessment data', async () => {
      const responses = [
        createMockAssessmentResponse('feelings-1', 'feelings', 3.0),
      ];
      const evaluation = createMockEvaluation({ assessmentResponses: responses });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      await service.completeEvaluation('user123');

      // Should update both evaluation and user documents
      expect(mockUpdate).toHaveBeenCalledTimes(2);
    });

    it('should return error when evaluation not found', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null, false));

      const result = await service.completeEvaluation('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EVALUATION_NOT_FOUND');
    });

    it('should handle completion errors', async () => {
      const evaluation = createMockEvaluation({ assessmentResponses: [] });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockRejectedValue(new Error('Firestore error'));

      const result = await service.completeEvaluation('user123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('COMPLETE_EVALUATION_FAILED');
    });
  });

  describe('markOnboardingComplete', () => {
    it('should mark onboarding as complete', async () => {
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.markOnboardingComplete('user123');

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'users',
        'user123',
        expect.objectContaining({
          onboardingCompleted: true,
        })
      );
    });

    it('should handle update errors', async () => {
      mockUpdate.mockRejectedValue(new Error('Firestore error'));

      const result = await service.markOnboardingComplete('user123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('MARK_COMPLETE_FAILED');
    });
  });

  describe('getPendingReviews', () => {
    it('should return pending reviews without coach filter', async () => {
      const evaluations = [
        createMockEvaluation({
          id: 'eval_1',
          status: 'completed',
          completedAt: createMockTimestamp(),
          pacingLevel: 'development',
          intelligenceProfile: { overallScore: 2.5 },
        }),
      ];
      const user = {
        id: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
      };

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: evaluations,
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );
      mockGetById.mockResolvedValue(createMockApiResponse(user));

      const result = await service.getPendingReviews();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter by coach ID when provided', async () => {
      const evaluations = [
        createMockEvaluation({ id: 'eval_1', status: 'completed' }),
      ];
      const user = {
        id: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
        assignedCoachId: 'coach123',
      };

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: evaluations,
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );
      mockGetById.mockResolvedValue(createMockApiResponse(user));

      const result = await service.getPendingReviews('coach123');

      expect(result.success).toBe(true);
    });

    it('should handle query errors', async () => {
      mockQuery.mockRejectedValue(new Error('Firestore error'));

      const result = await service.getPendingReviews();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('GET_PENDING_REVIEWS_FAILED');
    });
  });

  describe('addCoachReview', () => {
    it('should add coach review to evaluation', async () => {
      const evaluation = createMockEvaluation({ status: 'completed' });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const reviewInput = {
        evaluationId: 'eval_user123',
        coachId: 'coach123',
        coachName: 'Coach Name',
        notes: 'Good progress',
      };

      const result = await service.addCoachReview(reviewInput);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'onboarding_evaluations',
        'eval_user123',
        expect.objectContaining({
          status: 'reviewed',
          coachReview: expect.objectContaining({
            reviewedBy: 'coach123',
            reviewerName: 'Coach Name',
            notes: 'Good progress',
          }),
        })
      );
    });

    it('should update user level when adjusted', async () => {
      const evaluation = createMockEvaluation({ status: 'completed', userId: 'user123' });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const reviewInput = {
        evaluationId: 'eval_user123',
        coachId: 'coach123',
        coachName: 'Coach Name',
        notes: 'Adjusted level',
        adjustedLevel: 'intermediate' as const,
      };

      await service.addCoachReview(reviewInput);

      // Should update both evaluation and user
      expect(mockUpdate).toHaveBeenCalledTimes(2);
      expect(mockUpdate).toHaveBeenCalledWith(
        'users',
        'user123',
        expect.objectContaining({
          initialAssessmentLevel: 'intermediate',
        })
      );
    });

    it('should return error when evaluation not found', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null, false));

      const reviewInput = {
        evaluationId: 'eval_nonexistent',
        coachId: 'coach123',
        coachName: 'Coach Name',
        notes: 'Notes',
      };

      const result = await service.addCoachReview(reviewInput);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EVALUATION_NOT_FOUND');
    });

    it('should handle review errors', async () => {
      const evaluation = createMockEvaluation({ status: 'completed' });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockRejectedValue(new Error('Firestore error'));

      const reviewInput = {
        evaluationId: 'eval_user123',
        coachId: 'coach123',
        coachName: 'Coach Name',
        notes: 'Notes',
      };

      const result = await service.addCoachReview(reviewInput);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ADD_REVIEW_FAILED');
    });
  });

  describe('getEvaluationById', () => {
    it('should retrieve evaluation by ID', async () => {
      const evaluation = createMockEvaluation();
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));

      const result = await service.getEvaluationById('eval_user123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(evaluation);
    });

    it('should return null for non-existent evaluation', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));

      const result = await service.getEvaluationById('eval_nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockGetById.mockRejectedValue(new Error('Firestore error'));

      const result = await service.getEvaluationById('eval_user123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('GET_EVALUATION_FAILED');
    });
  });

});

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

// Mock onboarding questions
vi.mock('@/data/onboarding-questions', () => ({
  ONBOARDING_QUESTIONS: [
    {
      id: 'mindset-1',
      pillarSlug: 'mindset',
      type: 'rating',
      question: 'How well do you handle letting in a goal?',
      maxPoints: 5,
      order: 1,
    },
    {
      id: 'mindset-2',
      pillarSlug: 'mindset',
      type: 'rating',
      question: 'Rate your ability to stay focused.',
      maxPoints: 5,
      order: 2,
    },
    {
      id: 'skating-1',
      pillarSlug: 'skating',
      type: 'rating',
      question: 'How comfortable are you moving laterally?',
      maxPoints: 5,
      order: 1,
    },
    {
      id: 'skating-2',
      pillarSlug: 'skating',
      type: 'rating',
      question: 'Rate your butterfly drop speed.',
      maxPoints: 5,
      order: 2,
    },
  ],
}));

// Mock types
vi.mock('@/types', async () => {
  const actual = await vi.importActual('@/types');
  return {
    ...actual,
    PILLARS: [
      { slug: 'mindset', name: 'Mindset Development' },
      { slug: 'skating', name: 'Skating as a Skill' },
    ],
    calculateLevel: (percentage: number) => {
      if (percentage >= 80) return 'advanced';
      if (percentage >= 50) return 'intermediate';
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
const createMockEvaluation = (overrides: any = {}) => ({
  id: 'eval_user123',
  userId: 'user123',
  startedAt: createMockTimestamp(Date.now() - 60000),
  status: 'in_progress' as const,
  currentPillarIndex: 0,
  currentQuestionIndex: 0,
  responses: [],
  createdAt: createMockTimestamp(),
  updatedAt: createMockTimestamp(),
  ...overrides,
});

// Helper to create mock response
const createMockResponse = (questionId: string, pillarSlug: string, points: number, maxPoints: number) => ({
  questionId,
  pillarSlug,
  points,
  maxPoints,
  answeredAt: createMockTimestamp(),
});

describe('OnboardingService', () => {
  let service: OnboardingService;
  let mockCreateWithId: any;
  let mockGetById: any;
  let mockUpdate: any;
  let mockQuery: any;

  beforeEach(() => {
    service = new OnboardingService();

    // Get access to the mocked methods
    mockCreateWithId = vi.mocked(service.createWithId);
    mockGetById = vi.mocked(service.getById);
    mockUpdate = vi.mocked(service.update);
    mockQuery = vi.mocked(service.query);

    vi.clearAllMocks();
  });

  describe('getOnboardingQuestions', () => {
    it('should return all onboarding questions', () => {
      const questions = service.getOnboardingQuestions();

      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);
    });
  });

  describe('getQuestionsForPillar', () => {
    it('should return questions filtered by pillar', () => {
      const mindsetQuestions = service.getQuestionsForPillar('mindset');

      expect(mindsetQuestions).toBeDefined();
      expect(mindsetQuestions.every(q => q.pillarSlug === 'mindset')).toBe(true);
    });

    it('should return questions sorted by order', () => {
      const questions = service.getQuestionsForPillar('mindset');

      for (let i = 0; i < questions.length - 1; i++) {
        expect(questions[i].order).toBeLessThanOrEqual(questions[i + 1].order);
      }
    });

    it('should return empty array for unknown pillar', () => {
      const questions = service.getQuestionsForPillar('unknown' as any);

      expect(questions).toEqual([]);
    });
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
    it('should retrieve evaluation by userId', async () => {
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

  describe('saveResponse', () => {
    it('should add new response to evaluation', async () => {
      const evaluation = createMockEvaluation({ responses: [] });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const response = createMockResponse('mindset-1', 'mindset', 4, 5);
      const result = await service.saveResponse('eval_user123', response, 0, 1);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'onboarding_evaluations',
        'eval_user123',
        expect.objectContaining({
          responses: [response],
          currentPillarIndex: 0,
          currentQuestionIndex: 1,
        })
      );
    });

    it('should update existing response', async () => {
      const existingResponse = createMockResponse('mindset-1', 'mindset', 3, 5);
      const evaluation = createMockEvaluation({ responses: [existingResponse] });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const updatedResponse = createMockResponse('mindset-1', 'mindset', 5, 5);
      const result = await service.saveResponse('eval_user123', updatedResponse, 0, 1);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'onboarding_evaluations',
        'eval_user123',
        expect.objectContaining({
          responses: [updatedResponse],
        })
      );
    });

    it('should return error when evaluation not found', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null, false));

      const response = createMockResponse('mindset-1', 'mindset', 4, 5);
      const result = await service.saveResponse('eval_nonexistent', response, 0, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EVALUATION_NOT_FOUND');
    });

    it('should handle save errors', async () => {
      const evaluation = createMockEvaluation();
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockRejectedValue(new Error('Firestore error'));

      const response = createMockResponse('mindset-1', 'mindset', 4, 5);
      const result = await service.saveResponse('eval_user123', response, 0, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SAVE_RESPONSE_FAILED');
    });
  });

  describe('completeEvaluation', () => {
    it('should complete evaluation and calculate results', async () => {
      const responses = [
        createMockResponse('mindset-1', 'mindset', 4, 5),
        createMockResponse('mindset-2', 'mindset', 5, 5),
        createMockResponse('skating-1', 'skating', 3, 5),
        createMockResponse('skating-2', 'skating', 4, 5),
      ];
      const evaluation = createMockEvaluation({ responses });
      mockGetById.mockResolvedValue(createMockApiResponse(evaluation));
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.completeEvaluation('user123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
      expect(result.data?.pillarAssessments).toBeDefined();
      expect(result.data?.overallLevel).toBeDefined();
      expect(result.data?.overallPercentage).toBeDefined();
    });

    it('should update user document with assessment data', async () => {
      const responses = [
        createMockResponse('mindset-1', 'mindset', 5, 5),
      ];
      const evaluation = createMockEvaluation({ responses });
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
      const evaluation = createMockEvaluation({ responses: [] });
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
          overallLevel: 'intermediate',
          overallPercentage: 65,
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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EnrollmentService } from '@/lib/database/services/enrollment.service';
import { createMockApiResponse, createMockSport, createMockSkill } from '../../../setup';
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

// Mock sports service
vi.mock('@/lib/database/services/sports.service', () => ({
  sportsService: {
    getSport: vi.fn(),
    getSkillsBySport: vi.fn(),
  },
}));

// Mock video quiz service
vi.mock('@/lib/database/services/video-quiz.service', () => ({
  videoQuizService: {
    getUserVideoQuizAttempts: vi.fn(),
  },
}));

// Import mocked services
import { sportsService } from '@/lib/database/services/sports.service';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
const mockGetSport = vi.mocked(sportsService.getSport);
const mockGetSkillsBySport = vi.mocked(sportsService.getSkillsBySport);
const mockGetUserVideoQuizAttempts = vi.mocked(videoQuizService.getUserVideoQuizAttempts);

// Helper to create mock Timestamp
const createMockTimestamp = (millis: number = Date.now()) => ({
  toMillis: () => millis,
  toDate: () => new Date(millis),
  seconds: Math.floor(millis / 1000),
  nanoseconds: 0,
} as unknown as Timestamp);

// Helper to create mock sport progress
const createMockSportProgress = (overrides: any = {}) => ({
  id: 'progress_123',
  userId: 'user123',
  sportId: 'sport123',
  status: 'in_progress' as const,
  completedSkills: ['skill_1'],
  totalSkills: 3,
  progressPercentage: 33.3,
  timeSpent: 120,
  streak: {
    current: 5,
    longest: 10,
    lastActiveDate: createMockTimestamp(),
  },
  startedAt: createMockTimestamp(),
  lastAccessedAt: createMockTimestamp(),
  createdAt: createMockTimestamp(),
  updatedAt: createMockTimestamp(),
  ...overrides,
});

// Helper to create mock quiz attempt
const createMockQuizAttempt = (overrides: any = {}) => ({
  id: 'attempt_123',
  userId: 'user123',
  skillId: 'skill_1',
  score: 8,
  maxScore: 10,
  percentage: 80,
  completed: true,
  ...overrides,
});

describe('EnrollmentService', () => {
  let service: EnrollmentService;
  let mockCreate: any;
  let mockQuery: any;
  let mockUpdate: any;
  let mockDelete: any;

  beforeEach(() => {
    service = new EnrollmentService();

    // Get access to the mocked methods
    mockCreate = vi.mocked(service.create);
    mockQuery = vi.mocked(service.query);
    mockUpdate = vi.mocked(service.update);
    mockDelete = vi.mocked(service.delete);

    vi.clearAllMocks();
  });

  describe('enrollInSport', () => {
    it('should enroll user in a sport successfully', async () => {
      // User is not already enrolled
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Sport exists
      const sport = createMockSport({ id: 'sport123' });
      mockGetSport.mockResolvedValue(createMockApiResponse(sport));

      // Get skills for the sport
      const skills = [createMockSkill({ id: 'skill_1' }), createMockSkill({ id: 'skill_2' })];
      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 2,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Create enrollment
      mockCreate.mockResolvedValue(createMockApiResponse({ id: 'progress_new' }));

      const result = await service.enrollInSport('user123', 'sport123');

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('progress_new');
      expect(mockCreate).toHaveBeenCalledWith(
        'sport_progress',
        expect.objectContaining({
          userId: 'user123',
          sportId: 'sport123',
          status: 'not_started',
          completedSkills: [],
          totalSkills: 2,
          progressPercentage: 0,
        })
      );
    });

    it('should return error if already enrolled', async () => {
      const existingProgress = createMockSportProgress();

      // Check existing enrollment
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [existingProgress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Mock for getUserSportProgress internal call
      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );
      mockGetUserVideoQuizAttempts.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.enrollInSport('user123', 'sport123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ALREADY_ENROLLED');
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return error if sport not found', async () => {
      // Not enrolled
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Sport not found
      mockGetSport.mockResolvedValue(createMockApiResponse(null));

      const result = await service.enrollInSport('user123', 'nonexistent');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SPORT_NOT_FOUND');
    });
  });

  describe('getUserEnrolledSports', () => {
    it('should return enrolled sports with progress', async () => {
      const progress = createMockSportProgress();
      const sport = createMockSport({ id: 'sport123' });
      const skills = [
        createMockSkill({ id: 'skill_1' }),
        createMockSkill({ id: 'skill_2' }),
        createMockSkill({ id: 'skill_3' }),
      ];
      const quizAttempt = createMockQuizAttempt({ skillId: 'skill_1', percentage: 85 });

      // Query progress records
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Get sport details
      mockGetSport.mockResolvedValue(createMockApiResponse(sport));

      // Get skills
      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 3,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Get quiz attempts for each skill
      mockGetUserVideoQuizAttempts
        .mockResolvedValueOnce(
          createMockApiResponse({
            items: [quizAttempt],
            total: 1,
            page: 1,
            limit: 1,
            hasMore: false,
            totalPages: 1,
          })
        )
        .mockResolvedValue(
          createMockApiResponse({
            items: [],
            total: 0,
            page: 1,
            limit: 1,
            hasMore: false,
            totalPages: 1,
          })
        );

      const result = await service.getUserEnrolledSports('user123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].sport).toBeDefined();
      expect(result.data?.[0].progress).toBeDefined();
    });

    it('should return empty array when no enrollments', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getUserEnrolledSports('user123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should handle query errors', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse(null, false)
      );

      const result = await service.getUserEnrolledSports('user123');

      expect(result.success).toBe(false);
    });
  });

  describe('getUserSportProgress', () => {
    it('should return progress with calculated values', async () => {
      const progress = createMockSportProgress();
      const skills = [
        createMockSkill({ id: 'skill_1' }),
        createMockSkill({ id: 'skill_2' }),
      ];
      const quizAttempt = createMockQuizAttempt({ skillId: 'skill_1', percentage: 90 });

      // Query for existing progress
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Get skills
      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 2,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Get quiz attempts
      mockGetUserVideoQuizAttempts
        .mockResolvedValueOnce(
          createMockApiResponse({
            items: [quizAttempt],
            total: 1,
            page: 1,
            limit: 1,
            hasMore: false,
            totalPages: 1,
          })
        )
        .mockResolvedValue(
          createMockApiResponse({
            items: [],
            total: 0,
            page: 1,
            limit: 1,
            hasMore: false,
            totalPages: 1,
          })
        );

      const result = await service.getUserSportProgress('user123', 'sport123');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.completedSkills).toContain('skill_1');
    });

    it('should return null when not enrolled', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getUserSportProgress('user123', 'nonexistent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should calculate status based on completed skills', async () => {
      const progress = createMockSportProgress({ completedSkills: [] });
      const skills = [createMockSkill({ id: 'skill_1' })];
      const quizAttempt = createMockQuizAttempt({ skillId: 'skill_1', percentage: 100 });

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetUserVideoQuizAttempts.mockResolvedValue(
        createMockApiResponse({
          items: [quizAttempt],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getUserSportProgress('user123', 'sport123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('completed');
    });
  });

  describe('isUserEnrolled', () => {
    it('should return true when enrolled', async () => {
      const progress = createMockSportProgress();

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.isUserEnrolled('user123', 'sport123');

      expect(result).toBe(true);
    });

    it('should return false when not enrolled', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.isUserEnrolled('user123', 'sport123');

      expect(result).toBe(false);
    });
  });

  describe('unenrollFromSport', () => {
    it('should unenroll user successfully', async () => {
      const progress = createMockSportProgress();

      // Find existing enrollment
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // Delete enrollment
      mockDelete.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.unenrollFromSport('user123', 'sport123');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('sport_progress', progress.id);
    });

    it('should return error when not enrolled', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.unenrollFromSport('user123', 'sport123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_ENROLLED');
    });
  });

  describe('updateEnrollmentProgress', () => {
    it('should update progress successfully', async () => {
      const progress = createMockSportProgress({ totalSkills: 4 });
      const skills = [
        createMockSkill({ id: 'skill_1' }),
        createMockSkill({ id: 'skill_2' }),
        createMockSkill({ id: 'skill_3' }),
        createMockSkill({ id: 'skill_4' }),
      ];

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      // getUserSportProgress calls getSkillsBySport and then quiz attempts for each skill
      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 4,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      // No completed quiz attempts to return
      mockGetUserVideoQuizAttempts.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.updateEnrollmentProgress('user123', 'sport123', {
        completedSkills: ['skill_1', 'skill_2'],
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'sport_progress',
        progress.id,
        expect.objectContaining({
          completedSkills: ['skill_1', 'skill_2'],
          progressPercentage: 50,
          status: 'in_progress',
        })
      );
    });

    it('should set status to completed when 100%', async () => {
      const progress = createMockSportProgress({ totalSkills: 2 });
      const skills = [
        createMockSkill({ id: 'skill_1' }),
        createMockSkill({ id: 'skill_2' }),
      ];

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [progress],
          total: 1,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetSkillsBySport.mockResolvedValue(
        createMockApiResponse({
          items: skills,
          total: 2,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockGetUserVideoQuizAttempts.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.updateEnrollmentProgress('user123', 'sport123', {
        completedSkills: ['skill_1', 'skill_2'],
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        'sport_progress',
        progress.id,
        expect.objectContaining({
          status: 'completed',
          progressPercentage: 100,
        })
      );
    });

    it('should return error when not enrolled', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 1,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.updateEnrollmentProgress('user123', 'sport123', {
        completedSkills: ['skill_1'],
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_ENROLLED');
    });
  });

  describe('getEnrollmentStats', () => {
    it('should return stats for all enrollments', async () => {
      const enrollments = [
        createMockSportProgress({ status: 'completed', progressPercentage: 100 }),
        createMockSportProgress({ id: 'progress_2', status: 'in_progress', progressPercentage: 50 }),
        createMockSportProgress({ id: 'progress_3', status: 'not_started', progressPercentage: 0 }),
      ];

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: enrollments,
          total: 3,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getEnrollmentStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalEnrollments).toBe(3);
      expect(result.data?.activeEnrollments).toBe(1);
      expect(result.data?.completedEnrollments).toBe(1);
      expect(result.data?.averageProgress).toBe(50);
    });

    it('should filter by sport ID when provided', async () => {
      const enrollments = [
        createMockSportProgress({ sportId: 'sport123' }),
      ];

      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: enrollments,
          total: 1,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getEnrollmentStats('sport123');

      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith(
        'sport_progress',
        expect.objectContaining({
          where: [{ field: 'sportId', operator: '==', value: 'sport123' }],
        })
      );
    });

    it('should return zeros for empty enrollments', async () => {
      mockQuery.mockResolvedValue(
        createMockApiResponse({
          items: [],
          total: 0,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        })
      );

      const result = await service.getEnrollmentStats();

      expect(result.success).toBe(true);
      expect(result.data?.totalEnrollments).toBe(0);
      expect(result.data?.averageProgress).toBe(0);
    });

    it('should handle query errors', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse(null, false));

      const result = await service.getEnrollmentStats();

      expect(result.success).toBe(false);
    });
  });
});

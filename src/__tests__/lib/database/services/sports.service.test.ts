import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportsService } from '@/lib/database/services/sports.service';
import { createMockSport, createMockSkill, createMockApiResponse } from '../../../setup';
import type { Sport, Skill } from '@/types';

// Mock the base service
vi.mock('@/lib/database/base.service', () => ({
  BaseDatabaseService: class {
    create = vi.fn();
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

describe('SportsService', () => {
  let service: SportsService;
  let mockCreate: any;
  let mockGetById: any;
  let mockUpdate: any;
  let mockDelete: any;
  let mockQuery: any;
  let mockCount: any;
  let mockIncrementField: any;
  let mockBatchWrite: any;

  beforeEach(() => {
    service = new SportsService();

    // Get access to the mocked methods
    mockCreate = vi.mocked(service.create);
    mockGetById = vi.mocked(service.getById);
    mockUpdate = vi.mocked(service.update);
    mockDelete = vi.mocked(service.delete);
    mockQuery = vi.mocked(service.query);
    mockCount = vi.mocked(service.count);
    mockIncrementField = vi.mocked(service.incrementField);
    mockBatchWrite = vi.mocked(service.batchWrite);

    vi.clearAllMocks();
  });

  describe('createSport', () => {
    it('should create a sport with default metadata', async () => {
      const sportData = createMockSport();
      const { skillsCount, metadata, ...inputData } = sportData;

      mockCreate.mockResolvedValue(createMockApiResponse({ id: 'sport-id' }));

      const result = await service.createSport(inputData);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith('sports', expect.objectContaining({
        ...inputData,
        skillsCount: 0,
        metadata: {
          totalEnrollments: 0,
          totalCompletions: 0,
          averageRating: 0,
          totalRatings: 0,
          averageCompletionTime: 0,
        },
      }));
    });

    it('should handle creation errors', async () => {
      const sportData = createMockSport();
      const { skillsCount, metadata, ...inputData } = sportData;

      mockCreate.mockResolvedValue(createMockApiResponse(null, false));

      const result = await service.createSport(inputData);

      expect(result.success).toBe(false);
    });
  });

  describe('getSport', () => {
    it('should retrieve a sport by ID', async () => {
      const sport = createMockSport();
      mockGetById.mockResolvedValue(createMockApiResponse(sport));

      const result = await service.getSport('sport-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(sport);
      expect(mockGetById).toHaveBeenCalledWith('sports', 'sport-id');
    });

    it('should return null for non-existent sport', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));

      const result = await service.getSport('non-existent');

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('updateSport', () => {
    it('should update a sport successfully', async () => {
      const updates = { name: 'Updated Sport', description: 'Updated description' };
      mockUpdate.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.updateSport('sport-id', updates);

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith('sports', 'sport-id', updates);
    });
  });

  describe('deleteSport', () => {
    it('should delete a sport without skills', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));
      mockDelete.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.deleteSport('sport-id');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('sports', 'sport-id');
    });

    it('should not delete sport with existing skills', async () => {
      const skill = createMockSkill();
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [skill],
        total: 1,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.deleteSport('sport-id');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SPORT_HAS_SKILLS');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getAllSports', () => {
    it('should get all active sports with default ordering', async () => {
      const sports = [createMockSport(), createMockSport({ id: 'sport-2' })];
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: sports,
        total: 2,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.getAllSports();

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith('sports', expect.objectContaining({
        orderBy: [
          { field: 'isFeatured', direction: 'desc' },
          { field: 'order', direction: 'asc' },
          { field: 'name', direction: 'asc' },
        ],
        where: [{ field: 'isActive', operator: '==', value: true }],
      }));
    });

    it('should filter by difficulty', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      await service.getAllSports({
        difficulty: ['beginner', 'intermediate'],
      });

      expect(mockQuery).toHaveBeenCalledWith('sports', expect.objectContaining({
        where: expect.arrayContaining([
          { field: 'isActive', operator: '==', value: true },
          { field: 'difficulty', operator: 'in', value: ['beginner', 'intermediate'] },
        ]),
      }));
    });

    it('should filter by categories', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      await service.getAllSports({
        categories: ['Team Sports', 'Individual Sports'],
      });

      expect(mockQuery).toHaveBeenCalledWith('sports', expect.objectContaining({
        where: expect.arrayContaining([
          { field: 'isActive', operator: '==', value: true },
          { field: 'category', operator: 'in', value: ['Team Sports', 'Individual Sports'] },
        ]),
      }));
    });
  });

  describe('getFeaturedSports', () => {
    it('should get featured sports with default limit', async () => {
      const sports = [createMockSport({ isFeatured: true })];
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: sports,
        total: 1,
        page: 1,
        limit: 6,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.getFeaturedSports();

      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('sports', {
        where: [
          { field: 'isActive', operator: '==', value: true },
          { field: 'isFeatured', operator: '==', value: true },
        ],
        orderBy: [{ field: 'order', direction: 'asc' }],
        limit: 6,
      });
    });

    it('should respect custom limit', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [],
        total: 0,
        page: 1,
        limit: 3,
        hasMore: false,
        totalPages: 1,
      }));

      await service.getFeaturedSports(3);

      expect(mockQuery).toHaveBeenCalledWith('sports', expect.objectContaining({
        limit: 3,
      }));
    });
  });

  describe('searchSports', () => {
    it('should search sports with query string', async () => {
      const basketballSport = createMockSport({
        name: 'Basketball',
        description: 'A team sport played with a ball',
        tags: ['team', 'indoor', 'ball']
      });
      const tennisSport = createMockSport({
        id: 'tennis-id',
        name: 'Tennis',
        description: 'Individual racket sport',
        tags: ['individual', 'outdoor', 'racket']
      });

      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [basketballSport, tennisSport],
        total: 2,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.searchSports('ball');

      expect(result.success).toBe(true);
      // Should filter to only basketball (contains 'ball' in name, description, or tags)
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.items[0].name).toBe('Basketball');
    });

    it('should apply search filters', async () => {
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      await service.searchSports('test', {
        difficulty: ['beginner'],
        categories: ['Team Sports'],
      });

      expect(mockQuery).toHaveBeenCalledWith('sports', expect.objectContaining({
        where: expect.arrayContaining([
          { field: 'isActive', operator: '==', value: true },
          { field: 'difficulty', operator: 'in', value: ['beginner'] },
          { field: 'category', operator: 'in', value: ['Team Sports'] },
        ]),
      }));
    });
  });

  describe('createSkill', () => {
    it('should create a skill and increment sport skills count', async () => {
      const skillData = createMockSkill();
      const { metadata, ...inputData } = skillData;

      mockCreate.mockResolvedValue(createMockApiResponse({ id: 'skill-id' }));
      mockIncrementField.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.createSkill(inputData);

      expect(result.success).toBe(true);
      expect(mockCreate).toHaveBeenCalledWith('skills', expect.objectContaining({
        ...inputData,
        metadata: expect.objectContaining({
          totalCompletions: 0,
          averageCompletionTime: inputData.estimatedTimeToComplete,
          averageRating: 0,
          totalRatings: 0,
          difficulty: inputData.difficulty,
        }),
      }));
      expect(mockIncrementField).toHaveBeenCalledWith('sports', inputData.sportId, 'skillsCount');
    });
  });

  describe('getSkill', () => {
    it('should retrieve a skill by ID', async () => {
      const skill = createMockSkill();
      mockGetById.mockResolvedValue(createMockApiResponse(skill));

      const result = await service.getSkill('skill-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(skill);
      expect(mockGetById).toHaveBeenCalledWith('skills', 'skill-id');
    });
  });

  describe('deleteSkill', () => {
    it('should delete a skill and decrement sport skills count', async () => {
      const skill = createMockSkill();
      mockGetById.mockResolvedValue(createMockApiResponse(skill));
      mockDelete.mockResolvedValue(createMockApiResponse(undefined));
      mockIncrementField.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.deleteSkill('skill-id');

      expect(result.success).toBe(true);
      expect(mockDelete).toHaveBeenCalledWith('skills', 'skill-id');
      expect(mockIncrementField).toHaveBeenCalledWith('sports', skill.sportId, 'skillsCount', -1);
    });

    it('should handle non-existent skill', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));

      const result = await service.deleteSkill('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_NOT_FOUND');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });

  describe('getSkillsBySport', () => {
    it('should get skills for a specific sport', async () => {
      const skills = [createMockSkill(), createMockSkill({ id: 'skill-2' })];
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: skills,
        total: 2,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.getSkillsBySport('sport-id');

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(2);
      expect(mockQuery).toHaveBeenCalledWith('skills', expect.objectContaining({
        where: [
          { field: 'sportId', operator: '==', value: 'sport-id' },
          { field: 'isActive', operator: '==', value: true },
        ],
        orderBy: [{ field: 'order', direction: 'asc' }],
      }));
    });
  });

  describe('getSkillsByDifficulty', () => {
    it('should get skills by sport and difficulty', async () => {
      const skills = [createMockSkill({ difficulty: 'beginner' })];
      mockQuery.mockResolvedValue(createMockApiResponse({
        items: skills,
        total: 1,
        page: 1,
        limit: 50,
        hasMore: false,
        totalPages: 1,
      }));

      const result = await service.getSkillsByDifficulty('sport-id', 'beginner');

      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledWith('skills', {
        where: [
          { field: 'sportId', operator: '==', value: 'sport-id' },
          { field: 'difficulty', operator: '==', value: 'beginner' },
          { field: 'isActive', operator: '==', value: true },
        ],
        orderBy: [{ field: 'order', direction: 'asc' }],
      });
    });
  });

  describe('getSkillPrerequisites', () => {
    it('should get skill prerequisites', async () => {
      const skillWithPrereqs = createMockSkill({ prerequisites: ['prereq-1', 'prereq-2'] });
      const prereq1 = createMockSkill({ id: 'prereq-1', name: 'Prerequisite 1' });
      const prereq2 = createMockSkill({ id: 'prereq-2', name: 'Prerequisite 2' });

      mockGetById
        .mockResolvedValueOnce(createMockApiResponse(skillWithPrereqs))
        .mockResolvedValueOnce(createMockApiResponse(prereq1))
        .mockResolvedValueOnce(createMockApiResponse(prereq2));

      const result = await service.getSkillPrerequisites('skill-id');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].name).toBe('Prerequisite 1');
      expect(result.data?.[1].name).toBe('Prerequisite 2');
    });

    it('should return empty array for skill with no prerequisites', async () => {
      const skill = createMockSkill({ prerequisites: [] });
      mockGetById.mockResolvedValue(createMockApiResponse(skill));

      const result = await service.getSkillPrerequisites('skill-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle non-existent skill', async () => {
      mockGetById.mockResolvedValue(createMockApiResponse(null));

      const result = await service.getSkillPrerequisites('non-existent');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SKILL_NOT_FOUND');
    });
  });

  describe('reorderSkills', () => {
    it('should reorder skills using batch operations', async () => {
      const skillOrders = [
        { skillId: 'skill-1', order: 2 },
        { skillId: 'skill-2', order: 1 },
      ];

      mockBatchWrite.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.reorderSkills('sport-id', skillOrders);

      expect(result.success).toBe(true);
      expect(mockBatchWrite).toHaveBeenCalledWith([
        { type: 'update', collection: 'skills', id: 'skill-1', data: { order: 2 } },
        { type: 'update', collection: 'skills', id: 'skill-2', data: { order: 1 } },
      ]);
    });
  });

  describe('reorderSports', () => {
    it('should reorder sports using batch operations', async () => {
      const sportOrders = [
        { sportId: 'sport-1', order: 2 },
        { sportId: 'sport-2', order: 1 },
      ];

      mockBatchWrite.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.reorderSports(sportOrders);

      expect(result.success).toBe(true);
      expect(mockBatchWrite).toHaveBeenCalledWith([
        { type: 'update', collection: 'sports', id: 'sport-1', data: { order: 2 } },
        { type: 'update', collection: 'sports', id: 'sport-2', data: { order: 1 } },
      ]);
    });
  });

  describe('getSportAnalytics', () => {
    it('should calculate sport analytics', async () => {
      const sport = createMockSport();
      const skills = [createMockSkill(), createMockSkill({ id: 'skill-2' })];
      const progresses = [
        {
          userId: 'user-1',
          sportId: 'sport-id',
          status: 'completed' as const,
          completedSkills: ['skill-1', 'skill-2'],
          timeSpent: 120,
        },
        {
          userId: 'user-2',
          sportId: 'sport-id',
          status: 'in_progress' as const,
          completedSkills: ['skill-1'],
          timeSpent: 60,
        },
      ];

      mockGetById.mockResolvedValue(createMockApiResponse(sport));
      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({
          items: skills,
          total: 2,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        }))
        .mockResolvedValueOnce(createMockApiResponse({
          items: progresses,
          total: 2,
          page: 1,
          limit: 50,
          hasMore: false,
          totalPages: 1,
        }));

      const result = await service.getSportAnalytics('sport-id');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalEnrollments: 2,
        totalCompletions: 1,
        completionRate: 50,
        averageCompletionTime: 120,
        skillCompletionRates: [
          { skillId: 'test-skill-id', completionRate: 100 }, // skill-1 completed by both users
          { skillId: 'skill-2', completionRate: 50 }, // skill-2 completed by 1 user
        ],
      });
    });
  });
});
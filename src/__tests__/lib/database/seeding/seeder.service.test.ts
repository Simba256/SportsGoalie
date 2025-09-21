import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SeederService } from '@/lib/database/seeding/seeder.service';
import { createMockApiResponse, createMockSport, createMockSkill } from '../../../setup';
import { sampleSports, sampleSkills, sampleAchievements } from '@/lib/database/seeding/seed-data';

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

describe('SeederService', () => {
  let service: SeederService;
  let mockCreate: any;
  let mockQuery: any;
  let mockIncrementField: any;
  let mockBatchWrite: any;
  let mockCount: any;

  beforeEach(() => {
    service = new SeederService();

    // Get access to the mocked methods
    mockCreate = vi.mocked(service.create);
    mockQuery = vi.mocked(service.query);
    mockIncrementField = vi.mocked(service.incrementField);
    mockBatchWrite = vi.mocked(service.batchWrite);
    mockCount = vi.mocked(service.count);

    vi.clearAllMocks();
  });

  describe('seedAll', () => {
    it('should seed all data successfully', async () => {
      const adminUserId = 'admin-123';

      // Mock successful creation responses
      mockCreate
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-basketball' })) // Basketball
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-soccer' })) // Soccer
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-tennis' })) // Tennis
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-swimming' })) // Swimming
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-climbing' })) // Rock Climbing
        .mockResolvedValueOnce(createMockApiResponse({ id: 'sport-yoga' })) // Yoga
        .mockResolvedValueOnce(createMockApiResponse({ id: 'skill-dribbling' })) // Basic Dribbling
        .mockResolvedValueOnce(createMockApiResponse({ id: 'skill-shooting' })) // Shooting Form
        .mockResolvedValueOnce(createMockApiResponse({ id: 'skill-defense' })) // Defensive Stance
        .mockResolvedValueOnce(createMockApiResponse({ id: 'quiz-dribbling' })) // Dribbling Quiz
        .mockResolvedValueOnce(createMockApiResponse({ id: 'quiz-shooting' })) // Shooting Quiz
        .mockResolvedValueOnce(createMockApiResponse({ id: 'question-1' })) // Quiz Questions
        .mockResolvedValueOnce(createMockApiResponse({ id: 'question-2' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'question-3' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'question-4' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-1' })) // Achievements
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-2' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-3' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-4' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-5' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'achievement-6' }))
        .mockResolvedValueOnce(createMockApiResponse({ id: 'app-settings' })); // App Settings

      // Mock increment field for skill count updates
      mockIncrementField.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.seedAll({
        adminUserId,
        includeAdditionalSports: false,
        force: false,
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sportsCreated: 6, // Default sports count
        skillsCreated: 3, // Basketball skills
        quizzesCreated: 2, // Dribbling and Shooting quizzes
        questionsCreated: 4, // 2 questions per quiz
        achievementsCreated: 6, // All sample achievements
        appSettingsCreated: true,
      });

      // Verify sports were created
      expect(mockCreate).toHaveBeenCalledWith('sports', expect.objectContaining({
        name: 'Basketball',
        createdBy: adminUserId,
        skillsCount: 0,
        metadata: expect.objectContaining({
          totalEnrollments: 0,
          totalCompletions: 0,
        }),
      }));

      // Verify skills were created
      expect(mockCreate).toHaveBeenCalledWith('skills', expect.objectContaining({
        name: 'Basic Dribbling',
        createdBy: adminUserId,
        metadata: expect.objectContaining({
          totalCompletions: 0,
        }),
      }));

      // Verify skill count was incremented
      expect(mockIncrementField).toHaveBeenCalledWith('sports', 'sport-basketball', 'skillsCount');
    });

    it('should handle creation errors gracefully', async () => {
      const adminUserId = 'admin-123';

      // Mock first sport creation to fail
      mockCreate.mockRejectedValueOnce(new Error('Database error'));

      const result = await service.seedAll({
        adminUserId,
        includeAdditionalSports: false,
        force: false,
      });

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SEEDING_FAILED');
    });

    it('should include additional sports when requested', async () => {
      const adminUserId = 'admin-123';

      // Mock successful responses for all sports (6 default + 4 additional)
      for (let i = 0; i < 10; i++) {
        mockCreate.mockResolvedValueOnce(createMockApiResponse({ id: `sport-${i}` }));
      }

      await service.seedAll({
        adminUserId,
        includeAdditionalSports: true,
        force: false,
      });

      // Should have created 10 sports (6 default + 4 additional)
      expect(mockCreate).toHaveBeenCalledTimes(10);
    });

    it('should clear existing data when force is true', async () => {
      const adminUserId = 'admin-123';

      // Mock query responses for clearing data
      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item1' }] })) // Questions
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item2' }] })) // Quizzes
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item3' }] })) // Skills
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item4' }] })) // Sports
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item5' }] })) // Achievements
        .mockResolvedValueOnce(createMockApiResponse({ items: [{ id: 'item6' }] })); // App Settings

      mockBatchWrite.mockResolvedValue(createMockApiResponse(undefined));

      // Mock create responses for new data
      for (let i = 0; i < 20; i++) {
        mockCreate.mockResolvedValueOnce(createMockApiResponse({ id: `new-item-${i}` }));
      }

      await service.seedAll({
        adminUserId,
        includeAdditionalSports: false,
        force: true,
      });

      // Should have called batchWrite to delete existing data
      expect(mockBatchWrite).toHaveBeenCalledWith(
        expect.arrayContaining([
          { type: 'delete', collection: expect.any(String), id: 'item1' },
        ])
      );
    });
  });

  describe('seedSports', () => {
    it('should seed only sports', async () => {
      const adminUserId = 'admin-123';

      // Mock successful creation for default sports count
      sampleSports.forEach((_, index) => {
        mockCreate.mockResolvedValueOnce(createMockApiResponse({ id: `sport-${index}` }));
      });

      const result = await service.seedSports(adminUserId, false);

      expect(result.success).toBe(true);
      expect(result.data?.created).toBe(sampleSports.length);
      expect(mockCreate).toHaveBeenCalledTimes(sampleSports.length);
    });

    it('should include additional sports when requested', async () => {
      const adminUserId = 'admin-123';

      // Mock successful creation for all sports
      for (let i = 0; i < 10; i++) {
        mockCreate.mockResolvedValueOnce(createMockApiResponse({ id: `sport-${i}` }));
      }

      const result = await service.seedSports(adminUserId, true);

      expect(result.success).toBe(true);
      expect(result.data?.created).toBe(10); // 6 default + 4 additional
    });

    it('should handle creation errors', async () => {
      const adminUserId = 'admin-123';

      mockCreate.mockRejectedValue(new Error('Creation failed'));

      const result = await service.seedSports(adminUserId, false);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SPORTS_SEEDING_FAILED');
    });
  });

  describe('seedAchievements', () => {
    it('should seed all achievements', async () => {
      // Mock successful creation for all achievements
      sampleAchievements.forEach((_, index) => {
        mockCreate.mockResolvedValueOnce(createMockApiResponse({ id: `achievement-${index}` }));
      });

      const result = await service.seedAchievements();

      expect(result.success).toBe(true);
      expect(result.data?.created).toBe(sampleAchievements.length);
      expect(mockCreate).toHaveBeenCalledTimes(sampleAchievements.length);
    });

    it('should handle creation errors', async () => {
      mockCreate.mockRejectedValue(new Error('Creation failed'));

      const result = await service.seedAchievements();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('ACHIEVEMENTS_SEEDING_FAILED');
    });
  });

  describe('createAppSettings', () => {
    it('should create app settings', async () => {
      const adminUserId = 'admin-123';
      mockCreate.mockResolvedValue(createMockApiResponse({ id: 'settings-id' }));

      const result = await service.createAppSettings(adminUserId);

      expect(result.success).toBe(true);
      expect(result.data?.id).toBe('settings-id');
      expect(mockCreate).toHaveBeenCalledWith('app_settings', expect.objectContaining({
        maintenanceMode: false,
        featuresEnabled: expect.objectContaining({
          registration: true,
          quizzes: true,
          achievements: true,
        }),
        updatedBy: adminUserId,
      }));
    });

    it('should handle creation errors', async () => {
      const adminUserId = 'admin-123';
      mockCreate.mockRejectedValue(new Error('Creation failed'));

      const result = await service.createAppSettings(adminUserId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('APP_SETTINGS_CREATION_FAILED');
    });
  });

  describe('clearAllData', () => {
    it('should clear all data from collections', async () => {
      // Mock query responses for each collection
      const collections = [
        'quiz_questions',
        'quizzes',
        'skills',
        'sports',
        'achievements',
        'app_settings',
      ];

      collections.forEach((collection, index) => {
        mockQuery.mockResolvedValueOnce(createMockApiResponse({
          items: [
            { id: `${collection}-item-1` },
            { id: `${collection}-item-2` },
          ],
        }));
      });

      mockBatchWrite.mockResolvedValue(createMockApiResponse(undefined));

      const result = await service.clearAllData();

      expect(result.success).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(collections.length);
      expect(mockBatchWrite).toHaveBeenCalledTimes(collections.length);
    });

    it('should handle clearing errors', async () => {
      mockQuery.mockRejectedValue(new Error('Query failed'));

      const result = await service.clearAllData();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CLEAR_DATA_FAILED');
    });
  });

  describe('checkSeededData', () => {
    it('should return count of seeded data', async () => {
      // Mock count responses
      mockCount
        .mockResolvedValueOnce(5) // sports
        .mockResolvedValueOnce(10) // skills
        .mockResolvedValueOnce(3) // quizzes
        .mockResolvedValueOnce(15) // questions
        .mockResolvedValueOnce(6) // achievements
        .mockResolvedValueOnce(1); // app_settings

      const result = await service.checkSeededData();

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        sports: 5,
        skills: 10,
        quizzes: 3,
        questions: 15,
        achievements: 6,
        hasAppSettings: true,
        isEmpty: false,
      });
    });

    it('should detect empty database', async () => {
      // Mock zero counts
      mockCount.mockResolvedValue(0);

      const result = await service.checkSeededData();

      expect(result.success).toBe(true);
      expect(result.data?.isEmpty).toBe(true);
      expect(result.data?.hasAppSettings).toBe(false);
    });

    it('should handle check errors', async () => {
      mockCount.mockRejectedValue(new Error('Count failed'));

      const result = await service.checkSeededData();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('CHECK_DATA_FAILED');
    });
  });

  describe('validateDataIntegrity', () => {
    it('should validate data integrity successfully', async () => {
      const sports = [createMockSport({ id: 'sport-1' })];
      const skills = [createMockSkill({ id: 'skill-1', sportId: 'sport-1' })];
      const quizzes = [{ id: 'quiz-1', skillId: 'skill-1', sportId: 'sport-1', title: 'Test Quiz' }];
      const questions = [{ id: 'question-1', quizId: 'quiz-1' }];

      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({ items: skills })) // skills
        .mockResolvedValueOnce(createMockApiResponse({ items: sports })) // sports
        .mockResolvedValueOnce(createMockApiResponse({ items: quizzes })) // quizzes
        .mockResolvedValueOnce(createMockApiResponse({ items: questions })); // questions

      const result = await service.validateDataIntegrity();

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(true);
      expect(result.data?.issues).toEqual([]);
    });

    it('should detect skill referencing non-existent sport', async () => {
      const sports = [createMockSport({ id: 'sport-1' })];
      const skills = [createMockSkill({ id: 'skill-1', sportId: 'non-existent-sport' })];

      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({ items: skills })) // skills
        .mockResolvedValueOnce(createMockApiResponse({ items: sports })) // sports
        .mockResolvedValueOnce(createMockApiResponse({ items: [] })) // quizzes
        .mockResolvedValueOnce(createMockApiResponse({ items: [] })); // questions

      const result = await service.validateDataIntegrity();

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.issues).toContain(
        'Skill "Test Skill" references non-existent sport ID: non-existent-sport'
      );
    });

    it('should detect quiz referencing non-existent skill', async () => {
      const sports = [createMockSport({ id: 'sport-1' })];
      const skills = [createMockSkill({ id: 'skill-1', sportId: 'sport-1' })];
      const quizzes = [{ id: 'quiz-1', skillId: 'non-existent-skill', sportId: 'sport-1', title: 'Test Quiz' }];

      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({ items: skills })) // skills
        .mockResolvedValueOnce(createMockApiResponse({ items: sports })) // sports
        .mockResolvedValueOnce(createMockApiResponse({ items: quizzes })) // quizzes
        .mockResolvedValueOnce(createMockApiResponse({ items: [] })); // questions

      const result = await service.validateDataIntegrity();

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.issues).toContain(
        'Quiz "Test Quiz" references non-existent skill ID: non-existent-skill'
      );
    });

    it('should detect question referencing non-existent quiz', async () => {
      const sports = [createMockSport({ id: 'sport-1' })];
      const skills = [createMockSkill({ id: 'skill-1', sportId: 'sport-1' })];
      const quizzes = [{ id: 'quiz-1', skillId: 'skill-1', sportId: 'sport-1', title: 'Test Quiz' }];
      const questions = [{ id: 'question-1', quizId: 'non-existent-quiz' }];

      mockQuery
        .mockResolvedValueOnce(createMockApiResponse({ items: skills })) // skills
        .mockResolvedValueOnce(createMockApiResponse({ items: sports })) // sports
        .mockResolvedValueOnce(createMockApiResponse({ items: quizzes })) // quizzes
        .mockResolvedValueOnce(createMockApiResponse({ items: questions })); // questions

      const result = await service.validateDataIntegrity();

      expect(result.success).toBe(true);
      expect(result.data?.valid).toBe(false);
      expect(result.data?.issues).toContain(
        'Question references non-existent quiz ID: non-existent-quiz'
      );
    });

    it('should handle validation errors', async () => {
      mockQuery.mockRejectedValue(new Error('Query failed'));

      const result = await service.validateDataIntegrity();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('getSeededDataMappings', () => {
    it('should return seeded data mappings', () => {
      // Since mappings are internal, we just verify the method exists and returns an object
      const mappings = service.getSeededDataMappings();

      expect(mappings).toHaveProperty('sports');
      expect(mappings).toHaveProperty('skills');
      expect(mappings).toHaveProperty('quizzes');
      expect(mappings).toHaveProperty('achievements');
    });
  });
});
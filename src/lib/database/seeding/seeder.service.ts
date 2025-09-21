import { BaseDatabaseService } from '../base.service';
import {
  sampleSports,
  sampleSkills,
  sampleQuizzes,
  sampleQuizQuestions,
  sampleAchievements,
  sampleAppSettings,
  generateAdditionalSports,
} from './seed-data';
import {
  Sport,
  Skill,
  Quiz,
  QuizQuestion,
  Achievement,
  AppSettings,
  ApiResponse,
} from '@/types';
import { logger } from '../../utils/logger';

export class SeederService extends BaseDatabaseService {
  private readonly SPORTS_COLLECTION = 'sports';
  private readonly SKILLS_COLLECTION = 'skills';
  private readonly QUIZZES_COLLECTION = 'quizzes';
  private readonly QUIZ_QUESTIONS_COLLECTION = 'quiz_questions';
  private readonly ACHIEVEMENTS_COLLECTION = 'achievements';
  private readonly APP_SETTINGS_COLLECTION = 'app_settings';

  private seededData: {
    sports: Map<string, string>; // name -> id
    skills: Map<string, string>; // name -> id
    quizzes: Map<string, string>; // title -> id
    achievements: Map<string, string>; // name -> id
  } = {
    sports: new Map(),
    skills: new Map(),
    quizzes: new Map(),
    achievements: new Map(),
  };

  async seedAll(options: {
    includeAdditionalSports?: boolean;
    adminUserId: string;
    force?: boolean; // Clear existing data
  }): Promise<ApiResponse<{
    sportsCreated: number;
    skillsCreated: number;
    quizzesCreated: number;
    questionsCreated: number;
    achievementsCreated: number;
    appSettingsCreated: boolean;
  }>> {
    try {
      logger.info('Starting database seeding', 'SeederService');

      if (options.force) {
        logger.info('🗑️ Clearing existing data...');
        await this.clearAllData();
      }

      const results = {
        sportsCreated: 0,
        skillsCreated: 0,
        quizzesCreated: 0,
        questionsCreated: 0,
        achievementsCreated: 0,
        appSettingsCreated: false,
      };

      // 1. Seed Sports
      logger.info('🏀 Seeding sports...');
      const sportsToSeed = options.includeAdditionalSports
        ? [...sampleSports, ...generateAdditionalSports()]
        : sampleSports;

      for (const sport of sportsToSeed) {
        const sportData = {
          ...sport,
          createdBy: options.adminUserId,
        };

        const result = await this.create<Sport>(this.SPORTS_COLLECTION, sportData);
        if (result.success) {
          this.seededData.sports.set(sport.name, result.data!.id);
          results.sportsCreated++;
          logger.info(`  ✅ Created sport: ${sport.name}`);
        } else {
          logger.info(`  ❌ Failed to create sport: ${sport.name}`);
        }
      }

      // 2. Seed Skills
      logger.info('🎯 Seeding skills...');
      const basketballSportId = this.seededData.sports.get('Basketball');

      if (basketballSportId) {
        for (const skill of sampleSkills) {
          const skillData = {
            ...skill,
            sportId: basketballSportId,
            createdBy: options.adminUserId,
          };

          const result = await this.create<Skill>(this.SKILLS_COLLECTION, skillData);
          if (result.success) {
            this.seededData.skills.set(skill.name, result.data!.id);
            results.skillsCreated++;
            logger.info(`  ✅ Created skill: ${skill.name}`);

            // Update sport skills count
            await this.incrementField(this.SPORTS_COLLECTION, basketballSportId, 'skillsCount');
          } else {
            logger.info(`  ❌ Failed to create skill: ${skill.name}`);
          }
        }
      }

      // 3. Seed Quizzes
      logger.info('📝 Seeding quizzes...');
      const basicDribblingSkillId = this.seededData.skills.get('Basic Dribbling');
      const shootingFormSkillId = this.seededData.skills.get('Shooting Form');

      if (basicDribblingSkillId && shootingFormSkillId && basketballSportId) {
        const skillIds = [basicDribblingSkillId, shootingFormSkillId];

        for (let i = 0; i < sampleQuizzes.length; i++) {
          const quiz = sampleQuizzes[i];
          const quizData = {
            ...quiz,
            skillId: skillIds[i],
            sportId: basketballSportId,
            createdBy: options.adminUserId,
          };

          const result = await this.create<Quiz>(this.QUIZZES_COLLECTION, quizData);
          if (result.success) {
            this.seededData.quizzes.set(quiz.title, result.data!.id);
            results.quizzesCreated++;
            logger.info(`  ✅ Created quiz: ${quiz.title}`);
          } else {
            logger.info(`  ❌ Failed to create quiz: ${quiz.title}`);
          }
        }
      }

      // 4. Seed Quiz Questions
      logger.info('❓ Seeding quiz questions...');
      const dribblingQuizId = this.seededData.quizzes.get('Basic Dribbling Knowledge Check');
      const shootingQuizId = this.seededData.quizzes.get('Shooting Form Assessment');

      if (dribblingQuizId && shootingQuizId) {
        const quizIds = [dribblingQuizId, dribblingQuizId, shootingQuizId, shootingQuizId];

        for (let i = 0; i < sampleQuizQuestions.length; i++) {
          const question = sampleQuizQuestions[i];
          const questionData = {
            ...question,
            quizId: quizIds[i],
          };

          const result = await this.create<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION, questionData);
          if (result.success) {
            results.questionsCreated++;
            logger.info(`  ✅ Created question: ${question.question.substring(0, 50)}...`);
          } else {
            logger.info(`  ❌ Failed to create question: ${question.question.substring(0, 50)}...`);
          }
        }
      }

      // 5. Seed Achievements
      logger.info('🏆 Seeding achievements...');
      for (const achievement of sampleAchievements) {
        let achievementData = { ...achievement };

        // Set basketball sport ID for basketball-specific achievements
        if (achievement.criteria.sportId === '' && basketballSportId) {
          achievementData.criteria = {
            ...achievement.criteria,
            sportId: basketballSportId,
          };
        }

        const result = await this.create<Achievement>(this.ACHIEVEMENTS_COLLECTION, achievementData);
        if (result.success) {
          this.seededData.achievements.set(achievement.name, result.data!.id);
          results.achievementsCreated++;
          logger.info(`  ✅ Created achievement: ${achievement.name}`);
        } else {
          logger.info(`  ❌ Failed to create achievement: ${achievement.name}`);
        }
      }

      // 6. Seed App Settings
      logger.info('⚙️ Seeding app settings...');
      const settingsData = {
        ...sampleAppSettings,
        updatedBy: options.adminUserId,
      };

      const settingsResult = await this.create<AppSettings>(this.APP_SETTINGS_COLLECTION, settingsData);
      if (settingsResult.success) {
        results.appSettingsCreated = true;
        logger.info('  ✅ Created app settings');
      } else {
        logger.info('  ❌ Failed to create app settings');
      }

      logger.info('🎉 Database seeding completed!');
      logger.info(`📊 Summary:
        - Sports: ${results.sportsCreated}
        - Skills: ${results.skillsCreated}
        - Quizzes: ${results.quizzesCreated}
        - Questions: ${results.questionsCreated}
        - Achievements: ${results.achievementsCreated}
        - App Settings: ${results.appSettingsCreated ? 'Yes' : 'No'}`);

      return {
        success: true,
        data: results,
        message: 'Database seeded successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      logger.error('Seeding failed', 'SeederService', error);
      return {
        success: false,
        error: {
          code: 'SEEDING_FAILED',
          message: 'Failed to seed database',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async seedSports(
    adminUserId: string,
    includeAdditional: boolean = false
  ): Promise<ApiResponse<{ created: number }>> {
    try {
      logger.info('🏀 Seeding sports only...');

      const sportsToSeed = includeAdditional
        ? [...sampleSports, ...generateAdditionalSports()]
        : sampleSports;

      let created = 0;

      for (const sport of sportsToSeed) {
        const sportData = {
          ...sport,
          createdBy: adminUserId,
        };

        const result = await this.create<Sport>(this.SPORTS_COLLECTION, sportData);
        if (result.success) {
          created++;
          logger.info(`  ✅ Created sport: ${sport.name}`);
        }
      }

      return {
        success: true,
        data: { created },
        message: `Successfully seeded ${created} sports`,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SPORTS_SEEDING_FAILED',
          message: 'Failed to seed sports',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async seedAchievements(): Promise<ApiResponse<{ created: number }>> {
    try {
      logger.info('🏆 Seeding achievements only...');

      let created = 0;

      for (const achievement of sampleAchievements) {
        const result = await this.create<Achievement>(this.ACHIEVEMENTS_COLLECTION, achievement);
        if (result.success) {
          created++;
          logger.info(`  ✅ Created achievement: ${achievement.name}`);
        }
      }

      return {
        success: true,
        data: { created },
        message: `Successfully seeded ${created} achievements`,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ACHIEVEMENTS_SEEDING_FAILED',
          message: 'Failed to seed achievements',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async createAppSettings(adminUserId: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const settingsData = {
        ...sampleAppSettings,
        updatedBy: adminUserId,
      };

      return await this.create<AppSettings>(this.APP_SETTINGS_COLLECTION, settingsData);

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'APP_SETTINGS_CREATION_FAILED',
          message: 'Failed to create app settings',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async clearAllData(): Promise<ApiResponse<void>> {
    try {
      logger.info('🗑️ Clearing all seeded data...');

      const collections = [
        this.QUIZ_QUESTIONS_COLLECTION,
        this.QUIZZES_COLLECTION,
        this.SKILLS_COLLECTION,
        this.SPORTS_COLLECTION,
        this.ACHIEVEMENTS_COLLECTION,
        this.APP_SETTINGS_COLLECTION,
      ];

      for (const collectionName of collections) {
        const result = await this.query(collectionName, { limit: 1000 });
        if (result.success && result.data && result.data.items.length > 0) {
          const deleteOperations = result.data.items.map(item => ({
            type: 'delete' as const,
            collection: collectionName,
            id: (item as any).id,
          }));

          await this.batchWrite(deleteOperations);
          logger.info(`  🗑️ Cleared ${result.data.items.length} items from ${collectionName}`);
        }
      }

      logger.info('✅ All data cleared');

      return {
        success: true,
        message: 'All data cleared successfully',
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEAR_DATA_FAILED',
          message: 'Failed to clear data',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async checkSeededData(): Promise<ApiResponse<{
    sports: number;
    skills: number;
    quizzes: number;
    questions: number;
    achievements: number;
    hasAppSettings: boolean;
    isEmpty: boolean;
  }>> {
    try {
      const [
        sportsResult,
        skillsResult,
        quizzesResult,
        questionsResult,
        achievementsResult,
        settingsResult,
      ] = await Promise.all([
        this.count(this.SPORTS_COLLECTION),
        this.count(this.SKILLS_COLLECTION),
        this.count(this.QUIZZES_COLLECTION),
        this.count(this.QUIZ_QUESTIONS_COLLECTION),
        this.count(this.ACHIEVEMENTS_COLLECTION),
        this.count(this.APP_SETTINGS_COLLECTION),
      ]);

      const counts = {
        sports: sportsResult,
        skills: skillsResult,
        quizzes: quizzesResult,
        questions: questionsResult,
        achievements: achievementsResult,
        hasAppSettings: settingsResult > 0,
        isEmpty: sportsResult === 0 && skillsResult === 0 && quizzesResult === 0,
      };

      return {
        success: true,
        data: counts,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CHECK_DATA_FAILED',
          message: 'Failed to check seeded data',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async seedDemoUser(): Promise<ApiResponse<{ userId: string; email: string }>> {
    try {
      // This would typically integrate with Firebase Auth
      // For now, we'll just return demo user info
      const demoUser = {
        userId: 'demo-user-123',
        email: 'demo@sportscoach.com',
      };

      logger.info('👤 Demo user info prepared');

      return {
        success: true,
        data: demoUser,
        message: 'Demo user prepared',
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'DEMO_USER_FAILED',
          message: 'Failed to seed demo user',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  // Get seeded data mappings for testing/development
  getSeededDataMappings() {
    return {
      sports: Object.fromEntries(this.seededData.sports),
      skills: Object.fromEntries(this.seededData.skills),
      quizzes: Object.fromEntries(this.seededData.quizzes),
      achievements: Object.fromEntries(this.seededData.achievements),
    };
  }

  // Validate data integrity after seeding
  async validateDataIntegrity(): Promise<ApiResponse<{
    valid: boolean;
    issues: string[];
  }>> {
    try {
      const issues: string[] = [];

      // Check if skills reference valid sports
      const skillsResult = await this.query<Skill>(this.SKILLS_COLLECTION);
      const sportsResult = await this.query<Sport>(this.SPORTS_COLLECTION);

      if (skillsResult.success && sportsResult.success) {
        const sportIds = new Set(sportsResult.data!.items.map(s => s.id));

        for (const skill of skillsResult.data!.items) {
          if (!sportIds.has(skill.sportId)) {
            issues.push(`Skill "${skill.name}" references non-existent sport ID: ${skill.sportId}`);
          }
        }
      }

      // Check if quizzes reference valid skills and sports
      const quizzesResult = await this.query<Quiz>(this.QUIZZES_COLLECTION);

      if (quizzesResult.success && skillsResult.success && sportsResult.success) {
        const skillIds = new Set(skillsResult.data!.items.map(s => s.id));
        const sportIds = new Set(sportsResult.data!.items.map(s => s.id));

        for (const quiz of quizzesResult.data!.items) {
          if (!skillIds.has(quiz.skillId)) {
            issues.push(`Quiz "${quiz.title}" references non-existent skill ID: ${quiz.skillId}`);
          }
          if (!sportIds.has(quiz.sportId)) {
            issues.push(`Quiz "${quiz.title}" references non-existent sport ID: ${quiz.sportId}`);
          }
        }
      }

      // Check if quiz questions reference valid quizzes
      const questionsResult = await this.query<QuizQuestion>(this.QUIZ_QUESTIONS_COLLECTION);

      if (questionsResult.success && quizzesResult.success) {
        const quizIds = new Set(quizzesResult.data!.items.map(q => q.id));

        for (const question of questionsResult.data!.items) {
          if (!quizIds.has(question.quizId)) {
            issues.push(`Question references non-existent quiz ID: ${question.quizId}`);
          }
        }
      }

      const valid = issues.length === 0;

      return {
        success: true,
        data: { valid, issues },
        message: valid ? 'Data integrity validated successfully' : 'Data integrity issues found',
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Failed to validate data integrity',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const seederService = new SeederService();
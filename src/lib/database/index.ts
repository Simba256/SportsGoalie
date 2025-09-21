// Database Services
export { BaseDatabaseService } from './base.service';

// Specialized Services
export { SportsService, sportsService } from './services/sports.service';
export { QuizService, quizService } from './services/quiz.service';
export { UserService, userService } from './services/user.service';

// Utilities
export { SeederService, seederService } from './seeding/seeder.service';
export { MigrationService, migrationService } from './migrations/migration.service';

// Validation
export * from '../validation/schemas';

// Types (re-export for convenience)
export type {
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  RealtimeListener,
  RealtimeUpdate,
  CacheEntry,
  CacheOptions,
  ErrorDetails,
  ValidationResult,
  ValidationError,
} from '@/types';

// Database initialization helper
import { migrationService } from './migrations/migration.service';
import { seederService } from './seeding/seeder.service';

export interface DatabaseInitOptions {
  runMigrations?: boolean;
  seedData?: boolean;
  adminUserId?: string;
  force?: boolean; // Clear existing data before seeding
  includeAdditionalSports?: boolean;
}

export class DatabaseManager {
  /**
   * Initialize the database with migrations and optional seeding
   */
  static async initialize(options: DatabaseInitOptions = {}): Promise<{
    success: boolean;
    migrations?: any;
    seeding?: any;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let migrationResult;
    let seedingResult;

    try {
      console.log('🚀 Initializing SportsCoach V3 Database...');

      // Run migrations if requested
      if (options.runMigrations !== false) {
        console.log('📦 Running database migrations...');
        migrationResult = await migrationService.runPendingMigrations();

        if (!migrationResult.success) {
          errors.push(`Migration failed: ${migrationResult.error?.message}`);
        } else {
          console.log(`✅ Migrations completed: ${migrationResult.data?.migrationsRun} migrations run`);
        }
      }

      // Seed data if requested
      if (options.seedData && options.adminUserId) {
        console.log('🌱 Seeding database with sample data...');

        seedingResult = await seederService.seedAll({
          adminUserId: options.adminUserId,
          force: options.force || false,
          includeAdditionalSports: options.includeAdditionalSports || false,
        });

        if (!seedingResult.success) {
          errors.push(`Seeding failed: ${seedingResult.error?.message}`);
        } else {
          console.log('✅ Database seeding completed successfully');
          console.log(`📊 Seeded: ${seedingResult.data?.sportsCreated} sports, ${seedingResult.data?.skillsCreated} skills, ${seedingResult.data?.quizzesCreated} quizzes`);
        }
      }

      const success = errors.length === 0;

      if (success) {
        console.log('🎉 Database initialization completed successfully!');
      } else {
        console.error('❌ Database initialization completed with errors:', errors);
      }

      return {
        success,
        migrations: migrationResult?.data,
        seeding: seedingResult?.data,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      console.error('💥 Database initialization failed:', error);
      return {
        success: false,
        errors: [`Initialization failed: ${error}`],
      };
    }
  }

  /**
   * Check the current status of the database
   */
  static async getStatus(): Promise<{
    migrations: {
      currentVersion: string;
      latestVersion: string;
      pendingMigrations: number;
      needsMigration: boolean;
    };
    seeding: {
      sports: number;
      skills: number;
      quizzes: number;
      questions: number;
      achievements: number;
      hasAppSettings: boolean;
      isEmpty: boolean;
    };
  }> {
    try {
      const [migrationStatus, seedingStatus] = await Promise.all([
        migrationService.checkMigrationStatus(),
        seederService.checkSeededData(),
      ]);

      return {
        migrations: migrationStatus.data || {
          currentVersion: '0.0.0',
          latestVersion: '0.0.0',
          pendingMigrations: 0,
          needsMigration: false,
        },
        seeding: seedingStatus.data || {
          sports: 0,
          skills: 0,
          quizzes: 0,
          questions: 0,
          achievements: 0,
          hasAppSettings: false,
          isEmpty: true,
        },
      };

    } catch (error) {
      console.error('Failed to get database status:', error);
      throw error;
    }
  }

  /**
   * Reset the entire database (development only!)
   */
  static async reset(adminUserId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      console.log('⚠️  Resetting database - this will clear all data!');

      // Clear all data
      const clearResult = await seederService.clearAllData();
      if (!clearResult.success) {
        throw new Error(`Failed to clear data: ${clearResult.error?.message}`);
      }

      // Re-initialize with fresh data
      const initResult = await this.initialize({
        runMigrations: true,
        seedData: true,
        adminUserId,
        force: true,
        includeAdditionalSports: true,
      });

      if (!initResult.success) {
        throw new Error(`Failed to re-initialize: ${initResult.errors?.join(', ')}`);
      }

      console.log('✅ Database reset completed successfully');

      return {
        success: true,
        message: 'Database reset and re-initialized successfully',
      };

    } catch (error) {
      console.error('❌ Database reset failed:', error);
      return {
        success: false,
        message: `Database reset failed: ${error}`,
      };
    }
  }

  /**
   * Validate database integrity
   */
  static async validateIntegrity(): Promise<{
    valid: boolean;
    issues: string[];
  }> {
    try {
      const result = await seederService.validateDataIntegrity();
      return result.data || { valid: false, issues: ['Validation failed'] };
    } catch (error) {
      console.error('Database integrity validation failed:', error);
      return {
        valid: false,
        issues: [`Validation error: ${error}`],
      };
    }
  }
}

// Export the manager as default
export default DatabaseManager;

// Helper functions for common operations
export const DatabaseHelpers = {
  /**
   * Quick health check for all database services
   */
  async healthCheck(): Promise<{
    baseService: any;
    sportsService: any;
    quizService: any;
    userService: any;
  }> {
    const [baseHealth, sportsHealth, quizHealth, userHealth] = await Promise.all([
      migrationService.healthCheck(),
      sportsService.healthCheck(),
      quizService.healthCheck(),
      userService.healthCheck(),
    ]);

    return {
      baseService: baseHealth,
      sportsService: sportsHealth,
      quizService: quizHealth,
      userService: userHealth,
    };
  },

  /**
   * Get cache statistics from all services
   */
  getCacheStats() {
    return {
      migrations: migrationService.getCacheStats(),
      sports: sportsService.getCacheStats(),
      quiz: quizService.getCacheStats(),
      user: userService.getCacheStats(),
    };
  },

  /**
   * Clear all caches
   */
  clearAllCaches() {
    migrationService.clearCache();
    sportsService.clearCache();
    quizService.clearCache();
    userService.clearCache();
    console.log('🧹 All caches cleared');
  },
};
// Database Services
export { BaseDatabaseService } from './base.service';

// Specialized Services
export { SportsService, sportsService } from './services/sports.service';
export { VideoQuizService, videoQuizService } from './services/video-quiz.service';
export { UserService, userService } from './services/user.service';
export { ChartingService, chartingService } from './services/charting.service';
export { FormTemplateService, formTemplateService } from './services/form-template.service';
export { DynamicChartingService, dynamicChartingService } from './services/dynamic-charting.service';

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
import { sportsService } from './services/sports.service';
import { videoQuizService } from './services/video-quiz.service';
import { userService } from './services/user.service';
import { logger, withPerformanceLogging } from '../utils/logger';

/**
 * Configuration options for database initialization
 */
export interface DatabaseInitOptions {
  /** Whether to run database migrations (default: true) */
  runMigrations?: boolean;
  /** Whether to seed the database with sample data (default: false) */
  seedData?: boolean;
  /** Admin user ID required for seeding operations */
  adminUserId?: string;
  /** Clear existing data before seeding (default: false) */
  force?: boolean;
  /** Include additional sports in the seeding data (default: false) */
  includeAdditionalSports?: boolean;
}

/**
 * Result of database initialization operation
 */
export interface DatabaseInitResult {
  /** Whether the initialization was successful */
  success: boolean;
  /** Migration operation results */
  migrations?: {
    migrationsRun: number;
    currentVersion: string;
    latestVersion: string;
  };
  /** Seeding operation results */
  seeding?: {
    sportsCreated: number;
    skillsCreated: number;
    quizzesCreated: number;
    achievementsCreated: number;
  };
  /** Array of error messages if any operations failed */
  errors?: string[];
}

/**
 * Central database management class for SportsCoach V3
 *
 * Provides high-level operations for database initialization, health checking,
 * and maintenance operations. This class orchestrates migrations, seeding,
 * and provides a unified interface for database management.
 *
 * @example
 * ```typescript
 * // Initialize database with migrations and seeding
 * const result = await DatabaseManager.initialize({
 *   runMigrations: true,
 *   seedData: true,
 *   adminUserId: 'admin-123',
 *   includeAdditionalSports: true
 * });
 *
 * if (result.success) {
 *   console.log('Database ready for use');
 * }
 * ```
 */
export class DatabaseManager {
  /**
   * Initialize the database with migrations and optional seeding
   *
   * This method performs a complete database setup including running pending
   * migrations and optionally seeding the database with sample data. It's designed
   * to be idempotent and safe to run multiple times.
   *
   * @param options - Configuration options for initialization
   * @returns Promise resolving to initialization result with detailed status
   *
   * @example
   * ```typescript
   * // Basic initialization with migrations only
   * const result = await DatabaseManager.initialize();
   *
   * // Full initialization with seeding
   * const result = await DatabaseManager.initialize({
   *   seedData: true,
   *   adminUserId: 'admin-user-id',
   *   force: true, // Clear existing data
   *   includeAdditionalSports: true
   * });
   * ```
   */
  static async initialize(options: DatabaseInitOptions = {}): Promise<DatabaseInitResult> {
    const errors: string[] = [];
    let migrationResult;
    let seedingResult;

    try {
      logger.info('Initializing SportsCoach V3 Database', 'DatabaseManager', options);

      // Run migrations if requested
      if (options.runMigrations !== false) {
        logger.info('Running database migrations', 'DatabaseManager');
        migrationResult = await migrationService.runPendingMigrations();

        if (!migrationResult.success) {
          const errorMsg = `Migration failed: ${migrationResult.error?.message}`;
          errors.push(errorMsg);
          logger.error(errorMsg, 'DatabaseManager', migrationResult.error);
        } else {
          const migrationsRun = migrationResult.data?.migrationsRun || 0;
          logger.info(`Migrations completed successfully: ${migrationsRun} migrations run`, 'DatabaseManager');
        }
      }

      // Seed data if requested
      if (options.seedData && options.adminUserId) {
        logger.info('Seeding database with sample data', 'DatabaseManager', {
          adminUserId: options.adminUserId,
          force: options.force,
          includeAdditionalSports: options.includeAdditionalSports,
        });

        seedingResult = await seederService.seedAll({
          adminUserId: options.adminUserId,
          force: options.force || false,
          includeAdditionalSports: options.includeAdditionalSports || false,
        });

        if (!seedingResult.success) {
          const errorMsg = `Seeding failed: ${seedingResult.error?.message}`;
          errors.push(errorMsg);
          logger.error(errorMsg, 'DatabaseManager', seedingResult.error);
        } else {
          const stats = seedingResult.data;
          logger.info('Database seeding completed successfully', 'DatabaseManager', {
            sportsCreated: stats?.sportsCreated,
            skillsCreated: stats?.skillsCreated,
            quizzesCreated: stats?.quizzesCreated,
            achievementsCreated: stats?.achievementsCreated,
          });
        }
      }

      const success = errors.length === 0;

      if (success) {
        logger.info('Database initialization completed successfully', 'DatabaseManager');
      } else {
        logger.error('Database initialization completed with errors', 'DatabaseManager', { errors });
      }

      return {
        success,
        migrations: migrationResult?.data,
        seeding: seedingResult?.data,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      logger.error('Database initialization failed with exception', 'DatabaseManager', error);
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
      logger.error('Failed to get database status', 'DatabaseManager', error);
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
      logger.warn('Resetting database - this will clear all data!', 'DatabaseManager');

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

      logger.info('Database reset completed successfully', 'DatabaseManager');

      return {
        success: true,
        message: 'Database reset and re-initialized successfully',
      };

    } catch (error) {
      logger.error('Database reset failed', 'DatabaseManager', error);
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
      logger.error('Database integrity validation failed', 'DatabaseManager', error);
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
    videoQuizService: any;
    userService: any;
  }> {
    const [baseHealth, sportsHealth, videoQuizHealth, userHealth] = await Promise.all([
      migrationService.healthCheck(),
      sportsService.healthCheck(),
      videoQuizService.healthCheck(),
      userService.healthCheck(),
    ]);

    return {
      baseService: baseHealth,
      sportsService: sportsHealth,
      videoQuizService: videoQuizHealth,
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
      videoQuiz: videoQuizService.getCacheStats(),
      user: userService.getCacheStats(),
    };
  },

  /**
   * Clear all caches
   */
  clearAllCaches() {
    migrationService.clearCache();
    sportsService.clearCache();
    videoQuizService.clearCache();
    userService.clearCache();
    logger.info('All caches cleared', 'DatabaseHelpers');
  },
};
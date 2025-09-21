import { BaseDatabaseService } from '../base.service';
import {
  Migration,
  MigrationState,
  ApiResponse,
} from '@/types';
import { logger } from '../../utils/logger';

export class MigrationService extends BaseDatabaseService {
  private readonly MIGRATIONS_COLLECTION = 'migrations';
  private readonly MIGRATION_STATE_COLLECTION = 'migration_state';
  private readonly STATE_DOCUMENT_ID = 'current_state';

  private migrations: Migration[] = [
    {
      id: '001_initial_schema',
      version: '1.0.0',
      name: 'Initial Schema Setup',
      description: 'Set up initial database collections and indexes',
      up: async () => {
        logger.info('Running migration: Initial Schema Setup', 'MigrationService');
        // Migration logic for setting up initial schema
        // This would typically include creating indexes, etc.
        await this.setupInitialIndexes();
      },
      down: async () => {
        logger.info('Rolling back migration: Initial Schema Setup', 'MigrationService');
        // Rollback logic
        await this.removeInitialIndexes();
      },
    },
    {
      id: '002_add_user_preferences',
      version: '1.1.0',
      name: 'Add User Preferences',
      description: 'Add preferences field to user documents',
      up: async () => {
        logger.info('Running migration: Add User Preferences', 'MigrationService');
        await this.addUserPreferencesField();
      },
      down: async () => {
        logger.info('Rolling back migration: Add User Preferences', 'MigrationService');
        await this.removeUserPreferencesField();
      },
    },
    {
      id: '003_update_quiz_metadata',
      version: '1.2.0',
      name: 'Update Quiz Metadata',
      description: 'Add new metadata fields to quiz documents',
      up: async () => {
        logger.info('Running migration: Update Quiz Metadata', 'MigrationService');
        await this.updateQuizMetadataStructure();
      },
      down: async () => {
        logger.info('Rolling back migration: Update Quiz Metadata', 'MigrationService');
        await this.revertQuizMetadataStructure();
      },
    },
    {
      id: '004_add_achievement_rarity',
      version: '1.3.0',
      name: 'Add Achievement Rarity',
      description: 'Add rarity field to achievement documents',
      up: async () => {
        logger.info('Running migration: Add Achievement Rarity', 'MigrationService');
        await this.addAchievementRarityField();
      },
      down: async () => {
        logger.info('Rolling back migration: Add Achievement Rarity', 'MigrationService');
        await this.removeAchievementRarityField();
      },
    },
    {
      id: '005_add_content_analytics',
      version: '1.4.0',
      name: 'Add Content Analytics',
      description: 'Add analytics tracking fields to content documents',
      up: async () => {
        logger.info('Running migration: Add Content Analytics', 'MigrationService');
        await this.addContentAnalyticsFields();
      },
      down: async () => {
        logger.info('Rolling back migration: Add Content Analytics', 'MigrationService');
        await this.removeContentAnalyticsFields();
      },
    },
  ];

  async getCurrentMigrationState(): Promise<ApiResponse<MigrationState | null>> {
    try {
      const result = await this.getById<MigrationState>(
        this.MIGRATION_STATE_COLLECTION,
        this.STATE_DOCUMENT_ID,
        { useCache: false }
      );

      if (!result.success) {
        return result;
      }

      if (!result.data) {
        // Initialize migration state if it doesn't exist
        const initialState: Omit<MigrationState, 'id' | 'createdAt' | 'updatedAt'> = {
          currentVersion: '0.0.0',
          executedMigrations: [],
          lastMigrationAt: new Date() as any,
        };

        const createResult = await this.create<MigrationState>(
          this.MIGRATION_STATE_COLLECTION,
          initialState
        );

        if (createResult.success) {
          const newState: MigrationState = {
            id: createResult.data!.id,
            ...initialState,
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
          };

          return {
            success: true,
            data: newState,
            timestamp: new Date(),
          };
        }

        return {
          success: false,
          error: {
            code: 'MIGRATION_STATE_INIT_FAILED',
            message: 'Failed to initialize migration state',
          },
          timestamp: new Date(),
        };
      }

      return result;

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_STATE_FETCH_FAILED',
          message: 'Failed to get migration state',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async runPendingMigrations(): Promise<ApiResponse<{
    migrationsRun: number;
    newVersion: string;
    executedMigrations: string[];
  }>> {
    try {
      logger.info('Starting migration process', 'MigrationService');

      const stateResult = await this.getCurrentMigrationState();
      if (!stateResult.success || !stateResult.data) {
        return {
          success: false,
          error: stateResult.error || {
            code: 'MIGRATION_STATE_NOT_FOUND',
            message: 'Migration state not found',
          },
          timestamp: new Date(),
        };
      }

      const currentState = stateResult.data;
      const executedMigrations = new Set(currentState.executedMigrations);

      // Find pending migrations
      const pendingMigrations = this.migrations.filter(
        migration => !executedMigrations.has(migration.id)
      );

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found', 'MigrationService');
        return {
          success: true,
          data: {
            migrationsRun: 0,
            newVersion: currentState.currentVersion,
            executedMigrations: currentState.executedMigrations,
          },
          message: 'No pending migrations',
          timestamp: new Date(),
        };
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`, 'MigrationService');

      // Sort migrations by version to ensure proper order
      pendingMigrations.sort((a, b) => this.compareVersions(a.version, b.version));

      const executedMigrationIds: string[] = [];
      let lastVersion = currentState.currentVersion;

      // Execute migrations sequentially
      for (const migration of pendingMigrations) {
        try {
          logger.info(`Running migration: ${migration.name} (${migration.version})`, 'MigrationService');

          // Record migration start
          await this.recordMigrationExecution(migration, 'started');

          // Execute migration
          await migration.up();

          // Record migration completion
          await this.recordMigrationExecution(migration, 'completed');

          executedMigrationIds.push(migration.id);
          lastVersion = migration.version;

          logger.info(`Completed migration: ${migration.name}`, 'MigrationService');

        } catch (error) {
          logger.error(`Migration failed: ${migration.name}`, 'MigrationService', error);

          // Record migration failure
          await this.recordMigrationExecution(migration, 'failed', error);

          // Attempt rollback
          try {
            logger.info(`Attempting rollback for: ${migration.name}`, 'MigrationService');
            await migration.down();
            logger.info(`Rollback successful for: ${migration.name}`, 'MigrationService');
          } catch (rollbackError) {
            logger.error(`Rollback failed for: ${migration.name}`, 'MigrationService', rollbackError);
          }

          return {
            success: false,
            error: {
              code: 'MIGRATION_EXECUTION_FAILED',
              message: `Migration failed: ${migration.name}`,
              details: error,
            },
            timestamp: new Date(),
          };
        }
      }

      // Update migration state
      const updatedExecutedMigrations = [...currentState.executedMigrations, ...executedMigrationIds];

      await this.update<MigrationState>(
        this.MIGRATION_STATE_COLLECTION,
        currentState.id,
        {
          currentVersion: lastVersion,
          executedMigrations: updatedExecutedMigrations,
          lastMigrationAt: new Date() as any,
        }
      );

      logger.info(`Migration process completed! Updated to version ${lastVersion}`, 'MigrationService');

      return {
        success: true,
        data: {
          migrationsRun: executedMigrationIds.length,
          newVersion: lastVersion,
          executedMigrations: updatedExecutedMigrations,
        },
        message: `Successfully ran ${executedMigrationIds.length} migrations`,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_PROCESS_FAILED',
          message: 'Migration process failed',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async rollbackToVersion(targetVersion: string): Promise<ApiResponse<{
    migrationsRolledBack: number;
    newVersion: string;
    executedMigrations: string[];
  }>> {
    try {
      logger.info(`Starting rollback to version ${targetVersion}`, 'MigrationService');

      const stateResult = await this.getCurrentMigrationState();
      if (!stateResult.success || !stateResult.data) {
        return {
          success: false,
          error: stateResult.error || {
            code: 'MIGRATION_STATE_NOT_FOUND',
            message: 'Migration state not found',
          },
          timestamp: new Date(),
        };
      }

      const currentState = stateResult.data;

      // Find migrations to rollback (migrations with version > targetVersion)
      const migrationsToRollback = this.migrations
        .filter(migration =>
          currentState.executedMigrations.includes(migration.id) &&
          this.compareVersions(migration.version, targetVersion) > 0
        )
        .sort((a, b) => this.compareVersions(b.version, a.version)); // Reverse order for rollback

      if (migrationsToRollback.length === 0) {
        logger.info('No migrations to rollback', 'MigrationService');
        return {
          success: true,
          data: {
            migrationsRolledBack: 0,
            newVersion: currentState.currentVersion,
            executedMigrations: currentState.executedMigrations,
          },
          message: 'No migrations to rollback',
          timestamp: new Date(),
        };
      }

      logger.info(`Found ${migrationsToRollback.length} migrations to rollback`, 'MigrationService');

      const rolledBackMigrationIds: string[] = [];

      // Execute rollbacks sequentially
      for (const migration of migrationsToRollback) {
        try {
          logger.info(`Rolling back migration: ${migration.name} (${migration.version})`, 'MigrationService');

          // Record rollback start
          await this.recordMigrationExecution(migration, 'rollback_started');

          // Execute rollback
          await migration.down();

          // Record rollback completion
          await this.recordMigrationExecution(migration, 'rollback_completed');

          rolledBackMigrationIds.push(migration.id);

          logger.info(`Rolled back migration: ${migration.name}`, 'MigrationService');

        } catch (error) {
          logger.error(`Rollback failed: ${migration.name}`, 'MigrationService', error);

          // Record rollback failure
          await this.recordMigrationExecution(migration, 'rollback_failed', error);

          return {
            success: false,
            error: {
              code: 'ROLLBACK_EXECUTION_FAILED',
              message: `Rollback failed: ${migration.name}`,
              details: error,
            },
            timestamp: new Date(),
          };
        }
      }

      // Update migration state
      const updatedExecutedMigrations = currentState.executedMigrations.filter(
        id => !rolledBackMigrationIds.includes(id)
      );

      // Find the new current version (highest version of remaining executed migrations)
      const remainingMigrations = this.migrations.filter(
        migration => updatedExecutedMigrations.includes(migration.id)
      );

      const newVersion = remainingMigrations.length > 0
        ? remainingMigrations.reduce((latest, current) =>
            this.compareVersions(current.version, latest.version) > 0 ? current : latest
          ).version
        : '0.0.0';

      await this.update<MigrationState>(
        this.MIGRATION_STATE_COLLECTION,
        currentState.id,
        {
          currentVersion: newVersion,
          executedMigrations: updatedExecutedMigrations,
          lastMigrationAt: new Date() as any,
        }
      );

      logger.info(`Rollback process completed! Rolled back to version ${newVersion}`, 'MigrationService');

      return {
        success: true,
        data: {
          migrationsRolledBack: rolledBackMigrationIds.length,
          newVersion,
          executedMigrations: updatedExecutedMigrations,
        },
        message: `Successfully rolled back ${rolledBackMigrationIds.length} migrations`,
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ROLLBACK_PROCESS_FAILED',
          message: 'Rollback process failed',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async getMigrationHistory(): Promise<ApiResponse<Migration[]>> {
    try {
      const result = await this.query<Migration>(this.MIGRATIONS_COLLECTION, {
        orderBy: [{ field: 'executedAt', direction: 'desc' }],
      });

      return result.data ? {
        success: true,
        data: result.data.items,
        timestamp: new Date(),
      } : {
        success: true,
        data: [],
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_HISTORY_FETCH_FAILED',
          message: 'Failed to get migration history',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  async checkMigrationStatus(): Promise<ApiResponse<{
    currentVersion: string;
    latestVersion: string;
    pendingMigrations: number;
    executedMigrations: number;
    needsMigration: boolean;
  }>> {
    try {
      const stateResult = await this.getCurrentMigrationState();
      if (!stateResult.success || !stateResult.data) {
        return {
          success: false,
          error: stateResult.error || {
            code: 'MIGRATION_STATE_NOT_FOUND',
            message: 'Migration state not found',
          },
          timestamp: new Date(),
        };
      }

      const currentState = stateResult.data;
      const executedMigrations = new Set(currentState.executedMigrations);

      const pendingMigrations = this.migrations.filter(
        migration => !executedMigrations.has(migration.id)
      );

      const latestVersion = this.migrations.length > 0
        ? this.migrations.reduce((latest, current) =>
            this.compareVersions(current.version, latest.version) > 0 ? current : latest
          ).version
        : '0.0.0';

      return {
        success: true,
        data: {
          currentVersion: currentState.currentVersion,
          latestVersion,
          pendingMigrations: pendingMigrations.length,
          executedMigrations: currentState.executedMigrations.length,
          needsMigration: pendingMigrations.length > 0,
        },
        timestamp: new Date(),
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'MIGRATION_STATUS_CHECK_FAILED',
          message: 'Failed to check migration status',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  // Helper methods

  private async recordMigrationExecution(
    migration: Migration,
    status: 'started' | 'completed' | 'failed' | 'rollback_started' | 'rollback_completed' | 'rollback_failed',
    error?: any
  ): Promise<void> {
    try {
      const record = {
        ...migration,
        status,
        executedAt: new Date() as any,
        error: error ? String(error) : undefined,
      };

      await this.create(this.MIGRATIONS_COLLECTION, record);
    } catch (recordError) {
      logger.error('Failed to record migration execution', 'MigrationService', recordError);
      // Don't throw here as it would interrupt the migration process
    }
  }

  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    const maxLength = Math.max(v1Parts.length, v2Parts.length);

    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;

      if (v1Part > v2Part) return 1;
      if (v1Part < v2Part) return -1;
    }

    return 0;
  }

  // Migration implementation methods

  private async setupInitialIndexes(): Promise<void> {
    // In a real implementation, this would create Firestore indexes
    // For now, we'll just log the action
    logger.info('Setting up initial database indexes', 'MigrationService');
    // await this.createIndex('users', ['email']);
    // await this.createIndex('sports', ['category', 'difficulty']);
    // etc.
  }

  private async removeInitialIndexes(): Promise<void> {
    logger.info('Removing initial database indexes', 'MigrationService');
    // Rollback logic for index removal
  }

  private async addUserPreferencesField(): Promise<void> {
    logger.info('Adding preferences field to user documents', 'MigrationService');

    const usersResult = await this.query('users', { limit: 1000 });
    if (usersResult.success && usersResult.data) {
      const operations = usersResult.data.items
        .filter((user: any) => !user.preferences)
        .map((user: any) => ({
          type: 'update' as const,
          collection: 'users',
          id: user.id,
          data: {
            preferences: {
              notifications: true,
              theme: 'light',
              language: 'en',
              timezone: 'UTC',
              emailNotifications: {
                progress: true,
                quizResults: true,
                newContent: true,
                reminders: true,
              },
            },
          },
        }));

      if (operations.length > 0) {
        await this.batchWrite(operations);
        logger.info(`Updated ${operations.length} user documents`, 'MigrationService');
      }
    }
  }

  private async removeUserPreferencesField(): Promise<void> {
    logger.info('Removing preferences field from user documents', 'MigrationService');
    // Rollback logic - would need to use admin SDK to remove fields
  }

  private async updateQuizMetadataStructure(): Promise<void> {
    logger.info('Updating quiz metadata structure', 'MigrationService');

    const quizzesResult = await this.query('quizzes', { limit: 1000 });
    if (quizzesResult.success && quizzesResult.data) {
      const operations = quizzesResult.data.items.map((quiz: any) => ({
        type: 'update' as const,
        collection: 'quizzes',
        id: quiz.id,
        data: {
          metadata: {
            ...quiz.metadata,
            passRate: quiz.metadata?.passRate || 0,
            averageTimeSpent: quiz.metadata?.averageTimeSpent || 0,
          },
        },
      }));

      if (operations.length > 0) {
        await this.batchWrite(operations);
        logger.info(`Updated ${operations.length} quiz documents`, 'MigrationService');
      }
    }
  }

  private async revertQuizMetadataStructure(): Promise<void> {
    logger.info('Reverting quiz metadata structure', 'MigrationService');
    // Rollback logic
  }

  private async addAchievementRarityField(): Promise<void> {
    logger.info('Adding rarity field to achievement documents', 'MigrationService');

    const achievementsResult = await this.query('achievements', { limit: 1000 });
    if (achievementsResult.success && achievementsResult.data) {
      const operations = achievementsResult.data.items
        .filter((achievement: any) => !achievement.rarity)
        .map((achievement: any) => ({
          type: 'update' as const,
          collection: 'achievements',
          id: achievement.id,
          data: {
            rarity: 'common', // Default rarity
          },
        }));

      if (operations.length > 0) {
        await this.batchWrite(operations);
        logger.info(`Updated ${operations.length} achievement documents`, 'MigrationService');
      }
    }
  }

  private async removeAchievementRarityField(): Promise<void> {
    logger.info('Removing rarity field from achievement documents', 'MigrationService');
    // Rollback logic
  }

  private async addContentAnalyticsFields(): Promise<void> {
    logger.info('Adding analytics fields to content documents', 'MigrationService');

    const contentResult = await this.query('content', { limit: 1000 });
    if (contentResult.success && contentResult.data) {
      const operations = contentResult.data.items
        .filter((content: any) => !content.metadata?.views)
        .map((content: any) => ({
          type: 'update' as const,
          collection: 'content',
          id: content.id,
          data: {
            metadata: {
              ...content.metadata,
              views: 0,
              likes: 0,
              shares: 0,
              bookmarks: 0,
            },
          },
        }));

      if (operations.length > 0) {
        await this.batchWrite(operations);
        logger.info(`Updated ${operations.length} content documents`, 'MigrationService');
      }
    }
  }

  private async removeContentAnalyticsFields(): Promise<void> {
    logger.info('Removing analytics fields from content documents', 'MigrationService');
    // Rollback logic
  }
}

// Export singleton instance
export const migrationService = new MigrationService();
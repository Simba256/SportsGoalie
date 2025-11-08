import { formTemplateService } from '../database/services/form-template.service';
import { createDefaultHockeyGoalieTemplate } from './hockey-goalie-default';
import { logger } from '../utils/logger';

/**
 * Initializes the default form templates in the database
 * This should be run once when setting up the dynamic form system
 */
export async function initializeDefaultTemplates(adminUserId: string): Promise<{
  success: boolean;
  message: string;
  templateIds?: string[];
  errors?: string[];
}> {
  logger.info('Initializing default form templates', 'TemplateInit', { adminUserId });

  const results: string[] = [];
  const errors: string[] = [];

  try {
    // Create Hockey Goalie template
    const hockeyTemplate = createDefaultHockeyGoalieTemplate(adminUserId);

    logger.info('Creating Hockey Goalie template', 'TemplateInit');
    const hockeyResult = await formTemplateService.createTemplate(hockeyTemplate);

    if (hockeyResult.success && hockeyResult.data) {
      results.push(hockeyResult.data.id);
      logger.info('Hockey Goalie template created successfully', 'TemplateInit', {
        templateId: hockeyResult.data.id,
      });
    } else {
      const errorMsg = hockeyResult.message || 'Unknown error creating Hockey Goalie template';
      errors.push(errorMsg);
      logger.error('Failed to create Hockey Goalie template', errorMsg, 'TemplateInit');
    }

    // Future: Add more default templates here for other sports
    // e.g., Soccer Goalkeeper, Basketball, etc.

    if (errors.length > 0) {
      return {
        success: false,
        message: `Template initialization completed with ${errors.length} error(s)`,
        templateIds: results,
        errors,
      };
    }

    return {
      success: true,
      message: `Successfully initialized ${results.length} template(s)`,
      templateIds: results,
    };
  } catch (error) {
    logger.error('Error initializing templates', error, 'TemplateInit');
    return {
      success: false,
      message: 'Failed to initialize templates',
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Checks if default templates are already initialized
 */
export async function checkDefaultTemplatesExist(): Promise<{
  hockeyGoalie: boolean;
}> {
  try {
    const hockeyResult = await formTemplateService.getTemplates({
      sport: 'Hockey',
      isActive: true,
      isArchived: false,
      limit: 1,
    });

    return {
      hockeyGoalie: hockeyResult.success && hockeyResult.data ? hockeyResult.data.length > 0 : false,
    };
  } catch (error) {
    logger.error('Error checking template existence', error, 'TemplateInit');
    return {
      hockeyGoalie: false,
    };
  }
}

/**
 * Gets or creates the default Hockey Goalie template
 * Useful for ensuring a template exists before using it
 */
export async function ensureHockeyGoalieTemplate(adminUserId: string): Promise<{
  success: boolean;
  templateId?: string;
  message?: string;
}> {
  try {
    // Check if template already exists
    const existingResult = await formTemplateService.getActiveTemplate('Hockey');

    if (existingResult.success && existingResult.data) {
      return {
        success: true,
        templateId: existingResult.data.id,
        message: 'Using existing template',
      };
    }

    // Template doesn't exist, create it
    const template = createDefaultHockeyGoalieTemplate(adminUserId);
    const createResult = await formTemplateService.createTemplate(template);

    if (createResult.success && createResult.data) {
      return {
        success: true,
        templateId: createResult.data.id,
        message: 'Template created successfully',
      };
    }

    return {
      success: false,
      message: createResult.message || 'Failed to create template',
    };
  } catch (error) {
    logger.error('Error ensuring Hockey Goalie template', error, 'TemplateInit');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

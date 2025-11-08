import { BaseDatabaseService } from '../base.service';
import {
  FormTemplate,
  FormSection,
  FormField,
  FormTemplateQueryOptions,
  TemplateValidationResult,
  FieldType,
  AnalyticsType,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import {
  Timestamp,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  collection,
  doc,
  setDoc,
  updateDoc,
  increment,
} from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { db } from '../../firebase/config';

/**
 * Service for managing dynamic form templates in the charting system.
 *
 * This service provides functionality for:
 * - Creating and managing form templates
 * - Template validation
 * - Versioning and activation
 * - Template cloning and archiving
 *
 * @example
 * ```typescript
 * // Create a new template
 * const template = await formTemplateService.createTemplate({
 *   name: 'Hockey Goalie Performance',
 *   sport: 'Hockey',
 *   sections: [...]
 * });
 *
 * // Activate a template
 * await formTemplateService.activateTemplate(templateId, 'Hockey');
 * ```
 */
export class FormTemplateService extends BaseDatabaseService {
  private readonly TEMPLATES_COLLECTION = 'form_templates';

  // ==================== TEMPLATE CRUD OPERATIONS ====================

  /**
   * Creates a new form template
   */
  async createTemplate(
    templateData: Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.TEMPLATES_COLLECTION, undefined, {
      name: templateData.name,
      sport: templateData.sport,
    });

    // Validate template structure
    const validation = this.validateTemplate(templateData as FormTemplate);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Template validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.map((e) => e.message).join(', '),
          details: validation.errors,
        },
        timestamp: new Date(),
      };
    }

    // If this template should be active, deactivate others
    if (templateData.isActive && templateData.sport) {
      await this.deactivateOtherTemplates(templateData.sport);
    }

    const cleanedData = {
      ...templateData,
      version: 1,
      isArchived: false,
      usageCount: 0,
    };

    const result = await this.create<FormTemplate>(this.TEMPLATES_COLLECTION, cleanedData);

    if (result.success) {
      logger.info('Form template created successfully', 'FormTemplateService', {
        templateId: result.data!.id,
        name: templateData.name,
      });
    }

    return result;
  }

  /**
   * Gets a form template by ID
   */
  async getTemplate(templateId: string): Promise<ApiResponse<FormTemplate>> {
    logger.database('read', this.TEMPLATES_COLLECTION, templateId);

    return await this.getById<FormTemplate>(this.TEMPLATES_COLLECTION, templateId);
  }

  /**
   * Updates a form template
   * Creates a new version if the template is in use
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<FormTemplate>,
    createNewVersion: boolean = false
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('update', this.TEMPLATES_COLLECTION, templateId, { createNewVersion });

    // Get current template
    const currentResult = await this.getTemplate(templateId);
    if (!currentResult.success || !currentResult.data) {
      return {
        success: false,
        message: 'Template not found',
        error: {
          code: 'NOT_FOUND',
          message: 'Template does not exist',
        },
        timestamp: new Date(),
      };
    }

    const currentTemplate = currentResult.data;

    // Check if we should create a new version
    if (createNewVersion || (currentTemplate.usageCount && currentTemplate.usageCount > 0)) {
      // Create new version
      const newTemplateData = {
        ...currentTemplate,
        ...updates,
        version: currentTemplate.version + 1,
        usageCount: 0,
      };

      // Archive the old version
      await this.archiveTemplate(templateId);

      // Create new version
      return await this.createTemplate(newTemplateData);
    }

    // Validate updated template
    const updatedTemplate = { ...currentTemplate, ...updates };
    const validation = this.validateTemplate(updatedTemplate);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Template validation failed',
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.errors.map((e) => e.message).join(', '),
          details: validation.errors,
        },
        timestamp: new Date(),
      };
    }

    // If activating this template, deactivate others
    if (updates.isActive && currentTemplate.sport) {
      await this.deactivateOtherTemplates(currentTemplate.sport, templateId);
    }

    const result = await this.update<FormTemplate>(this.TEMPLATES_COLLECTION, templateId, updates);

    if (result.success) {
      logger.info('Form template updated successfully', 'FormTemplateService', {
        templateId,
      });
    }

    return result;
  }

  /**
   * Deletes a form template
   * Only allowed if template has no usage
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.TEMPLATES_COLLECTION, templateId);

    // Check if template is in use
    const templateResult = await this.getTemplate(templateId);
    if (!templateResult.success || !templateResult.data) {
      return {
        success: false,
        message: 'Template not found',
      };
    }

    if (templateResult.data.usageCount && templateResult.data.usageCount > 0) {
      return {
        success: false,
        message: 'Cannot delete template that is in use. Archive it instead.',
        error: {
          code: 'TEMPLATE_IN_USE',
          message: 'Cannot delete template that is in use. Archive it instead.',
        },
        timestamp: new Date(),
      };
    }

    return await this.delete(this.TEMPLATES_COLLECTION, templateId);
  }

  /**
   * Archives a template (soft delete)
   */
  async archiveTemplate(templateId: string): Promise<ApiResponse<void>> {
    logger.database('update', this.TEMPLATES_COLLECTION, templateId, { archive: true });

    return await this.update<FormTemplate>(this.TEMPLATES_COLLECTION, templateId, {
      isArchived: true,
      isActive: false,
    });
  }

  /**
   * Restores an archived template
   */
  async restoreTemplate(templateId: string): Promise<ApiResponse<void>> {
    logger.database('update', this.TEMPLATES_COLLECTION, templateId, { restore: true });

    return await this.update<FormTemplate>(this.TEMPLATES_COLLECTION, templateId, {
      isArchived: false,
    });
  }

  /**
   * Clones a template with a new name
   */
  async cloneTemplate(
    templateId: string,
    newName: string,
    createdBy: string
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('read', this.TEMPLATES_COLLECTION, templateId, { action: 'clone' });

    // Get original template
    const originalResult = await this.getTemplate(templateId);
    if (!originalResult.success || !originalResult.data) {
      return {
        success: false,
        message: 'Template not found',
      };
    }

    const original = originalResult.data;

    // Create clone with new name
    const cloneData = {
      ...original,
      name: newName,
      isActive: false, // Clones are not active by default
      isArchived: false,
      createdBy,
      // Remove ID and timestamps - will be generated by create
    } as Omit<FormTemplate, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'usageCount'>;

    return await this.createTemplate(cloneData);
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Gets all templates based on query options
   */
  async getTemplates(
    options: FormTemplateQueryOptions = {}
  ): Promise<ApiResponse<FormTemplate[]>> {
    logger.database('query', this.TEMPLATES_COLLECTION, undefined, options);

    try {
      const templatesRef = collection(db, this.TEMPLATES_COLLECTION);
      let q = query(templatesRef);

      // Apply filters
      if (options.sport !== undefined) {
        q = query(q, where('sport', '==', options.sport));
      }
      if (options.isActive !== undefined) {
        q = query(q, where('isActive', '==', options.isActive));
      }
      if (options.isArchived !== undefined) {
        q = query(q, where('isArchived', '==', options.isArchived));
      }
      if (options.createdBy) {
        q = query(q, where('createdBy', '==', options.createdBy));
      }

      // Apply ordering
      const orderField = options.orderBy || 'createdAt';
      const orderDir = options.orderDirection || 'desc';
      q = query(q, orderBy(orderField, orderDir));

      // Apply limit
      if (options.limit) {
        q = query(q, firestoreLimit(options.limit));
      }

      const snapshot = await getDocs(q);
      const templates = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FormTemplate[];

      return {
        success: true,
        data: templates,
      };
    } catch (error) {
      logger.error('Error querying templates', error, 'FormTemplateService');
      return {
        success: false,
        message: 'Failed to query templates',
        error: {
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets the active template
   */
  async getActiveTemplate(): Promise<ApiResponse<FormTemplate | null>> {
    logger.database('query', this.TEMPLATES_COLLECTION, undefined, {
      isActive: true,
    });

    const result = await this.getTemplates({
      isActive: true,
      isArchived: false,
      limit: 1,
    });

    if (!result.success) {
      return result as ApiResponse<FormTemplate | null>;
    }

    return {
      success: true,
      data: result.data && result.data.length > 0 ? result.data[0] : null,
    };
  }

  /**
   * Gets templates by creator
   */
  async getTemplatesByCreator(
    userId: string,
    includeArchived: boolean = false
  ): Promise<ApiResponse<FormTemplate[]>> {
    return await this.getTemplates({
      createdBy: userId,
      isArchived: includeArchived ? undefined : false,
      orderBy: 'updatedAt',
      orderDirection: 'desc',
    });
  }

  // ==================== TEMPLATE ACTIVATION ====================

  /**
   * Activates a template for a specific sport
   * Deactivates all other templates for that sport
   */
  async activateTemplate(
    templateId: string,
    sport?: string
  ): Promise<ApiResponse<void>> {
    logger.database('update', this.TEMPLATES_COLLECTION, templateId, {
      action: 'activate',
    });

    // Get template to check sport
    const templateResult = await this.getTemplate(templateId);
    if (!templateResult.success || !templateResult.data) {
      return {
        success: false,
        message: 'Template not found',
      };
    }

    const targetSport = sport || templateResult.data.sport;
    if (!targetSport) {
      return {
        success: false,
        message: 'Sport must be specified for activation',
        error: {
          code: 'MISSING_SPORT',
          message: 'Sport must be specified for activation',
        },
        timestamp: new Date(),
      };
    }

    // Deactivate other templates
    await this.deactivateOtherTemplates(targetSport, templateId);

    // Activate this template
    return await this.update<FormTemplate>(this.TEMPLATES_COLLECTION, templateId, {
      isActive: true,
      sport: targetSport,
    });
  }

  /**
   * Deactivates all templates for a sport except the specified one
   */
  private async deactivateOtherTemplates(
    sport: string,
    exceptTemplateId?: string
  ): Promise<void> {
    const templates = await this.getTemplates({
      sport,
      isActive: true,
    });

    if (!templates.success || !templates.data) return;

    const updatePromises = templates.data
      .filter((t) => t.id !== exceptTemplateId)
      .map((t) =>
        this.update<FormTemplate>(this.TEMPLATES_COLLECTION, t.id, {
          isActive: false,
        })
      );

    await Promise.all(updatePromises);
  }

  // ==================== TEMPLATE VALIDATION ====================

  /**
   * Validates a form template structure
   */
  validateTemplate(template: Partial<FormTemplate>): TemplateValidationResult {
    const errors: { path: string; message: string }[] = [];
    const warnings: { path: string; message: string }[] = [];

    // Basic validation
    if (!template.name || template.name.trim().length === 0) {
      errors.push({ path: 'name', message: 'Template name is required' });
    }

    if (!template.sections || template.sections.length === 0) {
      errors.push({ path: 'sections', message: 'Template must have at least one section' });
    }

    // Validate sections
    if (template.sections) {
      const sectionIds = new Set<string>();

      template.sections.forEach((section, sIdx) => {
        const sectionPath = `sections[${sIdx}]`;

        // Check for duplicate section IDs
        if (sectionIds.has(section.id)) {
          errors.push({
            path: `${sectionPath}.id`,
            message: `Duplicate section ID: ${section.id}`,
          });
        }
        sectionIds.add(section.id);

        // Validate section
        if (!section.title || section.title.trim().length === 0) {
          errors.push({
            path: `${sectionPath}.title`,
            message: 'Section title is required',
          });
        }

        if (!section.fields || section.fields.length === 0) {
          warnings.push({
            path: `${sectionPath}.fields`,
            message: 'Section has no fields',
          });
        }

        // Validate fields
        if (section.fields) {
          const fieldIds = new Set<string>();

          section.fields.forEach((field, fIdx) => {
            const fieldPath = `${sectionPath}.fields[${fIdx}]`;

            // Check for duplicate field IDs
            if (fieldIds.has(field.id)) {
              errors.push({
                path: `${fieldPath}.id`,
                message: `Duplicate field ID: ${field.id}`,
              });
            }
            fieldIds.add(field.id);

            // Validate field
            const fieldErrors = this.validateField(field, fieldPath);
            errors.push(...fieldErrors);
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validates a single field
   */
  private validateField(field: FormField, path: string): { path: string; message: string }[] {
    const errors: { path: string; message: string }[] = [];

    // Basic validation
    if (!field.label || field.label.trim().length === 0) {
      errors.push({ path: `${path}.label`, message: 'Field label is required' });
    }

    if (!field.type) {
      errors.push({ path: `${path}.type`, message: 'Field type is required' });
    }

    // Validate field type specific requirements
    if (field.type === 'radio' || field.type === 'checkbox') {
      if (!field.options || field.options.length === 0) {
        errors.push({
          path: `${path}.options`,
          message: 'Radio and checkbox fields require options',
        });
      }
    }

    if (field.type === 'scale' || field.type === 'numeric') {
      if (
        field.validation?.min !== undefined &&
        field.validation?.max !== undefined &&
        field.validation.min >= field.validation.max
      ) {
        errors.push({
          path: `${path}.validation`,
          message: 'Min value must be less than max value',
        });
      }
    }

    // Validate analytics configuration
    if (field.analytics?.enabled) {
      if (!field.analytics.type || field.analytics.type === 'none') {
        errors.push({
          path: `${path}.analytics.type`,
          message: 'Analytics type required when analytics is enabled',
        });
      }

      // Check analytics type compatibility with field type
      const incompatibleCombos: { [key in FieldType]?: AnalyticsType[] } = {
        yesno: ['sum', 'distribution'],
        text: ['average', 'sum', 'percentage'],
        textarea: ['average', 'sum', 'percentage'],
        radio: ['average', 'sum'],
        checkbox: ['average', 'sum'],
      };

      const incompatible = incompatibleCombos[field.type];
      if (incompatible && incompatible.includes(field.analytics.type)) {
        errors.push({
          path: `${path}.analytics.type`,
          message: `Analytics type '${field.analytics.type}' is not compatible with field type '${field.type}'`,
        });
      }
    }

    return errors;
  }

  // ==================== USAGE TRACKING ====================

  /**
   * Increments the usage count for a template
   * Called when a new entry is created using this template
   */
  async incrementUsageCount(templateId: string): Promise<void> {
    try {
      const templateRef = doc(db, this.TEMPLATES_COLLECTION, templateId);
      await updateDoc(templateRef, {
        usageCount: increment(1),
      });
    } catch (error) {
      logger.error('Error incrementing template usage count', error, 'FormTemplateService', {
        templateId,
      });
    }
  }

  /**
   * Gets template usage statistics
   */
  async getTemplateStats(templateId: string): Promise<
    ApiResponse<{
      usageCount: number;
      activeUsers: number;
      lastUsed?: Timestamp;
    }>
  > {
    const templateResult = await this.getTemplate(templateId);
    if (!templateResult.success || !templateResult.data) {
      return {
        success: false,
        message: 'Template not found',
      };
    }

    // For now, return basic stats from template
    // Can be enhanced to query actual entry data
    return {
      success: true,
      data: {
        usageCount: templateResult.data.usageCount || 0,
        activeUsers: 0, // Would need to query entries
        lastUsed: undefined, // Would need to query entries
      },
    };
  }
}

// Export singleton instance
export const formTemplateService = new FormTemplateService();

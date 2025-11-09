import { BaseDatabaseService } from '../base.service';
import {
  DynamicChartingEntry,
  FormTemplate,
  FormResponses,
  ApiResponse,
} from '@/types';
import {
  Timestamp,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  getDocs,
  collection,
} from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { db } from '../../firebase/config';
import { formTemplateService } from './form-template.service';

/**
 * Service for managing dynamic charting entries
 * Works alongside the legacy charting service during migration
 */
export class DynamicChartingService extends BaseDatabaseService {
  private readonly DYNAMIC_ENTRIES_COLLECTION = 'dynamic_charting_entries';

  // ==================== ENTRY CRUD OPERATIONS ====================

  /**
   * Creates a new dynamic charting entry
   */
  async createDynamicEntry(
    entryData: Omit<
      DynamicChartingEntry,
      'id' | 'submittedAt' | 'lastUpdatedAt' | 'isComplete' | 'completionPercentage'
    >
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.DYNAMIC_ENTRIES_COLLECTION, undefined, {
      sessionId: entryData.sessionId,
      templateId: entryData.formTemplateId,
    });

    // Validate that the template exists
    const templateResult = await formTemplateService.getTemplate(entryData.formTemplateId);
    if (!templateResult.success || !templateResult.data) {
      return {
        success: false,
        message: 'Form template not found',
        error: {
          code: 'TEMPLATE_NOT_FOUND',
          message: 'The specified form template does not exist',
        },
        timestamp: new Date(),
      };
    }

    const template = templateResult.data;

    // Calculate completion
    const completion = this.calculateCompletion(template, entryData.responses);

    const cleanedData = {
      ...entryData,
      isComplete: completion.isComplete,
      completionPercentage: completion.percentage,
    };

    const result = await this.create<DynamicChartingEntry>(
      this.DYNAMIC_ENTRIES_COLLECTION,
      cleanedData
    );

    if (result.success && result.data) {
      // Increment template usage count
      await formTemplateService.incrementUsageCount(entryData.formTemplateId);

      logger.info('Dynamic charting entry created successfully', 'DynamicChartingService', {
        entryId: result.data.id,
        sessionId: entryData.sessionId,
        templateId: entryData.formTemplateId,
        completion: completion.percentage,
      });

      // TODO: Trigger analytics recalculation
      // this.recalculateDynamicAnalytics(entryData.studentId, entryData.formTemplateId);
    }

    return result;
  }

  /**
   * Gets a dynamic charting entry by ID
   */
  async getDynamicEntry(entryId: string): Promise<ApiResponse<DynamicChartingEntry>> {
    logger.database('read', this.DYNAMIC_ENTRIES_COLLECTION, entryId);

    return await this.getById<DynamicChartingEntry>(this.DYNAMIC_ENTRIES_COLLECTION, entryId);
  }

  /**
   * Updates a dynamic charting entry
   */
  async updateDynamicEntry(
    entryId: string,
    updates: Partial<DynamicChartingEntry>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('update', this.DYNAMIC_ENTRIES_COLLECTION, entryId);

    // If responses are being updated, recalculate completion
    if (updates.responses) {
      const currentResult = await this.getDynamicEntry(entryId);
      if (!currentResult.success || !currentResult.data) {
        return {
          success: false,
          message: 'Entry not found',
          error: {
            code: 'NOT_FOUND',
            message: 'Dynamic charting entry does not exist',
          },
          timestamp: new Date(),
        };
      }

      const templateResult = await formTemplateService.getTemplate(
        currentResult.data.formTemplateId
      );
      if (templateResult.success && templateResult.data) {
        const completion = this.calculateCompletion(templateResult.data, updates.responses);
        updates.isComplete = completion.isComplete;
        updates.completionPercentage = completion.percentage;
      }
    }

    const result = await this.update<DynamicChartingEntry>(
      this.DYNAMIC_ENTRIES_COLLECTION,
      entryId,
      updates
    );

    if (result.success) {
      logger.info('Dynamic charting entry updated successfully', 'DynamicChartingService', {
        entryId,
      });

      // TODO: Trigger analytics recalculation
    }

    return result;
  }

  /**
   * Deletes a dynamic charting entry
   */
  async deleteDynamicEntry(entryId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.DYNAMIC_ENTRIES_COLLECTION, entryId);

    return await this.delete(this.DYNAMIC_ENTRIES_COLLECTION, entryId);
  }

  // ==================== QUERY OPERATIONS ====================

  /**
   * Gets all dynamic entries for a session
   *
   * Note: Sorting is done in-memory to avoid composite index requirement.
   * Using orderBy('submittedAt') with where('sessionId') requires a composite index
   * which can fail silently. Sorting in JS is more reliable and performant for
   * typical result set sizes.
   */
  async getDynamicEntriesBySession(
    sessionId: string
  ): Promise<ApiResponse<DynamicChartingEntry[]>> {
    logger.database('query', this.DYNAMIC_ENTRIES_COLLECTION, undefined, { sessionId });

    try {
      const entriesRef = collection(db, this.DYNAMIC_ENTRIES_COLLECTION);

      // Query without orderBy to avoid composite index issues
      const q = query(
        entriesRef,
        where('sessionId', '==', sessionId)
      );

      const snapshot = await getDocs(q);

      // Map and sort in JavaScript instead of using Firestore orderBy
      const entries = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first)
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        }) as DynamicChartingEntry[];

      return {
        success: true,
        data: entries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error querying dynamic entries by session', error, 'DynamicChartingService');
      return {
        success: false,
        message: 'Failed to query entries',
        error: {
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets all dynamic entries for a student
   *
   * Note: Sorting is done in-memory to avoid composite index requirement.
   */
  async getDynamicEntriesByStudent(
    studentId: string,
    templateId?: string
  ): Promise<ApiResponse<DynamicChartingEntry[]>> {
    logger.database('query', this.DYNAMIC_ENTRIES_COLLECTION, undefined, {
      studentId,
      templateId,
    });

    try {
      const entriesRef = collection(db, this.DYNAMIC_ENTRIES_COLLECTION);
      let q = query(entriesRef, where('studentId', '==', studentId));

      if (templateId) {
        q = query(q, where('formTemplateId', '==', templateId));
      }

      // Don't use orderBy to avoid composite index issues - sort in JS instead
      const snapshot = await getDocs(q);
      const entries = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first)
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        }) as DynamicChartingEntry[];

      return {
        success: true,
        data: entries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error querying dynamic entries by student', error, 'DynamicChartingService');
      return {
        success: false,
        message: 'Failed to query entries',
        error: {
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets all dynamic entries (with optional filters)
   *
   * Note: Sorting is done in-memory to avoid composite index requirement.
   */
  async getAllDynamicEntries(options: {
    templateId?: string;
    studentId?: string;
    limit?: number;
  } = {}): Promise<ApiResponse<DynamicChartingEntry[]>> {
    logger.database('query', this.DYNAMIC_ENTRIES_COLLECTION, undefined, options);

    try {
      const entriesRef = collection(db, this.DYNAMIC_ENTRIES_COLLECTION);
      let q = query(entriesRef);

      if (options.templateId) {
        q = query(q, where('formTemplateId', '==', options.templateId));
      }

      if (options.studentId) {
        q = query(q, where('studentId', '==', options.studentId));
      }

      // Don't use orderBy to avoid composite index issues - sort in JS instead
      const snapshot = await getDocs(q);
      let entries = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first)
          const aTime = a.submittedAt?.toMillis?.() || 0;
          const bTime = b.submittedAt?.toMillis?.() || 0;
          return bTime - aTime;
        }) as DynamicChartingEntry[];

      // Apply limit after sorting
      if (options.limit) {
        entries = entries.slice(0, options.limit);
      }

      return {
        success: true,
        data: entries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error querying all dynamic entries', error, 'DynamicChartingService');
      return {
        success: false,
        message: 'Failed to query entries',
        error: {
          code: 'QUERY_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date(),
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculates completion percentage and status for an entry
   */
  private calculateCompletion(
    template: FormTemplate,
    responses: FormResponses
  ): {
    isComplete: boolean;
    percentage: number;
    totalFields: number;
    completedFields: number;
  } {
    let totalRequiredFields = 0;
    let completedRequiredFields = 0;
    let totalOptionalFields = 0;
    let completedOptionalFields = 0;

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const sectionData = responses[section.id];
        const isRequired = field.validation?.required || false;

        if (isRequired) {
          totalRequiredFields++;
        } else {
          totalOptionalFields++;
        }

        // Check if field has a value
        let hasValue = false;

        if (section.isRepeatable) {
          const sectionArray = sectionData as any[];
          if (sectionArray && sectionArray.length > 0) {
            const firstInstance = sectionArray[0];
            const fieldValue = firstInstance?.[field.id];
            hasValue = this.isFieldValuePresent(fieldValue);
          }
        } else {
          const sectionObj = sectionData as any;
          const fieldValue = sectionObj?.[field.id];
          hasValue = this.isFieldValuePresent(fieldValue);
        }

        if (hasValue) {
          if (isRequired) {
            completedRequiredFields++;
          } else {
            completedOptionalFields++;
          }
        }
      });
    });

    const totalFields = totalRequiredFields + totalOptionalFields;
    const completedFields = completedRequiredFields + completedOptionalFields;

    // Entry is complete if all required fields are filled
    const isComplete = totalRequiredFields === completedRequiredFields;

    // Percentage based on all fields (required + optional)
    const percentage =
      totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;

    return {
      isComplete,
      percentage,
      totalFields,
      completedFields,
    };
  }

  /**
   * Checks if a field value is present and valid
   */
  private isFieldValuePresent(fieldValue: any): boolean {
    if (fieldValue === undefined || fieldValue === null) {
      return false;
    }

    // For objects with value property (FieldResponse)
    if (typeof fieldValue === 'object' && 'value' in fieldValue) {
      const value = fieldValue.value;

      if (value === undefined || value === null) {
        return false;
      }

      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }

      if (Array.isArray(value) && value.length === 0) {
        return false;
      }

      return true;
    }

    // For direct values
    if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
      return false;
    }

    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Validates responses against template
   */
  async validateResponses(
    templateId: string,
    responses: FormResponses
  ): Promise<{
    isValid: boolean;
    errors: { sectionId: string; fieldId: string; message: string }[];
  }> {
    const templateResult = await formTemplateService.getTemplate(templateId);
    if (!templateResult.success || !templateResult.data) {
      return {
        isValid: false,
        errors: [{ sectionId: '', fieldId: '', message: 'Template not found' }],
      };
    }

    const template = templateResult.data;
    const errors: { sectionId: string; fieldId: string; message: string }[] = [];

    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.validation?.required) {
          const sectionData = responses[section.id];
          let hasValue = false;

          if (section.isRepeatable) {
            const sectionArray = sectionData as any[];
            if (sectionArray && sectionArray.length > 0) {
              const firstInstance = sectionArray[0];
              hasValue = this.isFieldValuePresent(firstInstance?.[field.id]);
            }
          } else {
            const sectionObj = sectionData as any;
            hasValue = this.isFieldValuePresent(sectionObj?.[field.id]);
          }

          if (!hasValue) {
            errors.push({
              sectionId: section.id,
              fieldId: field.id,
              message: `${field.label} is required`,
            });
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const dynamicChartingService = new DynamicChartingService();

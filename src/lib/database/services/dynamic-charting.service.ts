import { BaseDatabaseService } from '../base.service';
import {
  DynamicChartingEntry,
  FormTemplate,
  FormResponses,
  ApiResponse,
} from '@/types';
import {
  query,
  where,
  getDocs,
  collection,
  Timestamp,
} from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { toDateSafe } from '../../utils/timestamp';
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

    const now = Timestamp.now();
    const cleanedData = {
      ...entryData,
      isComplete: completion.isComplete,
      completionPercentage: completion.percentage,
      submittedAt: now,
      lastUpdatedAt: now,
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

      await this.refreshAnalytics(entryData.studentId, entryData.formTemplateId);
    }

    return result;
  }

  /**
   * Rewrites the cached `${studentId}_${templateId}` analytics doc after an entry
   * changes.
   *
   * Without this the cached doc drifts from the entries it summarises, so anything
   * reading it plainly (rather than forcing `recalculate: true`) shows stale numbers
   * — or an empty board, since a student who has never had analytics computed has no
   * doc at all.
   *
   * Awaited rather than fired-and-forgotten: charting submits from the client and
   * usually navigate straight after, which would cancel an in-flight write and leave
   * the very staleness this exists to prevent. A failure here is logged and swallowed
   * — the entry itself is already saved, and a missing cache entry is recoverable
   * (the next recalculation rebuilds it) while a failed submit is not.
   */
  private async refreshAnalytics(studentId: string, templateId: string): Promise<void> {
    try {
      // Imported lazily: dynamic-analytics.service imports this module at the top
      // level, so a static import here would close the cycle.
      const { dynamicAnalyticsService } = await import('./dynamic-analytics.service');

      // No options — that's what persists the canonical full-history calculation.
      const result = await dynamicAnalyticsService.recalculateStudentAnalytics(
        studentId,
        templateId
      );

      if (!result.success) {
        logger.warn('Analytics refresh failed after entry change', 'DynamicChartingService', {
          studentId,
          templateId,
          reason: result.error?.message,
        });
      }
    } catch (error) {
      logger.warn('Analytics refresh threw after entry change', 'DynamicChartingService', {
        studentId,
        templateId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Gets a dynamic charting entry by ID
   */
  async getDynamicEntry(entryId: string): Promise<ApiResponse<DynamicChartingEntry | null>> {
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

    // Only a change to the answers can move the analytics, so the refresh below is
    // scoped to that case — and the entry we need its owner from is already loaded.
    let analyticsScope: { studentId: string; templateId: string } | null = null;

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

      analyticsScope = {
        studentId: currentResult.data.studentId,
        templateId: currentResult.data.formTemplateId,
      };

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

      if (analyticsScope) {
        await this.refreshAnalytics(analyticsScope.studentId, analyticsScope.templateId);
      }

      return {
        success: true,
        data: { id: entryId },
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      message: result.error?.message || 'Update failed',
      error: result.error,
      timestamp: new Date(),
    };
  }

  /**
   * Deletes a dynamic charting entry
   */
  async deleteDynamicEntry(entryId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.DYNAMIC_ENTRIES_COLLECTION, entryId);

    // Read before deleting — afterwards there's nothing left to tell us whose
    // analytics just became wrong.
    const currentResult = await this.getDynamicEntry(entryId);
    const scope = currentResult.success && currentResult.data
      ? {
          studentId: currentResult.data.studentId,
          templateId: currentResult.data.formTemplateId,
        }
      : null;

    const result = await this.delete(this.DYNAMIC_ENTRIES_COLLECTION, entryId);

    if (result.success && scope) {
      await this.refreshAnalytics(scope.studentId, scope.templateId);
    }

    return result;
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
      const entries = (snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DynamicChartingEntry[])
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first).
          //
          // This used to read `a.submittedAt?.toMillis?.() || 0`. On entries
          // whose timestamp was stored as a plain map (see toDateSafe) there is
          // no toMillis, so every entry scored 0 and the sort became a no-op —
          // callers treating the first element as "the latest" got an arbitrary
          // one. toDateSafe handles both the intact and the mangled shape.
          const aTime = toDateSafe(a.submittedAt)?.getTime() ?? 0;
          const bTime = toDateSafe(b.submittedAt)?.getTime() ?? 0;
          return bTime - aTime;
        });

      return {
        success: true,
        data: entries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error querying dynamic entries by session', 'DynamicChartingService', { error: error instanceof Error ? error.message : String(error) });
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
      const entries = (snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DynamicChartingEntry[])
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first).
          //
          // This used to read `a.submittedAt?.toMillis?.() || 0`. On entries
          // whose timestamp was stored as a plain map (see toDateSafe) there is
          // no toMillis, so every entry scored 0 and the sort became a no-op —
          // callers treating the first element as "the latest" got an arbitrary
          // one. toDateSafe handles both the intact and the mangled shape.
          const aTime = toDateSafe(a.submittedAt)?.getTime() ?? 0;
          const bTime = toDateSafe(b.submittedAt)?.getTime() ?? 0;
          return bTime - aTime;
        });

      return {
        success: true,
        data: entries,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error querying dynamic entries by student', 'DynamicChartingService', { error: error instanceof Error ? error.message : String(error) });
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
      let entries = (snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as DynamicChartingEntry[])
        .sort((a, b) => {
          // Sort by submittedAt descending (newest first).
          //
          // This used to read `a.submittedAt?.toMillis?.() || 0`. On entries
          // whose timestamp was stored as a plain map (see toDateSafe) there is
          // no toMillis, so every entry scored 0 and the sort became a no-op —
          // callers treating the first element as "the latest" got an arbitrary
          // one. toDateSafe handles both the intact and the mangled shape.
          const aTime = toDateSafe(a.submittedAt)?.getTime() ?? 0;
          const bTime = toDateSafe(b.submittedAt)?.getTime() ?? 0;
          return bTime - aTime;
        });

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
      logger.error('Error querying all dynamic entries', 'DynamicChartingService', { error: error instanceof Error ? error.message : String(error) });
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

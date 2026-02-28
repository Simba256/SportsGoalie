import { BaseDatabaseService } from '../base.service';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  CustomCurriculum,
  CustomCurriculumItem,
  CreateCurriculumData,
  AddCurriculumItemData,
  CurriculumQueryOptions,
  CurriculumProgress,
  CurriculumItemStatus,
  ApiResponse,
} from '@/types';
import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/database/utils/error-recovery';
import { cacheService } from '@/lib/utils/cache.service';

/**
 * Service for managing custom curricula for coach-guided students
 * Handles curriculum creation, item management, and progress tracking
 */
export class CustomCurriculumService extends BaseDatabaseService {
  private static readonly COLLECTION = 'custom_curriculum';
  private static cache = cacheService;

  /**
   * Convert object to Firestore-compatible format (handle Timestamps)
   */
  private static toFirestore(data: any): any {
    if (data === null || data === undefined) return data;
    if (data instanceof Timestamp) return data;
    if (data instanceof Date) return Timestamp.fromDate(data);
    if (Array.isArray(data)) return data.map(item => this.toFirestore(item));
    if (typeof data === 'object') {
      const result: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key) && data[key] !== undefined) {
          result[key] = this.toFirestore(data[key]);
        }
      }
      return result;
    }
    return data;
  }

  /**
   * Convert Firestore document to typed object (handle Timestamps)
   */
  private static fromFirestore<T>(data: any): T {
    if (data === null || data === undefined) return data;
    if (data instanceof Timestamp) return data as any;
    if (Array.isArray(data)) return data.map(item => this.fromFirestore(item)) as any;
    if (typeof data === 'object') {
      const result: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          result[key] = this.fromFirestore(data[key]);
        }
      }
      return result as T;
    }
    return data;
  }

  /**
   * Create curriculum for a student
   */
  static async createCurriculum(
    data: CreateCurriculumData,
    createdBy: string
  ): Promise<ApiResponse<CustomCurriculum>> {
    try {
      const curriculumId = `curr_${data.studentId}_${Date.now()}`;
      const now = Timestamp.now();

      const curriculum: CustomCurriculum = {
        id: curriculumId,
        studentId: data.studentId,
        coachId: data.coachId,
        items: data.items?.map((item, index) => ({
          ...item,
          id: `item_${Date.now()}_${index}`,
          assignedAt: now,
          status: item.unlocked ? 'unlocked' : 'locked',
        })) || [],
        createdAt: now,
        updatedAt: now,
        lastModifiedBy: createdBy,
      };

      await setDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore(curriculum));

      // Clear cache
      this.cache.delete(`curriculum_student_${data.studentId}`);

      logger.info('Created custom curriculum', 'CustomCurriculumService', {
        curriculumId,
        studentId: data.studentId,
        coachId: data.coachId,
        itemCount: curriculum.items.length,
      });

      return {
        success: true,
        data: curriculum,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create curriculum', 'CustomCurriculumService', {
        studentId: data.studentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_CREATE_ERROR',
          message: 'Failed to create curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get student's curriculum
   */
  static async getStudentCurriculum(studentId: string): Promise<ApiResponse<CustomCurriculum | null>> {
    try {
      const cacheKey = `curriculum_student_${studentId}`;
      const cached = this.cache.get<CustomCurriculum>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: new Date() };
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('studentId', '==', studentId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(querySnapshot.docs[0].data());
      this.cache.set(cacheKey, curriculum);

      return {
        success: true,
        data: curriculum,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get student curriculum', 'CustomCurriculumService', {
        studentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_FETCH_ERROR',
          message: 'Failed to fetch curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get curriculum by ID
   */
  static async getCurriculum(curriculumId: string): Promise<ApiResponse<CustomCurriculum | null>> {
    try {
      const docRef = doc(db, this.COLLECTION, curriculumId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(docSnap.data());

      return {
        success: true,
        data: curriculum,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get curriculum', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_FETCH_ERROR',
          message: 'Failed to fetch curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get all curricula for a coach
   */
  static async getCoachCurricula(coachId: string): Promise<ApiResponse<CustomCurriculum[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('coachId', '==', coachId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const curricula = querySnapshot.docs.map(doc =>
        this.fromFirestore<CustomCurriculum>(doc.data())
      );

      return {
        success: true,
        data: curricula,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get coach curricula', 'CustomCurriculumService', {
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_FETCH_ERROR',
          message: 'Failed to fetch coach curricula',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add item to curriculum
   */
  static async addItem(
    curriculumId: string,
    itemData: AddCurriculumItemData,
    modifiedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      const newItem: CustomCurriculumItem = {
        id: `item_${Date.now()}`,
        type: itemData.type,
        contentId: itemData.contentId,
        customContent: itemData.customContent ? {
          ...itemData.customContent,
          createdBy: modifiedBy,
          isStudentSpecific: true,
        } : undefined,
        pillarId: itemData.pillarId,
        levelId: itemData.levelId,
        order: itemData.order ?? curriculum.items.length,
        status: itemData.unlocked ? 'unlocked' : 'locked',
        assignedAt: now,
        dueDate: itemData.dueDate ? Timestamp.fromDate(itemData.dueDate) : undefined,
        notes: itemData.notes,
      };

      curriculum.items.push(newItem);
      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = modifiedBy;

      await updateDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: modifiedBy,
      }));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Added item to curriculum', 'CustomCurriculumService', {
        curriculumId,
        itemId: newItem.id,
        type: newItem.type,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to add curriculum item', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to add item to curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Remove item from curriculum
   */
  static async removeItem(
    curriculumId: string,
    itemId: string,
    modifiedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      curriculum.items = curriculum.items.filter(item => item.id !== itemId);
      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = modifiedBy;

      await updateDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: modifiedBy,
      }));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Removed item from curriculum', 'CustomCurriculumService', {
        curriculumId,
        itemId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to remove curriculum item', 'CustomCurriculumService', {
        curriculumId,
        itemId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to remove item from curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Reorder curriculum items
   */
  static async reorderItems(
    curriculumId: string,
    itemIds: string[],
    modifiedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      // Create a map of items by ID
      const itemMap = new Map(curriculum.items.map(item => [item.id, item]));

      // Reorder items based on the provided order
      curriculum.items = itemIds.map((id, index) => {
        const item = itemMap.get(id);
        if (!item) throw new Error(`Item ${id} not found in curriculum`);
        return { ...item, order: index };
      });

      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = modifiedBy;

      await updateDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: modifiedBy,
      }));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Reordered curriculum items', 'CustomCurriculumService', {
        curriculumId,
        itemCount: itemIds.length,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to reorder curriculum items', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to reorder curriculum items',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Unlock specific item
   */
  static async unlockItem(
    curriculumId: string,
    itemId: string,
    modifiedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      const item = curriculum.items.find(i => i.id === itemId);
      if (!item) {
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Curriculum item not found',
          },
          timestamp: new Date(),
        };
      }

      item.status = 'unlocked';
      item.unlockedAt = now;

      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = modifiedBy;

      await updateDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: modifiedBy,
      }));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Unlocked curriculum item', 'CustomCurriculumService', {
        curriculumId,
        itemId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to unlock curriculum item', 'CustomCurriculumService', {
        curriculumId,
        itemId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to unlock curriculum item',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Unlock all items in curriculum
   */
  static async unlockAllItems(
    curriculumId: string,
    modifiedBy: string
  ): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      curriculum.items = curriculum.items.map(item => ({
        ...item,
        status: 'unlocked',
        unlockedAt: item.unlockedAt || now,
      }));

      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = modifiedBy;

      await updateDoc(doc(db, this.COLLECTION, curriculumId), this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: modifiedBy,
      }));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Unlocked all curriculum items', 'CustomCurriculumService', {
        curriculumId,
        itemCount: curriculum.items.length,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to unlock all curriculum items', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to unlock all curriculum items',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Mark item as completed
   */
  static async markItemComplete(
    curriculumId: string,
    itemId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    try {
      console.log('✅ markItemComplete: Starting', { curriculumId, itemId, userId });
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        console.log('❌ markItemComplete: Curriculum document not found');
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      console.log('✅ markItemComplete: Curriculum doc exists, raw data:', curriculumDoc.data());
      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const now = Timestamp.now();

      console.log('✅ markItemComplete: Parsed curriculum items count:', curriculum.items?.length);
      const item = curriculum.items.find(i => i.id === itemId);
      if (!item) {
        console.log('❌ markItemComplete: Item not found in curriculum. Looking for:', itemId);
        console.log('❌ markItemComplete: Available item IDs:', curriculum.items?.map(i => i.id));
        return {
          success: false,
          error: {
            code: 'ITEM_NOT_FOUND',
            message: 'Curriculum item not found',
          },
          timestamp: new Date(),
        };
      }

      console.log('✅ markItemComplete: Found item, updating status');
      item.status = 'completed';
      item.completedAt = now;

      curriculum.updatedAt = now;
      curriculum.lastModifiedBy = userId;

      const updateData = this.toFirestore({
        items: curriculum.items,
        updatedAt: now,
        lastModifiedBy: userId,
      });
      console.log('✅ markItemComplete: Update data to save:', updateData);

      await updateDoc(doc(db, this.COLLECTION, curriculumId), updateData);
      console.log('✅ markItemComplete: Update successful');

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Marked curriculum item as complete', 'CustomCurriculumService', {
        curriculumId,
        itemId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to mark curriculum item complete', 'CustomCurriculumService', {
        curriculumId,
        itemId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_UPDATE_ERROR',
          message: 'Failed to mark item as complete',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get next item to complete
   */
  static async getNextItem(curriculumId: string): Promise<ApiResponse<CustomCurriculumItem | null>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());

      // Find first unlocked item that's not completed
      const nextItem = curriculum.items
        .sort((a, b) => a.order - b.order)
        .find(item => item.status === 'unlocked' && !item.completedAt);

      return {
        success: true,
        data: nextItem || null,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get next curriculum item', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_FETCH_ERROR',
          message: 'Failed to get next curriculum item',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get curriculum progress summary
   */
  static async getCurriculumProgress(curriculumId: string): Promise<ApiResponse<CurriculumProgress | null>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());
      const totalItems = curriculum.items.length;
      const completedItems = curriculum.items.filter(i => i.status === 'completed').length;
      const inProgressItems = curriculum.items.filter(i => i.status === 'in_progress').length;
      const lockedItems = curriculum.items.filter(i => i.status === 'locked').length;

      const nextItem = curriculum.items
        .sort((a, b) => a.order - b.order)
        .find(item => item.status === 'unlocked' && !item.completedAt);

      const lastCompletedItem = curriculum.items
        .filter(i => i.completedAt)
        .sort((a, b) => {
          const aTime = a.completedAt?.toMillis() || 0;
          const bTime = b.completedAt?.toMillis() || 0;
          return bTime - aTime;
        })[0];

      const estimatedTimeRemaining = curriculum.items
        .filter(i => !i.completedAt)
        .reduce((total, item) => {
          const time = item.customContent?.estimatedTimeMinutes || 30; // Default 30 min
          return total + time;
        }, 0);

      const progress: CurriculumProgress = {
        studentId: curriculum.studentId,
        totalItems,
        completedItems,
        inProgressItems,
        lockedItems,
        progressPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        nextItem,
        lastCompletedItem,
        estimatedTimeRemaining,
      };

      return {
        success: true,
        data: progress,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get curriculum progress', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_FETCH_ERROR',
          message: 'Failed to get curriculum progress',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Delete curriculum
   */
  static async deleteCurriculum(curriculumId: string): Promise<ApiResponse<void>> {
    try {
      const curriculumDoc = await getDoc(doc(db, this.COLLECTION, curriculumId));

      if (!curriculumDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CURRICULUM_NOT_FOUND',
            message: 'Curriculum not found',
          },
          timestamp: new Date(),
        };
      }

      const curriculum = this.fromFirestore<CustomCurriculum>(curriculumDoc.data());

      await deleteDoc(doc(db, this.COLLECTION, curriculumId));

      // Clear cache
      this.cache.delete(`curriculum_student_${curriculum.studentId}`);

      logger.info('Deleted curriculum', 'CustomCurriculumService', {
        curriculumId,
        studentId: curriculum.studentId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to delete curriculum', 'CustomCurriculumService', {
        curriculumId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CURRICULUM_DELETE_ERROR',
          message: 'Failed to delete curriculum',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const customCurriculumService = CustomCurriculumService;

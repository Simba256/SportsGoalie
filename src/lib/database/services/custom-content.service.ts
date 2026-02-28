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
  increment,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import {
  CustomContentLibrary,
  CreateCustomContentData,
  CustomContentMetadata,
  ApiResponse,
} from '@/types';
import { logger } from '@/lib/utils/logger';
import { withRetry } from '@/lib/database/utils/error-recovery';
import { cacheService } from '@/lib/utils/cache.service';

/**
 * Service for managing custom content library
 * Handles coach-created lessons and quizzes
 */
export class CustomContentService extends BaseDatabaseService {
  private static readonly COLLECTION = 'custom_content_library';
  private static readonly STORAGE_PATH = 'custom_content';
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
   * Create custom content
   */
  static async createContent(
    coachId: string,
    data: CreateCustomContentData
  ): Promise<ApiResponse<CustomContentLibrary>> {
    try {
      const contentId = `content_${Date.now()}`;
      const now = Timestamp.now();

      // Upload attachments if provided
      const attachmentUrls: string[] = [];
      if (data.attachments && data.attachments.length > 0) {
        for (const file of data.attachments) {
          const url = await this.uploadAttachment(file, coachId, contentId);
          if (url) {
            attachmentUrls.push(url);
          }
        }
      }

      const content: CustomContentLibrary = {
        id: contentId,
        createdBy: coachId,
        title: data.title,
        description: data.description,
        type: data.type,
        content: data.content,
        videoUrl: data.videoUrl,
        attachments: attachmentUrls,
        pillarId: data.pillarId,
        levelId: data.levelId,
        tags: data.tags || [],
        isPublic: data.isPublic || false,
        usageCount: 0,
        estimatedTimeMinutes: data.estimatedTimeMinutes,
        learningObjectives: data.learningObjectives,
        metadata: {
          views: 0,
          completions: 0,
          totalRatings: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, this.COLLECTION, contentId), this.toFirestore(content));

      // Clear coach's content cache
      this.cache.delete(`coach_content_${coachId}`);

      logger.info('Created custom content', 'CustomContentService', {
        contentId,
        coachId,
        type: data.type,
        title: data.title,
      });

      return {
        success: true,
        data: content,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to create custom content', 'CustomContentService', {
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_CREATE_ERROR',
          message: 'Failed to create custom content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Upload attachment file
   */
  static async uploadAttachment(
    file: File,
    coachId: string,
    contentId?: string
  ): Promise<string | null> {
    try {
      const fileId = contentId || `upload_${Date.now()}`;
      const filename = `${fileId}_${file.name}`;
      const storageRef = ref(storage, `${this.STORAGE_PATH}/${coachId}/${filename}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      logger.info('Uploaded content attachment', 'CustomContentService', {
        coachId,
        filename,
        size: file.size,
      });

      return downloadURL;
    } catch (error) {
      logger.error('Failed to upload attachment', 'CustomContentService', {
        coachId,
        filename: file.name,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  /**
   * Get content by ID
   */
  static async getContent(contentId: string): Promise<ApiResponse<CustomContentLibrary | null>> {
    try {
      const docRef = doc(db, this.COLLECTION, contentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: true, data: null, timestamp: new Date() };
      }

      const content = this.fromFirestore<CustomContentLibrary>(docSnap.data());

      // Increment view count
      await updateDoc(docRef, {
        'metadata.views': increment(1),
      });

      return {
        success: true,
        data: content,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get custom content', 'CustomContentService', {
        contentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: 'Failed to fetch custom content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get coach's content library
   */
  static async getCoachContent(coachId: string): Promise<ApiResponse<CustomContentLibrary[]>> {
    try {
      const cacheKey = `coach_content_${coachId}`;
      const cached = this.cache.get<CustomContentLibrary[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: new Date() };
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('createdBy', '==', coachId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const content = querySnapshot.docs.map(doc =>
        this.fromFirestore<CustomContentLibrary>(doc.data())
      );

      this.cache.set(cacheKey, content);

      return {
        success: true,
        data: content,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get coach content', 'CustomContentService', {
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: 'Failed to fetch coach content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get public content (shared by other coaches)
   */
  static async getPublicContent(): Promise<ApiResponse<CustomContentLibrary[]>> {
    try {
      const cacheKey = 'public_content';
      const cached = this.cache.get<CustomContentLibrary[]>(cacheKey);
      if (cached) {
        return { success: true, data: cached, timestamp: new Date() };
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('isPublic', '==', true),
        orderBy('usageCount', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const content = querySnapshot.docs.map(doc =>
        this.fromFirestore<CustomContentLibrary>(doc.data())
      );

      this.cache.set(cacheKey, content, 300000); // Cache for 5 minutes

      return {
        success: true,
        data: content,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get public content', 'CustomContentService', {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: 'Failed to fetch public content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get content by pillar and level
   */
  static async getContentByPillarLevel(
    pillarId: string,
    levelId?: string
  ): Promise<ApiResponse<CustomContentLibrary[]>> {
    try {
      let q;
      if (levelId) {
        q = query(
          collection(db, this.COLLECTION),
          where('pillarId', '==', pillarId),
          where('levelId', '==', levelId),
          orderBy('updatedAt', 'desc')
        );
      } else {
        q = query(
          collection(db, this.COLLECTION),
          where('pillarId', '==', pillarId),
          orderBy('updatedAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const content = querySnapshot.docs.map(doc =>
        this.fromFirestore<CustomContentLibrary>(doc.data())
      );

      return {
        success: true,
        data: content,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get content by pillar/level', 'CustomContentService', {
        pillarId,
        levelId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_FETCH_ERROR',
          message: 'Failed to fetch content by pillar/level',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update content
   */
  static async updateContent(
    contentId: string,
    updates: Partial<CustomContentLibrary>,
    coachId: string
  ): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, contentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date(),
        };
      }

      const content = this.fromFirestore<CustomContentLibrary>(docSnap.data());

      // Verify ownership
      if (content.createdBy !== coachId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only update your own content',
          },
          timestamp: new Date(),
        };
      }

      const now = Timestamp.now();
      await updateDoc(docRef, this.toFirestore({
        ...updates,
        updatedAt: now,
      }));

      // Clear caches
      this.cache.delete(`coach_content_${coachId}`);
      if (content.isPublic) {
        this.cache.delete('public_content');
      }

      logger.info('Updated custom content', 'CustomContentService', {
        contentId,
        coachId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to update custom content', 'CustomContentService', {
        contentId,
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_UPDATE_ERROR',
          message: 'Failed to update custom content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Delete content
   */
  static async deleteContent(contentId: string, coachId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, contentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Content not found',
          },
          timestamp: new Date(),
        };
      }

      const content = this.fromFirestore<CustomContentLibrary>(docSnap.data());

      // Verify ownership
      if (content.createdBy !== coachId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only delete your own content',
          },
          timestamp: new Date(),
        };
      }

      // Delete attachments from storage
      if (content.attachments && content.attachments.length > 0) {
        for (const url of content.attachments) {
          try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
          } catch (error) {
            logger.warn('Failed to delete attachment', 'CustomContentService', {
              url,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }
      }

      await deleteDoc(docRef);

      // Clear caches
      this.cache.delete(`coach_content_${coachId}`);
      if (content.isPublic) {
        this.cache.delete('public_content');
      }

      logger.info('Deleted custom content', 'CustomContentService', {
        contentId,
        coachId,
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to delete custom content', 'CustomContentService', {
        contentId,
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_DELETE_ERROR',
          message: 'Failed to delete custom content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Clone content to own library
   */
  static async cloneContent(
    sourceContentId: string,
    coachId: string
  ): Promise<ApiResponse<CustomContentLibrary>> {
    try {
      const sourceDoc = await getDoc(doc(db, this.COLLECTION, sourceContentId));

      if (!sourceDoc.exists()) {
        return {
          success: false,
          error: {
            code: 'CONTENT_NOT_FOUND',
            message: 'Source content not found',
          },
          timestamp: new Date(),
        };
      }

      const sourceContent = this.fromFirestore<CustomContentLibrary>(sourceDoc.data());

      // Verify it's public or owned by the coach
      if (!sourceContent.isPublic && sourceContent.createdBy !== coachId) {
        return {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'You can only clone public content',
          },
          timestamp: new Date(),
        };
      }

      const newContentId = `content_${Date.now()}`;
      const now = Timestamp.now();

      const clonedContent: CustomContentLibrary = {
        ...sourceContent,
        id: newContentId,
        createdBy: coachId,
        isPublic: false, // Cloned content is private by default
        usageCount: 0,
        metadata: {
          views: 0,
          completions: 0,
          totalRatings: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(doc(db, this.COLLECTION, newContentId), this.toFirestore(clonedContent));

      // Increment usage count on source
      if (sourceContent.createdBy !== coachId) {
        await updateDoc(doc(db, this.COLLECTION, sourceContentId), {
          usageCount: increment(1),
          'metadata.lastUsedAt': now,
        });
      }

      // Clear coach's content cache
      this.cache.delete(`coach_content_${coachId}`);

      logger.info('Cloned custom content', 'CustomContentService', {
        sourceContentId,
        newContentId,
        coachId,
      });

      return {
        success: true,
        data: clonedContent,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to clone custom content', 'CustomContentService', {
        sourceContentId,
        coachId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_CLONE_ERROR',
          message: 'Failed to clone custom content',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Mark content as used (increment usage count)
   */
  static async markContentUsed(contentId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, contentId);
      await updateDoc(docRef, {
        usageCount: increment(1),
        'metadata.lastUsedAt': Timestamp.now(),
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to mark content as used', 'CustomContentService', {
        contentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_UPDATE_ERROR',
          message: 'Failed to mark content as used',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Mark content as completed (increment completion count)
   */
  static async markContentCompleted(contentId: string): Promise<ApiResponse<void>> {
    try {
      const docRef = doc(db, this.COLLECTION, contentId);
      await updateDoc(docRef, {
        'metadata.completions': increment(1),
      });

      return {
        success: true,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to mark content as completed', 'CustomContentService', {
        contentId,
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        success: false,
        error: {
          code: 'CONTENT_UPDATE_ERROR',
          message: 'Failed to mark content as completed',
          details: error,
        },
        timestamp: new Date(),
      };
    }
  }
}

// Export singleton instance
export const customContentService = CustomContentService;

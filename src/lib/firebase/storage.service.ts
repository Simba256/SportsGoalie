'use client';

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
  updateMetadata,
  UploadTaskSnapshot
} from 'firebase/storage';
import { storage } from './config';
import { logger } from '@/lib/utils/logger';

export interface MediaUploadOptions {
  folder?: string;
  maxSizeBytes?: number;
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  customMetadata?: Record<string, string>;
}

export interface MediaUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  filename?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

class StorageService {
  private readonly defaultOptions: Required<MediaUploadOptions> = {
    folder: 'uploads',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    generateThumbnail: false,
    customMetadata: {},
  };

  /**
   * Upload a single file to Firebase Storage
   */
  async uploadFile(
    file: File,
    options: MediaUploadOptions = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<MediaUploadResult> {
    try {
      const config = { ...this.defaultOptions, ...options };

      // Validate file
      const validation = this.validateFile(file, config);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
        };
      }

      // Generate unique filename
      const filename = this.generateFilename(file);
      const storagePath = `${config.folder}/${filename}`;
      const storageRef = ref(storage, storagePath);

      // Prepare metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          originalName: file.name,
          uploadedAt: new Date().toISOString(),
          size: file.size.toString(),
          ...config.customMetadata,
        },
      };

      logger.info('Starting file upload', {
        filename,
        size: file.size,
        type: file.type,
        path: storagePath,
      });

      if (onProgress) {
        // Use resumable upload for progress tracking
        return this.uploadWithProgress(file, storageRef, metadata, onProgress);
      } else {
        // Simple upload
        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        logger.info('File upload completed', {
          filename,
          url: downloadURL,
          size: file.size,
        });

        return {
          success: true,
          url: downloadURL,
          path: storagePath,
          filename,
          size: file.size,
          contentType: file.type,
        };
      }
    } catch (error) {
      logger.error('File upload failed', { error, filename: file.name });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple files
   */
  async uploadFiles(
    files: File[],
    options: MediaUploadOptions = {},
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<MediaUploadResult[]> {
    const results: MediaUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressCallback = onProgress
        ? (progress: UploadProgress) => onProgress(i, progress)
        : undefined;

      const result = await this.uploadFile(file, options, progressCallback);
      results.push(result);

      // Stop uploading if one fails (optional - could continue)
      if (!result.success) {
        logger.warn('File upload failed, continuing with remaining files', {
          filename: file.name,
          error: result.error,
        });
      }
    }

    return results;
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);

      logger.info('File deleted successfully', { path });

      return { success: true };
    } catch (error) {
      logger.error('File deletion failed', { error, path });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deletion failed',
      };
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(path: string): Promise<{
    success: boolean;
    metadata?: any;
    error?: string;
  }> {
    try {
      const storageRef = ref(storage, path);
      const metadata = await getMetadata(storageRef);

      return {
        success: true,
        metadata,
      };
    } catch (error) {
      logger.error('Failed to get file metadata', { error, path });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get metadata',
      };
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    path: string,
    metadata: Record<string, string>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, {
        customMetadata: metadata,
      });

      logger.info('File metadata updated', { path, metadata });

      return { success: true };
    } catch (error) {
      logger.error('Failed to update file metadata', { error, path });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update metadata',
      };
    }
  }

  /**
   * Get a download URL for a file path
   */
  async getDownloadURL(path: string): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const storageRef = ref(storage, path);
      const url = await getDownloadURL(storageRef);

      return {
        success: true,
        url,
      };
    } catch (error) {
      logger.error('Failed to get download URL', { error, path });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get URL',
      };
    }
  }

  /**
   * Private helper methods
   */
  private validateFile(
    file: File,
    config: Required<MediaUploadOptions>
  ): { isValid: boolean; error?: string } {
    // Check file size
    if (file.size > config.maxSizeBytes) {
      return {
        isValid: false,
        error: `File size (${this.formatFileSize(file.size)}) exceeds maximum allowed size (${this.formatFileSize(config.maxSizeBytes)})`,
      };
    }

    // Check file type
    if (!config.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type "${file.type}" is not allowed. Allowed types: ${config.allowedTypes.join(', ')}`,
      };
    }

    // Check for empty file
    if (file.size === 0) {
      return {
        isValid: false,
        error: 'Cannot upload empty file',
      };
    }

    return { isValid: true };
  }

  private generateFilename(file: File): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || '';
    const cleanName = file.name
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[^a-zA-Z0-9]/g, '_') // Replace special chars with underscore
      .substring(0, 50); // Limit length

    return `${cleanName}_${timestamp}_${randomString}.${extension}`;
  }

  private async uploadWithProgress(
    file: File,
    storageRef: any,
    metadata: any,
    onProgress: (progress: UploadProgress) => void
  ): Promise<MediaUploadResult> {
    return new Promise((resolve) => {
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress: UploadProgress = {
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
            state: snapshot.state as any,
          };
          onProgress(progress);
        },
        (error) => {
          logger.error('Upload progress error', { error, filename: file.name });
          resolve({
            success: false,
            error: error.message,
          });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const filename = this.generateFilename(file);

            logger.info('Resumable upload completed', {
              filename,
              url: downloadURL,
              size: file.size,
            });

            resolve({
              success: true,
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath,
              filename,
              size: file.size,
              contentType: file.type,
            });
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Failed to get download URL',
            });
          }
        }
      );
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export constants for common configurations
export const STORAGE_CONFIGS = {
  IMAGES: {
    folder: 'images',
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  },
  VIDEOS: {
    folder: 'videos',
    maxSizeBytes: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/webm', 'video/mov'] as string[],
  },
  DOCUMENTS: {
    folder: 'documents',
    maxSizeBytes: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'text/plain', 'application/msword'] as string[],
  },
  SPORT_IMAGES: {
    folder: 'sports/images',
    maxSizeBytes: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as string[],
  },
  SKILL_MEDIA: {
    folder: 'skills/media',
    maxSizeBytes: 20 * 1024 * 1024, // 20MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'] as string[],
  },
};
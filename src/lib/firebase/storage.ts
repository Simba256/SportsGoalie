import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  StorageReference
} from 'firebase/storage';
import { storage } from './config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
}

export interface UploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
}

class FirebaseStorageService {
  /**
   * Upload a video file to Firebase Storage
   */
  async uploadVideo(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void,
    folder: string = 'videos'
  ): Promise<UploadResult> {
    try {
      console.log('Starting video upload:', { fileName: file.name, size: file.size, userId });

      // Validate storage connection
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${folder}/${userId}/${fileName}`;

      console.log('Upload path:', storagePath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            console.log('Upload progress:', progress.percentage + '%');
            onProgress?.(progress);
          },
          (error) => {
            // Error callback
            console.error('Upload error details:', {
              code: error.code,
              message: error.message,
              customData: error.customData
            });
            resolve({
              success: false,
              error: `Upload failed: ${error.message} (Code: ${error.code})`
            });
          },
          async () => {
            // Success callback
            try {
              console.log('Upload completed, getting download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              resolve({
                success: true,
                downloadURL
              });
            } catch (error) {
              console.error('Failed to get download URL:', error);
              resolve({
                success: false,
                error: 'Upload completed but failed to get download URL'
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Delete a video from Firebase Storage
   */
  async deleteVideo(downloadURL: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, downloadURL);
      await deleteObject(storageRef);
      return true;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get all videos for a specific user
   */
  async getUserVideos(userId: string): Promise<string[]> {
    try {
      const userVideosRef = ref(storage, `videos/${userId}`);
      const listResult = await listAll(userVideosRef);

      const downloadURLs = await Promise.all(
        listResult.items.map(item => getDownloadURL(item))
      );

      return downloadURLs;
    } catch (error) {
      console.error('Get user videos error:', error);
      return [];
    }
  }

  /**
   * Get video metadata from storage reference
   */
  async getVideoMetadata(downloadURL: string) {
    try {
      const storageRef = ref(storage, downloadURL);
      const metadata = await storageRef.getMetadata();
      return metadata;
    } catch (error) {
      console.error('Get metadata error:', error);
      return null;
    }
  }

  /**
   * Create a storage reference for a video path
   */
  createVideoRef(userId: string, fileName: string): StorageReference {
    const storagePath = `videos/${userId}/${fileName}`;
    return ref(storage, storagePath);
  }

  /**
   * Check if a file is a valid video type
   */
  isValidVideoFile(file: File): boolean {
    const validTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo', // .avi
      'video/webm'
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Check if file size is within limits
   */
  isValidFileSize(file: File, maxSizeMB: number = 100): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * Validate video file before upload
   */
  validateVideoFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidVideoFile(file)) {
      return {
        isValid: false,
        error: 'Please upload a valid video file (MP4, MOV, AVI, WebM)'
      };
    }

    if (!this.isValidFileSize(file)) {
      return {
        isValid: false,
        error: 'File size must be less than 100MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Upload an image file to Firebase Storage
   */
  async uploadImage(
    file: File,
    userId: string,
    folder: string = 'messages',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('Starting image upload:', { fileName: file.name, size: file.size, userId });

      // Validate storage connection
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${folder}/${userId}/${fileName}`;

      console.log('Upload path:', storagePath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            console.log('Upload progress:', progress.percentage + '%');
            onProgress?.(progress);
          },
          (error) => {
            // Error callback
            console.error('Upload error details:', {
              code: error.code,
              message: error.message,
              customData: error.customData
            });
            resolve({
              success: false,
              error: `Upload failed: ${error.message} (Code: ${error.code})`
            });
          },
          async () => {
            // Success callback
            try {
              console.log('Upload completed, getting download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              resolve({
                success: true,
                downloadURL
              });
            } catch (error) {
              console.error('Failed to get download URL:', error);
              resolve({
                success: false,
                error: 'Upload completed but failed to get download URL'
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Upload a document file to Firebase Storage
   */
  async uploadDocument(
    file: File,
    userId: string,
    folder: string = 'documents',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('Starting document upload:', { fileName: file.name, size: file.size, userId });

      // Validate storage connection
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storagePath = `${folder}/${userId}/${fileName}`;

      console.log('Upload path:', storagePath);

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Create upload task
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress callback
            const progress: UploadProgress = {
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              percentage: (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            };
            console.log('Upload progress:', progress.percentage + '%');
            onProgress?.(progress);
          },
          (error) => {
            // Error callback
            console.error('Upload error details:', {
              code: error.code,
              message: error.message,
              customData: error.customData
            });
            resolve({
              success: false,
              error: `Upload failed: ${error.message} (Code: ${error.code})`
            });
          },
          async () => {
            // Success callback
            try {
              console.log('Upload completed, getting download URL...');
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Download URL obtained:', downloadURL);
              resolve({
                success: true,
                downloadURL
              });
            } catch (error) {
              console.error('Failed to get download URL:', error);
              resolve({
                success: false,
                error: 'Upload completed but failed to get download URL'
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Upload setup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  /**
   * Check if a file is a valid image type
   */
  isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Check if a file is a valid document type
   */
  isValidDocumentFile(file: File): boolean {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return validTypes.includes(file.type);
  }

  /**
   * Validate image file before upload
   */
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidImageFile(file)) {
      return {
        isValid: false,
        error: 'Please upload a valid image file (JPG, PNG, GIF, WebP)'
      };
    }

    if (!this.isValidFileSize(file, 10)) {
      return {
        isValid: false,
        error: 'Image size must be less than 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate document file before upload
   */
  validateDocumentFile(file: File): { isValid: boolean; error?: string } {
    if (!this.isValidDocumentFile(file)) {
      return {
        isValid: false,
        error: 'Please upload a valid document file (PDF, DOC, DOCX, TXT)'
      };
    }

    if (!this.isValidFileSize(file, 10)) {
      return {
        isValid: false,
        error: 'Document size must be less than 10MB'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate message attachment file (image, video, or document)
   */
  validateMessageAttachment(file: File): { isValid: boolean; error?: string; type?: 'image' | 'video' | 'document' } {
    // Check image
    if (this.isValidImageFile(file)) {
      const validation = this.validateImageFile(file);
      return validation.isValid ? { ...validation, type: 'image' } : validation;
    }

    // Check video
    if (this.isValidVideoFile(file)) {
      const validation = this.validateVideoFile(file);
      return validation.isValid ? { ...validation, type: 'video' } : validation;
    }

    // Check document
    if (this.isValidDocumentFile(file)) {
      const validation = this.validateDocumentFile(file);
      return validation.isValid ? { ...validation, type: 'document' } : validation;
    }

    return {
      isValid: false,
      error: 'Unsupported file type. Please upload an image, video, or document.'
    };
  }

  /**
   * Upload a message attachment (image, video, or document)
   */
  async uploadMessageAttachment(
    file: File,
    userId: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult & { type?: 'image' | 'video' | 'document' }> {
    // Validate file
    const validation = this.validateMessageAttachment(file);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      };
    }

    // Upload based on type
    if (validation.type === 'image') {
      const result = await this.uploadImage(file, userId, 'messages/images', onProgress);
      return { ...result, type: 'image' };
    } else if (validation.type === 'video') {
      const result = await this.uploadVideo(file, userId, onProgress, 'messages/videos');
      return { ...result, type: 'video' };
    } else if (validation.type === 'document') {
      const result = await this.uploadDocument(file, userId, 'messages/documents', onProgress);
      return { ...result, type: 'document' };
    }

    return {
      success: false,
      error: 'Unknown file type'
    };
  }
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService();

// Export the class for testing
export { FirebaseStorageService };
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
    onProgress?: (progress: UploadProgress) => void
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
      const storagePath = `videos/${userId}/${fileName}`;

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
}

// Export singleton instance
export const firebaseStorageService = new FirebaseStorageService();

// Export the class for testing
export { FirebaseStorageService };
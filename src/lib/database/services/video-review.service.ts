import { BaseDatabaseService } from '../base.service';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { ApiResponse } from '@/types';
import { firebaseService } from '../../firebase/service';
import { messageService } from './message.service';

export interface StudentVideo {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  videoUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'pending' | 'reviewed' | 'feedback_sent';
  sport?: string;
  description?: string;
  coachFeedback?: string;
  recommendedCourses?: string[];
  reviewedAt?: Date;
  reviewedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VideoUploadData {
  studentId: string;
  studentName: string;
  studentEmail: string;
  videoUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  sport?: string;
  description?: string;
}

export interface CoachFeedback {
  coachFeedback: string;
  recommendedCourses: string[];
  reviewedBy: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

class VideoReviewService extends BaseDatabaseService {
  private readonly STUDENT_VIDEOS_COLLECTION = 'student_videos';

  get collection(): string {
    return this.STUDENT_VIDEOS_COLLECTION;
  }

  /**
   * Upload video metadata to database
   */
  async createVideoRecord(data: VideoUploadData): Promise<ServiceResult<string>> {
    try {
      const videoRecord = {
        ...data,
        status: 'pending' as const,
        uploadedAt: Timestamp.fromDate(new Date()),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      const videoId = await firebaseService.addDocument(this.collection, videoRecord);

      return {
        success: true,
        data: videoId
      };
    } catch (error) {
      logger.error('Failed to create video record', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to create video record'
        }
      };
    }
  }

  /**
   * Get all videos for admin review
   */
  async getAllVideosForReview(): Promise<ServiceResult<StudentVideo[]>> {
    try {
      logger.database('query', this.collection, undefined, { constraints: [{ field: 'status', operator: 'in', value: ['pending', 'reviewed', 'feedback_sent'] }] });

      const videos = await firebaseService.getCollection<StudentVideo>(this.collection, [
        { field: 'status', operator: 'in', value: ['pending', 'reviewed', 'feedback_sent'] }
      ]);

      logger.database('query-result', this.collection, undefined, { count: videos.length, statuses: videos.map(v => ({ id: v.id, status: v.status })) });

      // Sort by upload date (newest first)
      const sortedVideos = videos.sort((a, b) => {
        const dateA = a.uploadedAt instanceof Date ? a.uploadedAt : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime();
      });

      logger.database('query-success', this.collection, undefined, { resultCount: sortedVideos.length });
      return {
        success: true,
        data: sortedVideos
      };
    } catch (error) {
      logger.error('Failed to get videos for review', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get videos'
        }
      };
    }
  }

  /**
   * Get videos by status
   */
  async getVideosByStatus(status: StudentVideo['status']): Promise<ServiceResult<StudentVideo[]>> {
    try {
      const videos = await firebaseService.getCollection<StudentVideo>(this.collection, [
        { field: 'status', operator: '==', value: status }
      ]);

      return {
        success: true,
        data: videos
      };
    } catch (error) {
      logger.error('Failed to get videos by status', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get videos by status'
        }
      };
    }
  }

  /**
   * Get videos uploaded by a specific student
   */
  async getStudentVideos(studentId: string): Promise<ServiceResult<StudentVideo[]>> {
    try {
      const videos = await firebaseService.getCollection<StudentVideo>(this.collection, [
        { field: 'studentId', operator: '==', value: studentId }
      ]);

      // Sort by upload date (newest first)
      const sortedVideos = videos.sort((a, b) => {
        const dateA = a.uploadedAt instanceof Date ? a.uploadedAt : new Date(a.uploadedAt);
        const dateB = b.uploadedAt instanceof Date ? b.uploadedAt : new Date(b.uploadedAt);
        return dateB.getTime() - dateA.getTime();
      });

      return {
        success: true,
        data: sortedVideos
      };
    } catch (error) {
      logger.error('Failed to get student videos', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get student videos'
        }
      };
    }
  }

  /**
   * Get a specific video by ID
   */
  async getVideo(videoId: string): Promise<ServiceResult<StudentVideo>> {
    try {
      const video = await firebaseService.getDocument<StudentVideo>(this.collection, videoId);

      if (!video) {
        return {
          success: false,
          error: {
            message: 'Video not found'
          }
        };
      }

      return {
        success: true,
        data: video
      };
    } catch (error) {
      logger.error('Failed to get video', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get video'
        }
      };
    }
  }

  /**
   * Update video status (e.g., pending -> reviewed)
   */
  async updateVideoStatus(
    videoId: string,
    status: StudentVideo['status']
  ): Promise<ServiceResult<void>> {
    try {
      await firebaseService.updateDocument(this.collection, videoId, {
        status,
        updatedAt: Timestamp.fromDate(new Date())
      });

      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to update video status', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to update video status'
        }
      };
    }
  }

  /**
   * Submit coach feedback for a video
   * This method now also creates a message for the student
   */
  async submitCoachFeedback(
    videoId: string,
    feedback: CoachFeedback,
    adminUserId?: string
  ): Promise<ServiceResult<void>> {
    try {
      // First, get the video details to extract student info
      const videoResult = await this.getVideo(videoId);
      if (!videoResult.success || !videoResult.data) {
        return {
          success: false,
          error: {
            message: 'Video not found'
          }
        };
      }

      const video = videoResult.data;

      // Update the video document with feedback
      const updateData = {
        ...feedback,
        status: 'feedback_sent' as const,
        reviewedAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      await firebaseService.updateDocument(this.collection, videoId, updateData);

      // Create a message for the student
      // If adminUserId is not provided, extract from reviewedBy email or use studentId as fallback
      const fromUserId = adminUserId || video.studentId; // Fallback to studentId if admin not provided

      try {
        await messageService.createMessage(fromUserId, {
          toUserId: video.studentId,
          subject: 'Video Review Feedback',
          message: feedback.coachFeedback,
          type: 'video_review',
          relatedVideoUrl: video.videoUrl,
          relatedVideoId: videoId,
          attachments: []
        });

        logger.info('Video feedback message created', 'VideoReviewService', { videoId, studentId: video.studentId });
      } catch (messageError) {
        // Log the error but don't fail the entire operation
        logger.error('Failed to create message for video feedback', 'VideoReviewService', messageError);
        // Continue anyway - feedback was saved to video document
      }

      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to submit coach feedback', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to submit feedback'
        }
      };
    }
  }

  /**
   * Delete a video record
   */
  async deleteVideoRecord(videoId: string): Promise<ServiceResult<void>> {
    try {
      await firebaseService.deleteDocument(this.collection, videoId);

      return {
        success: true
      };
    } catch (error) {
      logger.error('Failed to delete video record', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to delete video record'
        }
      };
    }
  }

  /**
   * Get analytics for video reviews
   */
  async getVideoAnalytics(): Promise<ServiceResult<{
    totalVideos: number;
    pendingReviews: number;
    completedReviews: number;
    averageReviewTime: number;
  }>> {
    try {
      const allVideos = await firebaseService.getCollection<StudentVideo>(this.collection);

      const totalVideos = allVideos.length;
      const pendingReviews = allVideos.filter(v => v.status === 'pending').length;
      const completedReviews = allVideos.filter(v => v.status === 'feedback_sent').length;

      // Calculate average review time for completed reviews
      const reviewedVideos = allVideos.filter(v => v.reviewedAt && v.uploadedAt);
      let averageReviewTime = 0;

      if (reviewedVideos.length > 0) {
        const totalReviewTime = reviewedVideos.reduce((sum, video) => {
          const uploadDate = video.uploadedAt instanceof Date ? video.uploadedAt : new Date(video.uploadedAt);
          const reviewDate = video.reviewedAt instanceof Date ? video.reviewedAt : new Date(video.reviewedAt!);
          return sum + (reviewDate.getTime() - uploadDate.getTime());
        }, 0);

        averageReviewTime = totalReviewTime / reviewedVideos.length / (1000 * 60 * 60); // Convert to hours
      }

      return {
        success: true,
        data: {
          totalVideos,
          pendingReviews,
          completedReviews,
          averageReviewTime: Math.round(averageReviewTime * 10) / 10 // Round to 1 decimal place
        }
      };
    } catch (error) {
      logger.error('Failed to get video analytics', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to get analytics'
        }
      };
    }
  }

  /**
   * Search videos by student name or filename
   */
  async searchVideos(searchTerm: string): Promise<ServiceResult<StudentVideo[]>> {
    try {
      // Note: Firestore doesn't support full-text search, so we'll get all videos
      // and filter client-side. For production, consider using Algolia or similar.
      const allVideos = await firebaseService.getCollection<StudentVideo>(this.collection);

      const filteredVideos = allVideos.filter(video =>
        video.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.sport?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return {
        success: true,
        data: filteredVideos
      };
    } catch (error) {
      logger.error('Failed to search videos', 'VideoReviewService', error);
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Failed to search videos'
        }
      };
    }
  }
}

// Export singleton instance
export const videoReviewService = new VideoReviewService();

// Export the class for testing
export { VideoReviewService };
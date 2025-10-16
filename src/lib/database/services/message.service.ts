import { BaseDatabaseService } from '../base.service';
import {
  Message,
  MessageAttachment,
  MessageType,
  CreateMessageInput,
  MessageQueryOptions,
  MessageStats,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { TimestampPatterns } from '../../utils/timestamp';
import { userService } from './user.service';

/**
 * Service for managing messages between admins and students.
 *
 * This service provides functionality for:
 * - Creating messages with attachments
 * - Querying messages with various filters
 * - Marking messages as read/unread
 * - Integration with video review system
 * - Creating notifications for new messages
 *
 * @example
 * ```typescript
 * // Send a message
 * const result = await messageService.createMessage(adminUserId, {
 *   toUserId: 'student123',
 *   subject: 'Great work!',
 *   message: 'Keep up the excellent progress...',
 *   type: 'feedback',
 *   attachments: []
 * });
 *
 * // Get student's messages
 * const messages = await messageService.getUserMessages('student123');
 * ```
 */
export class MessageService extends BaseDatabaseService {
  private readonly MESSAGES_COLLECTION = 'messages';
  private readonly VIDEO_REVIEWS_COLLECTION = 'video_reviews';

  /**
   * Creates a new message from admin to student.
   *
   * @param fromUserId - Admin user ID sending the message
   * @param input - Message creation data
   * @returns Promise resolving to API response with created message ID
   *
   * @example
   * ```typescript
   * const result = await messageService.createMessage('admin123', {
   *   toUserId: 'student456',
   *   subject: 'Feedback on Shooting Form',
   *   message: 'Your form is improving! Here are some tips...',
   *   type: 'video_review',
   *   relatedVideoId: 'video789',
   *   attachments: [...]
   * });
   * ```
   */
  async createMessage(
    fromUserId: string,
    input: CreateMessageInput
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.MESSAGES_COLLECTION, undefined, {
      fromUserId,
      toUserId: input.toUserId,
      type: input.type
    });

    // Validate that sender is admin
    const senderResult = await userService.getUser(fromUserId);
    if (!senderResult.success || !senderResult.data || senderResult.data.role !== 'admin') {
      logger.warn('Message creation failed - sender is not admin', 'MessageService', { fromUserId });
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only admins can send messages',
        },
        timestamp: new Date(),
      };
    }

    // Validate that recipient exists and is a student
    const recipientResult = await userService.getUser(input.toUserId);
    if (!recipientResult.success || !recipientResult.data) {
      logger.warn('Message creation failed - recipient not found', 'MessageService', { toUserId: input.toUserId });
      return {
        success: false,
        error: {
          code: 'RECIPIENT_NOT_FOUND',
          message: 'Recipient user not found',
        },
        timestamp: new Date(),
      };
    }

    // Create message data
    const messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'> = {
      fromUserId,
      toUserId: input.toUserId,
      subject: input.subject,
      message: input.message,
      type: input.type,
      ...(input.relatedVideoUrl && { relatedVideoUrl: input.relatedVideoUrl }),
      ...(input.relatedVideoId && { relatedVideoId: input.relatedVideoId }),
      attachments: input.attachments || [],
      isRead: false,
    };

    const result = await this.create<Message>(this.MESSAGES_COLLECTION, messageData);

    if (result.success) {
      logger.info('Message created successfully', 'MessageService', {
        messageId: result.data!.id,
        fromUserId,
        toUserId: input.toUserId,
        type: input.type
      });

      // Create notification for the student
      await this.createMessageNotification(result.data!.id, fromUserId, input.toUserId, input.subject, input.type);

      // If this is video feedback, update the video review
      if (input.relatedVideoId) {
        await this.linkMessageToVideoReview(input.relatedVideoId, result.data!.id, fromUserId);
      }
    } else {
      logger.error('Message creation failed', 'MessageService', result.error);
    }

    return result;
  }

  /**
   * Retrieves a message by its ID.
   *
   * @param messageId - The ID of the message to retrieve
   * @returns Promise resolving to API response with message data or null if not found
   */
  async getMessage(messageId: string): Promise<ApiResponse<Message | null>> {
    logger.database('read', this.MESSAGES_COLLECTION, messageId);
    const result = await this.getById<Message>(this.MESSAGES_COLLECTION, messageId);

    if (result.success && result.data) {
      logger.debug('Message retrieved successfully', 'MessageService', { messageId });
    } else if (result.success && !result.data) {
      logger.warn('Message not found', 'MessageService', { messageId });
    } else {
      logger.error('Message retrieval failed', 'MessageService', result.error);
    }

    return result;
  }

  /**
   * Retrieves all messages for a specific user (as sender or recipient).
   *
   * @param userId - The ID of the user
   * @param options - Query options for filtering
   * @returns Promise resolving to API response with paginated messages
   *
   * @example
   * ```typescript
   * // Get all messages for a student
   * const result = await messageService.getUserMessages('student123', {
   *   isRead: false,
   *   limit: 20
   * });
   *
   * // Get video feedback messages only
   * const videoFeedback = await messageService.getUserMessages('student123', {
   *   type: 'video_review'
   * });
   * ```
   */
  async getUserMessages(
    userId: string,
    options: MessageQueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    logger.database('query', this.MESSAGES_COLLECTION, undefined, { userId, options });

    const whereClause: QueryOptions['where'] = [];

    // Messages sent to this user (students) or from this user (admins)
    whereClause.push({ field: 'toUserId', operator: '==', value: userId });

    // Filter by message type
    if (options.type) {
      whereClause.push({ field: 'type', operator: '==', value: options.type });
    }

    // Filter by read status
    if (options.isRead !== undefined) {
      whereClause.push({ field: 'isRead', operator: '==', value: options.isRead });
    }

    // Filter by date range
    if (options.fromDate) {
      whereClause.push({
        field: 'createdAt',
        operator: '>=',
        value: Timestamp.fromDate(options.fromDate)
      });
    }

    if (options.toDate) {
      whereClause.push({
        field: 'createdAt',
        operator: '<=',
        value: Timestamp.fromDate(options.toDate)
      });
    }

    const queryOptions: QueryOptions = {
      where: whereClause,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      offset: options.offset,
    };

    const result = await this.query<Message>(this.MESSAGES_COLLECTION, queryOptions);

    if (result.success) {
      logger.debug('Messages retrieved successfully', 'MessageService', {
        userId,
        count: result.data?.items.length || 0
      });
    } else {
      logger.error('Messages retrieval failed', 'MessageService', result.error);
    }

    return result;
  }

  /**
   * Retrieves all messages sent by an admin.
   *
   * @param adminUserId - The admin user ID
   * @param options - Query options for filtering
   * @returns Promise resolving to API response with paginated messages
   */
  async getAdminSentMessages(
    adminUserId: string,
    options: MessageQueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Message>>> {
    logger.database('query', this.MESSAGES_COLLECTION, undefined, { adminUserId, options });

    const whereClause: QueryOptions['where'] = [
      { field: 'fromUserId', operator: '==', value: adminUserId }
    ];

    // Filter by message type
    if (options.type) {
      whereClause.push({ field: 'type', operator: '==', value: options.type });
    }

    // Filter by recipient
    if (options.userId) {
      whereClause.push({ field: 'toUserId', operator: '==', value: options.userId });
    }

    const queryOptions: QueryOptions = {
      where: whereClause,
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      offset: options.offset,
    };

    return this.query<Message>(this.MESSAGES_COLLECTION, queryOptions);
  }

  /**
   * Marks a message as read.
   *
   * @param messageId - The message ID
   * @param userId - The user ID marking the message as read
   * @returns Promise resolving to API response
   *
   * @example
   * ```typescript
   * await messageService.markAsRead('msg123', 'student456');
   * ```
   */
  async markAsRead(messageId: string, userId: string): Promise<ApiResponse<void>> {
    logger.database('update', this.MESSAGES_COLLECTION, messageId, { isRead: true });

    // Verify user is the recipient
    const messageResult = await this.getMessage(messageId);
    if (!messageResult.success || !messageResult.data) {
      return {
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found',
        },
        timestamp: new Date(),
      };
    }

    if (messageResult.data.toUserId !== userId) {
      logger.warn('Mark as read failed - user is not recipient', 'MessageService', { messageId, userId });
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only the recipient can mark a message as read',
        },
        timestamp: new Date(),
      };
    }

    const result = await this.update<Message>(this.MESSAGES_COLLECTION, messageId, {
      isRead: true,
      readAt: TimestampPatterns.forDatabase(),
    });

    if (result.success) {
      logger.info('Message marked as read', 'MessageService', { messageId, userId });
    }

    return result;
  }

  /**
   * Marks a message as unread.
   *
   * @param messageId - The message ID
   * @param userId - The user ID marking the message as unread
   * @returns Promise resolving to API response
   */
  async markAsUnread(messageId: string, userId: string): Promise<ApiResponse<void>> {
    logger.database('update', this.MESSAGES_COLLECTION, messageId, { isRead: false });

    // Verify user is the recipient
    const messageResult = await this.getMessage(messageId);
    if (!messageResult.success || !messageResult.data) {
      return {
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found',
        },
        timestamp: new Date(),
      };
    }

    if (messageResult.data.toUserId !== userId) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only the recipient can mark a message as unread',
        },
        timestamp: new Date(),
      };
    }

    const result = await this.update<Message>(this.MESSAGES_COLLECTION, messageId, {
      isRead: false,
      readAt: undefined,
    });

    if (result.success) {
      logger.info('Message marked as unread', 'MessageService', { messageId, userId });
    }

    return result;
  }

  /**
   * Gets the count of unread messages for a user.
   *
   * @param userId - The user ID
   * @returns Promise resolving to unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.getUserMessages(userId, { isRead: false, limit: 1000 });
    return result.data?.total || 0;
  }

  /**
   * Deletes a message.
   *
   * @param messageId - The message ID to delete
   * @param userId - The user ID requesting deletion
   * @returns Promise resolving to API response
   */
  async deleteMessage(messageId: string, userId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.MESSAGES_COLLECTION, messageId);

    // Verify user is the recipient
    const messageResult = await this.getMessage(messageId);
    if (!messageResult.success || !messageResult.data) {
      return {
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found',
        },
        timestamp: new Date(),
      };
    }

    if (messageResult.data.toUserId !== userId) {
      return {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Only the recipient can delete a message',
        },
        timestamp: new Date(),
      };
    }

    const result = await this.delete(this.MESSAGES_COLLECTION, messageId);

    if (result.success) {
      logger.info('Message deleted', 'MessageService', { messageId, userId });
    }

    return result;
  }

  /**
   * Gets message statistics for an admin.
   *
   * @param adminUserId - The admin user ID
   * @returns Promise resolving to message statistics
   */
  async getMessageStats(adminUserId: string): Promise<ApiResponse<MessageStats>> {
    const messagesResult = await this.getAdminSentMessages(adminUserId, { limit: 10000 });

    if (!messagesResult.success || !messagesResult.data) {
      return {
        success: false,
        error: messagesResult.error,
        timestamp: new Date(),
      };
    }

    const messages = messagesResult.data.items;

    const stats: MessageStats = {
      totalSent: messages.length,
      totalRead: messages.filter(m => m.isRead).length,
      totalUnread: messages.filter(m => !m.isRead).length,
      averageReadTime: 0, // TODO: Calculate based on readAt - createdAt
      messagesByType: {
        instruction: messages.filter(m => m.type === 'instruction').length,
        feedback: messages.filter(m => m.type === 'feedback').length,
        general: messages.filter(m => m.type === 'general').length,
        video_review: messages.filter(m => m.type === 'video_review').length,
      },
    };

    return {
      success: true,
      data: stats,
      timestamp: new Date(),
    };
  }

  /**
   * Creates a notification for the student when a new message is sent.
   * @private
   */
  private async createMessageNotification(
    messageId: string,
    fromUserId: string,
    toUserId: string,
    subject: string,
    messageType: MessageType
  ): Promise<void> {
    try {
      // Get sender name
      const senderResult = await userService.getUser(fromUserId);
      const senderName = senderResult.data?.displayName || 'Your Coach';

      // Determine notification title based on message type
      let title = '💬 New message from ' + senderName;
      if (messageType === 'video_review') {
        title = '📹 ' + senderName + ' reviewed your video';
      } else if (messageType === 'feedback') {
        title = '📝 New feedback from ' + senderName;
      } else if (messageType === 'instruction') {
        title = '📋 New instructions from ' + senderName;
      }

      await userService.createNotification(toUserId, {
        type: 'admin_message',
        title,
        message: subject,
        data: {
          messageId,
          messageType,
          actionUrl: `/messages/${messageId}`,
        },
        priority: 'high',
      });

      logger.info('Message notification created', 'MessageService', { messageId, toUserId });
    } catch (error) {
      logger.error('Failed to create message notification', 'MessageService', { messageId, error });
      // Don't fail the message creation if notification fails
    }
  }

  /**
   * Links a message to a video review.
   * @private
   */
  private async linkMessageToVideoReview(
    videoReviewId: string,
    messageId: string,
    reviewedBy: string
  ): Promise<void> {
    try {
      await this.update(this.VIDEO_REVIEWS_COLLECTION, videoReviewId, {
        feedbackMessageId: messageId,
        reviewedAt: TimestampPatterns.forDatabase(),
        reviewedBy,
        status: 'reviewed',
      });

      logger.info('Message linked to video review', 'MessageService', { videoReviewId, messageId });
    } catch (error) {
      logger.error('Failed to link message to video review', 'MessageService', { videoReviewId, error });
      // Don't fail the message creation if linking fails
    }
  }

  /**
   * Subscribes to messages for a specific user in real-time.
   *
   * @param userId - The user ID to subscribe to
   * @param callback - Callback function called when messages change
   * @returns Unsubscribe function
   */
  subscribeToUserMessages(
    userId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    return this.subscribeToCollection<Message>(
      this.MESSAGES_COLLECTION,
      {
        where: [{ field: 'toUserId', operator: '==', value: userId }],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: 50,
      },
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }
}

// Export singleton instance
export const messageService = new MessageService();

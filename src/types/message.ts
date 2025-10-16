import { Timestamp } from 'firebase/firestore';

/**
 * Message type enumeration
 */
export type MessageType = 'instruction' | 'feedback' | 'general' | 'video_review';

/**
 * Message attachment type enumeration
 */
export type AttachmentType = 'image' | 'video' | 'document';

/**
 * Message interface - represents a message from admin to student
 */
export interface Message {
  id: string;
  fromUserId: string;        // Admin user ID
  toUserId: string;          // Student user ID
  subject: string;           // Message subject line
  message: string;           // Message body content
  type: MessageType;         // Type of message

  // Video review integration
  relatedVideoUrl?: string;  // Student's original video URL (if video feedback)
  relatedVideoId?: string;   // Reference to video_reviews collection

  // Attachments
  attachments: MessageAttachment[];

  // Status
  isRead: boolean;
  readAt?: Timestamp;

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Message attachment interface - represents a file attached to a message
 */
export interface MessageAttachment {
  id: string;
  type: AttachmentType;      // Type of attachment
  url: string;               // Firebase Storage download URL
  fileName: string;          // Original file name
  fileSize: number;          // Size in bytes
  mimeType: string;          // MIME type (e.g., 'image/jpeg', 'video/mp4')
  thumbnailUrl?: string;     // Thumbnail URL for videos
  uploadedAt: Timestamp;
}

/**
 * Message create input - used when creating a new message
 */
export interface CreateMessageInput {
  toUserId: string;
  subject: string;
  message: string;
  type: MessageType;
  relatedVideoUrl?: string;
  relatedVideoId?: string;
  attachments?: MessageAttachment[];
}

/**
 * Message query options - used for filtering messages
 */
export interface MessageQueryOptions {
  userId?: string;           // Filter by sender or recipient
  type?: MessageType;        // Filter by message type
  isRead?: boolean;          // Filter by read status
  fromDate?: Date;           // Filter messages after this date
  toDate?: Date;             // Filter messages before this date
  limit?: number;            // Limit number of results
  offset?: number;           // Offset for pagination
}

/**
 * Message statistics - used for admin dashboard
 */
export interface MessageStats {
  totalSent: number;
  totalRead: number;
  totalUnread: number;
  averageReadTime: number;   // Average time to read in minutes
  messagesByType: {
    instruction: number;
    feedback: number;
    general: number;
    video_review: number;
  };
}

import { Timestamp, serverTimestamp } from 'firebase/firestore';

/**
 * Centralized timestamp utilities for consistent date/time handling across the application
 */
export class TimestampUtils {
  /**
   * Get server timestamp for Firestore documents (recommended for all database operations)
   * This ensures consistent timezone handling and server-side time accuracy
   */
  static getServerTimestamp() {
    return serverTimestamp();
  }

  /**
   * Convert JavaScript Date to Firestore Timestamp
   * Use this only when you need to store a specific client-side time
   */
  static fromDate(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  }

  /**
   * Get current timestamp as Firestore Timestamp
   * Use this for client-side operations that need immediate timestamp values
   */
  static now(): Timestamp {
    return Timestamp.fromDate(new Date());
  }

  /**
   * Get current date as JavaScript Date object
   * Use this for API response timestamps and client-side operations
   */
  static currentDate(): Date {
    return new Date();
  }

  /**
   * Convert Firestore Timestamp to JavaScript Date
   */
  static toDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  }

  /**
   * Format timestamp for display (consistent across the app)
   */
  static formatForDisplay(timestamp: Timestamp | Date, locale: string = 'en-US'): string {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get ISO string representation for API responses
   */
  static toISOString(timestamp: Timestamp | Date): string {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toISOString();
  }
}

/**
 * Common timestamp patterns for different use cases
 */
export const TimestampPatterns = {
  /**
   * For Firestore document fields - always use server timestamp
   */
  forDatabase: () => serverTimestamp(),

  /**
   * For API response metadata
   */
  forResponse: () => new Date(),

  /**
   * For immediate client-side timestamp needs
   */
  forClient: () => Timestamp.fromDate(new Date()),
} as const;

export default TimestampUtils;
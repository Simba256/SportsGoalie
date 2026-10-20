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
 * Best-effort conversion of anything date-shaped that comes back out of
 * Firestore into a real Date, returning null when there's nothing usable.
 *
 * Needed because a bug in BaseDatabaseService.removeUndefinedFields wrote some
 * timestamps as plain `{ seconds, nanoseconds }` maps instead of real Timestamp
 * fields (fixed at the write path, but documents created before that fix still
 * hold the broken shape). Also covers the ordinary cases — a live Timestamp, a
 * Date, an ISO string, epoch millis — and an unresolved serverTimestamp(), which
 * reads back as null on the local snapshot before the server round-trips.
 *
 * Callers must handle null rather than assuming a date exists.
 */
export function toDateSafe(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'object') {
    const candidate = value as {
      toDate?: () => Date;
      seconds?: number;
      nanoseconds?: number;
      _seconds?: number;
    };

    if (typeof candidate.toDate === 'function') {
      const date = candidate.toDate();
      return date instanceof Date && !isNaN(date.getTime()) ? date : null;
    }

    // The mangled shape. `_seconds` is the Admin SDK's field name, which shows
    // up in anything seeded by a script rather than by the client SDK.
    const seconds = candidate.seconds ?? candidate._seconds;
    if (typeof seconds === 'number') {
      return new Date(seconds * 1000 + (candidate.nanoseconds ?? 0) / 1e6);
    }

    return null;
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
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
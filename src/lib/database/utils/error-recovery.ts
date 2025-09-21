/**
 * Error recovery strategies and utilities for database operations.
 *
 * This module provides comprehensive error handling, retry mechanisms,
 * circuit breakers, and recovery strategies for database operations
 * to improve system resilience and user experience.
 */

import { logger } from '../../utils/logger';
import { ApiResponse } from '@/types';

/**
 * Configuration options for retry strategies
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay between retries in milliseconds */
  baseDelay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Multiplier for exponential backoff */
  backoffMultiplier: number;
  /** Whether to add jitter to delays */
  useJitter: boolean;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: unknown) => boolean;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  useJitter: true,
  isRetryable: isRetryableError,
};

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerOptions {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in milliseconds to wait before attempting to close circuit */
  resetTimeout: number;
  /** Timeout for individual operations in milliseconds */
  timeout: number;
}

/**
 * Circuit breaker states
 */
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Determines if an error is retryable based on its type and characteristics
 *
 * @param error - The error to evaluate
 * @returns True if the error is retryable, false otherwise
 */
export function isRetryableError(error: unknown): boolean {
  if (!error) return false;

  // Firebase-specific retryable errors
  const firebaseRetryableCodes = [
    'unavailable',
    'deadline-exceeded',
    'resource-exhausted',
    'internal',
    'cancelled',
    'unknown',
  ];

  // Network errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Check for network-related errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('connection') ||
      message.includes('fetch')
    ) {
      return true;
    }

    // Check for Firebase error codes
    const errorCode = (error as any).code;
    if (errorCode && firebaseRetryableCodes.includes(errorCode)) {
      return true;
    }
  }

  // Check for HTTP status codes that are retryable
  const statusCode = (error as any).status || (error as any).statusCode;
  if (statusCode) {
    // 5xx server errors are generally retryable
    // 429 (Too Many Requests) is retryable
    // 408 (Request Timeout) is retryable
    return statusCode >= 500 || statusCode === 429 || statusCode === 408;
  }

  return false;
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 *
 * @param attempt - Current attempt number (0-based)
 * @param options - Retry configuration options
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(attempt: number, options: RetryOptions): number {
  const exponentialDelay = options.baseDelay * Math.pow(options.backoffMultiplier, attempt);
  let delay = Math.min(exponentialDelay, options.maxDelay);

  // Add jitter to prevent thundering herd problem
  if (options.useJitter) {
    delay = delay * (0.5 + Math.random() * 0.5);
  }

  return Math.floor(delay);
}

/**
 * Executes an async function with retry logic and exponential backoff
 *
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns Promise resolving to the function result or rejecting with the final error
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchUserData(userId),
 *   { maxAttempts: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      const result = await fn();

      // Log successful retry if this wasn't the first attempt
      if (attempt > 0) {
        logger.info(`Operation succeeded after ${attempt + 1} attempts`, 'ErrorRecovery');
      }

      return result;
    } catch (error) {
      lastError = error;

      // Don't retry if this was the last attempt
      if (attempt === config.maxAttempts - 1) {
        logger.error(`Operation failed after ${config.maxAttempts} attempts`, 'ErrorRecovery', error);
        break;
      }

      // Don't retry if error is not retryable
      if (!config.isRetryable!(error)) {
        logger.warn('Non-retryable error encountered, giving up', 'ErrorRecovery', error);
        break;
      }

      const delay = calculateRetryDelay(attempt, config);
      logger.warn(`Attempt ${attempt + 1} failed, retrying in ${delay}ms`, 'ErrorRecovery', error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Circuit breaker implementation to prevent cascade failures
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;

  constructor(
    private name: string,
    private options: CircuitBreakerOptions
  ) {}

  /**
   * Executes a function with circuit breaker protection
   *
   * @param fn - The function to execute
   * @returns Promise resolving to the function result
   *
   * @example
   * ```typescript
   * const circuitBreaker = new CircuitBreaker('database-service', {
   *   failureThreshold: 5,
   *   resetTimeout: 30000,
   *   timeout: 5000
   * });
   *
   * const result = await circuitBreaker.execute(() => dbOperation());
   * ```
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime < this.options.resetTimeout) {
        const error = new Error(`Circuit breaker ${this.name} is OPEN`);
        logger.warn(`Circuit breaker ${this.name} blocked request`, 'CircuitBreaker');
        throw error;
      } else {
        // Transition to half-open state
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        logger.info(`Circuit breaker ${this.name} transitioning to HALF_OPEN`, 'CircuitBreaker');
      }
    }

    try {
      // Add timeout to the operation
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), this.options.timeout)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      // Require multiple successes to close circuit
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        logger.info(`Circuit breaker ${this.name} transitioned to CLOSED`, 'CircuitBreaker');
      }
    } else if (this.state === 'CLOSED') {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker ${this.name} transitioned to OPEN from HALF_OPEN`, 'CircuitBreaker');
    } else if (this.state === 'CLOSED' && this.failureCount >= this.options.failureThreshold) {
      this.state = 'OPEN';
      logger.warn(`Circuit breaker ${this.name} transitioned to OPEN`, 'CircuitBreaker', {
        failureCount: this.failureCount,
        threshold: this.options.failureThreshold,
      });
    }
  }

  /**
   * Gets the current state of the circuit breaker
   */
  getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Gets current statistics about the circuit breaker
   */
  getStats() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
    };
  }

  /**
   * Manually resets the circuit breaker to CLOSED state
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    logger.info(`Circuit breaker ${this.name} manually reset`, 'CircuitBreaker');
  }
}

/**
 * Wraps an API response with enhanced error information
 *
 * @param error - The original error
 * @param context - Additional context about the operation
 * @param recoveryActions - Suggested recovery actions
 * @returns Enhanced API response with error details
 */
export function createErrorResponse<T>(
  error: unknown,
  context: string,
  recoveryActions?: string[]
): ApiResponse<T> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  const errorCode = (error as any)?.code || 'UNKNOWN_ERROR';

  logger.error(`Error in ${context}`, 'ErrorRecovery', error);

  return {
    success: false,
    error: {
      code: errorCode,
      message: errorMessage,
      context,
      recoveryActions,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date(),
  };
}

/**
 * Handles database connection errors with appropriate recovery strategies
 *
 * @param error - The database error
 * @param operation - The operation that failed
 * @returns Recovery strategy information
 */
export function handleDatabaseError(error: unknown, operation: string) {
  const isRetryable = isRetryableError(error);
  const errorCode = (error as any)?.code;

  let recoveryStrategy = 'retry';
  let userMessage = 'An error occurred. Please try again.';
  let internalActions: string[] = [];

  switch (errorCode) {
    case 'permission-denied':
      recoveryStrategy = 'auth-refresh';
      userMessage = 'You don\'t have permission to perform this action.';
      internalActions = ['Check user permissions', 'Refresh authentication token'];
      break;

    case 'not-found':
      recoveryStrategy = 'fallback';
      userMessage = 'The requested resource was not found.';
      internalActions = ['Verify resource exists', 'Check for data consistency issues'];
      break;

    case 'quota-exceeded':
      recoveryStrategy = 'backoff';
      userMessage = 'Service is temporarily unavailable. Please try again later.';
      internalActions = ['Implement exponential backoff', 'Monitor quota usage'];
      break;

    case 'network-timeout':
    case 'unavailable':
      recoveryStrategy = 'retry-with-backoff';
      userMessage = 'Connection timeout. Please check your internet and try again.';
      internalActions = ['Retry with exponential backoff', 'Check network connectivity'];
      break;

    default:
      if (isRetryable) {
        recoveryStrategy = 'retry';
        userMessage = 'A temporary error occurred. Please try again.';
        internalActions = ['Retry operation', 'Log error for monitoring'];
      } else {
        recoveryStrategy = 'manual-intervention';
        userMessage = 'An unexpected error occurred. Please contact support if this persists.';
        internalActions = ['Manual investigation required', 'Contact support team'];
      }
  }

  logger.error(`Database error in ${operation}`, 'DatabaseErrorHandler', {
    error,
    recoveryStrategy,
    isRetryable,
    errorCode,
  });

  return {
    recoveryStrategy,
    userMessage,
    internalActions,
    isRetryable,
    shouldCircuitBreak: ['quota-exceeded', 'internal', 'unavailable'].includes(errorCode),
  };
}

/**
 * Creates a graceful degradation response when primary operations fail
 *
 * @param fallbackData - Fallback data to return
 * @param reason - Reason for degradation
 * @returns API response with fallback data
 */
export function createGracefulDegradation<T>(
  fallbackData: T,
  reason: string
): ApiResponse<T> {
  logger.warn(`Graceful degradation activated: ${reason}`, 'ErrorRecovery');

  return {
    success: true,
    data: fallbackData,
    warning: {
      code: 'GRACEFUL_DEGRADATION',
      message: reason,
    },
    timestamp: new Date(),
  };
}

/**
 * Validates that critical dependencies are available
 *
 * @param dependencies - Map of dependency names to validation functions
 * @returns Promise resolving to dependency check results
 */
export async function validateDependencies(
  dependencies: Record<string, () => Promise<boolean>>
): Promise<{ healthy: boolean; issues: string[] }> {
  const issues: string[] = [];

  for (const [name, healthCheck] of Object.entries(dependencies)) {
    try {
      const isHealthy = await withRetry(healthCheck, { maxAttempts: 2, baseDelay: 500 });
      if (!isHealthy) {
        issues.push(`Dependency ${name} is unhealthy`);
      }
    } catch (error) {
      issues.push(`Dependency ${name} failed health check: ${error}`);
    }
  }

  const healthy = issues.length === 0;

  if (!healthy) {
    logger.error('Dependency validation failed', 'ErrorRecovery', { issues });
  }

  return { healthy, issues };
}
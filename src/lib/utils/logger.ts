/**
 * Production-ready logging utility for SportsCoach V3
 * Replaces console.log statements with structured, configurable logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  includeStack: boolean;
  redactSensitiveData: boolean;
}

class Logger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      enableConsole: process.env.NODE_ENV !== 'test',
      enableRemote: process.env.NODE_ENV === 'production',
      includeStack: process.env.NODE_ENV === 'development',
      redactSensitiveData: process.env.NODE_ENV === 'production',
      ...config,
    };
  }

  /**
   * Logs a debug message (development only)
   * @param message - The message to log
   * @param context - Optional context (e.g., component name, function name)
   * @param data - Optional additional data
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log('debug', message, context, data);
  }

  /**
   * Logs an info message
   * @param message - The message to log
   * @param context - Optional context (e.g., component name, function name)
   * @param data - Optional additional data
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log('info', message, context, data);
  }

  /**
   * Logs a warning message
   * @param message - The message to log
   * @param context - Optional context (e.g., component name, function name)
   * @param data - Optional additional data
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log('warn', message, context, data);
  }

  /**
   * Logs an error message
   * @param message - The message to log
   * @param context - Optional context (e.g., component name, function name)
   * @param data - Optional additional data (error object, stack trace, etc.)
   */
  error(message: string, context?: string, data?: unknown): void {
    this.log('error', message, context, data);
  }

  /**
   * Logs database operations for debugging and monitoring
   * @param operation - The database operation (create, read, update, delete)
   * @param collection - The collection being operated on
   * @param id - Optional document ID
   * @param data - Optional operation data
   */
  database(
    operation: 'create' | 'read' | 'update' | 'delete' | 'query',
    collection: string,
    id?: string,
    data?: unknown
  ): void {
    const message = `Database ${operation} on ${collection}${id ? ` (${id})` : ''}`;
    this.debug(message, 'database', this.redactSensitiveData({ collection, id, data }));
  }

  /**
   * Logs authentication events
   * @param event - The auth event (login, logout, register, etc.)
   * @param userId - The user ID (will be redacted in production)
   * @param data - Optional additional data
   */
  auth(event: string, userId?: string, data?: unknown): void {
    const message = `Auth event: ${event}`;
    const logData = this.redactSensitiveData({ userId, ...data });
    this.info(message, 'auth', logData);
  }

  /**
   * Logs performance metrics
   * @param operation - The operation being measured
   * @param duration - Duration in milliseconds
   * @param context - Optional context
   * @param data - Optional additional data
   */
  performance(operation: string, duration: number, context?: string, data?: unknown): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    this.info(message, context || 'performance', { duration, ...data });
  }

  /**
   * Logs user actions for analytics
   * @param action - The user action
   * @param userId - The user ID (will be redacted in production)
   * @param data - Optional additional data
   */
  userAction(action: string, userId?: string, data?: unknown): void {
    const message = `User action: ${action}`;
    const logData = this.redactSensitiveData({ userId, ...data });
    this.info(message, 'user-action', logData);
  }

  /**
   * Core logging method
   * @private
   */
  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: this.redactSensitiveData(data),
    };

    // Add to buffer
    this.addToBuffer(entry);

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Remote logging (production)
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry);
    }
  }

  /**
   * Checks if a log level should be output
   * @private
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  /**
   * Creates a safe version of data for logging by handling circular references
   * @private
   */
  private createSafeLogData(data: any): any {
    const seen = new WeakSet();

    const replacer = (key: string, value: any) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
      }

      // Handle functions
      if (typeof value === 'function') {
        return '[Function]';
      }

      // Handle undefined
      if (value === undefined) {
        return '[Undefined]';
      }

      return value;
    };

    try {
      return JSON.parse(JSON.stringify(data, replacer));
    } catch (err) {
      return { dataType: typeof data, error: 'Could not serialize data' };
    }
  }

  /**
   * Outputs log entry to console with appropriate formatting
   * @private
   */
  private outputToConsole(entry: LogEntry): void {
    const prefix = entry.context ? `[${entry.context}]` : '';
    const message = `${prefix} ${entry.message}`;

    // Helper to safely log data
    const logWithData = (logFn: any, msg: string, data: any) => {
      if (!data) {
        logFn(msg);
        return;
      }

      if (typeof data === 'object' && !(data instanceof Error)) {
        try {
          // Test if the object can be serialized safely
          JSON.stringify(data);
          logFn(msg, data);
        } catch (err) {
          // If serialization fails, try to create a safe version
          try {
            const safeData = this.createSafeLogData(data);
            logFn(msg, safeData);
          } catch (fallbackErr) {
            logFn(msg + ' [data logging failed]');
          }
        }
      } else {
        try {
          logFn(msg, data);
        } catch (err) {
          logFn(msg + ' [data logging failed]');
        }
      }
    };

    switch (entry.level) {
      case 'debug':
        logWithData(console.debug, `🔍 ${message}`, entry.data);
        break;
      case 'info':
        logWithData(console.info, `ℹ️ ${message}`, entry.data);
        break;
      case 'warn':
        logWithData(console.warn, `⚠️ ${message}`, entry.data);
        break;
      case 'error':
        logWithData(console.error, `❌ ${message}`, entry.data);
        if (this.config.includeStack && entry.data instanceof Error) {
          console.error(entry.data.stack);
        }
        break;
    }
  }

  /**
   * Sends log entry to remote logging service
   * @private
   */
  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      if (!this.config.remoteEndpoint) return;

      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Fallback to console for remote logging errors
      console.error('Failed to send log to remote service:', error);
    }
  }

  /**
   * Adds entry to internal buffer for batch operations
   * @private
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Redacts sensitive data from log entries
   * @private
   */
  private redactSensitiveData(data: unknown): unknown {
    if (!this.config.redactSensitiveData || !data) return data;

    if (typeof data === 'string') {
      return this.redactString(data);
    }

    if (typeof data === 'object' && data !== null) {
      return this.redactObject(data as Record<string, unknown>);
    }

    return data;
  }

  /**
   * Redacts sensitive information from strings
   * @private
   */
  private redactString(str: string): string {
    // Redact email addresses
    str = str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');

    // Redact potential tokens/keys (32+ character alphanumeric strings)
    str = str.replace(/\b[a-zA-Z0-9]{32,}\b/g, '[TOKEN_REDACTED]');

    // Redact potential passwords (password= followed by non-whitespace)
    str = str.replace(/password=\S+/gi, 'password=[REDACTED]');

    return str;
  }

  /**
   * Redacts sensitive fields from objects
   * @private
   */
  private redactObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'privateKey',
      'accessToken',
      'refreshToken',
      'sessionId',
      'userId', // In production, user IDs should be redacted for privacy
    ];

    const redacted = { ...obj };

    for (const field of sensitiveFields) {
      if (field in redacted) {
        redacted[field] = '[REDACTED]';
      }
    }

    // Recursively redact nested objects
    for (const [key, value] of Object.entries(redacted)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        redacted[key] = this.redactObject(value as Record<string, unknown>);
      }
    }

    return redacted;
  }

  /**
   * Gets recent log entries from buffer
   * @param count - Number of entries to return (default: 100)
   * @param level - Optional level filter
   * @returns Array of log entries
   */
  getRecentLogs(count = 100, level?: LogLevel): LogEntry[] {
    let logs = this.logBuffer;

    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }

    return logs.slice(-count);
  }

  /**
   * Clears the log buffer
   */
  clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Updates logger configuration
   * @param newConfig - Partial configuration to merge
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current logger configuration
   * @returns Current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Create default logger instance
export const logger = new Logger();

// Export logger class for custom instances
export { Logger };

// Convenience exports for common logging patterns
export const logDatabase = logger.database.bind(logger);
export const logAuth = logger.auth.bind(logger);
export const logPerformance = logger.performance.bind(logger);
export const logUserAction = logger.userAction.bind(logger);

/**
 * Higher-order function to wrap async functions with performance logging
 * @param fn - The async function to wrap
 * @param operationName - Name of the operation for logging
 * @param context - Optional context for logging
 * @returns Wrapped function with performance logging
 */
export function withPerformanceLogging<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string,
  context?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const start = Date.now();
    try {
      const result = await fn(...args);
      const duration = Date.now() - start;
      logger.performance(operationName, duration, context);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.performance(`${operationName} (failed)`, duration, context);
      logger.error(`${operationName} failed`, context, error);
      throw error;
    }
  };
}

/**
 * Logs function entry and exit for debugging
 * @param fn - The function to wrap
 * @param functionName - Name of the function for logging
 * @param context - Optional context for logging
 * @returns Wrapped function with entry/exit logging
 */
export function withDebugLogging<T extends unknown[], R>(
  fn: (...args: T) => R,
  functionName: string,
  context?: string
): (...args: T) => R {
  return (...args: T): R => {
    logger.debug(`Entering ${functionName}`, context, { args });
    try {
      const result = fn(...args);
      logger.debug(`Exiting ${functionName}`, context, { result });
      return result;
    } catch (error) {
      logger.debug(`${functionName} threw error`, context, error);
      throw error;
    }
  };
}

/**
 * Creates a child logger with additional context
 * @param parentLogger - The parent logger instance
 * @param additionalContext - Additional context to add to all log messages
 * @returns New logger instance with combined context
 */
export function createChildLogger(parentLogger: Logger, additionalContext: string): Logger {
  const config = parentLogger.getConfig();
  const childLogger = new Logger(config);

  // Override the log method to include additional context
  const originalLog = (childLogger as any).log;
  (childLogger as any).log = function(level: LogLevel, message: string, context?: string, data?: unknown) {
    const combinedContext = context ? `${additionalContext}:${context}` : additionalContext;
    return originalLog.call(this, level, message, combinedContext, data);
  };

  return childLogger;
}
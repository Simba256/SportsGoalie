/**
 * Centralized Error Logging System
 *
 * Provides structured logging for different error types with appropriate
 * log levels and formatting based on environment.
 */

import { AuthError, ErrorSeverity } from './auth-errors';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  error?: AuthError;
  context?: Record<string, unknown>;
  timestamp: Date;
  environment: string;
}

/**
 * Error Logger Class
 */
export class ErrorLogger {
  private static instance: ErrorLogger;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log authentication errors with appropriate level
   */
  public logAuthError(error: AuthError): void {
    if (!error.shouldLog) {
      return;
    }

    const logLevel = this.getLogLevelFromSeverity(error.severity);
    const logEntry: LogEntry = {
      level: logLevel,
      message: `Authentication Error: ${error.code}`,
      error,
      context: error.toLogFormat(),
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    this.writeLog(logEntry);
  }

  /**
   * Log general errors
   */
  public logError(message: string, error?: Error, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      context: {
        error: error?.message,
        stack: error?.stack,
        ...context,
      },
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    this.writeLog(logEntry);
  }

  /**
   * Log warnings
   */
  public logWarning(message: string, context?: Record<string, unknown>): void {
    const logEntry: LogEntry = {
      level: LogLevel.WARN,
      message,
      context,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    this.writeLog(logEntry);
  }

  /**
   * Log info messages (development only)
   */
  public logInfo(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    const logEntry: LogEntry = {
      level: LogLevel.INFO,
      message,
      context,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    this.writeLog(logEntry);
  }

  /**
   * Log debug messages (development only)
   */
  public logDebug(message: string, context?: Record<string, unknown>): void {
    if (!this.isDevelopment) return;

    const logEntry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      context,
      timestamp: new Date(),
      environment: process.env.NODE_ENV || 'unknown',
    };

    this.writeLog(logEntry);
  }

  /**
   * Convert error severity to log level
   */
  private getLogLevelFromSeverity(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.LOW:
        return LogLevel.INFO;
      case ErrorSeverity.MEDIUM:
        return LogLevel.WARN;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return LogLevel.ERROR;
      default:
        return LogLevel.ERROR;
    }
  }

  /**
   * Write log entry to appropriate output
   */
  private writeLog(entry: LogEntry): void {
    const formattedEntry = this.formatLogEntry(entry);

    if (this.isDevelopment) {
      // In development, use console with colors
      this.writeToConsole(entry, formattedEntry);
    } else {
      // In production, use structured logging
      this.writeStructuredLog(formattedEntry);
    }
  }

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);

    let formatted = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      formatted += '\n' + JSON.stringify(entry.context, null, 2);
    }

    return formatted;
  }

  /**
   * Write to console with appropriate colors (development)
   */
  private writeToConsole(entry: LogEntry, formatted: string): void {
    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        if (entry.error?.stack && this.isDevelopment) {
          console.error('Stack trace:', entry.error.stack);
        }
        break;
      default:
        console.log(formatted);
    }
  }

  /**
   * Write structured log (production)
   */
  private writeStructuredLog(formatted: string): void {
    // In production, you might want to send logs to external service
    // For now, we'll use console.error for all production logs
    console.error(formatted);
  }
}

/**
 * Convenience functions for logging
 */
export const logger = ErrorLogger.getInstance();

export const logAuthError = (error: AuthError) => logger.logAuthError(error);
export const logError = (message: string, error?: Error, context?: Record<string, unknown>) =>
  logger.logError(message, error, context);
export const logWarning = (message: string, context?: Record<string, unknown>) =>
  logger.logWarning(message, context);
export const logInfo = (message: string, context?: Record<string, unknown>) =>
  logger.logInfo(message, context);
export const logDebug = (message: string, context?: Record<string, unknown>) =>
  logger.logDebug(message, context);
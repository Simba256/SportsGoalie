/**
 * Error Boundary Components and Hooks
 *
 * Provides centralized error handling for React components with
 * proper error recovery and user feedback.
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AuthError, isAuthError } from './auth-errors';
import { logError, logAuthError } from './error-logger';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | AuthError | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error | AuthError, retry: () => void) => ReactNode;
  onError?: (error: Error | AuthError, errorInfo: ErrorInfo) => void;
}

/**
 * Generic Error Boundary Component
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log the error
    if (isAuthError(error)) {
      logAuthError(error);
    } else {
      logError('React Error Boundary caught error', error, {
        componentStack: errorInfo.componentStack,
      });
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return <DefaultErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Authentication-specific Error Boundary
 */
interface AuthErrorBoundaryProps {
  children: ReactNode;
  onAuthError?: (error: AuthError) => void;
}

export class AuthErrorBoundary extends Component<AuthErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: AuthErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Only catch authentication errors
    if (isAuthError(error)) {
      return {
        hasError: true,
        error,
      };
    }

    // Re-throw non-auth errors to be caught by parent boundary
    throw error;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (isAuthError(error)) {
      this.setState({ errorInfo });
      logAuthError(error);
      this.props.onAuthError?.(error);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error && isAuthError(this.state.error)) {
      return <AuthErrorFallback error={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 */
interface ErrorFallbackProps {
  error: Error | AuthError;
  onRetry: () => void;
}

function DefaultErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-500">
            {isAuthError(error) ? error.userMessage : 'An unexpected error occurred.'}
          </p>

          {isDevelopment && (
            <details className="mt-4 text-left">
              <summary className="text-sm text-gray-600 cursor-pointer">
                Technical Details (Development)
              </summary>
              <pre className="mt-2 text-xs text-gray-800 bg-gray-100 p-2 rounded overflow-auto">
                {error.message}
                {error.stack && '\n\n' + error.stack}
              </pre>
            </details>
          )}

          <div className="mt-6 flex space-x-3">
            <button
              onClick={onRetry}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Authentication Error Fallback Component
 */
interface AuthErrorFallbackProps {
  error: AuthError;
  onRetry: () => void;
}

function AuthErrorFallback({ error, onRetry }: AuthErrorFallbackProps) {
  const shouldShowRetry = error.isRetryable;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <h3 className="text-lg font-medium text-gray-900">Authentication Issue</h3>
          <p className="mt-2 text-sm text-gray-500">{error.userMessage}</p>

          <div className="mt-6 flex space-x-3">
            {shouldShowRetry && (
              <button
                onClick={onRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => (window.location.href = '/auth/login')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-sm font-medium py-2 px-4 rounded-md transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
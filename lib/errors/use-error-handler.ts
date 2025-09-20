/**
 * Error Handling Hook
 *
 * Provides centralized error handling for React components with
 * proper error reporting and user feedback.
 */

import { useCallback, useState } from 'react';
import { AuthError, isAuthError } from './auth-errors';
import { logAuthError, logError } from './error-logger';

interface ErrorState {
  error: AuthError | Error | null;
  isRetryable: boolean;
  userMessage: string;
}

interface UseErrorHandlerReturn {
  error: ErrorState['error'];
  isRetryable: boolean;
  userMessage: string;
  hasError: boolean;
  handleError: (error: unknown) => void;
  clearError: () => void;
  retry: (retryFn: () => Promise<void> | void) => Promise<void>;
}

/**
 * Hook for handling errors in React components
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetryable: false,
    userMessage: '',
  });

  const handleError = useCallback((error: unknown) => {
    if (isAuthError(error)) {
      logAuthError(error);
      setErrorState({
        error,
        isRetryable: error.isRetryable,
        userMessage: error.userMessage,
      });
    } else if (error instanceof Error) {
      logError('Unhandled error in component', error);
      setErrorState({
        error,
        isRetryable: false,
        userMessage: 'An unexpected error occurred. Please try again.',
      });
    } else {
      logError('Unknown error type', undefined, { error });
      setErrorState({
        error: new Error('Unknown error'),
        isRetryable: false,
        userMessage: 'An unexpected error occurred. Please try again.',
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetryable: false,
      userMessage: '',
    });
  }, []);

  const retry = useCallback(
    async (retryFn: () => Promise<void> | void) => {
      clearError();
      try {
        await retryFn();
      } catch (error) {
        handleError(error);
      }
    },
    [clearError, handleError]
  );

  return {
    error: errorState.error,
    isRetryable: errorState.isRetryable,
    userMessage: errorState.userMessage,
    hasError: errorState.error !== null,
    handleError,
    clearError,
    retry,
  };
}

/**
 * Hook for handling async operations with error handling
 */
export function useAsyncOperation<T extends unknown[], R>(
  operation: (...args: T) => Promise<R>
): {
  execute: (...args: T) => Promise<R | undefined>;
  loading: boolean;
  error: AuthError | Error | null;
  userMessage: string;
  hasError: boolean;
  clearError: () => void;
  isRetryable: boolean;
} {
  const [loading, setLoading] = useState(false);
  const { error, userMessage, hasError, handleError, clearError, isRetryable } = useErrorHandler();

  const execute = useCallback(
    async (...args: T): Promise<R | undefined> => {
      try {
        setLoading(true);
        clearError();
        const result = await operation(...args);
        return result;
      } catch (error) {
        handleError(error);
        return undefined;
      } finally {
        setLoading(false);
      }
    },
    [operation, handleError, clearError]
  );

  return {
    execute,
    loading,
    error,
    userMessage,
    hasError,
    clearError,
    isRetryable,
  };
}

/**
 * Hook specifically for authentication operations
 */
export function useAuthOperation<T extends unknown[], R>(
  operation: (...args: T) => Promise<R>
): {
  execute: (...args: T) => Promise<R | undefined>;
  loading: boolean;
  authError: AuthError | null;
  error: Error | null;
  userMessage: string;
  hasError: boolean;
  clearError: () => void;
  isRetryable: boolean;
} {
  const asyncOp = useAsyncOperation(operation);

  return {
    ...asyncOp,
    authError: isAuthError(asyncOp.error) ? asyncOp.error : null,
    error: isAuthError(asyncOp.error) ? null : (asyncOp.error as Error | null),
  };
}
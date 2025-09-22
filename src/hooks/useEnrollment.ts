import { useState, useEffect, useCallback } from 'react';
import { Sport, SportProgress, ApiResponse } from '@/types';
import { enrollmentService } from '@/src/lib/database/services/enrollment.service';
import { useAuth } from '@/lib/auth/context';
import { logger } from '@/src/lib/utils/logger';

interface EnrolledSport {
  sport: Sport;
  progress: SportProgress;
}

interface UseEnrollmentReturn {
  enrolledSports: EnrolledSport[];
  loading: boolean;
  error: string | null;
  enrollInSport: (sportId: string) => Promise<boolean>;
  unenrollFromSport: (sportId: string) => Promise<boolean>;
  isEnrolled: (sportId: string) => boolean;
  refreshEnrollments: () => Promise<void>;
  getProgress: (sportId: string) => SportProgress | null;
}

/**
 * Hook for managing user sports enrollments
 */
export function useEnrollment(): UseEnrollmentReturn {
  const { user } = useAuth();
  const [enrolledSports, setEnrolledSports] = useState<EnrolledSport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's enrolled sports
  const fetchEnrolledSports = useCallback(async () => {
    if (!user?.id) {
      setEnrolledSports([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await enrollmentService.getUserEnrolledSports(user.id);

      if (result.success && result.data) {
        setEnrolledSports(result.data);
        logger.debug('Enrolled sports fetched successfully', 'useEnrollment', {
          userId: user.id,
          count: result.data.length
        });
      } else {
        setError(result.error?.message || 'Failed to fetch enrolled sports');
        logger.error('Failed to fetch enrolled sports', 'useEnrollment', {
          error: result.error?.message || 'Unknown error',
          code: result.error?.code
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('Error in fetchEnrolledSports', 'useEnrollment', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initial load
  useEffect(() => {
    fetchEnrolledSports();
  }, [fetchEnrolledSports]);

  // Enroll in a sport
  const enrollInSport = useCallback(async (sportId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const result = await enrollmentService.enrollInSport(user.id, sportId);

      if (result.success) {
        // Refresh enrollments to get updated list
        await fetchEnrolledSports();
        logger.info('Successfully enrolled in sport', 'useEnrollment', {
          userId: user.id,
          sportId
        });
        return true;
      } else {
        setError(result.error?.message || 'Failed to enroll in sport');
        logger.error('Failed to enroll in sport', 'useEnrollment', {
          error: result.error?.message || 'Unknown error',
          code: result.error?.code
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('Error in enrollInSport', 'useEnrollment', { error: errorMessage });
      return false;
    }
  }, [user?.id, fetchEnrolledSports]);

  // Unenroll from a sport
  const unenrollFromSport = useCallback(async (sportId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setError(null);
      const result = await enrollmentService.unenrollFromSport(user.id, sportId);

      if (result.success) {
        // Remove from local state immediately for better UX
        setEnrolledSports(prev => prev.filter(item => item.sport.id !== sportId));
        logger.info('Successfully unenrolled from sport', 'useEnrollment', {
          userId: user.id,
          sportId
        });
        return true;
      } else {
        setError(result.error?.message || 'Failed to unenroll from sport');
        logger.error('Failed to unenroll from sport', 'useEnrollment', {
          error: result.error?.message || 'Unknown error',
          code: result.error?.code
        });
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('Error in unenrollFromSport', 'useEnrollment', { error: errorMessage });
      return false;
    }
  }, [user?.id]);

  // Check if user is enrolled in a sport
  const isEnrolled = useCallback((sportId: string): boolean => {
    return enrolledSports.some(item => item.sport.id === sportId);
  }, [enrolledSports]);

  // Get progress for a specific sport
  const getProgress = useCallback((sportId: string): SportProgress | null => {
    const enrolledSport = enrolledSports.find(item => item.sport.id === sportId);
    return enrolledSport?.progress || null;
  }, [enrolledSports]);

  // Refresh enrollments
  const refreshEnrollments = useCallback(async () => {
    await fetchEnrolledSports();
  }, [fetchEnrolledSports]);

  return {
    enrolledSports,
    loading,
    error,
    enrollInSport,
    unenrollFromSport,
    isEnrolled,
    refreshEnrollments,
    getProgress,
  };
}

/**
 * Hook for managing a specific sport enrollment
 */
export function useSportEnrollment(sportId: string) {
  const { user } = useAuth();
  const [enrolled, setEnrolled] = useState<boolean>(false);
  const [progress, setProgress] = useState<SportProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check enrollment status and get progress
  const checkEnrollment = useCallback(async () => {
    if (!user?.id || !sportId) {
      setEnrolled(false);
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await enrollmentService.getUserSportProgress(user.id, sportId);

      if (result.success) {
        if (result.data) {
          setEnrolled(true);
          setProgress(result.data);
        } else {
          setEnrolled(false);
          setProgress(null);
        }
      } else {
        setError(result.error?.message || 'Failed to check enrollment status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user?.id, sportId]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  // Enroll in sport
  const enroll = useCallback(async (): Promise<boolean> => {
    console.log('Enroll function called, user state:', user);
    console.log('User id:', user?.id);
    console.log('User object keys:', user ? Object.keys(user) : 'no user');

    if (!user?.id) {
      console.error('Enrollment failed: No user authenticated');
      console.error('User state details:', { user, hasId: !!user?.id });
      return false;
    }

    try {
      console.log('Attempting to enroll user', user.id, 'in sport', sportId);
      const result = await enrollmentService.enrollInSport(user.id, sportId);

      console.log('Enrollment result:', result);

      if (result.success) {
        await checkEnrollment(); // Refresh status
        return true;
      } else {
        console.error('Enrollment failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      return false;
    }
  }, [user?.id, sportId, checkEnrollment]);

  // Unenroll from sport
  const unenroll = useCallback(async (): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const result = await enrollmentService.unenrollFromSport(user.id, sportId);
      if (result.success) {
        setEnrolled(false);
        setProgress(null);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [user?.id, sportId]);

  return {
    enrolled,
    progress,
    loading,
    error,
    enroll,
    unenroll,
    refresh: checkEnrollment,
  };
}
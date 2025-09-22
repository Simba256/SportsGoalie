'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { ProgressService } from '@/lib/database/services/progress.service';
import { UserProgress, SportProgress, SkillProgress, UserAchievement, Achievement } from '@/types';

export function useProgress() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const result = await ProgressService.getUserProgress(user.id);

        if (result.success) {
          setUserProgress(result.data);
          setError(null);
        } else {
          setError(result.error?.message || 'Failed to fetch progress');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id]);

  const updateStreak = async () => {
    if (!user?.id) return;

    try {
      const result = await ProgressService.updateStreak(user.id);
      if (result.success) {
        // Refresh user progress
        const progressResult = await ProgressService.getUserProgress(user.id);
        if (progressResult.success) {
          setUserProgress(progressResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  };

  const recordQuizCompletion = async (
    quizId: string,
    skillId: string,
    sportId: string,
    score: number,
    timeSpent: number,
    passed: boolean
  ) => {
    if (!user?.id) return;

    try {
      await ProgressService.recordQuizCompletion(
        user.id,
        quizId,
        skillId,
        sportId,
        score,
        timeSpent,
        passed
      );

      // Refresh user progress
      const progressResult = await ProgressService.getUserProgress(user.id);
      if (progressResult.success) {
        setUserProgress(progressResult.data);
      }
    } catch (error) {
      console.error('Failed to record quiz completion:', error);
    }
  };

  return {
    userProgress,
    loading,
    error,
    updateStreak,
    recordQuizCompletion,
    refresh: async () => {
      if (user?.id) {
        const result = await ProgressService.getUserProgress(user.id);
        if (result.success) {
          setUserProgress(result.data);
        }
      }
    }
  };
}

export function useSportProgress(sportId: string) {
  const { user } = useAuth();
  const [sportProgress, setSportProgress] = useState<SportProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !sportId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const result = await ProgressService.getSportProgress(user.id, sportId);

        if (result.success) {
          setSportProgress(result.data);
          setError(null);
        } else {
          setError(result.error?.message || 'Failed to fetch sport progress');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, sportId]);

  const updateProgress = async (updates: Partial<SportProgress>) => {
    if (!user?.id || !sportId) return;

    try {
      const result = await ProgressService.updateSportProgress(user.id, sportId, updates);
      if (result.success) {
        setSportProgress(result.data);
      }
    } catch (error) {
      console.error('Failed to update sport progress:', error);
    }
  };

  return {
    sportProgress,
    loading,
    error,
    updateProgress
  };
}

export function useSkillProgress(skillId: string, sportId: string) {
  const { user } = useAuth();
  const [skillProgress, setSkillProgress] = useState<SkillProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !skillId) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);
        const result = await ProgressService.getSkillProgress(user.id, skillId);

        if (result.success) {
          setSkillProgress(result.data);
          setError(null);
        } else {
          setError(result.error?.message || 'Failed to fetch skill progress');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user?.id, skillId]);

  const updateProgress = async (updates: Partial<SkillProgress>) => {
    if (!user?.id || !skillId || !sportId) return;

    try {
      const result = await ProgressService.updateSkillProgress(user.id, skillId, sportId, updates);
      if (result.success) {
        setSkillProgress(result.data);
      }
    } catch (error) {
      console.error('Failed to update skill progress:', error);
    }
  };

  return {
    skillProgress,
    loading,
    error,
    updateProgress
  };
}

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);

        // Fetch available achievements
        const achievementsResult = await ProgressService.getAvailableAchievements();
        if (achievementsResult.success) {
          setAchievements(achievementsResult.data || []);
        }

        // Fetch user achievements if user is logged in
        if (user?.id) {
          const userAchievementsResult = await ProgressService.getUserAchievements(user.id);
          if (userAchievementsResult.success) {
            setUserAchievements(userAchievementsResult.data || []);
          }
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch achievements');
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user?.id]);

  const awardAchievement = async (achievementId: string) => {
    if (!user?.id) return;

    try {
      const result = await ProgressService.awardAchievement(user.id, achievementId);
      if (result.success) {
        // Refresh user achievements
        const userAchievementsResult = await ProgressService.getUserAchievements(user.id);
        if (userAchievementsResult.success) {
          setUserAchievements(userAchievementsResult.data || []);
        }
      }
    } catch (error) {
      console.error('Failed to award achievement:', error);
    }
  };

  return {
    achievements,
    userAchievements,
    loading,
    error,
    awardAchievement
  };
}
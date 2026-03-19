'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { videoQuizService } from '@/lib/database';
import { VideoQuizProgress } from '@/types/video-quiz';

export function useRecentQuizzes(limit = 5) {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<VideoQuizProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setQuizzes([]);
      setLoading(false);
      return;
    }

    const fetchRecentQuizzes = async () => {
      try {
        setLoading(true);
        const result = await videoQuizService.getUserVideoQuizAttempts(user.id, {
          completed: true,
          limit,
        });

        if (result.success && result.data?.items) {
          setQuizzes(result.data.items);
        }
      } catch {
        // Silently fail - dashboard still works without recent quizzes
      } finally {
        setLoading(false);
      }
    };

    fetchRecentQuizzes();
  }, [user?.id, limit]);

  return { quizzes, loading };
}

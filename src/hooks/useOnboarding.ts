import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { onboardingService } from '@/lib/database';
import {
  OnboardingEvaluation,
  OnboardingQuestion,
  AssessmentResponse,
  PillarSlug,
  PILLARS,
} from '@/types';
import { getQuestionsByPillar } from '@/data/onboarding-questions';
import { logger } from '@/lib/utils/logger';

export type OnboardingPhase =
  | 'loading'
  | 'welcome'
  | 'pillar_intro'
  | 'question'
  | 'results'
  | 'complete';

interface UseOnboardingOptions {
  userId: string | null;
  studentName?: string;
  enabled?: boolean;
}

interface UseOnboardingReturn {
  // State
  phase: OnboardingPhase;
  loading: boolean;
  error: string | null;
  evaluation: OnboardingEvaluation | null;

  // Current position
  currentPillarIndex: number;
  currentQuestionIndex: number;
  currentPillar: typeof PILLARS[number] | null;
  currentQuestion: OnboardingQuestion | null;

  // Progress
  completedPillars: PillarSlug[];
  questionProgress: { current: number; total: number };
  pillarQuestions: OnboardingQuestion[];

  // Actions
  beginEvaluation: () => void;
  startPillar: () => void;
  answerQuestion: (value: string | number, points: number) => Promise<void>;
  completeEvaluation: () => Promise<void>;
  goToDashboard: () => void;
}

/**
 * Hook for managing the onboarding evaluation flow.
 */
export function useOnboarding({
  userId,
  studentName: _studentName,
  enabled = true,
}: UseOnboardingOptions): UseOnboardingReturn {
  const router = useRouter();

  // State
  const [phase, setPhase] = useState<OnboardingPhase>('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<OnboardingEvaluation | null>(null);

  // Current position
  const [currentPillarIndex, setCurrentPillarIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Get questions organized by pillar
  const questionsByPillar = useMemo(() => getQuestionsByPillar(), []);

  // Derived state
  const currentPillar = currentPillarIndex < PILLARS.length
    ? PILLARS[currentPillarIndex]
    : null;

  const pillarQuestions = currentPillar
    ? questionsByPillar[currentPillar.slug] || []
    : [];

  const currentQuestion = currentQuestionIndex < pillarQuestions.length
    ? pillarQuestions[currentQuestionIndex]
    : null;

  const completedPillars = useMemo(() => {
    const completed: PillarSlug[] = [];
    if (!evaluation) return completed;

    for (let i = 0; i < currentPillarIndex; i++) {
      completed.push(PILLARS[i].slug);
    }
    return completed;
  }, [evaluation, currentPillarIndex]);

  const questionProgress = useMemo(() => {
    let total = 0;
    let current = 0;

    // Count total questions across all pillars
    for (const pillar of PILLARS) {
      const questions = questionsByPillar[pillar.slug] || [];
      total += questions.length;
    }

    // Count completed questions
    for (let i = 0; i < currentPillarIndex; i++) {
      const pillarQuestions = questionsByPillar[PILLARS[i].slug] || [];
      current += pillarQuestions.length;
    }
    current += currentQuestionIndex;

    return { current, total };
  }, [questionsByPillar, currentPillarIndex, currentQuestionIndex]);

  // Load or create evaluation
  useEffect(() => {
    if (!enabled || !userId) {
      setLoading(false);
      return;
    }

    loadEvaluation();
  }, [enabled, userId]);

  const loadEvaluation = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Try to get existing evaluation
      const result = await onboardingService.getEvaluation(userId);

      if (result.success && result.data) {
        setEvaluation(result.data);

        // Resume from saved position if in progress
        if (result.data.status === 'in_progress') {
          setCurrentPillarIndex(result.data.currentPillarIndex);
          setCurrentQuestionIndex(result.data.currentQuestionIndex);

          // Determine phase based on position
          if (result.data.currentPillarIndex === 0 && result.data.currentQuestionIndex === 0) {
            setPhase('welcome');
          } else {
            // Check if we need to show pillar intro or continue with questions
            const pillarQuestions = questionsByPillar[PILLARS[result.data.currentPillarIndex]?.slug] || [];
            if (result.data.currentQuestionIndex === 0) {
              setPhase('pillar_intro');
            } else if (result.data.currentQuestionIndex < pillarQuestions.length) {
              setPhase('question');
            } else {
              // Move to next pillar
              setCurrentPillarIndex(prev => prev + 1);
              setCurrentQuestionIndex(0);
              setPhase('pillar_intro');
            }
          }
        } else if (result.data.status === 'completed' || result.data.status === 'reviewed') {
          setPhase('results');
        }
      } else {
        // Create new evaluation
        const createResult = await onboardingService.createEvaluation(userId);
        if (createResult.success && createResult.data) {
          setEvaluation(createResult.data);
          setPhase('welcome');
        } else {
          setError('Failed to create evaluation');
        }
      }
    } catch (err) {
      logger.error('Failed to load onboarding evaluation', 'useOnboarding', err);
      setError('Failed to load evaluation');
    } finally {
      setLoading(false);
    }
  };

  const beginEvaluation = useCallback(() => {
    setCurrentPillarIndex(0);
    setCurrentQuestionIndex(0);
    setPhase('pillar_intro');
  }, []);

  const startPillar = useCallback(() => {
    setPhase('question');
  }, []);

  const answerQuestion = useCallback(async (value: string | number, points: number) => {
    if (!evaluation || !currentQuestion || !currentPillar) {
      logger.error('Cannot answer question - missing evaluation or question', 'useOnboarding');
      return;
    }

    try {
      const response: AssessmentResponse = {
        questionId: currentQuestion.id,
        pillarSlug: currentPillar.slug,
        questionType: currentQuestion.type,
        value,
        points,
        maxPoints: currentQuestion.maxPoints,
        answeredAt: Timestamp.now(),
      };

      // Calculate next position
      let nextPillarIndex = currentPillarIndex;
      let nextQuestionIndex = currentQuestionIndex + 1;

      // Check if we're done with current pillar
      if (nextQuestionIndex >= pillarQuestions.length) {
        nextPillarIndex = currentPillarIndex + 1;
        nextQuestionIndex = 0;
      }

      // Save response with next position
      await onboardingService.saveResponse(
        evaluation.id,
        response,
        nextPillarIndex,
        nextQuestionIndex
      );

      // Update local state
      setEvaluation(prev => prev ? {
        ...prev,
        responses: [...prev.responses.filter(r => r.questionId !== response.questionId), response],
        currentPillarIndex: nextPillarIndex,
        currentQuestionIndex: nextQuestionIndex,
      } : null);

      // Transition to next state
      if (nextPillarIndex >= PILLARS.length) {
        // All pillars complete - show results
        await completeEvaluationInternal();
      } else if (nextQuestionIndex === 0 && nextPillarIndex > currentPillarIndex) {
        // New pillar - show intro
        setCurrentPillarIndex(nextPillarIndex);
        setCurrentQuestionIndex(0);
        setPhase('pillar_intro');
      } else {
        // Next question in same pillar
        setCurrentQuestionIndex(nextQuestionIndex);
      }
    } catch (err) {
      logger.error('Failed to save response', 'useOnboarding', err);
      setError('Failed to save your answer. Please try again.');
    }
  }, [evaluation, currentQuestion, currentPillar, currentPillarIndex, currentQuestionIndex, pillarQuestions.length]);

  const completeEvaluationInternal = async () => {
    if (!userId || !evaluation) return;

    try {
      setLoading(true);
      const result = await onboardingService.completeEvaluation(userId);

      if (result.success && result.data) {
        setEvaluation(result.data);
        setPhase('results');
      } else {
        setError('Failed to complete evaluation');
      }
    } catch (err) {
      logger.error('Failed to complete evaluation', 'useOnboarding', err);
      setError('Failed to complete evaluation');
    } finally {
      setLoading(false);
    }
  };

  const completeEvaluation = useCallback(async () => {
    await completeEvaluationInternal();
  }, [userId, evaluation]);

  const goToDashboard = useCallback(() => {
    setPhase('complete');
    router.push('/dashboard');
  }, [router]);

  return {
    phase,
    loading,
    error,
    evaluation,
    currentPillarIndex,
    currentQuestionIndex,
    currentPillar,
    currentQuestion,
    completedPillars,
    questionProgress,
    pillarQuestions,
    beginEvaluation,
    startPillar,
    answerQuestion,
    completeEvaluation,
    goToDashboard,
  };
}

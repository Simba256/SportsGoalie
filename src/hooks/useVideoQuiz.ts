import { useState, useCallback, useRef, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import {
  VideoQuiz,
  VideoQuizProgress,
  VideoQuestionAnswer,
  VideoQuizQuestionWithState,
} from '@/types';

interface UseVideoQuizOptions {
  quiz: VideoQuiz;
  initialProgress?: VideoQuizProgress;
  userId: string;
  onSave?: (progress: VideoQuizProgress) => Promise<void>;
  autoSaveInterval?: number; // milliseconds
}

export const useVideoQuiz = ({
  quiz,
  initialProgress,
  userId,
  onSave,
  autoSaveInterval = 30000, // 30 seconds
}: UseVideoQuizOptions) => {
  const [progress, setProgress] = useState<VideoQuizProgress>(() => {
    if (initialProgress) {
      return initialProgress;
    }

    // Create initial progress
    return {
      id: `progress_${userId}_${quiz.id}`,
      userId,
      videoQuizId: quiz.id,
      skillId: quiz.skillId,
      sportId: quiz.sportId,
      currentTime: 0,
      questionsAnswered: [],
      questionsRemaining: quiz.questions.length,
      score: 0,
      maxScore: quiz.questions.reduce((sum, q) => sum + q.points, 0),
      percentage: 0,
      passed: false,
      isCompleted: false,
      status: 'in-progress',
      attemptNumber: 1,
      startedAt: Timestamp.now(),
      watchTime: 0,
      totalTimeSpent: 0,
    };
  });

  const [questionsWithState, setQuestionsWithState] = useState<VideoQuizQuestionWithState[]>(() =>
    quiz.questions.map((q) => ({
      ...q,
      answered: initialProgress?.questionsAnswered.some((a) => a.questionId === q.id) || false,
    }))
  );

  const watchStartTime = useRef<number>(Date.now());
  const lastSaveTime = useRef<number>(Date.now());

  // Check if answer is correct
  const checkAnswer = useCallback(
    (questionId: string, answer: string | string[]): { isCorrect: boolean; pointsEarned: number } => {
      const question = quiz.questions.find((q) => q.id === questionId);
      if (!question) {
        return { isCorrect: false, pointsEarned: 0 };
      }

      let isCorrect = false;

      switch (question.type) {
        case 'multiple_choice': {
          if (!question.options) break;

          const correctOptions = question.options.filter((opt) => opt.isCorrect);

          if (question.options.some((opt) => opt.allowMultiple)) {
            // Multiple selection
            const answerArray = Array.isArray(answer) ? answer : [answer];
            const correctIds = correctOptions.map((opt) => opt.id);
            isCorrect =
              answerArray.length === correctIds.length &&
              answerArray.every((id) => correctIds.includes(id));
          } else {
            // Single selection
            isCorrect = correctOptions.some((opt) => opt.id === answer);
          }
          break;
        }

        case 'true_false': {
          isCorrect = String(question.correctAnswer) === String(answer);
          break;
        }

        case 'fill_in_blank': {
          if (!question.correctAnswers) break;

          const answers = Array.isArray(answer) ? answer : [answer];
          isCorrect = question.correctAnswers.every((correct, index) => {
            const userAnswer = answers[index];
            if (!userAnswer) return false;

            if (question.caseSensitive) {
              return userAnswer.trim() === correct.trim();
            }
            return userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();
          });
          break;
        }

        case 'descriptive': {
          // For descriptive questions, we'll need AI grading
          // For now, mark as needing review
          isCorrect = false; // Will be graded by AI or manually
          break;
        }

        default:
          isCorrect = false;
      }

      return {
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      };
    },
    [quiz.questions]
  );

  // Handle question answer
  const handleQuestionAnswer = useCallback(
    (questionId: string, answer: string | string[]) => {
      const question = quiz.questions.find((q) => q.id === questionId);
      if (!question) return;

      const { isCorrect, pointsEarned } = checkAnswer(questionId, answer);

      const questionAnswer: VideoQuestionAnswer = {
        questionId,
        questionType: question.type,
        timestamp: question.timestamp,
        answer,
        isCorrect,
        pointsEarned,
        timeToAnswer: 0, // Can be calculated if needed
        answeredAt: Timestamp.now(),
      };

      setProgress((prev) => {
        const newQuestionsAnswered = [...prev.questionsAnswered, questionAnswer];
        const newScore = newQuestionsAnswered.reduce((sum, a) => sum + a.pointsEarned, 0);
        const newPercentage = (newScore / prev.maxScore) * 100;

        return {
          ...prev,
          questionsAnswered: newQuestionsAnswered,
          questionsRemaining: prev.questionsRemaining - 1,
          score: newScore,
          percentage: newPercentage,
          passed: newPercentage >= quiz.settings.passingScore,
        };
      });

      // Update question state
      setQuestionsWithState((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? {
                ...q,
                answered: true,
                userAnswer: answer,
                isCorrect,
              }
            : q
        )
      );
    },
    [quiz.questions, quiz.settings.passingScore, checkAnswer]
  );

  // Update video progress
  const updateVideoProgress = useCallback((currentTime: number) => {
    setProgress((prev) => ({
      ...prev,
      currentTime,
    }));
  }, []);

  // Calculate watch time
  const updateWatchTime = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - watchStartTime.current) / 1000; // Convert to seconds

    setProgress((prev) => ({
      ...prev,
      watchTime: prev.watchTime + elapsed,
      totalTimeSpent: prev.totalTimeSpent + elapsed,
    }));

    watchStartTime.current = now;
  }, []);

  // Complete quiz
  const completeQuiz = useCallback(() => {
    updateWatchTime();

    setProgress((prev) => {
      const finalProgress = {
        ...prev,
        isCompleted: true,
        status: 'submitted' as const,
        completedAt: Timestamp.now(),
      };

      // Save final progress
      if (onSave) {
        onSave(finalProgress);
      }

      return finalProgress;
    });
  }, [updateWatchTime, onSave]);

  // Check if question is answered
  const isQuestionAnswered = useCallback(
    (questionId: string) => {
      return progress.questionsAnswered.some((a) => a.questionId === questionId);
    },
    [progress.questionsAnswered]
  );

  // Auto-save progress periodically
  useEffect(() => {
    if (!onSave) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSaveTime.current >= autoSaveInterval) {
        updateWatchTime();
        onSave(progress);
        lastSaveTime.current = now;
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [progress, onSave, autoSaveInterval, updateWatchTime]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      if (onSave && !progress.isCompleted) {
        updateWatchTime();
        onSave(progress);
      }
    };
  }, [progress, onSave, updateWatchTime]);

  return {
    progress,
    questionsWithState,
    handleQuestionAnswer,
    updateVideoProgress,
    updateWatchTime,
    completeQuiz,
    isQuestionAnswered,
  };
};

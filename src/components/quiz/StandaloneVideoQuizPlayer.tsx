'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { VideoQuiz, VideoQuizProgress, VideoQuizQuestionWithState, VideoQuestionAnswer } from '@/types';
import { QuestionOverlay } from './QuestionOverlay';
import { VideoControls } from './VideoControls';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

interface StandaloneVideoQuizPlayerProps {
  quiz: VideoQuiz;
  userId: string;
  initialProgress?: VideoQuizProgress;
  onComplete: (progress: VideoQuizProgress) => void;
}

/**
 * STANDALONE VIDEO QUIZ PLAYER
 *
 * This component is completely self-contained and manages its own state.
 * It does NOT rely on external hooks or state management that could cause
 * re-renders and infinite loops.
 *
 * Key principles:
 * 1. All question data is stored in refs and NEVER causes re-renders
 * 2. Only UI state (playing, overlay visibility) causes re-renders
 * 3. Questions are processed once on mount and stored in a ref
 * 4. No external dependencies that could change and cause re-renders
 */
export const StandaloneVideoQuizPlayer: React.FC<StandaloneVideoQuizPlayerProps> = ({
  quiz,
  userId,
  initialProgress,
  onComplete,
}) => {
  // Player ref
  const playerRef = useRef<ReactPlayer>(null);

  // Static data refs - these NEVER change after initialization
  const questionsRef = useRef<VideoQuizQuestionWithState[]>([]);
  const progressRef = useRef<VideoQuizProgress>(null!);
  const answeredQuestionsRef = useRef<Set<string>>(new Set());
  const shownQuestionsRef = useRef<Set<string>>(new Set());

  // Dynamic tracking refs
  const currentTimeRef = useRef(0);
  const isProcessingRef = useRef(false);
  const videoEndedRef = useRef(false);
  const allQuestionsAnsweredRef = useRef(false);

  // UI State - minimal, only what affects rendering
  const [isReady, setIsReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [overlayQuestion, setOverlayQuestion] = useState<VideoQuizQuestionWithState | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Initialize data ONCE on mount
  useEffect(() => {
    console.log('🎬 Initializing standalone player with quiz:', quiz.id);

    // Initialize questions
    questionsRef.current = quiz.questions.map(q => ({
      ...q,
      answered: false,
      userAnswer: undefined,
      isCorrect: undefined,
    }));

    // Initialize progress
    progressRef.current = initialProgress || {
      id: `progress_${userId}_${quiz.id}`,
      userId,
      videoQuizId: quiz.id,
      skillId: quiz.skillId,
      sportId: quiz.sportId,
      currentTime: 0,
      questionsAnswered: [],
      questionsRemaining: quiz.questions.length,
      score: 0,
      maxScore: quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
      percentage: 0,
      isCompleted: false,
      status: 'in-progress',
      startedAt: Timestamp.now(),
      watchTime: 0,
      totalTimeSpent: 0,
    };

    console.log('✅ Initialized with', questionsRef.current.length, 'questions');
  }, []); // Empty deps - only run once on mount

  // Check if quiz should complete (both conditions must be met)
  const checkAndCompleteQuiz = useCallback(() => {
    if (videoEndedRef.current && allQuestionsAnsweredRef.current) {
      console.log('🎉 Quiz complete - both video ended and all questions answered!');
      progressRef.current.isCompleted = true;
      progressRef.current.status = 'submitted';
      progressRef.current.completedAt = Timestamp.now();

      setTimeout(() => {
        onComplete(progressRef.current);
      }, 1000);
    } else {
      console.log('📋 Completion check:', {
        videoEnded: videoEndedRef.current,
        allQuestionsAnswered: allQuestionsAnsweredRef.current,
        answeredCount: answeredQuestionsRef.current.size,
        totalQuestions: questionsRef.current.length,
      });
    }
  }, [onComplete]);

  // Progress handler - called by ReactPlayer
  const handleProgress = useCallback((state: OnProgressProps) => {
    const currentSeconds = state.playedSeconds;
    currentTimeRef.current = currentSeconds;

    // Update display time for UI
    setDisplayTime(Math.floor(currentSeconds));

    // Don't check questions if we're already showing one or processing
    if (overlayQuestion || isProcessingRef.current) {
      return;
    }

    // Check for questions at current time
    const questions = questionsRef.current;
    for (const question of questions) {
      // Skip if already shown or answered
      if (shownQuestionsRef.current.has(question.id) || answeredQuestionsRef.current.has(question.id)) {
        continue;
      }

      // Check if we're at this question's timestamp (within 0.5 seconds)
      const timeDiff = Math.abs(currentSeconds - question.timestamp);
      if (timeDiff < 0.5) {
        console.log('📍 Triggering question at', currentSeconds, '- Question:', question.id);

        // Mark as processing to prevent double-triggering
        isProcessingRef.current = true;
        shownQuestionsRef.current.add(question.id);

        // Use setTimeout to defer state updates and avoid React batching issues
        setTimeout(() => {
          setPlaying(false);
          setOverlayQuestion(question);
          isProcessingRef.current = false;
        }, 0);

        break; // Only show one question at a time
      }
    }
  }, [overlayQuestion]); // Only depend on overlayQuestion presence

  // Handle question answer
  const handleAnswer = useCallback((answer: string | string[]) => {
    if (!overlayQuestion) return;

    console.log('✅ Question answered:', overlayQuestion.id, 'Answer:', answer);

    // Mark as answered
    answeredQuestionsRef.current.add(overlayQuestion.id);

    // Calculate if correct
    let isCorrect = false;
    let pointsEarned = 0;

    const question = overlayQuestion;
    switch (question.type) {
      case 'multiple_choice':
        if (question.options) {
          const correctOptions = question.options.filter(opt => opt.isCorrect);
          if (Array.isArray(answer)) {
            const correctIds = correctOptions.map(opt => opt.id);
            isCorrect = answer.length === correctIds.length &&
                       answer.every(id => correctIds.includes(id));
          } else {
            isCorrect = correctOptions.some(opt => opt.id === answer);
          }
        }
        break;

      case 'true_false':
        isCorrect = String(question.correctAnswer) === String(answer);
        break;

      case 'fill_in_blank':
        if (question.correctAnswers) {
          const answers = Array.isArray(answer) ? answer : [answer];
          isCorrect = question.correctAnswers.every((correct, index) => {
            const userAnswer = answers[index];
            if (!userAnswer) return false;
            return question.caseSensitive
              ? userAnswer.trim() === correct.trim()
              : userAnswer.trim().toLowerCase() === correct.trim().toLowerCase();
          });
        }
        break;
    }

    if (isCorrect) {
      pointsEarned = question.points || 0;
    }

    // Update progress ref (not state!)
    const questionAnswer: VideoQuestionAnswer = {
      questionId: overlayQuestion.id,
      questionType: question.type,
      timestamp: question.timestamp,
      answer,
      isCorrect,
      pointsEarned,
      timeToAnswer: 0,
      answeredAt: Timestamp.now(),
    };

    progressRef.current.questionsAnswered.push(questionAnswer);
    progressRef.current.questionsRemaining--;
    progressRef.current.score += pointsEarned;
    progressRef.current.percentage = (progressRef.current.score / progressRef.current.maxScore) * 100;

    // Update answered count for UI
    setAnsweredCount(prev => prev + 1);

    // Hide overlay and resume
    setOverlayQuestion(null);
    setTimeout(() => setPlaying(true), 100);

    // Check if all questions are answered
    if (answeredQuestionsRef.current.size >= questionsRef.current.length) {
      console.log('✅ All questions answered');
      allQuestionsAnsweredRef.current = true;

      // Check if we should complete the quiz (both conditions)
      checkAndCompleteQuiz();
    }
  }, [overlayQuestion, checkAndCompleteQuiz]);

  // Video event handlers
  const handleReady = useCallback(() => {
    console.log('✅ Video ready');
    setIsReady(true);

    if (initialProgress?.currentTime && initialProgress.currentTime > 0) {
      playerRef.current?.seekTo(initialProgress.currentTime, 'seconds');
    }
  }, [initialProgress?.currentTime]);

  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    console.log('🎬 Video ended');
    videoEndedRef.current = true;

    const unanswered = questionsRef.current.filter(
      q => !answeredQuestionsRef.current.has(q.id)
    );

    if (unanswered.length > 0) {
      console.log(`⚠️ ${unanswered.length} unanswered questions remaining`);
      // Don't complete yet - user needs to answer all questions
      toast.warning(`Please answer ${unanswered.length} remaining question(s) to complete the quiz`);

      // If there are unanswered questions, we might want to show them
      // For now, we'll just wait for the user to seek back
    } else {
      // All questions answered and video ended
      allQuestionsAnsweredRef.current = true;
      checkAndCompleteQuiz();
    }
  }, [checkAndCompleteQuiz]);

  // Handle seeking
  const handleSeek = useCallback((seconds: number) => {
    currentTimeRef.current = seconds;
    playerRef.current?.seekTo(seconds, 'seconds');
  }, []);

  // Start quiz
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setPlaying(true);
  }, []);

  // Calculate question number for overlay
  const questionNumber = overlayQuestion
    ? questionsRef.current.findIndex(q => q.id === overlayQuestion.id) + 1
    : 0;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="relative aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={quiz.videoUrl}
          playing={playing}
          controls={false}
          width="100%"
          height="100%"
          progressInterval={500}
          onProgress={handleProgress}
          onReady={handleReady}
          onDuration={handleDuration}
          onEnded={handleEnded}
          config={{
            file: {
              attributes: {
                preload: 'auto',
                playsInline: true,
              },
            },
          }}
        />

        {/* Loading */}
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        )}

        {/* Start Button */}
        {isReady && !hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <button
              onClick={handleStart}
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold"
            >
              Start Quiz
            </button>
          </div>
        )}

        {/* Question Overlay */}
        {overlayQuestion && (
          <QuestionOverlay
            question={overlayQuestion}
            questionNumber={questionNumber}
            totalQuestions={questionsRef.current.length}
            onAnswer={handleAnswer}
          />
        )}
      </div>

      {/* Controls */}
      {hasStarted && (
        <VideoControls
          playing={playing}
          playbackRate={1}
          currentTime={displayTime}
          duration={duration}
          onPlayPause={() => setPlaying(!playing)}
          onSeek={handleSeek}
          disabled={!!overlayQuestion}
        />
      )}

      {/* Progress indicator */}
      {quiz.settings.showProgressBar && (
        <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs">
          {answeredCount} / {questionsRef.current.length} answered
        </div>
      )}
    </div>
  );
};
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { VideoQuizPlayerProps, VideoQuizQuestionWithState } from '@/types';
import { QuestionOverlay } from './QuestionOverlay';
import { VideoControls } from './VideoControls';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const VideoQuizPlayer: React.FC<VideoQuizPlayerProps> = ({
  videoUrl,
  questions,
  settings,
  initialTime = 0,
  onQuestionAnswer,
  onProgressUpdate,
  onComplete,
}) => {
  console.log('🎬 [VideoQuizPlayer] Component initialized:', {
    videoUrl,
    questionsReceived: questions,
    questionsCount: questions?.length,
    firstQuestion: questions?.[0],
    settings,
  });
  const playerRef = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuizQuestionWithState | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [initialPlayStarted, setInitialPlayStarted] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0); // Track answered count in state

  const lastCheckedTime = useRef(0);
  const triggeredQuestions = useRef(new Set<string>());
  const questionsRef = useRef(questions);
  const isProcessingQuestion = useRef(false); // Prevent multiple triggers

  // Update questions ref when prop changes
  useEffect(() => {
    console.log('🔄 [VideoQuizPlayer] Questions prop changed:', {
      questionsCount: questions?.length,
      firstQuestion: questions?.[0],
    });
    questionsRef.current = questions;
    // Clear triggered questions when new questions arrive
    if (questions && questions.length > 0) {
      triggeredQuestions.current.clear();
      isProcessingQuestion.current = false;
      // Update answered count based on questions prop
      const answered = questions.filter(q => q.answered).length;
      setAnsweredCount(answered);
    }
  }, [questions]);

  // Seek to initial time when player is ready
  useEffect(() => {
    if (loadingState === 'ready' && initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  }, [loadingState, initialTime]);

  // Check for question triggers during playback
  const handleProgress = useCallback(
    (state: OnProgressProps) => {
      const currentSeconds = state.playedSeconds;
      const currentQuestions = questionsRef.current; // Use ref instead of prop

      // Update current time for UI display (throttled to reduce re-renders)
      setCurrentTime((prev) => {
        // Only update if difference is significant (> 0.1 seconds)
        if (Math.abs(prev - currentSeconds) > 0.1) {
          return currentSeconds;
        }
        return prev;
      });

      // Report progress to parent
      if (onProgressUpdate) {
        onProgressUpdate(currentSeconds, duration);
      }

      // Early returns to prevent processing
      if (!currentQuestions || currentQuestions.length === 0) {
        return;
      }

      // If we're already processing a question, don't check for new ones
      // Use ref instead of state to avoid dependency issues
      if (isProcessingQuestion.current) {
        return;
      }

      // Debug logging every 5 seconds
      if (Math.floor(currentSeconds) % 5 === 0 && Math.floor(currentSeconds) !== lastCheckedTime.current) {
        lastCheckedTime.current = Math.floor(currentSeconds);
        console.log('⏰ [VideoQuizPlayer] Progress check:', {
          currentSeconds,
          questionsCount: currentQuestions.length,
          triggeredCount: triggeredQuestions.current.size,
          isProcessing: isProcessingQuestion.current,
        });
      }

      // Check each question to see if we've reached its timestamp
      for (const question of currentQuestions) {
        // Skip if already triggered or answered
        if (triggeredQuestions.current.has(question.id) || question.answered) {
          continue;
        }

        // Check if we've reached this question's timestamp (with 0.5 second tolerance)
        const timeDiff = Math.abs(currentSeconds - question.timestamp);
        if (timeDiff < 0.5) {
          console.log('🎯 [VideoQuizPlayer] Question timestamp reached:', {
            questionId: question.id,
            timestamp: question.timestamp,
            currentTime: currentSeconds,
            timeDiff,
          });

          // Mark as processing immediately to prevent re-triggers
          isProcessingQuestion.current = true;
          triggeredQuestions.current.add(question.id);

          // Pause the video and show the question
          setPlaying(false);
          setCurrentQuestion(question);
          setShowOverlay(true);

          // Stop checking other questions
          break;
        }
      }
    },
    [duration, onProgressUpdate] // Remove showOverlay from dependencies!
  );

  // Handle question answer submission
  const handleAnswerSubmit = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;

      console.log('✅ [VideoQuizPlayer] Question answered:', {
        questionId: currentQuestion.id,
        answer,
      });

      // Call parent handler
      onQuestionAnswer(currentQuestion.id, answer);

      // Update answered count
      setAnsweredCount(prev => prev + 1);

      // Hide overlay and resume playback
      setShowOverlay(false);
      setCurrentQuestion(null);
      isProcessingQuestion.current = false; // Reset processing flag
      setPlaying(true);

      // Check if all questions are answered using ref
      const allQuestions = questionsRef.current;
      const allAnswered = allQuestions.every(
        (q) => q.answered || triggeredQuestions.current.has(q.id)
      );

      if (allAnswered && onComplete) {
        console.log('🏁 [VideoQuizPlayer] All questions answered, completing quiz');
        // Wait a moment before completing to allow video to continue
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    },
    [currentQuestion, onQuestionAnswer, onComplete]
  );

  // Handle seeking - check if user skipped past a question
  const handleSeek = useCallback(
    (time: number) => {
      if (settings.requireSequentialAnswers) {
        const currentQuestions = questionsRef.current;

        // Find any unanswered questions before the seek time
        const unansweredBefore = currentQuestions.find(
          (q) =>
            !q.answered &&
            !triggeredQuestions.current.has(q.id) &&
            q.timestamp < time
        );

        if (unansweredBefore) {
          // Force user to answer the question first
          playerRef.current?.seekTo(unansweredBefore.timestamp, 'seconds');
          isProcessingQuestion.current = true;
          triggeredQuestions.current.add(unansweredBefore.id);
          setPlaying(false);
          setCurrentQuestion(unansweredBefore);
          setShowOverlay(true);
          toast.info('Please answer this question first');
          return;
        }
      }

      playerRef.current?.seekTo(time, 'seconds');
    },
    [settings.requireSequentialAnswers]
  );

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback(
    (rate: number) => {
      // Check if settings exist and allow speed change
      if (!settings || settings.allowPlaybackSpeedChange === false) {
        toast.info('Playback speed change is disabled for this quiz');
        return;
      }
      setPlaybackRate(rate);
    },
    [settings]
  );

  // Handle video ready
  const handleReady = useCallback(() => {
    setLoadingState('ready');
  }, []);

  // Handle video duration
  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  // Handle video error
  const handleError = useCallback((error: any) => {
    console.error('Video error:', error);
    setLoadingState('error');
    toast.error('Failed to load video', {
      description: 'Please check your internet connection and try again.',
    });
  }, []);

  // Handle buffering
  const handleBuffer = useCallback(() => {
    setBuffering(true);
  }, []);

  const handleBufferEnd = useCallback(() => {
    setBuffering(false);
  }, []);

  // Handle video ended
  const handleEnded = useCallback(() => {
    setPlaying(false);

    const currentQuestions = questionsRef.current;

    // Check if all questions were answered
    const unansweredQuestions = currentQuestions.filter(
      (q) => !q.answered && !triggeredQuestions.current.has(q.id)
    );

    if (unansweredQuestions.length > 0) {
      toast.warning(`You have ${unansweredQuestions.length} unanswered question(s)`, {
        description: 'Please rewind to answer all questions.',
      });
    } else if (onComplete) {
      onComplete();
    }
  }, [onComplete]);

  // Calculate question number
  const questionNumber = currentQuestion
    ? questionsRef.current.findIndex((q) => q.id === currentQuestion.id) + 1
    : 0;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
      {/* Video Player */}
      <div className="relative aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          playbackRate={playbackRate}
          controls={false}
          width="100%"
          height="100%"
          onProgress={handleProgress}
          onDuration={handleDuration}
          onReady={handleReady}
          onError={handleError}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          onEnded={handleEnded}
          progressInterval={500}
          config={{
            file: {
              attributes: {
                preload: 'auto',
                controlsList: 'nodownload',
                playsInline: true,
              },
            },
          }}
        />

        {/* Loading State */}
        {loadingState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
            <p className="text-white text-sm">Loading video...</p>
          </div>
        )}

        {/* Error State */}
        {loadingState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
            <div className="text-center px-4">
              <p className="text-white text-lg mb-4">Failed to load video</p>
              <button
                onClick={() => {
                  setLoadingState('loading');
                  playerRef.current?.seekTo(0);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {buffering && loadingState === 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        )}

        {/* Initial Play Button */}
        {!initialPlayStarted && loadingState === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-30">
            <button
              onClick={() => {
                setInitialPlayStarted(true);
                setPlaying(true);
              }}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl"
            >
              <svg
                className="h-6 w-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-lg font-semibold">Start Video Quiz</span>
            </button>
            <p className="text-white mt-4 text-sm">
              {questions.length} questions • {Math.ceil(duration / 60)} minutes
            </p>
          </div>
        )}

        {/* Question Overlay */}
        {showOverlay && currentQuestion && (
          <QuestionOverlay
            question={currentQuestion}
            questionNumber={questionNumber}
            totalQuestions={questionsRef.current.length}
            onAnswer={handleAnswerSubmit}
          />
        )}
      </div>

      {/* Custom Video Controls */}
      {loadingState === 'ready' && initialPlayStarted && (
        <VideoControls
          playing={playing}
          playbackRate={playbackRate}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={() => setPlaying(!playing)}
          onSeek={handleSeek}
          onPlaybackRateChange={settings?.allowPlaybackSpeedChange ? handlePlaybackRateChange : undefined}
          disabled={showOverlay}
        />
      )}

      {/* Progress Indicator */}
      {settings.showProgressBar && questions.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium z-20">
          {answeredCount} / {questions.length}{' '}
          answered
        </div>
      )}
    </div>
  );
};

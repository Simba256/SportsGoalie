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

  const lastCheckedTime = useRef(0);
  const triggeredQuestions = useRef(new Set<string>());

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

      // Only update current time state if it's significantly different (avoid excessive re-renders)
      setCurrentTime((prev) => {
        if (Math.abs(prev - currentSeconds) > 0.1) {
          return currentSeconds;
        }
        return prev;
      });

      // Only check every 0.5 seconds to avoid performance issues
      if (Math.abs(currentSeconds - lastCheckedTime.current) < 0.5) {
        return;
      }
      lastCheckedTime.current = currentSeconds;

      // Report progress to parent (less frequently)
      if (onProgressUpdate) {
        onProgressUpdate(currentSeconds, duration);
      }

      // Find if we've reached a question timestamp
      const nextQuestion = questions.find(
        (q) =>
          !q.answered &&
          !triggeredQuestions.current.has(q.id) &&
          currentSeconds >= q.timestamp &&
          currentSeconds < q.timestamp + 0.5
      );

      if (nextQuestion) {
        triggeredQuestions.current.add(nextQuestion.id);
        setPlaying(false);
        setCurrentQuestion(nextQuestion);
        setShowOverlay(true);
      }
    },
    [questions, duration, onProgressUpdate]
  );

  // Handle question answer submission
  const handleAnswerSubmit = useCallback(
    (answer: string | string[]) => {
      if (!currentQuestion) return;

      // Mark question as triggered (to prevent re-showing)
      triggeredQuestions.current.add(currentQuestion.id);

      // Call parent handler
      onQuestionAnswer(currentQuestion.id, answer);

      // Hide overlay and resume playback
      setShowOverlay(false);
      setCurrentQuestion(null);
      setPlaying(true);

      // Check if all questions are answered
      const allAnswered = questions.every(
        (q) => q.answered || triggeredQuestions.current.has(q.id)
      );

      if (allAnswered && onComplete) {
        // Wait a moment before completing to allow video to continue
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    },
    [currentQuestion, questions, onQuestionAnswer, onComplete]
  );

  // Handle seeking - check if user skipped past a question
  const handleSeek = useCallback(
    (time: number) => {
      if (settings.requireSequentialAnswers) {
        // Find any unanswered questions before the seek time
        const unansweredBefore = questions.find(
          (q) =>
            !q.answered &&
            !triggeredQuestions.current.has(q.id) &&
            q.timestamp < time
        );

        if (unansweredBefore) {
          // Force user to answer the question first
          playerRef.current?.seekTo(unansweredBefore.timestamp, 'seconds');
          setPlaying(false);
          setCurrentQuestion(unansweredBefore);
          setShowOverlay(true);
          toast.info('Please answer this question first');
          return;
        }
      }

      playerRef.current?.seekTo(time, 'seconds');
    },
    [questions, settings.requireSequentialAnswers]
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

    // Check if all questions were answered
    const unansweredQuestions = questions.filter((q) => !q.answered);

    if (unansweredQuestions.length > 0) {
      toast.warning(`You have ${unansweredQuestions.length} unanswered question(s)`, {
        description: 'Please rewind to answer all questions.',
      });
    } else if (onComplete) {
      onComplete();
    }
  }, [questions, onComplete]);

  // Calculate question number
  const questionNumber = currentQuestion
    ? questions.findIndex((q) => q.id === currentQuestion.id) + 1
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
          progressInterval={1000}
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
            totalQuestions={questions.length}
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
          {questions.filter((q) => q.answered).length} / {questions.length}{' '}
          answered
        </div>
      )}
    </div>
  );
};

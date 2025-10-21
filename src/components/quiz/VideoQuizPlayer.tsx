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
  console.log('🎬 [VideoQuizPlayer] Component mounted with questions:', questions?.length);

  // React Player ref
  const playerRef = useRef<ReactPlayer>(null);

  // Video state
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [initialPlayStarted, setInitialPlayStarted] = useState(false);

  // Question state - single state to prevent multiple updates
  const [questionState, setQuestionState] = useState<{
    current: VideoQuizQuestionWithState | null;
    showOverlay: boolean;
    answeredCount: number;
  }>({
    current: null,
    showOverlay: false,
    answeredCount: 0,
  });

  // Refs for tracking without causing re-renders
  const triggeredQuestions = useRef(new Set<string>());
  const processingQuestion = useRef(false);
  const playingRef = useRef(playing);
  const currentTimeRef = useRef(0);
  const questionsRef = useRef(questions);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when state changes
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Update questions ref when prop changes
  useEffect(() => {
    questionsRef.current = questions;
    if (questions && questions.length > 0) {
      console.log('🔄 [VideoQuizPlayer] Questions updated:', questions.length);
      const answered = questions.filter(q => q.answered).length;
      setQuestionState(prev => ({ ...prev, answeredCount: answered }));
    }
  }, [questions]);

  // Seek to initial time when ready
  useEffect(() => {
    if (loadingState === 'ready' && initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  }, [loadingState, initialTime]);

  // Question checker - runs once on mount
  useEffect(() => {
    console.log('📍 [VideoQuizPlayer] Starting question checker');

    const checkForQuestions = () => {
      // Use refs to avoid stale closures
      const currentQuestions = questionsRef.current;

      if (!currentQuestions || currentQuestions.length === 0) {
        return;
      }

      // Skip if already processing or not playing
      if (processingQuestion.current || !playingRef.current) {
        return;
      }

      const currentSeconds = currentTimeRef.current;

      // Check each question
      for (const question of currentQuestions) {
        // Skip if already triggered or answered
        if (triggeredQuestions.current.has(question.id) || question.answered) {
          continue;
        }

        // Check if we're within range of the question timestamp
        if (Math.abs(currentSeconds - question.timestamp) < 0.3) {
          console.log('🎯 [VideoQuizPlayer] Question triggered:', question.id);

          // Mark as processing
          processingQuestion.current = true;
          triggeredQuestions.current.add(question.id);

          // Single state update to prevent multiple renders
          setPlaying(false);
          setQuestionState(prev => ({
            ...prev,
            current: question,
            showOverlay: true,
          }));

          break;
        }
      }
    };

    // Set up interval
    intervalRef.current = setInterval(checkForQuestions, 250);

    return () => {
      console.log('🛑 [VideoQuizPlayer] Clearing question checker');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Run once on mount, no dependencies

  // Simple progress handler - only tracks time
  const handleProgress = useCallback((state: OnProgressProps) => {
    const seconds = state.playedSeconds;

    // Update ref for question checker
    currentTimeRef.current = seconds;

    // Update state for UI (throttled)
    if (Math.abs(currentTime - seconds) > 0.2) {
      setCurrentTime(seconds);
    }

    // Notify parent
    if (onProgressUpdate) {
      onProgressUpdate(seconds, duration);
    }
  }, [currentTime, duration, onProgressUpdate]);

  // Handle question answer
  const handleAnswerSubmit = useCallback(
    (answer: string | string[]) => {
      if (!questionState.current) return;

      console.log('✅ [VideoQuizPlayer] Answer submitted:', {
        questionId: questionState.current.id,
        answer,
      });

      // Notify parent
      onQuestionAnswer(questionState.current.id, answer);

      // Single state update
      setQuestionState(prev => ({
        current: null,
        showOverlay: false,
        answeredCount: prev.answeredCount + 1,
      }));

      // Reset processing flag
      processingQuestion.current = false;

      // Resume playback after a short delay
      setTimeout(() => {
        setPlaying(true);
      }, 100);

      // Check if quiz is complete
      const totalAnswered = triggeredQuestions.current.size;
      const totalQuestions = questionsRef.current?.length || 0;
      if (totalAnswered >= totalQuestions && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    },
    [questionState.current, onQuestionAnswer, onComplete]
  );

  // Handle seeking
  const handleSeek = useCallback(
    (time: number) => {
      currentTimeRef.current = time;

      const currentQuestions = questionsRef.current;
      if (settings.requireSequentialAnswers && currentQuestions) {
        // Check for unanswered questions before seek point
        const unanswered = currentQuestions.find(
          q => !q.answered &&
               !triggeredQuestions.current.has(q.id) &&
               q.timestamp < time
        );

        if (unanswered) {
          playerRef.current?.seekTo(unanswered.timestamp, 'seconds');
          toast.info('Please answer this question first');

          // Trigger the unanswered question
          processingQuestion.current = true;
          triggeredQuestions.current.add(unanswered.id);
          setPlaying(false);
          setQuestionState(prev => ({
            ...prev,
            current: unanswered,
            showOverlay: true,
          }));
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
      if (!settings || settings.allowPlaybackSpeedChange === false) {
        toast.info('Playback speed change is disabled for this quiz');
        return;
      }
      setPlaybackRate(rate);
    },
    [settings]
  );

  // Video event handlers
  const handleReady = useCallback(() => {
    setLoadingState('ready');
    console.log('✅ [VideoQuizPlayer] Video ready');
  }, []);

  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('❌ [VideoQuizPlayer] Video error:', error);
    setLoadingState('error');
    toast.error('Failed to load video');
  }, []);

  const handleBuffer = useCallback(() => {
    setBuffering(true);
  }, []);

  const handleBufferEnd = useCallback(() => {
    setBuffering(false);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);

    const currentQuestions = questionsRef.current;
    if (currentQuestions) {
      const unanswered = currentQuestions.filter(
        q => !q.answered && !triggeredQuestions.current.has(q.id)
      );

      if (unanswered.length > 0) {
        toast.warning(`${unanswered.length} unanswered question(s) remaining`);
      } else if (onComplete) {
        onComplete();
      }
    }
  }, [onComplete]);

  // Calculate question number for overlay
  const questionNumber = questionState.current && questionsRef.current
    ? questionsRef.current.findIndex(q => q.id === questionState.current!.id) + 1
    : 0;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
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
          progressInterval={250}
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
              {questions?.length || 0} questions • {Math.ceil(duration / 60)} minutes
            </p>
          </div>
        )}

        {/* Question Overlay */}
        {questionState.showOverlay && questionState.current && (
          <QuestionOverlay
            question={questionState.current}
            questionNumber={questionNumber}
            totalQuestions={questionsRef.current?.length || 0}
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
          disabled={questionState.showOverlay}
        />
      )}

      {/* Progress Indicator */}
      {settings.showProgressBar && questions && questions.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium z-20">
          {questionState.answeredCount} / {questions.length} answered
        </div>
      )}
    </div>
  );
};
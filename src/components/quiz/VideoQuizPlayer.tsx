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

  // Question state
  const [currentQuestion, setCurrentQuestion] = useState<VideoQuizQuestionWithState | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  // Refs for tracking without causing re-renders
  const triggeredQuestions = useRef(new Set<string>());
  const processingQuestion = useRef(false);
  const playingRef = useRef(playing);
  const currentTimeRef = useRef(0);

  // Update playing ref when state changes
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Reset triggered questions when questions change
  useEffect(() => {
    if (questions && questions.length > 0) {
      console.log('🔄 [VideoQuizPlayer] Questions updated, resetting triggers');
      triggeredQuestions.current.clear();
      processingQuestion.current = false;
      const answered = questions.filter(q => q.answered).length;
      setAnsweredCount(answered);
    }
  }, [questions]);

  // Seek to initial time when ready
  useEffect(() => {
    if (loadingState === 'ready' && initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  }, [loadingState, initialTime]);

  // Question checker - completely independent from React Player
  useEffect(() => {
    if (!questions || questions.length === 0) {
      return;
    }

    console.log('📍 [VideoQuizPlayer] Starting question checker interval');

    const checkInterval = setInterval(() => {
      // Skip if we're already processing a question or overlay is showing
      if (processingQuestion.current || !playingRef.current) {
        return;
      }

      const currentSeconds = currentTimeRef.current;

      // Check each question
      for (const question of questions) {
        // Skip if already triggered or answered
        if (triggeredQuestions.current.has(question.id) || question.answered) {
          continue;
        }

        // Check if we're within range of the question timestamp
        if (Math.abs(currentSeconds - question.timestamp) < 0.3) {
          console.log('🎯 [VideoQuizPlayer] Question triggered at:', {
            questionId: question.id,
            timestamp: question.timestamp,
            currentTime: currentSeconds,
          });

          // Mark as processing to prevent re-triggers
          processingQuestion.current = true;
          triggeredQuestions.current.add(question.id);

          // Trigger the question display
          setPlaying(false);
          setCurrentQuestion(question);
          setShowOverlay(true);

          break;
        }
      }
    }, 200); // Check every 200ms

    return () => {
      console.log('🛑 [VideoQuizPlayer] Clearing question checker interval');
      clearInterval(checkInterval);
    };
  }, [questions]); // Only depend on questions array

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
      if (!currentQuestion) return;

      console.log('✅ [VideoQuizPlayer] Answer submitted:', {
        questionId: currentQuestion.id,
        answer,
      });

      // Notify parent
      onQuestionAnswer(currentQuestion.id, answer);

      // Update UI
      setAnsweredCount(prev => prev + 1);

      // Clear question and resume
      setCurrentQuestion(null);
      setShowOverlay(false);
      processingQuestion.current = false;

      // Resume playback after a short delay
      setTimeout(() => {
        setPlaying(true);
      }, 100);

      // Check if quiz is complete
      const totalAnswered = triggeredQuestions.current.size;
      if (questions && totalAnswered >= questions.length && onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    },
    [currentQuestion, questions, onQuestionAnswer, onComplete]
  );

  // Handle seeking
  const handleSeek = useCallback(
    (time: number) => {
      currentTimeRef.current = time;

      if (settings.requireSequentialAnswers && questions) {
        // Check for unanswered questions before seek point
        const unanswered = questions.find(
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
          setCurrentQuestion(unanswered);
          setShowOverlay(true);
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

    if (questions) {
      const unanswered = questions.filter(
        q => !q.answered && !triggeredQuestions.current.has(q.id)
      );

      if (unanswered.length > 0) {
        toast.warning(`${unanswered.length} unanswered question(s) remaining`);
      } else if (onComplete) {
        onComplete();
      }
    }
  }, [questions, onComplete]);

  // Calculate question number for overlay
  const questionNumber = currentQuestion && questions
    ? questions.findIndex(q => q.id === currentQuestion.id) + 1
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
        {showOverlay && currentQuestion && (
          <QuestionOverlay
            question={currentQuestion}
            questionNumber={questionNumber}
            totalQuestions={questions?.length || 0}
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
      {settings.showProgressBar && questions && questions.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium z-20">
          {answeredCount} / {questions.length} answered
        </div>
      )}
    </div>
  );
};
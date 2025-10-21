'use client';

import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { VideoQuizPlayerProps, VideoQuizQuestionWithState } from '@/types';
import { QuestionOverlay } from './QuestionOverlay';
import { VideoControls } from './VideoControls';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * GPT-5 Optimized Video Quiz Player
 * Key improvements:
 * - No setInterval - only uses ReactPlayer's onProgress
 * - Idempotent state updates - only changes when values actually differ
 * - Refs for hot data - no unnecessary re-renders
 * - Single source of truth for timeline
 */
export const VideoQuizPlayer: React.FC<VideoQuizPlayerProps> = ({
  videoUrl,
  questions,
  settings,
  initialTime = 0,
  onQuestionAnswer,
  onProgressUpdate,
  onComplete,
}) => {
  // Sort questions once by timestamp
  const sortedQuestions = useMemo(
    () => questions ? [...questions].sort((a, b) => a.timestamp - b.timestamp) : [],
    [questions]
  );

  // Refs
  const playerRef = useRef<ReactPlayer>(null);
  const triggeredRef = useRef(new Set<string>()); // Questions that have been shown
  const answeredRef = useRef(new Set<string>());  // Questions that have been answered
  const nextIndexRef = useRef(0);                 // Index of next question to check
  const currentTimeRef = useRef(0);
  const processingRef = useRef(false);

  // State - minimal, only for UI changes
  const [overlayQuestion, setOverlayQuestion] = useState<VideoQuizQuestionWithState | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [loadingState, setLoadingState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [initialPlayStarted, setInitialPlayStarted] = useState(false);

  // Reset refs when questions change
  useEffect(() => {
    if (sortedQuestions && sortedQuestions.length > 0) {
      console.log('📚 Questions loaded:', sortedQuestions.length);
      // Reset tracking but preserve answered state for already answered questions
      triggeredRef.current = new Set();
      nextIndexRef.current = 0;

      // Preserve answered state
      sortedQuestions.forEach(q => {
        if (q.answered) {
          answeredRef.current.add(q.id);
          triggeredRef.current.add(q.id);
        }
      });
    }
  }, [sortedQuestions]);

  // Idempotent question open
  const openQuestion = useCallback((question: VideoQuizQuestionWithState) => {
    if (processingRef.current) return;
    processingRef.current = true;

    console.log('🎯 Opening question:', question.id);

    // Only update if different
    setOverlayQuestion(prev => (prev?.id === question.id ? prev : question));
    setPlaying(prev => prev ? false : prev); // Only pause if playing

    // Reset after a frame to allow state updates
    requestAnimationFrame(() => {
      processingRef.current = false;
    });
  }, []);

  // Idempotent question close
  const closeQuestionAndResume = useCallback(() => {
    console.log('✅ Closing question overlay');

    setOverlayQuestion(prev => prev ? null : prev); // Only close if open
    setPlaying(prev => !prev ? true : prev);        // Only resume if paused
  }, []);

  // Main progress handler - single source of truth for timeline
  const handleProgress = useCallback((state: OnProgressProps) => {
    const seconds = state.playedSeconds;
    currentTimeRef.current = seconds;

    // Update UI time (throttled)
    if (Math.abs(currentTime - seconds) > 0.2) {
      setCurrentTime(seconds);
    }

    // Report to parent
    if (onProgressUpdate) {
      onProgressUpdate(seconds, duration);
    }

    // If overlay is showing, don't check for new questions
    if (overlayQuestion || processingRef.current) return;

    // Check for questions at current time
    const qs = sortedQuestions;
    let idx = nextIndexRef.current;

    // Move through questions that should trigger
    while (idx < qs.length) {
      const q = qs[idx];

      // If we haven't reached this question yet, stop checking
      if (seconds + 0.1 < q.timestamp) break;

      // If not answered and not triggered
      if (!answeredRef.current.has(q.id) && !triggeredRef.current.has(q.id)) {
        triggeredRef.current.add(q.id);
        nextIndexRef.current = idx + 1; // Move pointer forward
        openQuestion(q);
        return; // Stop processing - we just opened a question
      }

      idx++;
      nextIndexRef.current = idx;
    }
  }, [currentTime, duration, overlayQuestion, onProgressUpdate, openQuestion, sortedQuestions]);

  // Handle seeking - update next index
  const handleSeek = useCallback((time: number) => {
    currentTimeRef.current = time;

    // Find next question index after seek position
    const qs = sortedQuestions;
    let idx = 0;
    while (idx < qs.length && qs[idx].timestamp <= time) {
      idx++;
    }
    nextIndexRef.current = idx;

    // Handle sequential requirements
    if (settings.requireSequentialAnswers) {
      const unanswered = qs.find(
        q => q.timestamp < time &&
             !answeredRef.current.has(q.id) &&
             !triggeredRef.current.has(q.id)
      );

      if (unanswered) {
        playerRef.current?.seekTo(unanswered.timestamp, 'seconds');
        toast.info('Please answer this question first');
        triggeredRef.current.add(unanswered.id);
        openQuestion(unanswered);
        return;
      }
    }

    playerRef.current?.seekTo(time, 'seconds');
  }, [sortedQuestions, settings.requireSequentialAnswers, openQuestion]);

  // Handle answer submission
  const handleAnswerSubmit = useCallback((answer: string | string[]) => {
    if (!overlayQuestion) return;

    console.log('📝 Answer submitted for question:', overlayQuestion.id);

    // Mark as answered
    answeredRef.current.add(overlayQuestion.id);

    // Notify parent
    onQuestionAnswer(overlayQuestion.id, answer);

    // Close overlay and resume
    closeQuestionAndResume();

    // Check completion
    const totalAnswered = answeredRef.current.size;
    if (totalAnswered >= sortedQuestions.length && onComplete) {
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }, [overlayQuestion, onQuestionAnswer, closeQuestionAndResume, sortedQuestions.length, onComplete]);

  // Video event handlers
  const handleReady = useCallback(() => {
    setLoadingState('ready');
    console.log('✅ Video ready');

    // Seek to initial time if needed
    if (initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  }, [initialTime]);

  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  const handleError = useCallback((error: any) => {
    console.error('❌ Video error:', error);
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

    const unanswered = sortedQuestions.filter(
      q => !answeredRef.current.has(q.id)
    );

    if (unanswered.length > 0) {
      toast.warning(`${unanswered.length} unanswered question(s) remaining`);
    } else if (onComplete) {
      onComplete();
    }
  }, [sortedQuestions, onComplete]);

  // Playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (settings?.allowPlaybackSpeedChange === false) {
      toast.info('Playback speed change is disabled');
      return;
    }
    setPlaybackRate(rate);
  }, [settings]);

  // Calculate question number
  const questionNumber = overlayQuestion && sortedQuestions
    ? sortedQuestions.findIndex(q => q.id === overlayQuestion.id) + 1
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
          progressInterval={300} // GPT-5 recommendation: 300ms is optimal
          onProgress={handleProgress}
          onDuration={handleDuration}
          onReady={handleReady}
          onError={handleError}
          onBuffer={handleBuffer}
          onBufferEnd={handleBufferEnd}
          onEnded={handleEnded}
          onSeek={(seconds) => handleSeek(seconds)}
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
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Buffering */}
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
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              <span className="text-lg font-semibold">Start Video Quiz</span>
            </button>
            <p className="text-white mt-4 text-sm">
              {sortedQuestions.length} questions • {Math.ceil(duration / 60)} minutes
            </p>
          </div>
        )}

        {/* Question Overlay */}
        {overlayQuestion && (
          <QuestionOverlay
            question={overlayQuestion}
            questionNumber={questionNumber}
            totalQuestions={sortedQuestions.length}
            onAnswer={handleAnswerSubmit}
          />
        )}
      </div>

      {/* Video Controls */}
      {loadingState === 'ready' && initialPlayStarted && (
        <VideoControls
          playing={playing}
          playbackRate={playbackRate}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={() => setPlaying(prev => !prev)}
          onSeek={handleSeek}
          onPlaybackRateChange={settings?.allowPlaybackSpeedChange ? handlePlaybackRateChange : undefined}
          disabled={!!overlayQuestion}
        />
      )}

      {/* Progress Indicator */}
      {settings.showProgressBar && sortedQuestions.length > 0 && (
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium z-20">
          {answeredRef.current.size} / {sortedQuestions.length} answered
        </div>
      )}
    </div>
  );
};
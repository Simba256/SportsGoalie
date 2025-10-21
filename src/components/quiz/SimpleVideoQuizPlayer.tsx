'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { OnProgressProps } from 'react-player/base';
import { VideoQuizPlayerProps, VideoQuizQuestionWithState } from '@/types';
import { QuestionOverlay } from './QuestionOverlay';
import { VideoControls } from './VideoControls';
import { Loader2 } from 'lucide-react';

/**
 * SIMPLE VIDEO QUIZ PLAYER - CLEAN IMPLEMENTATION
 *
 * Core Principles:
 * 1. NO intervals - only ReactPlayer drives the timeline
 * 2. NO complex state - just what we're showing right now
 * 3. NO effects that depend on their own state
 * 4. NO recreating callbacks - all are stable
 * 5. Everything hot goes in refs
 */

export const VideoQuizPlayer: React.FC<VideoQuizPlayerProps> = ({
  videoUrl,
  questions = [],
  settings,
  initialTime = 0,
  onQuestionAnswer,
  onProgressUpdate,
  onComplete,
}) => {
  // Player ref
  const playerRef = useRef<ReactPlayer>(null);

  // Tracking refs - these NEVER cause re-renders
  const shownQuestions = useRef<Set<string>>(new Set());
  const currentTimeRef = useRef(0);
  const isShowingQuestion = useRef(false);

  // Minimal state - only what affects UI
  const [playing, setPlaying] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<VideoQuizQuestionWithState | null>(null);
  const [duration, setDuration] = useState(0);
  const [displayTime, setDisplayTime] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Progress handler - called by ReactPlayer
  const handleProgress = useCallback((state: OnProgressProps) => {
    const currentSeconds = state.playedSeconds;
    currentTimeRef.current = currentSeconds;

    // Update display time occasionally
    setDisplayTime(Math.floor(currentSeconds));

    // Call parent if needed
    if (onProgressUpdate) {
      onProgressUpdate(currentSeconds, duration);
    }

    // Don't check questions if we're showing one
    if (isShowingQuestion.current || !questions || questions.length === 0) {
      return;
    }

    // Check if we should show a question
    for (const question of questions) {
      // Skip if already shown or answered
      if (shownQuestions.current.has(question.id) || question.answered) {
        continue;
      }

      // Check if we're at the question time (within 0.5 seconds)
      const diff = Math.abs(currentSeconds - question.timestamp);
      if (diff < 0.5) {
        // Mark as showing
        isShowingQuestion.current = true;
        shownQuestions.current.add(question.id);

        // Pause and show question
        setPlaying(false);
        setActiveQuestion(question);

        console.log('📍 Showing question:', question.id);
        break;
      }
    }
  }, [questions, duration, onProgressUpdate]);

  // Handle answer
  const handleAnswer = useCallback((answer: string | string[]) => {
    if (!activeQuestion) return;

    console.log('✅ Question answered:', activeQuestion.id);

    // Tell parent
    if (onQuestionAnswer) {
      onQuestionAnswer(activeQuestion.id, answer);
    }

    // Hide question and resume
    setActiveQuestion(null);
    isShowingQuestion.current = false;
    setPlaying(true);

    // Check if done
    if (shownQuestions.current.size >= questions.length && onComplete) {
      setTimeout(onComplete, 500);
    }
  }, [activeQuestion, questions.length, onQuestionAnswer, onComplete]);

  // Handle seeking
  const handleSeek = useCallback((seconds: number) => {
    currentTimeRef.current = seconds;
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, 'seconds');
    }
  }, []);

  // Handle ready
  const handleReady = useCallback(() => {
    console.log('✅ Video ready');
    setIsReady(true);

    if (initialTime > 0 && playerRef.current) {
      playerRef.current.seekTo(initialTime, 'seconds');
    }
  }, [initialTime]);

  // Handle duration
  const handleDuration = useCallback((dur: number) => {
    setDuration(dur);
  }, []);

  // Handle ended
  const handleEnded = useCallback(() => {
    setPlaying(false);

    const unanswered = questions.filter(
      q => !shownQuestions.current.has(q.id) && !q.answered
    ).length;

    if (unanswered > 0) {
      console.log(`⚠️ ${unanswered} questions not shown`);
    } else if (onComplete) {
      onComplete();
    }
  }, [questions, onComplete]);

  // Start quiz
  const handleStart = useCallback(() => {
    setHasStarted(true);
    setPlaying(true);
  }, []);

  // Calculate question number
  const questionNumber = activeQuestion
    ? questions.findIndex(q => q.id === activeQuestion.id) + 1
    : 0;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl">
      <div className="relative aspect-video">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
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
              className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Start Quiz
            </button>
          </div>
        )}

        {/* Question Overlay */}
        {activeQuestion && (
          <QuestionOverlay
            question={activeQuestion}
            questionNumber={questionNumber}
            totalQuestions={questions.length}
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
          disabled={!!activeQuestion}
        />
      )}

      {/* Progress */}
      {settings?.showProgressBar && (
        <div className="absolute top-2 right-2 bg-black/70 px-3 py-1 rounded-full text-white text-xs">
          {shownQuestions.current.size} / {questions.length} shown
        </div>
      )}
    </div>
  );
};
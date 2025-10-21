'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { VideoQuizPlayer } from '@/components/quiz/VideoQuizPlayer';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { useVideoQuiz } from '@/hooks/useVideoQuiz';
import { VideoQuiz, VideoQuizProgress } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Clock, Target, ArrowLeft } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

function VideoQuizPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<VideoQuiz | null>(null);
  const [initialProgress, setInitialProgress] = useState<VideoQuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load quiz data
  useEffect(() => {
    if (quizId && user) {
      loadQuizData();
    }
  }, [quizId, user]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Just load the quiz, don't load any progress
      const quizResult = await videoQuizService.getVideoQuiz(quizId);

      if (!quizResult.success || !quizResult.data) {
        setError('Video quiz not found');
        toast.error('Video quiz not found');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      const quiz = quizResult.data;

      // DEBUG: Log what we received from the service
      console.log('📊 Quiz data received:', {
        quizId: quiz.id,
        title: quiz.title,
        questionsField: quiz.questions,
        questionsIsArray: Array.isArray(quiz.questions),
        questionsLength: quiz.questions?.length,
        firstQuestion: quiz.questions?.[0],
        allFields: Object.keys(quiz),
      });

      // Ensure questions is an array
      if (!quiz.questions) {
        console.error('❌ No questions field in quiz data');
        quiz.questions = [];
      } else if (!Array.isArray(quiz.questions)) {
        console.error('❌ Questions field is not an array:', typeof quiz.questions);
        quiz.questions = [];
      }

      // Create fresh progress for this attempt (not saved to database)
      const freshProgress: VideoQuizProgress = {
        id: `progress_${user!.id}_${quizId}`,
        userId: user!.id,
        videoQuizId: quizId,
        skillId: quiz.skillId,
        sportId: quiz.sportId,
        currentTime: 0,
        questionsAnswered: [],
        questionsRemaining: quiz.questions.length,
        score: 0,
        maxScore: quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0),
        percentage: 0,
        passed: false,
        isCompleted: false,
        status: 'in-progress',
        attemptNumber: 1,
        startedAt: Timestamp.now(),
        watchTime: 0,
        totalTimeSpent: 0,
      };

      setQuiz(quiz);
      setInitialProgress(freshProgress);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load video quiz');
      toast.error('Failed to load video quiz');
    } finally {
      setLoading(false);
    }
  };

  // Initialize video quiz hook - must always call hook (React rules)
  const videoQuizHook = useVideoQuiz(
    quiz && initialProgress && user ? {
      quiz,
      initialProgress,
      userId: user.id,
      onSave: async (progress) => {
        // Don't save progress during quiz - only save at completion
      },
      autoSaveInterval: 0, // Disable auto-save
    } : null
  );

  // Handle quiz completion
  const handleQuizComplete = async () => {
    if (!videoQuizHook) return;

    try {
      // Complete the quiz
      videoQuizHook.completeQuiz();

      const result = await videoQuizService.completeQuiz(videoQuizHook.progress);

      if (result.success) {
        toast.success('Video quiz completed!', {
          description: `You scored ${videoQuizHook.progress.percentage.toFixed(1)}%`,
        });

        // Redirect to results page
        setTimeout(() => {
          router.push(`/quiz/video/${quizId}/results`);
        }, 1500);
      } else {
        toast.error('Failed to save quiz results');
      }
    } catch (error) {
      console.error('Error completing quiz:', error);
      toast.error('Failed to complete quiz');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading video quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz || !initialProgress || !videoQuizHook) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-700 mb-4">{error || 'Video quiz not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { progress, questionsWithState, handleQuestionAnswer, updateVideoProgress } = videoQuizHook;

  // DEBUG: Log what we're passing to the video player
  console.log('🎮 Rendering video quiz page:', {
    hasQuiz: !!quiz,
    hasVideoQuizHook: !!videoQuizHook,
    questionsWithState,
    questionsCount: questionsWithState?.length,
    firstQuestionWithState: questionsWithState?.[0],
    originalQuizQuestions: quiz.questions,
    originalQuestionsCount: quiz.questions?.length,
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600">{quiz.description}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-sm">
              {quiz.difficulty}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {quiz.questions.length} questions
            </Badge>
            <Badge variant="outline" className="text-sm">
              {Math.ceil(quiz.videoDuration / 60)} min video
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Video Player - Takes up 3/4 on large screens */}
        <div className="lg:col-span-3">
          <VideoQuizPlayer
            videoUrl={quiz.videoUrl}
            questions={questionsWithState}
            settings={quiz.settings}
            initialTime={progress.currentTime}
            onQuestionAnswer={handleQuestionAnswer}
            onProgressUpdate={() => {}}
            onComplete={handleQuizComplete}
          />

          {/* Quiz Instructions (below video on mobile) */}
          {quiz.instructions && (
            <Card className="mt-6 lg:hidden">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Instructions</h3>
                <p className="text-sm text-gray-600">{quiz.instructions}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Sidebar - 1/4 on large screens, full width on mobile */}
        <div className="lg:col-span-1 space-y-4">
          {/* Progress Card */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Questions Progress
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {progress.questionsAnswered.length} / {quiz.questions.length}
                  </span>
                </div>
                <Progress
                  value={(progress.questionsAnswered.length / quiz.questions.length) * 100}
                  className="h-2"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">
                    {progress.questionsAnswered.filter(q => q.isCorrect).length} correct
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-gray-600">
                    {progress.score} / {progress.maxScore} points
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">
                    {Math.ceil(progress.totalTimeSpent / 60)} min spent
                  </span>
                </div>
              </div>

              {progress.questionsAnswered.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-sm text-gray-600 mb-1">Current Score</div>
                  <div className="text-2xl font-bold text-primary">
                    {progress.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Passing: {quiz.settings.passingScore}%
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions (desktop only) */}
          {quiz.instructions && (
            <Card className="hidden lg:block">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 text-sm">Instructions</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {quiz.instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quiz Settings Info */}
          <Card>
            <CardContent className="pt-6 space-y-2">
              <h3 className="font-semibold text-sm mb-3">Quiz Settings</h3>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Passing Score</span>
                  <span className="font-medium">{quiz.settings.passingScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Attempts</span>
                  <span className="font-medium">{quiz.settings.maxAttempts}</span>
                </div>
                <div className="flex justify-between">
                  <span>Show Explanations</span>
                  <span className="font-medium">
                    {quiz.settings.showExplanations ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function VideoQuizPage() {
  return (
    <ProtectedRoute>
      <VideoQuizPageContent />
    </ProtectedRoute>
  );
}

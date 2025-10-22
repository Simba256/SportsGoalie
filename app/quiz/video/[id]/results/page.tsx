'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { VideoQuiz, VideoQuizProgress } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  ArrowLeft,
  Home,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronRight,
  Target,
  Award
} from 'lucide-react';
import Link from 'next/link';

function VideoQuizResultsContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<VideoQuiz | null>(null);
  const [progress, setProgress] = useState<VideoQuizProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId && user) {
      loadResults();
    }
  }, [quizId, user]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load quiz data
      const [quizResult, progressResult] = await Promise.all([
        videoQuizService.getVideoQuiz(quizId),
        videoQuizService.getUserProgress(user!.id, quizId)
      ]);

      if (!quizResult.success || !quizResult.data) {
        setError('Video quiz not found');
        return;
      }

      if (!progressResult.success || !progressResult.data) {
        setError('Quiz results not found');
        return;
      }

      const progressData = progressResult.data;

      // Check if quiz is completed
      if (!progressData.isCompleted) {
        toast.error('Quiz not completed yet');
        router.push(`/quiz/video/${quizId}`);
        return;
      }

      setQuiz(quizResult.data);
      setProgress(progressData);
    } catch (error) {
      console.error('Error loading results:', error);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-gray-600">Loading quiz results...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz || !progress) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-gray-700 mb-4">{error || 'Results not found'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              <Home className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPassed = progress.passed;
  const scoreColor = isPassed ? 'text-green-600' : 'text-red-600';
  const scoreIcon = isPassed ? <Trophy className="h-6 w-6" /> : <Target className="h-6 w-6" />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Quiz Results</h1>
            <p className="text-gray-600">{quiz.title}</p>
          </div>
          <Badge variant={isPassed ? 'success' : 'destructive'} className="text-lg px-4 py-2">
            {isPassed ? 'PASSED' : 'FAILED'}
          </Badge>
        </div>
      </div>

      {/* Main Score Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Score</span>
            {scoreIcon}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className={`text-6xl font-bold mb-4 ${scoreColor}`}>
              {progress.percentage.toFixed(1)}%
            </div>
            <Progress value={progress.percentage} className="mb-4" />
            <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {progress.score}
                </div>
                <div className="text-gray-600">Points Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {progress.maxScore}
                </div>
                <div className="text-gray-600">Total Points</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Questions Answered</p>
                <p className="text-2xl font-semibold">
                  {progress.questionsAnswered.length} / {quiz.questions?.length || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Time Spent</p>
                <p className="text-2xl font-semibold">
                  {formatTime(progress.totalTimeSpent)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attempt</p>
                <p className="text-2xl font-semibold">
                  #{progress.attemptNumber}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Review */}
      {progress.questionsAnswered.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {progress.questionsAnswered.map((answer, index) => {
                const question = quiz.questions?.find(q => q.id === answer.questionId);
                if (!question) return null;

                return (
                  <div
                    key={answer.questionId}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">Question {index + 1}</p>
                        <p className="text-xs text-gray-600">
                          At {Math.floor(answer.timestamp / 60)}:{String(Math.floor(answer.timestamp % 60)).padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {answer.pointsEarned} / {question.points} pts
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatTime(answer.timeToAnswer)} to answer
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Started:</span>
              <span className="ml-2 font-medium">
                {formatDate(progress.startedAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completed:</span>
              <span className="ml-2 font-medium">
                {formatDate(progress.completedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
        >
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {quiz.allowRetakes && (
          <Button
            onClick={() => router.push(`/quiz/video/${quizId}`)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Quiz
          </Button>
        )}

        <Button
          variant="default"
          onClick={() => router.push(`/sports/${quiz.sportId}/skills/${quiz.skillId}`)}
        >
          Continue Learning
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function VideoQuizResultsPage() {
  return (
    <ProtectedRoute>
      <VideoQuizResultsContent />
    </ProtectedRoute>
  );
}
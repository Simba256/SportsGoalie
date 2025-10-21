'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { StandaloneVideoQuizPlayer } from '@/components/quiz/StandaloneVideoQuizPlayer';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { VideoQuiz, VideoQuizProgress } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function VideoQuizPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const quizId = params.id as string;

  const [quiz, setQuiz] = useState<VideoQuiz | null>(null);
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

      // Load the quiz
      const quizResult = await videoQuizService.getVideoQuiz(quizId);

      if (!quizResult.success || !quizResult.data) {
        setError('Video quiz not found');
        toast.error('Video quiz not found');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }

      const quizData = quizResult.data;

      // Ensure questions is an array
      if (!quizData.questions) {
        console.error('❌ No questions field in quiz data');
        quizData.questions = [];
      } else if (!Array.isArray(quizData.questions)) {
        console.error('❌ Questions field is not an array:', typeof quizData.questions);
        quizData.questions = [];
      }

      console.log('📊 Quiz loaded successfully:', {
        quizId: quizData.id,
        title: quizData.title,
        questionsCount: quizData.questions.length,
        firstQuestion: quizData.questions[0],
      });

      setQuiz(quizData);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load video quiz');
      toast.error('Failed to load video quiz');
    } finally {
      setLoading(false);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = async (progress: VideoQuizProgress) => {
    try {
      const result = await videoQuizService.completeQuiz(progress);

      if (result.success) {
        toast.success('Video quiz completed!', {
          description: `You scored ${progress.percentage.toFixed(1)}%`,
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
  if (error || !quiz || !user) {
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

        <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
        {quiz.description && (
          <p className="text-gray-600">{quiz.description}</p>
        )}
      </div>

      {/* Video Player */}
      <StandaloneVideoQuizPlayer
        quiz={quiz}
        userId={user.id}
        onComplete={handleQuizComplete}
      />
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
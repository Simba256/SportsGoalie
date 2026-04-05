'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { StandaloneVideoQuizPlayer } from '@/components/quiz/StandaloneVideoQuizPlayer';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { customContentService } from '@/lib/database/services/custom-content.service';
import { customCurriculumService } from '@/lib/database/services/custom-curriculum.service';
import { ProgressService } from '@/lib/database/services/progress.service';
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

      let actualQuizId = quizId;

      // If this is a custom content reference, resolve to actual quiz ID
      if (quizId.startsWith('content_')) {
        const contentResult = await customContentService.getContent(quizId);

        if (!contentResult.success || !contentResult.data) {
          setError('Content not found');
          toast.error('Content not found');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }

        // Parse the content field to get the real videoQuizId
        try {
          const contentData = JSON.parse(contentResult.data.content);
          if (contentData.videoQuizId) {
            actualQuizId = contentData.videoQuizId;
          } else {
            setError('Invalid quiz reference');
            toast.error('Invalid quiz reference');
            setTimeout(() => router.push('/dashboard'), 2000);
            return;
          }
        } catch {
          setError('Invalid quiz data');
          toast.error('Invalid quiz data');
          setTimeout(() => router.push('/dashboard'), 2000);
          return;
        }
      }

      // Load the quiz using the resolved ID
      const quizResult = await videoQuizService.getVideoQuiz(actualQuizId);

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
        // Record progress for curriculum tracking (handles both automated and custom workflows)
        if (user && quiz) {
          await ProgressService.recordQuizCompletion(
            user.id,
            quizId,
            quiz.skillId || '',
            quiz.sportId || '',
            progress.percentage,
            progress.timeSpent || 0,
            progress.percentage >= (quiz.settings?.passingScore || 70)
          );

          // If this is a custom content item, mark it complete in the curriculum
          if (quizId.startsWith('content_')) {
            await customCurriculumService.markItemCompleteByContentId(user.id, quizId);
          }
        }

        toast.success('Video quiz completed!', {
          description: `You scored ${progress.percentage.toFixed(1)}%`,
        });

        // Redirect to results page quickly
        setTimeout(() => {
          router.push(`/quiz/video/${quizId}/results`);
        }, 500);
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-red-600" />
          <p className="mt-4 text-slate-600">Loading video quiz...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !quiz || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md border-red-100">
          <CardContent className="pt-6 text-center">
            <p className="text-lg text-slate-700 mb-4">{error || 'Video quiz not found'}</p>
            <Button onClick={() => router.push('/dashboard')} className="bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-6 py-6 shadow-lg">
        <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
        <Link
          href="/dashboard"
          className="relative inline-flex items-center text-sm text-blue-100 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>

        <h1 className="relative text-3xl font-bold mb-2 text-white">{quiz.title}</h1>
        {quiz.description && (
          <p className="relative text-blue-100/90">{quiz.description}</p>
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
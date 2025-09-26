'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Quiz, QuizAttempt } from '@/types';
import { AdminRoute } from '@/components/auth/protected-route';
import { quizService } from '@/lib/database/services/quiz.service';
import { useDeleteConfirmation } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Users,
  Clock,
  Target,
  Award,
  FileText,
  BarChart3,
  Settings,
  Eye,
  Calendar,
} from 'lucide-react';

interface QuizDetailState {
  quiz: Quiz | null;
  attempts: QuizAttempt[];
  loading: boolean;
  error: string | null;
  deleting: boolean;
}

function QuizDetailContent() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [state, setState] = useState<QuizDetailState>({
    quiz: null,
    attempts: [],
    loading: true,
    error: null,
    deleting: false,
  });

  const { dialog, showDeleteConfirmation } = useDeleteConfirmation();

  useEffect(() => {
    if (!quizId) return;
    loadQuizData();
  }, [quizId]);

  const loadQuizData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const quizResult = await quizService.getQuiz(quizId);

      if (!quizResult.success || !quizResult.data) {
        setState(prev => ({
          ...prev,
          error: 'Quiz not found',
          loading: false,
        }));
        return;
      }

      // For now, we'll just load the quiz data without attempts since getQuizAttempts method doesn't exist
      // In a real implementation, you'd want to add a method to get all attempts for a specific quiz
      setState(prev => ({
        ...prev,
        quiz: quizResult.data || null,
        attempts: [], // Empty array for now
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load quiz data',
        loading: false,
      }));
    }
  };

  const handleEdit = () => {
    router.push(`/admin/quizzes/${quizId}/edit`);
  };

  const handleDelete = () => {
    if (!state.quiz) return;

    showDeleteConfirmation({
      title: 'Delete Quiz',
      description: `Are you sure you want to delete "${state.quiz.title}"? This action cannot be undone and will remove all associated data.`,
      itemName: 'quiz',
      onConfirm: async () => {
        setState(prev => ({ ...prev, deleting: true }));

        try {
          const result = await quizService.deleteQuiz(quizId);
          if (result.success) {
            router.push('/admin/quizzes');
          } else {
            setState(prev => ({
              ...prev,
              error: result.error?.message || 'Failed to delete quiz',
              deleting: false,
            }));
          }
        } catch (err) {
          setState(prev => ({
            ...prev,
            error: 'An unexpected error occurred while deleting',
            deleting: false,
          }));
        }
      },
    });
  };

  const handlePreview = () => {
    window.open(`/quiz/${quizId}`, '_blank');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean, isPublished: boolean) => {
    if (isPublished && isActive) {
      return 'bg-green-100 text-green-800';
    } else if (isActive && !isPublished) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (isActive: boolean, isPublished: boolean) => {
    if (isPublished && isActive) {
      return 'Published';
    } else if (isActive && !isPublished) {
      return 'Draft';
    } else {
      return 'Inactive';
    }
  };

  const formatDate = (timestamp: Date | { toDate: () => Date } | string | null) => {
    if (!timestamp) return 'N/A';
    const date = typeof timestamp === 'object' && 'toDate' in timestamp
      ? timestamp.toDate()
      : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateStats = () => {
    if (state.attempts.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        completionRate: 0,
        averageTime: 0,
      };
    }

    const completedAttempts = state.attempts.filter(attempt => attempt.isCompleted);
    const totalScore = completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
    const totalTime = completedAttempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);

    return {
      totalAttempts: state.attempts.length,
      averageScore: completedAttempts.length > 0 ? Math.round(totalScore / completedAttempts.length) : 0,
      completionRate: state.attempts.length > 0 ? Math.round((completedAttempts.length / state.attempts.length) * 100) : 0,
      averageTime: completedAttempts.length > 0 ? Math.round(totalTime / completedAttempts.length / 60) : 0,
    };
  };

  if (state.loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.error || !state.quiz) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600 text-4xl">⚠️</div>
              <h3 className="text-lg font-medium text-red-900">{state.error || 'Quiz not found'}</h3>
              <Button variant="outline" onClick={() => router.push('/admin/quizzes')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Quizzes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/quizzes')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quiz Management
        </Button>

        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{state.quiz.title}</h1>
              <Badge className={getDifficultyColor(state.quiz.difficulty)}>
                {state.quiz.difficulty}
              </Badge>
              <Badge className={getStatusColor(state.quiz.isActive, state.quiz.isPublished)}>
                {getStatusText(state.quiz.isActive, state.quiz.isPublished)}
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-2xl">{state.quiz.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={state.deleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {state.deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-600">
              <span className="font-medium">Error:</span>
              <span>{state.error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="mt-2"
            >
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quiz Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.completionRate}%</div>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.averageTime}m</div>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quiz Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quiz Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-1">{state.quiz.category || 'General'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Questions</label>
                  <div className="mt-1">{state.quiz.questions?.length || 0} questions</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estimated Duration</label>
                  <div className="mt-1">{state.quiz.estimatedDuration} minutes</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Points</label>
                  <div className="mt-1">
                    {state.quiz.questions?.reduce((sum, q) => sum + (q.points || 1), 0) || 0} points
                  </div>
                </div>
              </div>

              {state.quiz.instructions && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Instructions</label>
                  <div className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {state.quiz.instructions}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Questions ({state.quiz.questions?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.quiz.questions && state.quiz.questions.length > 0 ? (
                <div className="space-y-4">
                  {state.quiz.questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Q{index + 1}</Badge>
                            <Badge variant="secondary">{question.type}</Badge>
                            <Badge variant="outline">{question.difficulty}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {question.points || 1} {question.points === 1 ? 'point' : 'points'}
                            </span>
                          </div>
                          <h4 className="font-medium mb-1">{question.title}</h4>
                          <p className="text-sm text-muted-foreground mb-3">{question.content}</p>

                          {question.type === 'multiple_choice' && question.options && (
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2 text-sm">
                                  <div className={`w-2 h-2 rounded-full ${option.isCorrect ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  <span className={option.isCorrect ? 'font-medium text-green-700' : 'text-muted-foreground'}>
                                    {option.text}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No questions added yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quiz Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(state.quiz.isActive, state.quiz.isPublished)}>
                    {getStatusText(state.quiz.isActive, state.quiz.isPublished)}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <div className="mt-1 text-sm">{formatDate(state.quiz.createdAt)}</div>
              </div>

              {state.quiz.updatedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="mt-1 text-sm">{formatDate(state.quiz.updatedAt)}</div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <div className="mt-1 text-sm">{state.quiz.createdBy || 'Unknown'}</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" onClick={handlePreview}>
                <Play className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
              <Button variant="outline" className="w-full" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Quiz
              </Button>
              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {dialog}
    </div>
  );
}

export default function QuizDetailPage() {
  return (
    <AdminRoute>
      <QuizDetailContent />
    </AdminRoute>
  );
}
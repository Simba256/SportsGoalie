'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminRoute } from '@/components/auth/protected-route';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';
import { VideoQuiz } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Video,
  Clock,
  Target,
  Users,
  Loader2,
  Share2,
} from 'lucide-react';
import { toast } from 'sonner';

function AdminQuizzesPageContent() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<VideoQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      // Admin should see ALL quizzes, not just published ones
      // Temporarily remove orderBy to test if that's causing permission issues
      const result = await videoQuizService.getVideoQuizzes({
        limit: 100,
        // orderBy: [{ field: 'createdAt', direction: 'desc' }],
      });

      if (result.success && result.data) {
        setQuizzes(result.data.items);
        if (result.data.items.length === 0) {
          console.log('No video quizzes found in database');
        }
      } else {
        console.error('Failed to load video quizzes:', result.error);
        toast.error('Failed to load video quizzes', {
          description: result.error?.message || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load video quizzes', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string, quizTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const result = await videoQuizService.deleteVideoQuiz(quizId);

      if (result.success) {
        toast.success('Video quiz deleted successfully');
        loadQuizzes();
      } else {
        toast.error('Failed to delete video quiz');
      }
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete video quiz');
    }
  };

  const handleToggleStatus = async (quiz: VideoQuiz) => {
    try {
      const result = await videoQuizService.updateVideoQuiz(quiz.id, {
        isActive: !quiz.isActive,
      });

      if (result.success) {
        toast.success(
          `Video quiz ${quiz.isActive ? 'deactivated' : 'activated'} successfully`
        );
        loadQuizzes();
      } else {
        toast.error('Failed to update video quiz status');
      }
    } catch (error) {
      console.error('Error updating quiz status:', error);
      toast.error('Failed to update video quiz status');
    }
  };

  const handleShareQuiz = async (quizId: string, quizTitle: string) => {
    try {
      const quizUrl = `https://sports-goalie.vercel.app/quiz/video/${quizId}`;
      await navigator.clipboard.writeText(quizUrl);
      toast.success('Quiz link copied to clipboard!', {
        description: `Link for "${quizTitle}" is ready to share`,
      });
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy quiz link');
    }
  };

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      searchQuery === '' ||
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === 'all' || quiz.difficulty === difficultyFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && quiz.isActive && quiz.isPublished) ||
      (statusFilter === 'inactive' && !quiz.isActive) ||
      (statusFilter === 'draft' && !quiz.isPublished);

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Video Quizzes</h1>
          <p className="text-gray-600">
            Manage interactive video-based quizzes
          </p>
        </div>
        <Button onClick={() => router.push('/admin/quizzes/create')} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create Video Quiz
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold">{quizzes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {quizzes.filter((q) => q.isActive && q.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold">
                  {quizzes.reduce((sum, q) => sum + (q.metadata?.totalAttempts || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg. Duration</p>
                <p className="text-2xl font-bold">
                  {Math.round(
                    quizzes.reduce((sum, q) => sum + q.videoDuration, 0) / (quizzes.length || 1) / 60
                  ) || 0}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No video quizzes found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first video quiz'}
            </p>
            {!searchQuery && difficultyFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={() => router.push('/admin/quizzes/create')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Video Quiz
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1 mb-2">
                      {quiz.title}
                    </CardTitle>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          quiz.difficulty === 'beginner'
                            ? 'default'
                            : quiz.difficulty === 'intermediate'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {quiz.difficulty}
                      </Badge>
                      <Badge variant={quiz.isActive && quiz.isPublished ? 'default' : 'outline'}>
                        {quiz.isActive && quiz.isPublished
                          ? 'Active'
                          : !quiz.isPublished
                          ? 'Draft'
                          : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/quiz/video/${quiz.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleShareQuiz(quiz.id, quiz.title)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(quiz)}>
                        <Target className="mr-2 h-4 w-4" />
                        {quiz.isActive ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(quiz.id, quiz.title)}
                        className="text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {quiz.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {quiz.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {formatDuration(quiz.videoDuration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.questions.length} questions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.metadata?.totalAttempts || 0} attempts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {quiz.metadata?.averageScore?.toFixed(0) || 0}% avg
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                  >
                    <Edit className="mr-2 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/quiz/video/${quiz.id}`)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminQuizzesPage() {
  return (
    <AdminRoute>
      <AdminQuizzesPageContent />
    </AdminRoute>
  );
}

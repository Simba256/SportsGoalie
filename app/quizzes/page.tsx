'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Clock,
  Users,
  Star,
  Search,
  BookOpen,
  Target,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { VideoQuiz } from '@/types/video-quiz';
import { videoQuizService } from '@/lib/database/services/video-quiz.service';

interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}

interface QuizWithStats extends VideoQuiz {
  stats?: QuizStats;
}

function QuizzesPageContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<QuizWithStats[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithStats[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchTerm, selectedDifficulty]);

  const loadQuizzes = async () => {
    try {
      setLoading(true);

      // Get all published video quizzes using video quiz service
      const quizzesResult = await videoQuizService.getVideoQuizzes({
        where: [{ field: 'status', operator: '==', value: 'published' }],
        limit: 100
      });

      if (quizzesResult.success && quizzesResult.data) {
        const quizzesWithStats = await Promise.all(
          quizzesResult.data.items.map(async (quiz) => {
            try {
              // Get video quiz attempt statistics
              const attemptsResult = user ? await videoQuizService.getUserVideoQuizAttempts(user.id, { videoQuizId: quiz.id }) : null;

              let stats: QuizStats = {
                totalAttempts: 0,
                averageScore: 0,
                completionRate: 0,
              };

              if (attemptsResult?.success && attemptsResult.data && attemptsResult.data.items.length > 0) {
                const attempts = attemptsResult.data.items;
                const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
                const completedCount = attempts.filter(attempt => attempt.isCompleted).length;

                stats = {
                  totalAttempts: attempts.length,
                  averageScore: totalScore / attempts.length,
                  completionRate: (completedCount / attempts.length) * 100,
                };
              }

              return {
                ...quiz,
                stats,
              } as QuizWithStats;
            } catch (error) {
              // Return quiz without stats if there's an error
              return quiz as QuizWithStats;
            }
          })
        );

        setQuizzes(quizzesWithStats);
      } else {
        throw new Error(quizzesResult.error?.message || 'Failed to load quizzes');
      }
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.error('Failed to load quizzes', {
        description: 'Please try refreshing the page or contact support.',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterQuizzes = () => {
    let filtered = quizzes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by difficulty
    if (selectedDifficulty && selectedDifficulty !== 'all') {
      filtered = filtered.filter((quiz) => quiz.difficulty === selectedDifficulty);
    }

    setFilteredQuizzes(filtered);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'hard':
        return 'bg-zinc-200 text-zinc-800 border-zinc-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">Quizzes</p>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2">Available Quizzes</h1>
          <p className="text-white/60 text-sm">
            Test your knowledge and track your progress with interactive goalie quizzes.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-zinc-300 bg-white focus-visible:ring-blue-200"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[150px] border-zinc-300 bg-white focus:ring-blue-200">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedDifficulty !== 'all'
              ? 'Try adjusting your filters or search term.'
              : 'Check back later for new quizzes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="border-zinc-200 bg-white hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:-translate-y-0.5">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">Video Quiz</Badge>
                </div>
                <CardTitle className="text-xl mb-2 text-zinc-900">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-zinc-600 text-sm line-clamp-2">{quiz.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quiz Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-gray-500" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{formatDuration(quiz.estimatedDuration)}</span>
                  </div>
                </div>

                {/* Stats */}
                {quiz.stats && quiz.stats.totalAttempts > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{quiz.stats.totalAttempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span>{quiz.stats.averageScore.toFixed(1)}% avg</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/quiz/video/${quiz.id}`} className="flex-1">
                    <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                      Start Video Quiz
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function QuizzesPage() {
  return (
    <ProtectedRoute>
      <QuizzesPageContent />
    </ProtectedRoute>
  );
}
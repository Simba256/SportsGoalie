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
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-border';
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
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-red-100/80 via-white to-blue-100/70 border border-red-200/60 p-6 md:p-8 overflow-hidden shadow-xl shadow-red-200/30">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-red-200/15 rounded-full blur-2xl" />
        <div className="relative">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Available Quizzes</h1>
          <p className="text-muted-foreground mt-1">
            Test your knowledge and track your progress with our interactive quizzes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[150px] border-border focus:ring-primary">
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
        <div className="text-center py-12 rounded-xl border border-border bg-white">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No quizzes found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedDifficulty !== 'all'
              ? 'Try adjusting your filters or search term.'
              : 'Check back later for new quizzes.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card key={quiz.id} className="border-border hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={`border ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">Video Quiz</Badge>
                </div>
                <CardTitle className="text-xl mb-2 text-foreground">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">{quiz.description}</p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Quiz Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span>{quiz.questions?.length || 0} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(quiz.estimatedDuration)}</span>
                  </div>
                </div>

                {/* Stats */}
                {quiz.stats && quiz.stats.totalAttempts > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{quiz.stats.totalAttempts} attempts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span>{quiz.stats.averageScore.toFixed(1)}% avg</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link href={`/quiz/video/${quiz.id}`} className="flex-1">
                    <Button className="w-full">
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
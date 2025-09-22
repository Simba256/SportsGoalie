'use client';

import { BarChart, BookOpen, Target, Trophy, TrendingUp, Calendar, Award, Flame } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { useProgress } from '@/hooks/useProgress';
import { StatsCards } from '@/components/analytics/StatsCards';
import { ProgressChart } from '@/components/analytics/ProgressChart';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const { userProgress, loading, error } = useProgress();

  // Generate sample data for charts (in a real app, this would come from the service)
  const generateSampleProgressData = () => {
    const dates = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        skillsCompleted: Math.floor(Math.random() * 3),
        timeSpent: Math.floor(Math.random() * 4) + 1,
        quizScore: Math.floor(Math.random() * 30) + 70,
      });
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Don't show error for missing progress data - this is normal for new users
  // if (error) {
  //   return (
  //     <div className="container mx-auto px-4 py-8">
  //       <Card>
  //         <CardContent className="p-6 text-center">
  //           <h3 className="text-lg font-medium mb-2">Unable to load dashboard</h3>
  //           <p className="text-muted-foreground">{error}</p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   );
  // }

  const stats = userProgress?.overallStats;
  const progressData = generateSampleProgressData();

  const statsCards = [
    {
      title: 'Completed Quizzes',
      value: stats?.quizzesCompleted || 0,
      description: stats?.quizzesCompleted ? 'Keep up the great work!' : 'Start your first quiz!',
      trend: 'up' as const,
      trendValue: '+12%',
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: 'Skills Completed',
      value: stats?.skillsCompleted || 0,
      description: stats?.skillsCompleted ? 'Skills mastered' : 'Explore sports skills',
      trend: 'up' as const,
      trendValue: '+8%',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: 'Average Score',
      value: stats?.averageQuizScore ? `${Math.round(stats.averageQuizScore)}%` : '-',
      description: stats?.averageQuizScore ? 'Great performance!' : 'Complete quizzes to see progress',
      trend: stats?.averageQuizScore && stats.averageQuizScore > 75 ? 'up' : 'neutral' as const,
      trendValue: stats?.averageQuizScore ? '+5%' : '',
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || 0} days`,
      description: stats?.currentStreak ? 'Keep the momentum!' : 'Start your learning streak',
      trend: stats?.currentStreak && stats.currentStreak > 3 ? 'up' : 'neutral' as const,
      trendValue: stats?.currentStreak ? '+1 day' : '',
      icon: <Flame className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Continue your sports learning journey and track your progress.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Award className="h-3 w-3" />
              <span>Level {stats?.level || 1}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>{stats?.totalPoints || 0} XP</span>
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <StatsCards stats={statsCards} />

        {/* Progress Chart */}
        <ProgressChart
          data={progressData}
          title="30-Day Learning Progress"
          description="Your learning activity and performance over the last 30 days"
        />

        {/* Dashboard Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>
                Explore our sports library and begin your learning journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/sports">
                <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Browse Sports</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover sports and skills to master
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Quiz Section */}
          <Card>
            <CardHeader>
              <CardTitle>Test Your Knowledge</CardTitle>
              <CardDescription>
                Take quizzes to test your understanding and track progress.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/quizzes">
                <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Take Quiz</h3>
                    <p className="text-sm text-muted-foreground">
                      Challenge yourself with interactive quizzes
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>
                Your journey across all sports and skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Sports Completed</span>
                  <span className="font-medium">{stats?.sportsCompleted || 0}/6</span>
                </div>
                <Progress value={((stats?.sportsCompleted || 0) / 6) * 100} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span>Skills Completed</span>
                  <span className="font-medium">{stats?.skillsCompleted || 0}</span>
                </div>
                <Progress value={Math.min(((stats?.skillsCompleted || 0) / 20) * 100, 100)} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span>Time Spent Learning</span>
                  <span className="font-medium">{Math.round((stats?.totalTimeSpent || 0) / 60)}h</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Achievements */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest learning progress and achievements.</CardDescription>
            </CardHeader>
            <CardContent>
              {stats && (stats.quizzesCompleted > 0 || stats.skillsCompleted > 0) ? (
                <div className="space-y-4">
                  {stats.quizzesCompleted > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                        <Trophy className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Quiz Completed</p>
                        <p className="text-xs text-muted-foreground">
                          You've completed {stats.quizzesCompleted} quiz{stats.quizzesCompleted !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {stats.skillsCompleted > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Skills Mastered</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.skillsCompleted} skill{stats.skillsCompleted !== 1 ? 's' : ''} completed
                        </p>
                      </div>
                    </div>
                  )}

                  {stats.currentStreak > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Flame className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Learning Streak</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.currentStreak} day{stats.currentStreak !== 1 ? 's' : ''} in a row
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No activity yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start learning sports skills and taking quizzes to see your progress here.
                  </p>
                  <Link href="/sports">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Jump to different sections of your learning journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/progress" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <BarChart className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">View Analytics</p>
                    <p className="text-xs text-muted-foreground">Detailed progress tracking</p>
                  </div>
                </div>
              </Link>

              <Link href="/achievements" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Award className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Achievements</p>
                    <p className="text-xs text-muted-foreground">Unlock badges and milestones</p>
                  </div>
                </div>
              </Link>

              <Link href="/goals" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Set Goals</p>
                    <p className="text-xs text-muted-foreground">Track learning objectives</p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
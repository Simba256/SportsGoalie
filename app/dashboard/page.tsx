'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  BookOpen,
  Target,
  Trophy,
  Award,
  Flame,
  Play,
  CheckCircle,
  Clock,
  Users,
  Brain,
  Footprints,
  Shapes,
  Grid3X3,
  Dumbbell,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { useProgress } from '@/hooks/useProgress';
import { useEnrollment } from '@/src/hooks/useEnrollment';
import { StatsCards } from '@/components/analytics/StatsCards';
import { VideoUpload } from '@/src/components/dashboard/VideoUpload';
import { CustomCurriculumDashboard } from '@/src/components/dashboard/CustomCurriculumDashboard';
import { PILLARS } from '@/types';
import { getPillarColorClasses, getPillarSlugFromDocId } from '@/src/lib/utils/pillars';

// Icon map for pillar icons
const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { userProgress, loading } = useProgress();
  const {
    enrolledSports,
    loading: enrollmentsLoading,
    error: enrollmentsError,
  } = useEnrollment();

  // Redirect students who haven't completed onboarding
  useEffect(() => {
    if (user?.role === 'student' && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, router]);

  // Check if user is a custom workflow student
  const isCustomWorkflow = user?.role === 'student' && user?.workflowType === 'custom';

  // Don't render dashboard if student needs onboarding
  if (user?.role === 'student' && !user?.onboardingCompleted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show custom curriculum dashboard for custom workflow students
  if (isCustomWorkflow && user) {
    return <CustomCurriculumDashboard user={user} />;
  }

  if (loading || enrollmentsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const stats = userProgress?.overallStats;

  const statsCards = [
    {
      title: 'Quiz Attempts',
      value: stats?.quizzesCompleted || 0,
      description: stats?.quizzesCompleted
        ? 'Keep up the great work!'
        : 'Start your first quiz!',
      trend: stats?.quizzesCompleted ? ('up' as const) : ('neutral' as const),
      trendValue: '',
      icon: <Trophy className="h-4 w-4" />,
    },
    {
      title: 'Skills Attempted',
      value: stats?.skillsCompleted || 0,
      description: stats?.skillsCompleted
        ? 'Skills attempted'
        : 'Explore pillar skills',
      trend: stats?.skillsCompleted ? ('up' as const) : ('neutral' as const),
      trendValue: '',
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      title: 'Average Score',
      value: stats?.averageQuizScore
        ? `${Math.round(stats.averageQuizScore)}%`
        : '-',
      description: stats?.averageQuizScore
        ? 'Great performance!'
        : 'Complete quizzes to see progress',
      trend:
        stats?.averageQuizScore && stats.averageQuizScore > 75
          ? ('up' as const)
          : ('neutral' as const),
      trendValue: '',
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'Current Streak',
      value: `${stats?.currentStreak || 0} days`,
      description: stats?.currentStreak
        ? 'Keep the momentum!'
        : 'Start your learning streak',
      trend:
        stats?.currentStreak && stats.currentStreak > 3
          ? ('up' as const)
          : ('neutral' as const),
      trendValue: '',
      icon: <Flame className="h-4 w-4" />,
    },
  ];

  // Get pillar display info
  const getPillarDisplayInfo = (sport: { id: string; icon?: string; name: string }) => {
    const slug = getPillarSlugFromDocId(sport.id);
    if (slug) {
      const info = PILLARS.find(p => p.slug === slug);
      if (info) {
        return {
          icon: info.icon,
          color: info.color,
          shortName: info.shortName,
        };
      }
    }
    return {
      icon: sport.icon || 'Target',
      color: 'blue',
      shortName: sport.name.split(' ')[0],
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.displayName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-muted-foreground">
              Continue your goalie training journey and track your progress across all 6 pillars.
            </p>
          </div>
        </div>

        <StatsCards stats={statsCards} />

        <VideoUpload />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-primary" />
                <span>Your Pillar Progress</span>
              </h2>
              <p className="text-muted-foreground mt-1">
                Track your progress across all 6 goaltending pillars and continue
                your learning journey.
              </p>
            </div>
            {enrolledSports.length > 0 && (
              <Link href="/pillars">
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View All Pillars
                </Button>
              </Link>
            )}
          </div>

          {enrollmentsError ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-destructive text-sm">
                    {enrollmentsError}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : enrolledSports.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-16">
                <div className="text-center max-w-md">
                  <div className="h-24 w-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    No Pillars Enrolled Yet
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Start your goaltending journey by exploring the 6 fundamental
                    pillars. Each pillar contains essential skills to master.
                  </p>
                  <Link href="/pillars">
                    <Button className="bg-primary hover:bg-primary/90">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore Learning Pillars
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enrolledSports.map(({ sport, progress }) => {
                const displayInfo = getPillarDisplayInfo(sport);
                const colorClasses = getPillarColorClasses(displayInfo.color);
                const IconComponent = PILLAR_ICONS[displayInfo.icon] || Target;

                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return {
                        badge: 'bg-green-100 text-green-700 border-green-200',
                        progress: 'bg-green-500',
                        card: 'border-green-200 bg-green-50/30',
                      };
                    case 'in_progress':
                      return {
                        badge: `${colorClasses.bgLight} ${colorClasses.text} ${colorClasses.border}`,
                        progress: colorClasses.bg,
                        card: `${colorClasses.border} bg-opacity-5`,
                      };
                    default:
                      return {
                        badge: 'bg-gray-100 text-gray-700 border-gray-200',
                        progress: 'bg-gray-400',
                        card: 'border-gray-200',
                      };
                  }
                };

                const getStatusIcon = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return <CheckCircle className="h-4 w-4" />;
                    case 'in_progress':
                      return <Play className="h-4 w-4" />;
                    default:
                      return <Clock className="h-4 w-4" />;
                  }
                };

                const getStatusText = (status: string) => {
                  switch (status) {
                    case 'completed':
                      return 'Completed';
                    case 'in_progress':
                      return 'In Progress';
                    default:
                      return 'Not Started';
                  }
                };

                const statusColors = getStatusColor(progress.status);
                const progressPercentage = Math.round(progress.progressPercentage);

                return (
                  <Card
                    key={sport.id}
                    className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${statusColors.card}`}
                  >
                    <Link href={`/pillars/${sport.id}`} className="block">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-2 ring-background shadow-sm bg-gradient-to-br ${colorClasses.gradient}`}>
                              <IconComponent className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                                {sport.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium mt-1 ${statusColors.badge}`}
                              >
                                {getStatusIcon(progress.status)}
                                <span className="ml-1">
                                  {getStatusText(progress.status)}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                          {sport.description}
                        </p>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-muted-foreground">
                                Progress
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl font-bold text-foreground">
                                  {progressPercentage}%
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({progress.completedSkills.length}/
                                  {progress.totalSkills})
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ease-out ${statusColors.progress}`}
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {progress.completedSkills.length} of{' '}
                              {progress.totalSkills} skills completed
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
                            <div className="text-center">
                              <div className="text-lg font-semibold text-foreground">
                                {Math.round(progress.timeSpent / 60)}h
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Time Spent
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold text-foreground">
                                {progress.streak?.current || 0}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Day Streak
                              </div>
                            </div>
                          </div>

                          {progress.lastAccessedAt && (
                            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                              Last accessed:{' '}
                              {new Date(
                                progress.lastAccessedAt.toDate()
                              ).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          )}

                          <Button
                            className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                            variant={
                              progress.status === 'completed'
                                ? 'outline'
                                : 'default'
                            }
                          >
                            {progress.status === 'completed' ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Review & Practice
                              </>
                            ) : progress.status === 'in_progress' ? (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Continue Learning
                              </>
                            ) : (
                              <>
                                <Clock className="mr-2 h-4 w-4" />
                                Start Learning
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Start Learning</CardTitle>
              <CardDescription>
                Explore the 6 goaltending pillars and begin your training.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/pillars">
                <div className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">Browse Pillars</h3>
                    <p className="text-sm text-muted-foreground">
                      Discover skills across all 6 pillars
                    </p>
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
              <CardDescription>
                Your journey across all pillars and skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Pillars Completed</span>
                  <span className="font-medium">
                    {stats?.sportsCompleted || 0}/6
                  </span>
                </div>
                <Progress
                  value={((stats?.sportsCompleted || 0) / 6) * 100}
                  className="h-2"
                />

                <div className="flex items-center justify-between text-sm">
                  <span>Skills Attempted</span>
                  <span className="font-medium">{stats?.skillsCompleted || 0}</span>
                </div>
                <Progress
                  value={Math.min(
                    ((stats?.skillsCompleted || 0) / 20) * 100,
                    100
                  )}
                  className="h-2"
                />

                <div className="flex items-center justify-between text-sm">
                  <span>Time Spent Learning</span>
                  <span className="font-medium">
                    {Math.round((stats?.totalTimeSpent || 0) / 60)}h
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest learning progress and achievements.
              </CardDescription>
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
                        <p className="text-sm font-medium">Quizzes Attempted</p>
                        <p className="text-xs text-muted-foreground">
                          You've attempted {stats.quizzesCompleted} quiz
                          {stats.quizzesCompleted !== 1 ? 'zes' : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {stats.skillsCompleted > 0 && (
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Skills Attempted</p>
                        <p className="text-xs text-muted-foreground">
                          {stats.skillsCompleted} unique skill
                          {stats.skillsCompleted !== 1 ? 's' : ''} attempted
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
                          {stats.currentStreak} day
                          {stats.currentStreak !== 1 ? 's' : ''} in a row
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
                    Start learning pillar skills and taking quizzes to see your
                    progress here.
                  </p>
                  <Link href="/pillars">
                    <Button>Get Started</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump to different sections of your learning journey.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/progress" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <BarChart className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">View Analytics</p>
                    <p className="text-xs text-muted-foreground">
                      Detailed progress tracking
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/achievements" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Award className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Achievements</p>
                    <p className="text-xs text-muted-foreground">
                      Unlock badges and milestones
                    </p>
                  </div>
                </div>
              </Link>

              <Link href="/goals" className="block">
                <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Target className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Set Goals</p>
                    <p className="text-xs text-muted-foreground">
                      Track learning objectives
                    </p>
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

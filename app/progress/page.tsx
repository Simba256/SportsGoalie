'use client';

import { Calendar, TrendingUp, BarChart, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useProgress } from '@/hooks/useProgress';
import { StatsCards } from '@/components/analytics/StatsCards';
import { ProgressChart } from '@/components/analytics/ProgressChart';
import { SkillProgressChart } from '@/components/analytics/SkillProgressChart';

export default function ProgressPage() {
  return (
    <ProtectedRoute>
      <ProgressContent />
    </ProtectedRoute>
  );
}

function ProgressContent() {
  const { userProgress, loading, error } = useProgress();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Unable to load progress data</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = userProgress?.overallStats;

  // Generate empty data array for charts (real data would come from analytics service)
  // For now, show placeholder message for charts
  const progressData: any[] = [];
  const skillData: any[] = [];

  const statsCards = [
    {
      title: 'Total Learning Time',
      value: `${Math.round((stats?.totalTimeSpent || 0) / 60)}h`,
      description: 'Time invested in learning',
      trend: 'up' as const,
      trendValue: '+2.5h this week',
      icon: <Clock className="h-4 w-4" />,
    },
    {
      title: 'Skills Completed',
      value: stats?.skillsCompleted || 0,
      description: 'Skills mastered',
      trend: 'up' as const,
      trendValue: '+3 this month',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: 'Current Level',
      value: stats?.level || 1,
      description: `${stats?.experiencePoints || 0} XP earned`,
      trend: stats?.level && stats.level > 1 ? 'up' : 'neutral' as const,
      trendValue: '+150 XP',
      icon: <BarChart className="h-4 w-4" />,
    },
    {
      title: 'Learning Streak',
      value: `${stats?.currentStreak || 0} days`,
      description: `Best: ${stats?.longestStreak || 0} days`,
      trend: stats?.currentStreak && stats.currentStreak > 3 ? 'up' : 'neutral' as const,
      trendValue: '+1 day',
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Progress Analytics</h1>
          <p className="text-muted-foreground">
            Track your learning journey with detailed analytics and insights.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsCards stats={statsCards} />

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6">
              {/* Progress Chart */}
              <ProgressChart
                data={progressData}
                title="30-Day Learning Progress"
                description="Your daily learning activity and performance trends"
              />

              {/* Quick Stats Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Consistency</CardTitle>
                    <CardDescription>Your learning activity over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">This Week</span>
                        <span className="font-medium">5/7 days</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '71%' }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">This Month</span>
                        <span className="font-medium">18/30 days</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: '60%' }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Achievement Progress</CardTitle>
                    <CardDescription>Your journey towards achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Achievements Unlocked</span>
                        <span className="font-medium">3/15</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '20%' }}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Points</span>
                        <span className="font-medium">{stats?.totalPoints || 0} XP</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((stats?.level || 1) * 1000) - (stats?.experiencePoints || 0)} XP to next level
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <SkillProgressChart
              data={skillData}
              title="Skills Progress Breakdown"
              description="Track your progress across different sports skills"
            />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Performance</CardTitle>
                  <CardDescription>Your quiz scores and improvement over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">{Math.round(stats?.averageQuizScore || 0)}%</div>
                        <div className="text-sm text-muted-foreground">Average Score</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats?.quizzesCompleted || 0}</div>
                        <div className="text-sm text-muted-foreground">Quizzes Taken</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">85%</div>
                        <div className="text-sm text-muted-foreground">Pass Rate</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Learning Efficiency</CardTitle>
                  <CardDescription>How effectively you're learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Session Time</span>
                      <span className="font-medium">45 minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Skills per Hour</span>
                      <span className="font-medium">1.3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Completion Rate</span>
                      <span className="font-medium">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Learning Insights</CardTitle>
                  <CardDescription>Personalized recommendations based on your progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <h4 className="font-medium text-blue-900">🎯 Focus Recommendation</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        You're showing great progress in intermediate skills. Consider challenging yourself with advanced basketball techniques.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <h4 className="font-medium text-green-900">🔥 Streak Opportunity</h4>
                      <p className="text-sm text-green-700 mt-1">
                        You're on a 3-day learning streak! Keep it up to unlock the "Week Warrior" achievement.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                      <h4 className="font-medium text-yellow-900">⏰ Time Management</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your learning sessions are most effective between 2-4 PM. Try scheduling more practice during this time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Suggested Goals</CardTitle>
                  <CardDescription>Goals based on your current progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Complete 2 more basketball skills</p>
                        <p className="text-xs text-muted-foreground">Reach 80% completion in basketball</p>
                      </div>
                      <Button size="sm" variant="outline">Set Goal</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Maintain 7-day learning streak</p>
                        <p className="text-xs text-muted-foreground">Study for at least 30 minutes daily</p>
                      </div>
                      <Button size="sm" variant="outline">Set Goal</Button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">Achieve 90% average quiz score</p>
                        <p className="text-xs text-muted-foreground">Improve from current 75% average</p>
                      </div>
                      <Button size="sm" variant="outline">Set Goal</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
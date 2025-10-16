'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Settings, Users, BookOpen, Trophy, Target, HelpCircle, RefreshCw, Video, Database } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { analyticsService, PlatformAnalytics } from '@/lib/database/services/analytics.service';
import { seedCourses } from '@/lib/database/seeding/seed-courses';
import { toast } from 'sonner';
import { TokenDiagnostic } from '@/components/admin/token-diagnostic';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const fetchAnalytics = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);

      const result = await analyticsService.getPlatformAnalytics();

      if (result.success && result.data) {
        setAnalytics(result.data);
        if (showRefreshToast) {
          toast.success('Dashboard data refreshed');
        }
      } else {
        if (showRefreshToast) {
          toast.error('Failed to refresh dashboard data');
        }
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      if (showRefreshToast) {
        toast.error('Failed to refresh dashboard data');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    analyticsService.clearCache();
    fetchAnalytics(true);
  };

  const handleSeedCourses = async () => {
    setSeeding(true);
    try {
      await seedCourses();
      toast.success('Courses seeded successfully!');
    } catch (error) {
      console.error('Error seeding courses:', error);
      toast.error('Failed to seed courses');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Token Diagnostic - Temporary for debugging */}
        <TokenDiagnostic />

        {/* Admin Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Admin Dashboard - Welcome, {user?.displayName || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              Manage the SmarterGoalie platform, users, and content.
            </p>
          </div>
          <Button variant="success" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Admin Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : analytics?.users.total || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : `+${analytics?.users.newThisMonth || 0} this month`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sports Available</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : analytics?.content.totalSports || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : `${analytics?.content.totalSkills || 0} skills available`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : analytics?.engagement.totalQuizAttempts || '0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : `${analytics?.engagement.averageQuizScore || 0}% avg score`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${analytics?.performance.systemUptime || 100}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {loading ? 'Loading...' : 'System uptime'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>
                Manage sports, skills, and quiz content for the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Manage Sports & Skills</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and edit sports categories and skills
                  </p>
                </div>
                <Link href="/admin/sports">
                  <Button>Manage</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Manage Quizzes</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage interactive quizzes
                  </p>
                </div>
                <Link href="/admin/quizzes">
                  <Button>Manage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Support</CardTitle>
              <CardDescription>
                Review student videos and provide personalized coaching.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Video className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Video Reviews</h3>
                  <p className="text-sm text-muted-foreground">
                    Review student training videos and provide feedback
                  </p>
                </div>
                <Link href="/admin/video-reviews">
                  <Button>Review Videos</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">View All Users</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage user accounts and roles
                  </p>
                </div>
                <Link href="/admin/users">
                  <Button>Manage</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
              <CardDescription>
                View platform analytics and generate reports.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Platform Analytics</h3>
                  <p className="text-sm text-muted-foreground">
                    View user engagement and quiz performance
                  </p>
                </div>
                <Link href="/admin/analytics">
                  <Button>View Analytics</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure platform settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Platform Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure system-wide settings
                  </p>
                </div>
                <Link href="/admin/settings">
                  <Button>Configure</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-4 rounded-lg border p-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Database className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Seed Course Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Initialize the courses collection with sample data
                  </p>
                </div>
                <Button
                  onClick={handleSeedCourses}
                  disabled={seeding}
                  variant="warning"
                >
                  {seeding ? 'Seeding...' : 'Seed Courses'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin activities and system events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Authentication System Complete</h3>
              <p className="text-muted-foreground mb-4">
                Stage 2 authentication is fully implemented. Ready for Stage 3 content management.
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                ✅ Authentication System Active
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
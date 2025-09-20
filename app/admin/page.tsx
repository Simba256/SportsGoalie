'use client';

import { BarChart3, Settings, Users, BookOpen, Trophy, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboardContent />
    </AdminRoute>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Admin Header */}
        <div>
          <h1 className="text-3xl font-bold">
            Admin Dashboard - Welcome, {user?.displayName || user?.email}!
          </h1>
          <p className="text-muted-foreground">
            Manage the SportsCoach platform, users, and content.
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sports Available</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Coming in Stage 3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total quiz attempts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Activity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">System operational</p>
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
                <Button disabled>Coming Soon</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Monitor and manage user accounts and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <Button disabled>Coming Soon</Button>
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
                <Button disabled>Coming Soon</Button>
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
                <Button disabled>Coming Soon</Button>
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
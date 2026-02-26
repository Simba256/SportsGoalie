'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, GraduationCap, TrendingUp, Key, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/context';
import { userService, customCurriculumService } from '@/lib/database';

export default function CoachDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    studentsWithCurriculum: 0,
    totalCurriculumItems: 0,
    averageProgress: 0,
  });
  const [loading, setLoading] = useState(true);
  const [coachCode, setCoachCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadStats();
      loadCoachCode();
    }
  }, [user?.id]);

  const loadCoachCode = async () => {
    if (!user?.id) return;

    try {
      const result = await userService.getUser(user.id);
      if (result.success && result.data) {
        setCoachCode(result.data.coachCode || null);
      }
    } catch (error) {
      console.error('Failed to load coach code:', error);
    }
  };

  const handleCopyCode = async () => {
    if (!coachCode) return;

    try {
      await navigator.clipboard.writeText(coachCode);
      setCopied(true);
      toast.success('Coach code copied!', {
        description: 'Share this code with your students.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy', {
        description: 'Please try selecting and copying manually.',
      });
    }
  };

  const handleRegenerateCode = async () => {
    if (!user?.id || user.role !== 'coach') return;

    setRegenerating(true);
    try {
      const result = await userService.regenerateCoachCode(user.id);
      if (result.success && result.data) {
        setCoachCode(result.data.coachCode);
        toast.success('Coach code regenerated!', {
          description: 'Your new code is ready to share.',
        });
      } else {
        toast.error('Failed to regenerate code', {
          description: result.error?.message || 'Please try again.',
        });
      }
    } catch (error) {
      toast.error('Failed to regenerate code', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setRegenerating(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get all students assigned to this coach
      const allUsersResult = await userService.getAllUsers();
      if (!allUsersResult.success || !allUsersResult.data) return;

      // Admins can see ALL custom workflow students, coaches see assigned only
      const assignedStudents = allUsersResult.data.filter(
        u => u.role === 'student' &&
            u.workflowType === 'custom' &&
            (user?.role === 'admin' || u.assignedCoachId === user?.id)
      );

      let studentsWithCurriculum = 0;
      let totalItems = 0;
      let totalProgress = 0;

      for (const student of assignedStudents) {
        const curriculumResult = await customCurriculumService.getStudentCurriculum(student.id);
        if (curriculumResult.success && curriculumResult.data) {
          studentsWithCurriculum++;
          const curriculum = curriculumResult.data;
          totalItems += curriculum.items.length;

          const completed = curriculum.items.filter(i => i.status === 'completed').length;
          if (curriculum.items.length > 0) {
            totalProgress += (completed / curriculum.items.length) * 100;
          }
        }
      }

      setStats({
        totalStudents: assignedStudents.length,
        studentsWithCurriculum,
        totalCurriculumItems: totalItems,
        averageProgress: assignedStudents.length > 0 ? Math.round(totalProgress / assignedStudents.length) : 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {user?.role === 'admin' ? 'Curriculum Management' : 'Coach Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName}! Here's an overview of {user?.role === 'admin' ? 'all custom workflow' : 'your'} students.
        </p>
      </div>

      {/* Coach Code Card (Coaches Only) */}
      {user?.role === 'coach' && (
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Your Coach Code</CardTitle>
            </div>
            <CardDescription>
              Share this code with students to connect with them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {coachCode ? (
                  <div className="flex items-center gap-3">
                    <code className="text-2xl font-mono font-bold tracking-wider bg-background px-4 py-2 rounded-md border">
                      {coachCode}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyCode}
                      title="Copy coach code"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRegenerateCode}
                      disabled={regenerating}
                      title="Regenerate code (this will invalidate the old code)"
                    >
                      <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No coach code assigned. Contact an administrator.
                  </p>
                )}
              </div>
            </div>
            {coachCode && (
              <p className="text-xs text-muted-foreground mt-3">
                Students enter this code when registering with &quot;Coach-Guided&quot; learning mode.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Custom workflow students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Curricula</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsWithCurriculum}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Students with assigned curriculum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Content Items</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCurriculumItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all curricula
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your students</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild>
            <Link href="/coach/students">
              <Users className="h-4 w-4 mr-2" />
              View All Students
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

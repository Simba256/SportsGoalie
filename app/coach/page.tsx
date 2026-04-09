'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, TrendingUp, Key, Copy, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  const [_loading, setLoading] = useState(true);
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
      const assignedStudents = allUsersResult.data.items.filter(
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative">
          <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">
            {user?.role === 'admin' ? 'Curriculum Management' : 'Coach Dashboard'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome back, {user?.displayName}!
          </h1>
          <p className="text-white/60 text-sm mt-1">
            Here&apos;s an overview of {user?.role === 'admin' ? 'all custom workflow' : 'your'} students.
          </p>
        </div>
      </div>

      {/* Coach Code Card */}
      {user?.role === 'coach' && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Key className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-bold text-foreground">Your Coach Code</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Share this code with students to connect with them</p>
          <div className="flex items-center gap-3">
            {coachCode ? (
              <>
                <code className="text-2xl font-mono font-bold tracking-wider bg-gray-50 px-5 py-2.5 rounded-xl border border-border text-foreground">
                  {coachCode}
                </code>
                <button
                  onClick={handleCopyCode}
                  className="h-10 w-10 rounded-xl border border-border bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                  title="Copy coach code"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
                <button
                  onClick={handleRegenerateCode}
                  disabled={regenerating}
                  className="h-10 w-10 rounded-xl border border-border bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
                  title="Regenerate code"
                >
                  <RefreshCw className={`h-4 w-4 text-muted-foreground ${regenerating ? 'animate-spin' : ''}`} />
                </button>
              </>
            ) : (
              <button
                onClick={handleRegenerateCode}
                disabled={regenerating}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
              >
                {regenerating ? (
                  <><RefreshCw className="h-4 w-4 mr-2 animate-spin inline" />Generating...</>
                ) : (
                  <><Key className="h-4 w-4 mr-2 inline" />Generate Code</>
                )}
              </button>
            )}
          </div>
          {coachCode && (
            <p className="text-xs text-muted-foreground mt-3">
              Students enter this code when registering with &quot;Coach-Guided&quot; learning mode.
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Students', value: stats.totalStudents, sub: 'Custom workflow students', color: 'red', icon: <Users className="h-5 w-5" /> },
          { label: 'Active Curricula', value: stats.studentsWithCurriculum, sub: 'With assigned curriculum', color: 'blue', icon: <BookOpen className="h-5 w-5" /> },
          { label: 'Content Items', value: stats.totalCurriculumItems, sub: 'Across all curricula', color: 'green', icon: <GraduationCap className="h-5 w-5" /> },
          { label: 'Avg. Progress', value: `${stats.averageProgress}%`, sub: 'Across all students', color: 'orange', icon: <TrendingUp className="h-5 w-5" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
              <div className={`h-9 w-9 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-bold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/coach/students">
            <Button size="sm">
              <Users className="h-4 w-4 mr-2" />
              View All Students
            </Button>
          </Link>
          <Link href="/coach/content">
            <Button variant="outline" size="sm">
              <BookOpen className="h-4 w-4 mr-2" />
              Content Library
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

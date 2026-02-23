'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
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

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user?.id]);

  const loadStats = async () => {
    try {
      // Get all students assigned to this coach
      const allUsersResult = await userService.getAllUsers();
      if (!allUsersResult.success || !allUsersResult.data) return;

      const assignedStudents = allUsersResult.data.filter(
        u => u.role === 'student' &&
            u.workflowType === 'custom' &&
            u.assignedCoachId === user?.id
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
        <h1 className="text-3xl font-bold mb-2">Coach Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.displayName}! Here's an overview of your students.
        </p>
      </div>

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

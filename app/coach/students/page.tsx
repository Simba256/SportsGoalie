'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, BookOpen, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User } from '@/types';
import { toast } from 'sonner';

interface StudentWithCurriculum {
  student: User;
  hasCurriculum: boolean;
  curriculumProgress?: {
    totalItems: number;
    completedItems: number;
    progressPercentage: number;
  };
}

export default function CoachStudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentWithCurriculum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStudents();
    }
  }, [user?.id]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Get all students assigned to this coach
      const allUsersResult = await userService.getAllUsers();

      if (!allUsersResult.success || !allUsersResult.data) {
        toast.error('Failed to load students');
        return;
      }

      // Filter for students assigned to this coach with custom workflow
      const assignedStudents = allUsersResult.data.filter(
        u => u.role === 'student' &&
            u.workflowType === 'custom' &&
            u.assignedCoachId === user?.id
      );

      // Load curriculum data for each student
      const studentsWithCurriculum: StudentWithCurriculum[] = await Promise.all(
        assignedStudents.map(async (student) => {
          const curriculumResult = await customCurriculumService.getStudentCurriculum(student.id);

          if (curriculumResult.success && curriculumResult.data) {
            const curriculum = curriculumResult.data;
            const totalItems = curriculum.items.length;
            const completedItems = curriculum.items.filter(i => i.status === 'completed').length;

            return {
              student,
              hasCurriculum: true,
              curriculumProgress: {
                totalItems,
                completedItems,
                progressPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
              },
            };
          }

          return {
            student,
            hasCurriculum: false,
          };
        })
      );

      setStudents(studentsWithCurriculum);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Students</h1>
        <p className="text-muted-foreground">
          Manage curriculum and track progress for your custom workflow students
        </p>
      </div>

      {students.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Students Assigned</h3>
            <p className="text-muted-foreground text-center max-w-md">
              You don't have any students assigned yet. Students with custom workflow type need to be assigned to you by an administrator.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map(({ student, hasCurriculum, curriculumProgress }) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{student.displayName}</CardTitle>
                    <CardDescription className="mt-1">
                      {student.email}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <GraduationCap className="h-3 w-3 mr-1" />
                    Student
                  </Badge>
                </div>
                {student.studentNumber && (
                  <p className="text-sm text-muted-foreground mt-2">
                    ID: {student.studentNumber}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {hasCurriculum && curriculumProgress ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Curriculum Progress</span>
                      <span className="font-semibold">{curriculumProgress.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{ width: `${curriculumProgress.progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {curriculumProgress.completedItems} of {curriculumProgress.totalItems} items completed
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground py-2">
                    <p>No curriculum created yet</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button asChild className="flex-1" variant={hasCurriculum ? "default" : "outline"}>
                    <Link href={`/coach/students/${student.id}/curriculum`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      {hasCurriculum ? 'Manage Curriculum' : 'Create Curriculum'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

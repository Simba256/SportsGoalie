'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Users, BookOpen, GraduationCap, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User } from '@/types';
import { toast } from 'sonner';
import { StudentSearchDialog } from '@/components/coach/student-search-dialog';

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
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);

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
      // Admins can see ALL custom workflow students
      const assignedStudents = allUsersResult.data.filter(
        u => u.role === 'student' &&
            u.workflowType === 'custom' &&
            (user?.role === 'admin' || u.assignedCoachId === user?.id)
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

  const handleRemoveStudent = async () => {
    if (!studentToRemove || !user?.id) return;

    try {
      setRemoving(true);
      const result = await userService.removeStudentFromCoach(studentToRemove.id, user.id);

      if (result.success) {
        toast.success(`${studentToRemove.displayName} removed from your roster`);
        loadStudents();
      } else {
        toast.error(result.error?.message || 'Failed to remove student');
      }
    } catch (error) {
      console.error('Failed to remove student:', error);
      toast.error('Failed to remove student from roster');
    } finally {
      setRemoving(false);
      setRemoveDialogOpen(false);
      setStudentToRemove(null);
    }
  };

  const openRemoveDialog = (student: User) => {
    setStudentToRemove(student);
    setRemoveDialogOpen(true);
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
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'admin' ? 'All Custom Workflow Students' : 'My Students'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'admin'
              ? 'Manage curriculum and track progress for all custom workflow students'
              : 'Manage curriculum and track progress for your custom workflow students'}
          </p>
        </div>
        {user?.role === 'coach' && (
          <Button onClick={() => setSearchDialogOpen(true)} className="shrink-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        )}
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
                  <div className="flex items-center gap-2 ml-2">
                    <Badge variant="secondary">
                      <GraduationCap className="h-3 w-3 mr-1" />
                      Student
                    </Badge>
                    {user?.role === 'coach' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => openRemoveDialog(student)}
                        title="Remove from roster"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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

      {/* Add Student Dialog */}
      {user?.id && (
        <StudentSearchDialog
          open={searchDialogOpen}
          onOpenChange={setSearchDialogOpen}
          coachId={user.id}
          onStudentAdded={loadStudents}
        />
      )}

      {/* Remove Student Confirmation Dialog */}
      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student from Roster</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">{studentToRemove?.displayName}</span>{' '}
              from your roster? They will no longer appear in your student list, but their curriculum progress will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={removing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Student'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

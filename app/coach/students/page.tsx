'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Users, BookOpen, UserPlus, UserMinus, ClipboardCheck, Clock, Zap, UserCog, LineChart } from 'lucide-react';
import { SkeletonDarkPage } from '@/components/ui/skeletons';
import { useAuth } from '@/lib/auth/context';
import { userService, onboardingService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, OnboardingEvaluation } from '@/types';
import { toast } from 'sonner';
import { StudentSearchDialog } from '@/components/coach/student-search-dialog';

type WorkflowFilter = 'all' | 'custom' | 'automated';

interface StudentWithCurriculum {
  student: User;
  hasCurriculum: boolean;
  curriculumProgress?: {
    totalItems: number;
    completedItems: number;
    progressPercentage: number;
  };
  evaluation?: OnboardingEvaluation | null;
}

export default function CoachStudentsPage() {
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState<StudentWithCurriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<User | null>(null);
  const [removing, setRemoving] = useState(false);
  const [workflowFilter, setWorkflowFilter] = useState<WorkflowFilter>('all');

  useEffect(() => {
    if (user?.id) {
      loadStudents();
    }
  }, [user?.id]);

  const loadStudents = async () => {
    try {
      setLoading(true);

      // Get students — admins see all, coaches see only their assigned students
      const studentsResult = await userService.getAllUsers({ role: 'student' });

      if (!studentsResult.success || !studentsResult.data) {
        toast.error('Failed to load students');
        return;
      }

      // Filter to only students assigned to this coach (admins see all)
      if (user?.role === 'coach') {
        studentsResult.data.items = studentsResult.data.items.filter(
          (s) => s.assignedCoachId === user.id
        );
      }

      // Load curriculum and evaluation data for each student
      const studentsWithData: StudentWithCurriculum[] = await Promise.all(
        studentsResult.data.items.map(async (student) => {
          const [curriculumResult, evaluationResult] = await Promise.all([
            customCurriculumService.getStudentCurriculum(student.id),
            onboardingService.getEvaluation(student.id),
          ]);

          const result: StudentWithCurriculum = {
            student,
            hasCurriculum: false,
            evaluation: evaluationResult.success ? evaluationResult.data : null,
          };

          if (curriculumResult.success && curriculumResult.data) {
            const curriculum = curriculumResult.data;
            const totalItems = curriculum.items.length;
            const completedItems = curriculum.items.filter(i => i.status === 'completed').length;

            result.hasCurriculum = true;
            result.curriculumProgress = {
              totalItems,
              completedItems,
              progressPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
            };
          }

          return result;
        })
      );

      setAllStudents(studentsWithData);
    } catch (error) {
      console.error('Failed to load students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on selected workflow filter
  const filteredStudents = useMemo(() => {
    if (workflowFilter === 'all') {
      return allStudents;
    }
    return allStudents.filter(({ student }) => student.workflowType === workflowFilter);
  }, [allStudents, workflowFilter]);

  // Count students by workflow type
  const counts = useMemo(() => ({
    all: allStudents.length,
    custom: allStudents.filter(({ student }) => student.workflowType === 'custom').length,
    automated: allStudents.filter(({ student }) => student.workflowType === 'automated' || !student.workflowType).length,
  }), [allStudents]);

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
    return <SkeletonDarkPage />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-red-400 text-sm font-semibold tracking-wide uppercase mb-1">My Students</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Students</h1>
            <p className="text-white/60 text-sm mt-1">View evaluations and manage curriculum for your students</p>
          </div>
          {user?.role === 'coach' && workflowFilter === 'custom' && (
            <Button
              onClick={() => setSearchDialogOpen(true)}
              size="sm"
              className="shrink-0"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Filter Tabs */}
      <div className="mb-6">
        <Tabs value={workflowFilter} onValueChange={(v) => setWorkflowFilter(v as WorkflowFilter)}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              All ({counts.all})
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Custom ({counts.custom})
            </TabsTrigger>
            <TabsTrigger value="automated" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automated ({counts.automated})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {workflowFilter === 'all'
                ? 'No Students Found'
                : workflowFilter === 'custom'
                  ? 'No Custom Workflow Students'
                  : 'No Automated Workflow Students'}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {workflowFilter === 'custom'
                ? 'Students with custom workflow type will appear here when assigned.'
                : workflowFilter === 'automated'
                  ? 'Students with automated (self-paced) workflow will appear here.'
                  : 'No students have registered yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map(({ student, hasCurriculum, curriculumProgress, evaluation }) => {
            const isCustomWorkflow = student.workflowType === 'custom';
            const evalStatus = evaluation?.status;
            const evalCoachReview = evaluation?.coachReview;
            const hasCompletedEvaluation = evalStatus === 'completed' || evalStatus === 'reviewed';

            return (
              <Card key={student.id} className="group relative overflow-hidden border-zinc-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-black to-red-600 opacity-80" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-bold text-zinc-900">{student.displayName}</CardTitle>
                      <CardDescription className="mt-1 text-zinc-500">
                        {student.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {/* Workflow Type Badge */}
                      <Badge
                        variant="secondary"
                        className={isCustomWorkflow
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-100 text-blue-700 border-blue-200'}
                      >
                        {isCustomWorkflow ? (
                          <>
                            <UserCog className="h-3 w-3 mr-1" />
                            Custom
                          </>
                        ) : (
                          <>
                            <Zap className="h-3 w-3 mr-1" />
                            Automated
                          </>
                        )}
                      </Badge>
                      {user?.role === 'coach' && isCustomWorkflow && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => openRemoveDialog(student)}
                          title="Remove from roster"
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {student.studentNumber && (
                    <p className="text-xs text-zinc-500 mt-2 tracking-wide uppercase">
                      ID: {student.studentNumber}
                    </p>
                  )}

                  {/* Evaluation Status Badge */}
                  <div className="mt-3">
                    {hasCompletedEvaluation ? (
                      <Badge
                        variant="outline"
                        className={evalCoachReview ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                      >
                        <ClipboardCheck className="h-3 w-3 mr-1" />
                        {evalCoachReview ? 'Evaluation Reviewed' : 'Evaluation Pending Review'}
                      </Badge>
                    ) : !student.onboardingCompleted ? (
                      <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Awaiting Onboarding
                      </Badge>
                    ) : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Curriculum Progress - Only for custom workflow */}
                  {isCustomWorkflow && (
                    hasCurriculum && curriculumProgress ? (
                      <div className="space-y-2 rounded-xl border border-zinc-100 bg-zinc-50/80 p-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-zinc-500">Curriculum Progress</span>
                          <span className="font-semibold text-zinc-900">{curriculumProgress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-zinc-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-red-500 rounded-full h-2 transition-all"
                            style={{ width: `${curriculumProgress.progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-zinc-500">
                          {curriculumProgress.completedItems} of {curriculumProgress.totalItems} items completed
                        </p>
                      </div>
                    ) : (
                      <div className="text-sm text-zinc-500 py-2 rounded-xl border border-dashed border-zinc-200 px-3">
                        <p>No curriculum created yet</p>
                      </div>
                    )
                  )}

                  {/* Evaluation Summary */}
                  {evaluation?.intelligenceProfile?.pacingLevel && (
                    <div className="flex items-center justify-between text-sm py-2 border-t border-zinc-100">
                      <span className="text-zinc-500">Pacing Level</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                        {evaluation.intelligenceProfile.pacingLevel}
                      </Badge>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    {/* View Evaluation - Available for all students with completed evaluation */}
                    {hasCompletedEvaluation && (
                      <Button asChild size="sm" className="border border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 hover:border-blue-300">
                        <Link href={`/coach/students/${student.id}/evaluation`}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          View Evaluation
                        </Link>
                      </Button>
                    )}
                    {/* View Charting History */}
                    <Button asChild size="sm" variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                      <Link href={`/coach/students/${student.id}/charting`}>
                        <LineChart className="h-4 w-4 mr-2" />
                        View Charts
                      </Link>
                    </Button>
                    {/* Manage Curriculum - Only for custom workflow students */}
                    {isCustomWorkflow && (
                      <Button
                        asChild
                        className={hasCurriculum
                          ? 'flex-1 bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200/60'
                          : 'flex-1 border border-red-200 bg-white text-red-700 hover:bg-red-50'}
                        variant={hasCurriculum ? 'default' : 'outline'}
                      >
                        <Link href={`/coach/students/${student.id}/curriculum`}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          {hasCurriculum ? 'Manage Curriculum' : 'Create Curriculum'}
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
        <AlertDialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden border-0 bg-white shadow-2xl rounded-2xl">
          <AlertDialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-blue-500/15 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-red-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300 mb-2">Roster</p>
              <AlertDialogTitle className="text-2xl font-bold tracking-tight text-white">Remove Student from Roster</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300 mt-1.5 text-sm">
              Are you sure you want to remove{' '}
              <span className="font-semibold">{studentToRemove?.displayName}</span>{' '}
              from your roster? They will no longer appear in your student list, but their curriculum progress will be preserved.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="px-8 pb-6 pt-4 border-t border-slate-200 bg-white">
            <AlertDialogCancel disabled={removing} className="px-6 border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStudent}
              disabled={removing}
              className="bg-red-600 text-white hover:bg-red-700"
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

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
import { Loader2, Users, BookOpen, UserPlus, UserMinus, ClipboardCheck, Clock, Zap, UserCog } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, onboardingService } from '@/lib/database';
import { customCurriculumService } from '@/lib/database';
import { User, OnboardingEvaluation, OnboardingEvaluationV2, getLevelDisplayText, getLevelColor } from '@/types';
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
  evaluationV2?: OnboardingEvaluationV2 | null;
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

      // Get ALL students (both custom and automated)
      const studentsResult = await userService.getAllUsers({ role: 'student' });

      if (!studentsResult.success || !studentsResult.data) {
        toast.error('Failed to load students');
        return;
      }

      // Load curriculum and evaluation data for each student
      const studentsWithData: StudentWithCurriculum[] = await Promise.all(
        studentsResult.data.items.map(async (student) => {
          const [curriculumResult, evaluationResult, evaluationV2Result] = await Promise.all([
            customCurriculumService.getStudentCurriculum(student.id),
            onboardingService.getEvaluation(student.id),
            onboardingService.getEvaluationV2(student.id),
          ]);

          const result: StudentWithCurriculum = {
            student,
            hasCurriculum: false,
            evaluation: evaluationResult.success ? evaluationResult.data : null,
            evaluationV2: evaluationV2Result.success ? evaluationV2Result.data : null,
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
          <h1 className="text-3xl font-bold mb-2">Students</h1>
          <p className="text-muted-foreground">
            View evaluations and manage curriculum for your students
          </p>
        </div>
        {user?.role === 'coach' && workflowFilter === 'custom' && (
          <Button onClick={() => setSearchDialogOpen(true)} className="shrink-0">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        )}
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
          {filteredStudents.map(({ student, hasCurriculum, curriculumProgress, evaluation, evaluationV2 }) => {
            const isCustomWorkflow = student.workflowType === 'custom';
            // Prefer V2 evaluation, fall back to V1
            const hasV2Evaluation = evaluationV2 && evaluationV2.status;
            const evalStatus = hasV2Evaluation ? evaluationV2.status : evaluation?.status;
            const evalCoachReview = hasV2Evaluation ? evaluationV2.coachReview : evaluation?.coachReview;
            const hasCompletedEvaluation = evalStatus === 'completed' || evalStatus === 'reviewed';

            return (
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
                      {/* Workflow Type Badge */}
                      <Badge
                        variant="secondary"
                        className={isCustomWorkflow
                          ? 'bg-purple-100 text-purple-700 border-purple-200'
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

                  {/* Evaluation Status Badge */}
                  <div className="mt-3">
                    {hasCompletedEvaluation ? (
                      <Badge
                        variant="outline"
                        className={evalCoachReview ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}
                      >
                        <ClipboardCheck className="h-3 w-3 mr-1" />
                        {evalCoachReview ? 'Evaluation Reviewed' : 'Evaluation Pending Review'}
                        {hasV2Evaluation && <span className="ml-1 text-xs">(V2)</span>}
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
                    )
                  )}

                  {/* Evaluation Summary */}
                  {(evaluationV2?.intelligenceProfile?.pacingLevel || evaluation?.overallLevel) && (
                    <div className="flex items-center justify-between text-sm py-2 border-t">
                      <span className="text-muted-foreground">
                        {hasV2Evaluation ? 'Pacing Level' : 'Initial Level'}
                      </span>
                      {hasV2Evaluation && evaluationV2?.intelligenceProfile?.pacingLevel ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 capitalize">
                          {evaluationV2.intelligenceProfile.pacingLevel}
                        </Badge>
                      ) : evaluation?.overallLevel ? (
                        <Badge variant="outline" className={getLevelColor(evaluation.overallLevel)}>
                          {getLevelDisplayText(evaluation.overallLevel)}
                        </Badge>
                      ) : null}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* View Evaluation - Available for all students with completed evaluation */}
                    {hasCompletedEvaluation && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/coach/students/${student.id}/evaluation`}>
                          <ClipboardCheck className="h-4 w-4 mr-2" />
                          View Evaluation
                        </Link>
                      </Button>
                    )}
                    {/* Manage Curriculum - Only for custom workflow students */}
                    {isCustomWorkflow && (
                      <Button asChild className="flex-1" variant={hasCurriculum ? "default" : "outline"}>
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

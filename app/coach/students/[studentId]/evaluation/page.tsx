'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  ArrowLeft,
  Heart,
  Brain,
  Clock,
  Target,
  MessageCircle,
  Dumbbell,
  BookOpen,
  Save,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  LucideIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, onboardingService } from '@/lib/database';
import {
  User,
  OnboardingEvaluation,
  PacingLevel,
  GoalieCategorySlug,
  getPacingLevelDisplayText,
  getPacingLevelColor,
  GOALIE_CATEGORIES,
  CategoryScoreResult,
  AssessmentResponse,
} from '@/types';
import { GOALIE_ASSESSMENT_QUESTIONS } from '@/data/goalie-assessment-questions';
import { toast } from 'sonner';

// Icons for the 7 goalie categories
const categoryIcons: Record<GoalieCategorySlug, LucideIcon> = {
  feelings: Heart,
  knowledge: Brain,
  pre_game: Clock,
  in_game: Target,
  post_game: MessageCircle,
  training: Dumbbell,
  learning: BookOpen,
};

const pacingOptions: PacingLevel[] = ['introduction', 'development', 'refinement'];

// Helper to safely convert Firestore Timestamp to Date
function toDate(timestamp: unknown): Date | null {
  if (!timestamp) return null;

  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: unknown }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  return null;
}

// Format score for display (1.0 - 4.0 scale)
function formatScore(score: number): string {
  return score.toFixed(1);
}

// Get color class for score
function getScoreColor(score: number): string {
  if (score >= 3.1) return 'text-emerald-600';
  if (score >= 2.2) return 'text-blue-600';
  return 'text-amber-600';
}

// Get progress bar color for score
function getProgressBarColor(score: number): string {
  if (score >= 3.1) return 'bg-emerald-500';
  if (score >= 2.2) return 'bg-blue-500';
  return 'bg-amber-500';
}

// Get score badge color class
function getScoreBadgeColor(score: number): string {
  if (score >= 3.1) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 2.2) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

// Look up question by ID from the assessment questions
function getQuestionById(questionId: string) {
  return GOALIE_ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
}

// Get the text of the selected option
function getSelectedOptionText(questionId: string, optionId: string | string[]): string {
  const question = getQuestionById(questionId);
  if (!question) return 'Unknown';

  // Handle both single select and multi-select
  const optionIds = Array.isArray(optionId) ? optionId : [optionId];
  const selectedTexts = optionIds.map(id => {
    const option = question.options.find(opt => opt.id === id);
    return option?.text || 'Unknown';
  });

  return selectedTexts.join(', ');
}

export default function CoachEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { user: coach } = useAuth();
  const studentId = params.studentId as string;

  const [student, setStudent] = useState<User | null>(null);
  const [evaluation, setEvaluation] = useState<OnboardingEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Review form state
  const [notes, setNotes] = useState('');
  const [adjustedPacingLevel, setAdjustedPacingLevel] = useState<PacingLevel | ''>('');

  // Assessment responses expansion state
  const [showResponses, setShowResponses] = useState(false);

  // Group assessment responses by category (must be before early returns)
  const responsesByCategory = useMemo(() => {
    if (!evaluation?.assessmentResponses) return {};
    const grouped: Record<string, AssessmentResponse[]> = {};
    evaluation.assessmentResponses.forEach(response => {
      if (!grouped[response.categorySlug]) {
        grouped[response.categorySlug] = [];
      }
      grouped[response.categorySlug].push(response);
    });
    // Sort responses within each category by questionCode
    Object.values(grouped).forEach(responses => {
      responses.sort((a, b) => a.questionCode.localeCompare(b.questionCode));
    });
    return grouped;
  }, [evaluation?.assessmentResponses]);

  const totalResponses = evaluation?.assessmentResponses?.length || 0;

  useEffect(() => {
    if (studentId && coach?.id) {
      loadData();
    }
  }, [studentId, coach?.id]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load student
      const studentResult = await userService.getUser(studentId);
      if (!studentResult.success || !studentResult.data) {
        toast.error('Student not found');
        router.push('/coach/students');
        return;
      }

      // Verify access (admin or any coach can view)
      if (coach?.role !== 'admin' && coach?.role !== 'coach') {
        toast.error('Unauthorized: Only coaches and admins can view evaluations');
        router.push('/coach/students');
        return;
      }

      setStudent(studentResult.data);

      // Load evaluation
      const evalResult = await onboardingService.getEvaluation(studentId);
      if (evalResult.success && evalResult.data) {
        setEvaluation(evalResult.data);

        // Pre-fill form with existing review if any
        if (evalResult.data.coachReview) {
          setNotes(evalResult.data.coachReview.notes || '');
          setAdjustedPacingLevel(evalResult.data.coachReview.adjustedPacingLevel || '');
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!evaluation || !coach?.id || !coach?.displayName) return;

    try {
      setSaving(true);

      const result = await onboardingService.addCoachReview({
        evaluationId: evaluation.id,
        coachId: coach.id,
        coachName: coach.displayName,
        notes,
        adjustedPacingLevel: adjustedPacingLevel || undefined,
      });

      if (result.success) {
        toast.success('Review saved successfully');
        loadData(); // Refresh to show updated status
      } else {
        toast.error(result.error?.message || 'Failed to save review');
      }
    } catch (error) {
      console.error('Failed to save review:', error);
      toast.error('Failed to save review');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return null;
  }

  if (!evaluation) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/coach/students">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Evaluation Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {student.displayName} has not completed their onboarding evaluation
              yet. The evaluation will appear here once they complete it.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasCoachReview = !!evaluation.coachReview;
  const profile = evaluation.intelligenceProfile;
  const pacingLevel = profile?.pacingLevel || evaluation.pacingLevel || 'introduction';
  const overallScore = profile?.overallScore || 1.0;
  const categoryScores = profile?.categoryScores || [];

  // Get strengths and gaps from profile
  const strengths = profile?.identifiedStrengths || [];
  const gaps = profile?.identifiedGaps || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/coach/students">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Students
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {student.displayName}&apos;s Evaluation
            </h1>
            <p className="text-muted-foreground">
              Review assessment results and adjust recommended pacing level
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasCoachReview ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Reviewed
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Results Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Profile</CardTitle>
              <CardDescription>
                Completed{' '}
                {evaluation.completedAt
                  ? toDate(evaluation.completedAt)?.toLocaleDateString() ?? 'Unknown'
                  : 'Unknown'}
                {evaluation.duration &&
                  ` • ${Math.round(evaluation.duration / 60)} minutes`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Pacing Level
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-lg px-4 py-1 capitalize ${getPacingLevelColor(pacingLevel)}`}
                  >
                    {getPacingLevelDisplayText(pacingLevel)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Overall Score
                  </p>
                  <p className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                    {formatScore(overallScore)}
                  </p>
                  <p className="text-xs text-muted-foreground">out of 4.0</p>
                </div>
              </div>

              {/* Score breakdown bar */}
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getProgressBarColor(overallScore)}`}
                  style={{ width: `${((overallScore - 1) / 3) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Introduction (1.0-2.2)</span>
                <span>Development (2.2-3.1)</span>
                <span>Refinement (3.1-4.0)</span>
              </div>
            </CardContent>
          </Card>

          {/* Category Results Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Performance across the 7 assessment categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {GOALIE_CATEGORIES.map((category) => {
                  const Icon = categoryIcons[category.slug as GoalieCategorySlug];
                  const result = categoryScores.find(
                    (cs: CategoryScoreResult) => cs.categorySlug === category.slug
                  );
                  const score = result?.averageScore || 1.0;

                  return (
                    <div
                      key={category.slug}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{category.shortName}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                              {formatScore(score)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({category.weight}% weight)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(score)}`}
                          style={{ width: `${((score - 1) / 3) * 100}%` }}
                        />
                      </div>

                      {/* Strengths/Gaps indicators */}
                      {result && (result.strengths.length > 0 || result.gaps.length > 0) && (
                        <div className="flex gap-2 flex-wrap">
                          {result.strengths.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              {result.strengths.length} strength{result.strengths.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                          {result.gaps.length > 0 && (
                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                              {result.gaps.length} gap{result.gaps.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Assessment Responses - Collapsible Section */}
          {totalResponses > 0 && (
            <Card>
              <CardHeader
                className="cursor-pointer select-none"
                onClick={() => setShowResponses(!showResponses)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Assessment Responses
                      {showResponses ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      View all {totalResponses} questions and answers
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">{totalResponses} questions</Badge>
                </div>
              </CardHeader>
              {showResponses && (
                <CardContent className="space-y-6">
                  {GOALIE_CATEGORIES.map((category) => {
                    const Icon = categoryIcons[category.slug as GoalieCategorySlug];
                    const responses = responsesByCategory[category.slug] || [];
                    if (responses.length === 0) return null;

                    return (
                      <div key={category.slug} className="space-y-3">
                        {/* Category Header */}
                        <div className="flex items-center gap-2 pb-2 border-b">
                          <Icon className="h-5 w-5 text-primary" />
                          <h4 className="font-semibold">{category.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            ({responses.length} question{responses.length > 1 ? 's' : ''})
                          </span>
                        </div>

                        {/* Questions in this category */}
                        <div className="space-y-3 pl-7">
                          {responses.map((response) => {
                            const question = getQuestionById(response.questionId);
                            const answerText = getSelectedOptionText(
                              response.questionId,
                              response.value
                            );

                            return (
                              <div
                                key={response.questionId}
                                className="p-3 bg-muted/50 rounded-lg space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {response.questionCode}
                                    </span>
                                    <p className="text-sm font-medium">
                                      {question?.question || 'Unknown question'}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs font-mono shrink-0 ${getScoreBadgeColor(response.score)}`}
                                  >
                                    {formatScore(response.score)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">Answer:</span>{' '}
                                  {answerText}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              )}
            </Card>
          )}

          {/* Strengths & Gaps */}
          {(strengths.length > 0 || gaps.length > 0) && (
            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {strengths.slice(0, 4).map((strength) => (
                      <li key={strength.categorySlug} className="flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-500 mt-1">•</span>
                        <div>
                          <span className="font-medium">{strength.categoryName}</span>
                          <span className="text-muted-foreground ml-1">
                            ({formatScore(strength.score)})
                          </span>
                        </div>
                      </li>
                    ))}
                    {strengths.length === 0 && (
                      <li className="text-muted-foreground">
                        Focus on building foundational skills
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-5 w-5" />
                    Areas for Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {gaps.slice(0, 4).map((gap) => (
                      <li key={gap.categorySlug} className="flex items-start gap-2">
                        <span className="text-amber-600 dark:text-amber-500 mt-1">•</span>
                        <div>
                          <span className="font-medium">{gap.categoryName}</span>
                          <span className="text-muted-foreground ml-1">
                            ({formatScore(gap.score)})
                          </span>
                          {gap.priority === 'high' && (
                            <Badge variant="outline" className="ml-2 text-xs bg-red-50 text-red-700 border-red-200">
                              Priority
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                    {gaps.length === 0 && (
                      <li className="text-muted-foreground">
                        Strong performance across all categories
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Intake Data Summary */}
          {evaluation.intakeData && (
            <Card>
              <CardHeader>
                <CardTitle>Student Background</CardTitle>
                <CardDescription>Information from intake questionnaire</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {evaluation.intakeData.ageRange && (
                    <div>
                      <p className="text-sm text-muted-foreground">Age Range</p>
                      <p className="font-medium">{evaluation.intakeData.ageRange}</p>
                    </div>
                  )}
                  {evaluation.intakeData.experienceLevel && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experience</p>
                      <p className="font-medium">{evaluation.intakeData.experienceLevel}</p>
                    </div>
                  )}
                  {evaluation.intakeData.playingLevel && (
                    <div>
                      <p className="text-sm text-muted-foreground">Playing Level</p>
                      <p className="font-medium">{evaluation.intakeData.playingLevel}</p>
                    </div>
                  )}
                  {evaluation.intakeData.hasGoalieCoach !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Has Goalie Coach</p>
                      <p className="font-medium">{evaluation.intakeData.hasGoalieCoach ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                  {evaluation.intakeData.primaryReasons && evaluation.intakeData.primaryReasons.length > 0 && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Primary Reasons for Joining</p>
                      <p className="font-medium">{evaluation.intakeData.primaryReasons.join(', ')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coach Review Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Coach Review</CardTitle>
              <CardDescription>
                Add notes and adjust the recommended pacing level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adjust Pacing Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Adjust Pacing Level
                </label>
                <Select
                  value={adjustedPacingLevel || 'none'}
                  onValueChange={(value) =>
                    setAdjustedPacingLevel(value === 'none' ? '' : value as PacingLevel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keep assessed level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keep assessed level</SelectItem>
                    {pacingOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {getPacingLevelDisplayText(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {adjustedPacingLevel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Will change from {getPacingLevelDisplayText(pacingLevel)} to{' '}
                    {getPacingLevelDisplayText(adjustedPacingLevel)}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Coach Notes
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add observations, recommendations, or context about the student's assessment..."
                  rows={6}
                />
              </div>

              {/* Previous review info */}
              {evaluation.coachReview && (
                <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                  <p>
                    Previously reviewed by{' '}
                    <span className="font-medium">
                      {evaluation.coachReview.reviewerName || 'Coach'}
                    </span>
                  </p>
                  <p>
                    on{' '}
                    {toDate(evaluation.coachReview.reviewedAt)?.toLocaleDateString() ?? 'Unknown'}
                  </p>
                </div>
              )}

              {/* Save button */}
              <Button
                onClick={handleSaveReview}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {hasCoachReview ? 'Update Review' : 'Save Review'}
                  </>
                )}
              </Button>

              {/* Link to curriculum */}
              <div className="pt-4 border-t">
                <Link href={`/coach/students/${studentId}/curriculum`}>
                  <Button variant="outline" className="w-full">
                    Manage Curriculum
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

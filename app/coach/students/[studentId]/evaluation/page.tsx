'use client';

import { useEffect, useState } from 'react';
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
  Brain,
  Footprints,
  Shapes,
  Target,
  Grid3X3,
  Dumbbell,
  Save,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { userService, onboardingService } from '@/lib/database';
import {
  User,
  OnboardingEvaluation,
  PillarSlug,
  AssessmentLevel,
  PILLARS,
  getLevelDisplayText,
  getLevelColor,
} from '@/types';
import { toast } from 'sonner';

const pillarIcons: Record<PillarSlug, LucideIcon> = {
  mindset: Brain,
  skating: Footprints,
  form: Shapes,
  positioning: Target,
  seven_point: Grid3X3,
  training: Dumbbell,
};

// Helper to safely convert Firestore Timestamp to Date
// Timestamps may come as objects with seconds/nanoseconds after serialization
function toDate(timestamp: unknown): Date | null {
  if (!timestamp) return null;

  // If it has toDate method (real Firestore Timestamp)
  if (typeof timestamp === 'object' && 'toDate' in timestamp && typeof (timestamp as { toDate: unknown }).toDate === 'function') {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  // If it's a serialized timestamp with seconds
  if (typeof timestamp === 'object' && 'seconds' in timestamp) {
    return new Date((timestamp as { seconds: number }).seconds * 1000);
  }

  // If it's already a Date
  if (timestamp instanceof Date) {
    return timestamp;
  }

  return null;
}

const levelOptions: AssessmentLevel[] = ['beginner', 'intermediate', 'advanced'];

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
  const [adjustedLevel, setAdjustedLevel] = useState<AssessmentLevel | ''>('');
  const [adjustedPillarLevels, setAdjustedPillarLevels] = useState<
    Partial<Record<PillarSlug, AssessmentLevel>>
  >({});

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

      // Verify access (admin or assigned coach)
      if (
        coach?.role !== 'admin' &&
        studentResult.data.assignedCoachId !== coach?.id
      ) {
        toast.error('Unauthorized: This student is not assigned to you');
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
          setAdjustedLevel(evalResult.data.coachReview.adjustedLevel || '');
          setAdjustedPillarLevels(
            evalResult.data.coachReview.adjustedPillarLevels || {}
          );
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
        adjustedLevel: adjustedLevel || undefined,
        adjustedPillarLevels:
          Object.keys(adjustedPillarLevels).length > 0
            ? adjustedPillarLevels
            : undefined,
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

  const handlePillarLevelChange = (pillar: PillarSlug, level: string) => {
    if (level === 'none') {
      const updated = { ...adjustedPillarLevels };
      delete updated[pillar];
      setAdjustedPillarLevels(updated);
    } else {
      setAdjustedPillarLevels({
        ...adjustedPillarLevels,
        [pillar]: level as AssessmentLevel,
      });
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
  const overallLevel = evaluation.overallLevel || 'beginner';
  const overallPercentage = evaluation.overallPercentage || 0;

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
              {student.displayName}'s Evaluation
            </h1>
            <p className="text-muted-foreground">
              Review assessment results and adjust recommended levels
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
              <CardTitle>Overall Assessment</CardTitle>
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
                    Recommended Starting Level
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-lg px-4 py-1 ${getLevelColor(overallLevel)}`}
                  >
                    {getLevelDisplayText(overallLevel)}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">
                    Overall Score
                  </p>
                  <p className="text-3xl font-bold">{overallPercentage}%</p>
                </div>
              </div>

              {/* Score breakdown bar */}
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    overallLevel === 'advanced'
                      ? 'bg-green-500'
                      : overallLevel === 'intermediate'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Beginner (0-39%)</span>
                <span>Intermediate (40-69%)</span>
                <span>Advanced (70%+)</span>
              </div>
            </CardContent>
          </Card>

          {/* Pillar Results Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Pillar Breakdown</CardTitle>
              <CardDescription>
                Performance across the 6 Goalie Pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {PILLARS.map((pillar) => {
                  const Icon = pillarIcons[pillar.slug];
                  const result = evaluation.pillarAssessments?.[pillar.slug];
                  const adjustedPillarLevel = adjustedPillarLevels[pillar.slug];
                  const displayLevel = adjustedPillarLevel || result?.level || 'beginner';

                  return (
                    <div
                      key={pillar.slug}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{pillar.shortName}</h4>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${getLevelColor(displayLevel)}`}
                            >
                              {getLevelDisplayText(displayLevel)}
                            </Badge>
                            {adjustedPillarLevel && (
                              <span className="text-xs text-muted-foreground">
                                (adjusted)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      {result && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Score</span>
                            <span className="font-semibold">
                              {result.percentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                result.level === 'advanced'
                                  ? 'bg-green-500'
                                  : result.level === 'intermediate'
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${result.percentage}%` }}
                            />
                          </div>
                        </>
                      )}

                      {/* Adjust level */}
                      <div>
                        <Select
                          value={adjustedPillarLevel || 'none'}
                          onValueChange={(value) =>
                            handlePillarLevelChange(pillar.slug, value)
                          }
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Adjust level..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No adjustment</SelectItem>
                            {levelOptions.map((level) => (
                              <SelectItem key={level} value={level}>
                                {getLevelDisplayText(level)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Strengths & Weaknesses */}
          {evaluation.pillarAssessments && (
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
                    {getTopPillars(evaluation, 'high').map(({ pillar, result }) => (
                      <li key={pillar.slug} className="flex items-center gap-2">
                        <span className="text-green-600 dark:text-green-500">
                          •
                        </span>
                        {pillar.shortName} ({result.percentage}%)
                      </li>
                    ))}
                    {getTopPillars(evaluation, 'high').length === 0 && (
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
                    {getTopPillars(evaluation, 'low').map(({ pillar, result }) => (
                      <li key={pillar.slug} className="flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-500">
                          •
                        </span>
                        {pillar.shortName} ({result.percentage}%)
                      </li>
                    ))}
                    {getTopPillars(evaluation, 'low').length === 0 && (
                      <li className="text-muted-foreground">
                        Strong performance across all pillars
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Coach Review Panel */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Coach Review</CardTitle>
              <CardDescription>
                Add notes and adjust the recommended starting level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Adjust Overall Level */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Adjust Overall Level
                </label>
                <Select
                  value={adjustedLevel || 'none'}
                  onValueChange={(value) =>
                    setAdjustedLevel(value === 'none' ? '' : value as AssessmentLevel)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Keep assessed level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keep assessed level</SelectItem>
                    {levelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {getLevelDisplayText(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {adjustedLevel && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Will change from {getLevelDisplayText(overallLevel)} to{' '}
                    {getLevelDisplayText(adjustedLevel)}
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

// Helper function to get top/bottom pillars
function getTopPillars(
  evaluation: OnboardingEvaluation,
  type: 'high' | 'low'
): Array<{ pillar: (typeof PILLARS)[number]; result: { percentage: number } }> {
  if (!evaluation.pillarAssessments) return [];

  const pillarsWithScores = PILLARS.map((pillar) => ({
    pillar,
    result: evaluation.pillarAssessments![pillar.slug],
  })).filter(({ result }) => result);

  if (type === 'high') {
    return pillarsWithScores
      .filter(({ result }) => result.percentage >= 60)
      .sort((a, b) => b.result.percentage - a.result.percentage)
      .slice(0, 3);
  } else {
    return pillarsWithScores
      .filter(({ result }) => result.percentage < 60)
      .sort((a, b) => a.result.percentage - b.result.percentage)
      .slice(0, 3);
  }
}

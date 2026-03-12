'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { LinkedChildSummary, ParentCrossReferenceView } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CrossReferenceDisplay } from '@/components/parent';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Scale,
} from 'lucide-react';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';

export default function ChildDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;

  const [childData, setChildData] = useState<LinkedChildSummary | null>(null);
  const [crossReferenceData, setCrossReferenceData] = useState<ParentCrossReferenceView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !childId) return;

    const loadChildData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verify the parent is linked to this child
        const isLinked = await parentLinkService.isLinked(user.id, childId);
        if (!isLinked) {
          setError('You are not linked to this goalie');
          return;
        }

        // Get linked children to get full data for this child
        const childrenResult = await parentLinkService.getLinkedChildren(user.id);
        if (childrenResult.success && childrenResult.data) {
          const child = childrenResult.data.find(c => c.childId === childId);
          if (child) {
            setChildData(child);
          } else {
            setError('Goalie not found');
          }
        }

        // TODO: Load cross-reference data when onboarding service provides it
        // For now, create mock data structure
        setCrossReferenceData({
          childId,
          childName: childData?.displayName || 'Your Goalie',
          goalieAssessmentComplete: childData?.hasCompletedAssessment || false,
          parentAssessmentComplete: user.parentOnboardingComplete || false,
          comparisons: [],
          overallAlignmentScore: 0,
          criticalGapsCount: 0,
          strengthAlignmentsCount: 0,
          lastUpdated: new Date(),
        });

      } catch (err) {
        console.error('Failed to load child data:', err);
        setError('Failed to load goalie data');
      } finally {
        setLoading(false);
      }
    };

    loadChildData();
  }, [user, childId]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  if (user.role !== 'parent') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            This page is only available for parent accounts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/parent">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  if (!childData) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            Could not find the goalie you're looking for.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPacingLevelBadge = (level: string | undefined) => {
    if (!level) return null;

    const variants: Record<string, { className: string; label: string }> = {
      beginner: { className: 'bg-amber-100 text-amber-800', label: 'Introduction' },
      introduction: { className: 'bg-amber-100 text-amber-800', label: 'Introduction' },
      intermediate: { className: 'bg-blue-100 text-blue-800', label: 'Development' },
      development: { className: 'bg-blue-100 text-blue-800', label: 'Development' },
      advanced: { className: 'bg-emerald-100 text-emerald-800', label: 'Refinement' },
      refinement: { className: 'bg-emerald-100 text-emerald-800', label: 'Refinement' },
    };

    const variant = variants[level] || variants['beginner'];
    return (
      <Badge variant="secondary" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/parent" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Child Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={childData.profileImage} alt={childData.displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getInitials(childData.displayName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{childData.displayName}</h1>
                  {getPacingLevelBadge(childData.pacingLevel)}
                </div>

                {childData.studentNumber && (
                  <p className="text-sm text-muted-foreground font-mono mb-3">
                    ID: {childData.studentNumber}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Linked: {childData.linkedAt.toLocaleDateString()}
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {childData.relationship}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(childData.progressPercentage || 0)}%
              </div>
              <Progress value={childData.progressPercentage || 0} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Award className="h-3.5 w-3.5" />
                Quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childData.quizzesCompleted || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                Streak
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{childData.currentStreak || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {childData.currentStreak === 1 ? 'Day' : 'Days'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Last Active
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">
                {childData.lastActiveAt
                  ? childData.lastActiveAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {childData.lastActiveAt
                  ? childData.lastActiveAt.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="comparison" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Perception Comparison
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Progress Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="comparison" className="mt-6">
            {crossReferenceData ? (
              <CrossReferenceDisplay data={crossReferenceData} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Comparison Data</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Complete your parent assessment to see how your perceptions compare with your
                    goalie's self-assessment.
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/parent/onboarding">Take Parent Assessment</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress History</CardTitle>
                <CardDescription>
                  Track your goalie's learning journey over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Detailed progress charts coming soon.</p>
                  <p className="text-sm mt-2">
                    You'll be able to see quiz scores, time spent, and skill completion over time.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

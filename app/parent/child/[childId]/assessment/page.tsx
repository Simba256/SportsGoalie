'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  ChevronLeft,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';

export default function ParentAssessmentPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const childId = params.childId as string;

  const [childName, setChildName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!user || !childId) return;

    const checkAuthorization = async () => {
      try {
        setLoading(true);
        setError(null);

        // Verify the parent is linked to this child
        const isLinked = await parentLinkService.isLinked(user.id, childId);
        if (!isLinked) {
          setError('You are not linked to this goalie');
          return;
        }

        setIsAuthorized(true);

        // Get child name
        const childrenResult = await parentLinkService.getLinkedChildren(user.id);
        if (childrenResult.success && childrenResult.data) {
          const child = childrenResult.data.find(c => c.childId === childId);
          if (child) {
            setChildName(child.displayName);
          }
        }

      } catch (err) {
        console.error('Failed to check authorization:', err);
        setError('Failed to verify access');
      } finally {
        setLoading(false);
      }
    };

    checkAuthorization();
  }, [user, childId]);

  if (authLoading || loading) {
    return <SkeletonContentPage />;
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

  if (error || !isAuthorized) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || 'You are not authorized to view this page'}</AlertDescription>
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

  // Check if parent has already completed their assessment
  if (user.parentOnboardingComplete) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/parent/child/${childId}`} className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to {childName}'s Profile
            </Link>
          </Button>

          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Assessment Complete</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You've already completed your parent assessment. View the perception comparison
                to see how your views align with {childName}'s self-assessment.
              </p>
              <Button asChild>
                <Link href={`/parent/child/${childId}`}>
                  View Perception Comparison
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/parent/child/${childId}`} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to {childName}'s Profile
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              Parent Assessment
            </CardTitle>
            <CardDescription>
              Share your perspective on {childName}'s goaltending journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This assessment helps us understand your perspective on your goalie's skills,
              confidence, and development. Your answers will be compared with {childName}'s
              self-assessment to identify areas of alignment and opportunities for better support.
            </p>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium">What to expect:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>28 questions across 7 categories</li>
                <li>Estimated completion: 10-15 minutes</li>
                <li>No right or wrong answers - just your honest perspective</li>
                <li>Results compared with your goalie's self-assessment</li>
              </ul>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For the most accurate comparison, complete this assessment based on your
                current observations of {childName}, not how you hope they'll develop.
              </AlertDescription>
            </Alert>

            <Button className="w-full" asChild>
              <Link href="/onboarding?role=parent">
                Start Assessment
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function ParentOnboardingPage() {
  const { user, loading } = useAuth();

  if (loading) {
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

  // Check if already completed
  if (user.parentOnboardingComplete) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/parent" className="flex items-center gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                You've already completed your parent assessment. View your linked goalies to see
                how your perceptions compare with their self-assessments.
              </p>
              <Button asChild>
                <Link href="/parent">
                  Go to Dashboard
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
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild>
          <Link href="/parent" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        {/* Welcome Card */}
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome, Parent!</CardTitle>
            <CardDescription className="text-base">
              Help us understand your perspective on your goalie's development
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                This questionnaire helps us understand how you perceive your goalie's skills,
                confidence, and development needs. Your responses will be cross-referenced with
                their self-assessment to provide valuable insights.
              </p>

              {/* What's included */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold">7 Assessment Categories:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Your Goalie's Current State</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Position Understanding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Pre-Game Observations</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>The Car Ride Home</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Your Role in Development</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Expectations & Goals</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Communication Preferences</span>
                  </div>
                </div>
              </div>

              {/* Time estimate */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ClipboardCheck className="h-4 w-4" />
                <span>28 questions | Approximately 10-15 minutes</span>
              </div>
            </div>

            {/* Important note */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Honest Perspectives Help Most</AlertTitle>
              <AlertDescription>
                There are no right or wrong answers. Answer based on your current observations,
                not what you hope will happen. This helps identify genuine areas for support.
              </AlertDescription>
            </Alert>

            {/* Start Button */}
            <Button className="w-full" size="lg" asChild>
              <Link href="/onboarding?role=parent">
                Begin Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>

            {/* Skip option */}
            <p className="text-center text-xs text-muted-foreground">
              You can complete this assessment later from your dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

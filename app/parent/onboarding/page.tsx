'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ClipboardCheck,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
} from 'lucide-react';
import { SkeletonContentPage } from '@/components/ui/skeletons';
import Link from 'next/link';

/**
 * Parent onboarding page — redirects to the main onboarding flow.
 * The assessment is now part of the immersive onboarding experience at /onboarding.
 */
export default function ParentOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) {
    return <SkeletonContentPage />;
  }

    if (!user) {
      router.push('/auth/login');
      return;
    }

  if (user.role !== 'parent') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-sm text-red-700">This page is only available for parent accounts.</p>
          </div>
        </div>
      </div>
    );
  }

  // Already completed
  if (user.parentOnboardingComplete) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-xl shadow-red-900/5">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Complete!</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            You&apos;ve already completed your parent assessment. View your linked goalies to see
            how your perceptions compare with their self-assessments.
          </p>
          <Link href="/parent">
            <Button className="bg-red-600 hover:bg-red-700">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Main Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-xl shadow-red-900/5 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 px-8 py-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 via-transparent to-red-500/5" />
          <div className="relative">
            <div className="mx-auto w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Welcome, Parent!</h1>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Help us understand your perspective on your goalie&apos;s development
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8 space-y-6">
          <p className="text-center text-gray-500 text-sm leading-relaxed">
            This questionnaire helps us understand how you perceive your goalie&apos;s skills,
            confidence, and development needs. Your responses will be cross-referenced with
            their self-assessment to provide valuable insights.
          </p>

          {/* Categories Grid */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              7 Assessment Categories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Your Goalie\'s Current State',
                'Position Understanding',
                'Pre-Game Observations',
                'The Car Ride Home',
                'Your Role in Development',
                'Expectations & Goals',
                'Communication Preferences',
              ].map((cat) => (
                <div key={cat} className="flex items-center gap-2.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Estimate */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            <span>28 questions &middot; Approximately 10-15 minutes</span>
          </div>

          {/* Note */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3">
            <ClipboardCheck className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">Honest Perspectives Help Most</h4>
              <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                There are no right or wrong answers. Answer based on your current observations,
                not what you hope will happen. This helps identify genuine areas for support.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-base" asChild>
            <Link href="/onboarding?role=parent">
              Begin Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>

          <p className="text-center text-xs text-gray-400">
            You can complete this assessment later from your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

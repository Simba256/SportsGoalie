'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { SkeletonContentPage } from '@/components/ui/skeletons';

// This page now redirects directly to the Coach Baseline Profile questionnaire.
// The old landing page (category list + "Begin Assessment" button) is bypassed.
export default function CoachOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (user.coachOnboardingComplete) { router.replace('/coach'); return; }
    router.replace('/coach/assessment');
  }, [user, loading, router]);

  return <SkeletonContentPage />;
}

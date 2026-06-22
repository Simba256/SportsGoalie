'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { CoachBaselineQuestionnaire } from '@/components/onboarding';
import { SkeletonContentPage } from '@/components/ui/skeletons';

export default function CoachAssessmentPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/login'); return; }
    if (user.coachOnboardingComplete) { router.replace('/coach'); return; }
  }, [user, loading, router]);

  if (loading || !user) return <SkeletonContentPage />;
  if (user.coachOnboardingComplete) return null;

  const handleComplete = async () => {
    await refreshUser();
    router.push('/coach');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 72px)' }}>
      <CoachBaselineQuestionnaire
        userId={user.id}
        userName={user.displayName?.split(' ')[0] || 'Coach'}
        onComplete={handleComplete}
      />
    </div>
  );
}

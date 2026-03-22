'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { Loader2 } from 'lucide-react';

/**
 * Parent onboarding page — redirects to the main onboarding flow.
 * The assessment is now part of the immersive onboarding experience at /onboarding.
 */
export default function ParentOnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (user.role !== 'parent') {
      router.push('/dashboard');
      return;
    }

    if (user.parentOnboardingComplete) {
      router.push('/parent');
      return;
    }

    // Redirect to the main onboarding flow with parent role
    router.push('/onboarding?role=parent');
  }, [user, loading, router]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

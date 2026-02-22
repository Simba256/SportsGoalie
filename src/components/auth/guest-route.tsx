'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/lib/auth/context';
import { UserRole } from '@/types';

/**
 * Get the default redirect path for a user based on their role
 */
function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'coach':
      return '/dashboard'; // Will have coach-specific features in Phase 2
    case 'parent':
      return '/dashboard'; // Will have parent-specific features in Phase 2
    case 'student':
    default:
      return '/dashboard';
  }
}

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function GuestRoute({
  children,
  fallback,
}: GuestRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.role) {
      // Redirect based on user role
      const roleBasedRedirect = getRoleBasedRedirect(user.role);
      router.push(roleBasedRedirect);
    }
  }, [loading, isAuthenticated, user, router]);

  if (loading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}
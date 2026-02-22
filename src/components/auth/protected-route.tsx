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

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/auth/login',
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      if (requiredRole && user?.role !== requiredRole) {
        // Redirect based on user role
        const roleBasedRedirect = getRoleBasedRedirect(user?.role || 'student');
        router.push(roleBasedRedirect);
        return;
      }
    }
  }, [loading, isAuthenticated, user, requiredRole, router, redirectTo]);

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

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && user?.role !== requiredRole) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}

// Wrapper for admin-only pages
export function AdminRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  const { user, isAuthenticated } = useAuth();

  // Determine redirect target based on authentication status
  const getRedirectTarget = () => {
    if (!isAuthenticated) {
      return '/auth/login'; // Not logged in -> login page
    }
    if (user?.role) {
      return getRoleBasedRedirect(user.role); // Redirect to role-specific dashboard
    }
    return '/auth/login'; // Fallback to login
  };

  return (
    <ProtectedRoute requiredRole="admin" redirectTo={getRedirectTarget()} {...props}>
      {children}
    </ProtectedRoute>
  );
}

// Wrapper for student-only pages
export function StudentRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requiredRole'>) {
  return (
    <ProtectedRoute requiredRole="student" redirectTo="/admin" {...props}>
      {children}
    </ProtectedRoute>
  );
}
import { useAuth } from '@/lib/auth/context';

// Re-export the main useAuth hook
export { useAuth };

// Custom hook to check if user has specific role
export function useRole(requiredRole: 'student' | 'admin') {
  const { user, isAuthenticated } = useAuth();

  return {
    hasRole: isAuthenticated && user?.role === requiredRole,
    user,
    isAuthenticated,
  };
}

// Custom hook to check if user is admin
export function useIsAdmin() {
  const { hasRole, user, isAuthenticated } = useRole('admin');

  return {
    isAdmin: hasRole,
    user,
    isAuthenticated,
  };
}

// Custom hook to check if user is student
export function useIsStudent() {
  const { hasRole, user, isAuthenticated } = useRole('student');

  return {
    isStudent: hasRole,
    user,
    isAuthenticated,
  };
}

// Custom hook for protected route logic
export function useRequireAuth(redirectTo = '/auth/login') {
  const { user, loading, isAuthenticated } = useAuth();

  return {
    user,
    loading,
    isAuthenticated,
    shouldRedirect: !loading && !isAuthenticated,
    redirectTo,
  };
}

// Custom hook for guest-only routes (redirect if authenticated)
export function useRequireGuest(redirectTo = '/dashboard') {
  const { user, loading, isAuthenticated } = useAuth();

  return {
    user,
    loading,
    isAuthenticated,
    shouldRedirect: !loading && isAuthenticated,
    redirectTo,
  };
}
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth/context';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { UserRole } from '@/types';

/**
 * Where a signed-in person who does not belong in the goalie portal is sent
 * instead. Goalies, and admins (who need to preview and test the portal),
 * have no entry: they stay.
 */
const OTHER_PORTAL_HOME: Partial<Record<UserRole, string>> = {
  coach: '/coach',
  parent: '/parent',
};

function GoalieAreaGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const home = user?.role ? OTHER_PORTAL_HOME[user.role] : undefined;

  useEffect(() => {
    // replace, not push: the Back button must not land on the page that
    // just bounced them.
    if (home) router.replace(home);
  }, [home, router]);

  if (home) return null; // Will redirect in useEffect
  return <>{children}</>;
}

/**
 * The door to the goalie portal's own pages (/pillars and everything under
 * it). The public marketing pages (/pillar/[id]) are a different family and
 * stay open to everyone.
 *
 * Logged out: sent to login. Paused or still-walled applicants: held on their
 * own screen. Coaches and parents: sent to their own portal. Goalies and
 * admins: let in.
 *
 * This hides the screens. It does not stop someone reading the underlying
 * Firestore documents directly — that is the job of firestore.rules.
 */
export function GoalieAreaRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <GoalieAreaGate>{children}</GoalieAreaGate>
    </ProtectedRoute>
  );
}

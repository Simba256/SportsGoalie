'use client';

import { useAuth } from '@/lib/auth/context';
import { ParentDashboard } from '@/components/parent';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function ParentDashboardPage() {
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

  // Check if user is a parent
  if (user.role !== 'parent') {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="space-y-4">
            <p>
              This dashboard is only available for parent accounts. Your account type is:{' '}
              <span className="font-semibold capitalize">{user.role}</span>
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/">Go to Home</Link>
              </Button>
              {user.role === 'student' && (
                <Button asChild>
                  <Link href="/progress">View Your Progress</Link>
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ParentDashboard user={user} />
    </div>
  );
}

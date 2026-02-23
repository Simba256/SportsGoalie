'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'coach')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || user.role !== 'coach') {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Coach Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-4 py-4">
            <Button variant="ghost" asChild>
              <Link href="/coach">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/coach/students">
                <Users className="h-4 w-4 mr-2" />
                My Students
              </Link>
            </Button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

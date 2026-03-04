'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Users, LayoutDashboard, FolderOpen } from 'lucide-react';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/button';
import { CoachBreadcrumb } from '@/components/coach/coach-breadcrumb';

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'coach' && user.role !== 'admin'))) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || (user.role !== 'coach' && user.role !== 'admin')) {
    return null;
  }

  // Active state helpers
  const isDashboard = pathname === '/coach';
  const isStudents = pathname.startsWith('/coach/students');
  const isContent = pathname.startsWith('/coach/content');

  return (
    <div className="min-h-screen">
      {/* Coach Navigation */}
      <div className="border-b">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-4 py-4">
            <Button variant={isDashboard ? 'secondary' : 'ghost'} asChild>
              <Link href="/coach">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant={isStudents ? 'secondary' : 'ghost'} asChild>
              <Link href="/coach/students">
                <Users className="h-4 w-4 mr-2" />
                My Students
              </Link>
            </Button>
            <Button variant={isContent ? 'secondary' : 'ghost'} asChild>
              <Link href="/coach/content">
                <FolderOpen className="h-4 w-4 mr-2" />
                Content Library
              </Link>
            </Button>
          </nav>
          <CoachBreadcrumb className="pb-3" />
        </div>
      </div>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

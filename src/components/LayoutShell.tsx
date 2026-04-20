'use client';

import { useState, type ReactNode } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Header7 } from '@/components/header-7';
import { Footer7 } from '@/components/footer-7';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ParentSidebar } from '@/components/parent/ParentSidebar';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { CoachSidebar } from '@/components/coach/CoachSidebar';

const BARE_ROUTES = ['/auth'];
const PUBLIC_ROUTES = ['/', '/onboarding', '/pricing'];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }
  return PUBLIC_ROUTES.some(route => route !== '/' && pathname.startsWith(route));
}

function isBareRoute(pathname: string): boolean {
  return BARE_ROUTES.some(route => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function isCoachRoute(pathname: string): boolean {
  return pathname.startsWith('/coach');
}

function isParentRoute(pathname: string): boolean {
  return pathname.startsWith('/parent');
}

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first === 'admin') {
    const adminTitles: Record<string, string> = {
      admin: 'Dashboard',
      analytics: 'Analytics',
      users: 'Users',
      coaches: 'Coaches',
      pillars: 'Pillars',
      quizzes: 'Quizzes',
      'video-reviews': 'Video Reviews',
      'form-templates': 'Form Templates',
      messages: 'Messages',
      moderation: 'Moderation',
      charting: 'Charting',
      settings: 'Settings',
      'project-assistant': 'Project Assistant',
    };
    return adminTitles[segments[1]] || 'Dashboard';
  }

  if (first === 'coach') {
    const coachTitles: Record<string, string> = {
      coach: 'Dashboard',
      students: 'My Students',
      content: 'Content Library',
    };
    return coachTitles[segments[1]] || 'Dashboard';
  }

  if (first === 'parent') {
    const parentTitles: Record<string, string> = {
      parent: 'Dashboard',
      goalies: 'My Goalies',
      'link-child': 'Link Goalie',
      onboarding: 'Assessment',
      perception: 'Perception',
      profile: 'Profile',
      child: 'Goalie Details',
    };
    return parentTitles[segments[1]] || 'Dashboard';
  }

  const studentTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    pillars: 'Pillars',
    lessons: 'Lessons',
    quizzes: 'Quizzes',
    quiz: 'Quiz',
    progress: 'Analytics',
    goals: 'Goals & Achievements',
    messages: 'Messages',
    profile: 'Profile',
    charting: 'Charting',
    'mind-vault': 'Mind Vault',
    learn: 'Learn',
  };

  return studentTitles[first] || 'Dashboard';
}

function TopBar({
  pageTitle,
  onToggleSidebar,
}: {
  pageTitle: string;
  onToggleSidebar: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center px-6 gap-4">
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        aria-label="Toggle sidebar"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <span className="text-sm text-gray-900 font-semibold">{pageTitle}</span>
    </header>
  );
}

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (searchParams.get('embedded') === '1') {
    return <>{children}</>;
  }

  if (isBareRoute(pathname)) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">{children}</main>
        <Footer7 />
      </div>
    );
  }

  if (isPublicRoute(pathname)) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header7 />
        <main className="flex-1">{children}</main>
        <Footer7 />
      </div>
    );
  }

  const pageTitle = getPageTitle(pathname);

  if (isAdminRoute(pathname)) {
    return (
      <div className="min-h-screen bg-white">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  if (isCoachRoute(pathname)) {
    return (
      <div className="min-h-screen bg-white">
        <CoachSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  if (isParentRoute(pathname)) {
    return (
      <div className="min-h-screen bg-white">
        <ParentSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  return (
    <div className="goalie-app min-h-screen bg-gray-50">
      <DashboardSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <TopBar pageTitle={pageTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">{children}</main>
        <Footer7 />
      </div>
    </div>
  );
}

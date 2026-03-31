'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header7 } from '@/components/header-7';
import { Footer7 } from '@/components/footer-7';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { ParentSidebar } from '@/components/parent/ParentSidebar';
import { CoachSidebar } from '@/components/coach/CoachSidebar';

/** Routes that render only their own content (no header/footer/sidebar) */
const BARE_ROUTES = ['/auth'];
/** Routes that get the public layout (header + footer, no sidebar) */
const PUBLIC_ROUTES = ['/', '/onboarding', '/pricing'];
/** Routes that have their own layout and should not get the sidebar */
const EXCLUDED_ROUTES = ['/admin'];

function isPublicRoute(pathname: string) {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some(
    (r) => r !== '/' && pathname.startsWith(r)
  );
}

function isBareRoute(pathname: string) {
  return BARE_ROUTES.some((r) => pathname.startsWith(r));
}

function isExcludedRoute(pathname: string) {
  return EXCLUDED_ROUTES.some((r) => pathname.startsWith(r));
}

function isCoachRoute(pathname: string) {
  return pathname.startsWith('/coach');
}

function isParentRoute(pathname: string) {
  return pathname.startsWith('/parent');
}

/** Map pathname to a readable page title for the top bar */
function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  if (first === 'coach') {
    const coachTitles: Record<string, string> = {
      coach: 'Dashboard',
      students: 'My Students',
      content: 'Content Library',
    };
    const second = segments[1];
    return coachTitles[second] || 'Dashboard';
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
    const second = segments[1];
    return parentTitles[second] || 'Dashboard';
  }

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    pillars: 'Pillars',
    quizzes: 'Quizzes',
    quiz: 'Quiz',
    progress: 'Analytics',
    achievements: 'Achievements',
    goals: 'Goals',
    messages: 'Messages',
    profile: 'Profile',
    charting: 'Charting',
    learn: 'Learn',
  };

  return titles[first] || 'Dashboard';
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth pages: no header/footer, just the page itself
  if (isBareRoute(pathname)) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">{children}</main>
        <Footer7 />
      </div>
    );
  }

  // Public pages: landing, onboarding
  if (isPublicRoute(pathname)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header7 />
        <main className="flex-1">{children}</main>
        <Footer7 />
      </div>
    );
  }

  // Coach, admin have their own layouts — just render children
  if (isExcludedRoute(pathname)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header7 />
        <main className="flex-1">{children}</main>
        <Footer7 />
      </div>
    );
  }

  // Coach pages: coach sidebar layout
  if (isCoachRoute(pathname)) {
    const pageTitle = getPageTitle(pathname);

    return (
      <div className="min-h-screen bg-white">
        <CoachSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center px-6 gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-sm text-gray-900 font-semibold">{pageTitle}</span>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  // Parent pages: parent sidebar layout
  if (isParentRoute(pathname)) {
    const pageTitle = getPageTitle(pathname);

    return (
      <div className="min-h-screen bg-white">
        <ParentSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        <div
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center px-6 gap-4">
            <span className="text-sm text-gray-900 font-semibold">{pageTitle}</span>
          </header>

          {/* Page content */}
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  // All other authenticated student pages: sidebar layout
  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center px-6 gap-4">
          <span className="text-sm text-gray-500 font-medium">{pageTitle}</span>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
        <Footer7 />
      </div>
    </div>
  );
}

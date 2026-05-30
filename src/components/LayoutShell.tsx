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
const NAKED_ROUTES = ['/explain', '/goalie', '/parent-role', '/team-programs', '/goalie-coach', '/organization'];
const PUBLIC_ROUTES = ['/', '/onboarding', '/pricing'];

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PUBLIC_ROUTES.some(route => route !== '/' && pathname.startsWith(route));
}
function isBareRoute(pathname: string): boolean {
  return BARE_ROUTES.some(route => pathname.startsWith(route));
}
function isNakedRoute(pathname: string): boolean {
  return NAKED_ROUTES.some(route => pathname.startsWith(route));
}
function isAdminRoute(pathname: string): boolean { return pathname.startsWith('/admin'); }
function isCoachRoute(pathname: string): boolean { return pathname.startsWith('/coach'); }
function isParentRoute(pathname: string): boolean { return pathname.startsWith('/parent'); }

function getPageTitle(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  if (first === 'admin') {
    const titles: Record<string, string> = {
      admin: 'Dashboard', analytics: 'Analytics', users: 'Users', coaches: 'Coaches',
      pillars: 'Pillars', quizzes: 'Quizzes', 'video-reviews': 'Video Reviews',
      'form-templates': 'Form Templates', messages: 'Messages', moderation: 'Moderation',
      charting: 'Charting', settings: 'Settings', 'project-assistant': 'Project Assistant',
    };
    return titles[segments[1]] || 'Dashboard';
  }
  if (first === 'coach') {
    const titles: Record<string, string> = { coach: 'Dashboard', students: 'My Students', content: 'Content Library' };
    return titles[segments[1]] || 'Dashboard';
  }
  if (first === 'parent') {
    const titles: Record<string, string> = {
      parent: 'Dashboard', goalies: 'My Goalies', 'link-child': 'Link Goalie',
      onboarding: 'Assessment', perception: 'Perception', profile: 'Profile', child: 'Goalie Details',
    };
    return titles[segments[1]] || 'Dashboard';
  }
  const titles: Record<string, string> = {
    dashboard: 'Dashboard', pillars: 'Pillars', lessons: 'Lessons', quizzes: 'Quizzes',
    quiz: 'Quiz', progress: 'Analytics', goals: 'Goals & Achievements', messages: 'Messages',
    profile: 'Profile', charting: 'Charting', 'mind-vault': 'Mind Vault', learn: 'Learn',
  };
  return titles[first] || 'Dashboard';
}

function TopBar({ pageTitle, onToggleSidebar }: { pageTitle: string; onToggleSidebar: () => void }) {
  return (
    <>
      <style>{`.tb-toggle:hover{background:rgba(55,181,255,0.1)!important;color:#37b5ff!important}`}</style>
      <header style={{ position: 'sticky', top: 0, zIndex: 30, height: '64px', background: 'rgba(0,15,40,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(55,181,255,0.12)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', boxShadow: '0 1px 24px rgba(0,0,0,0.3)' }}>
        <button onClick={onToggleSidebar} className="lg:hidden tb-toggle"
          style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0 }}
          aria-label="Toggle sidebar">
          <svg style={{ height: '20px', width: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>{pageTitle}</span>
        <div style={{ flex: 1 }} />
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#37b5ff', boxShadow: '0 0 8px rgba(55,181,255,0.7)', flexShrink: 0 }} />
      </header>
    </>
  );
}

const appBg = 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)';

export function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggle = () => setSidebarOpen(o => !o);

  if (searchParams.get('embedded') === '1') return <>{children}</>;
  if (isNakedRoute(pathname)) return <>{children}</>;
  if (isBareRoute(pathname)) return <>{children}</>;

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
      <div style={{ minHeight: '100vh', background: appBg }}>
        <AdminSidebar isOpen={sidebarOpen} onToggle={toggle} />
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={toggle} />
          <main className="p-6">{children}</main>
        </div>
      </div>
    );
  }

  if (isCoachRoute(pathname)) {
    return (
      <div style={{ minHeight: '100vh', background: appBg }}>
        <CoachSidebar isOpen={sidebarOpen} onToggle={toggle} />
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={toggle} />
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  if (isParentRoute(pathname)) {
    return (
      <div style={{ minHeight: '100vh', background: appBg }}>
        <ParentSidebar isOpen={sidebarOpen} onToggle={toggle} />
        <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <TopBar pageTitle={pageTitle} onToggleSidebar={toggle} />
          <main className="p-6">{children}</main>
          <Footer7 />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: appBg }}>
      <DashboardSidebar isOpen={sidebarOpen} onToggle={toggle} />
      <div className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <TopBar pageTitle={pageTitle} onToggleSidebar={toggle} />
        <main className="p-6">{children}</main>
        <Footer7 />
      </div>
    </div>
  );
}

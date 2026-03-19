'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  User,
  UserCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface ParentSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { label: 'Dashboard', href: '/parent', icon: LayoutDashboard },
  { label: 'My Goalies', href: '/parent/goalies', icon: Users },
  { label: 'Assessment', href: '/parent/onboarding', icon: ClipboardCheck },
  { label: 'Perception', href: '/parent/perception', icon: Eye },
  { label: 'Profile', href: '/parent/profile', icon: UserCircle },
];

export function ParentSidebar({ isOpen, onToggle }: ParentSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/parent') return pathname === '/parent';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'linear-gradient(180deg, #0f0f13 0%, #1a1a24 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
          {isOpen ? (
            <>
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Smarter Goalie"
                  className="h-8 w-auto"
                />
                <span className="text-white font-bold text-sm">
                  SmarterGoalie
                </span>
              </Link>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5 lg:hidden" />
                <ChevronLeft className="h-5 w-5 hidden lg:block" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="hidden lg:flex w-full items-center justify-center p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className={`px-4 py-4 border-b border-white/10 ${!isOpen && 'lg:px-2 lg:py-3'}`}>
          <div className={`flex items-center ${isOpen ? 'gap-3' : 'lg:justify-center'}`}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-white text-sm font-semibold truncate">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-white/50 text-xs truncate">Parent</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${!isOpen && 'lg:justify-center lg:px-2'}
                  ${
                    active
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                      : 'text-white/60 hover:text-white hover:bg-white/8'
                  }
                `}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                {isOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors
              ${!isOpen && 'lg:justify-center lg:px-2'}
            `}
            title={!isOpen ? 'Log out' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  BookOpen,
  Trophy,
  Video,
  FileText,
  MessageSquare,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
  User,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'People',
    items: [
      { label: 'All Users', href: '/admin/users', icon: Users },
      { label: 'Coaches', href: '/admin/coaches', icon: UserPlus },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Pillars', href: '/admin/pillars', icon: BookOpen },
      { label: 'Quizzes', href: '/admin/quizzes', icon: Trophy },
      { label: 'Video Reviews', href: '/admin/video-reviews', icon: Video },
      { label: 'Form Templates', href: '/admin/form-templates', icon: FileText },
    ],
  },
  {
    label: 'Communication',
    items: [
      { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
      { label: 'Moderation', href: '/admin/moderation', icon: Shield },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Charting', href: '/admin/charting', icon: BarChart2 },
      { label: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
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
          bg-white border-r border-gray-200 shadow-sm
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {isOpen ? (
            <>
              <Link href="/admin" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="Smarter Goalie"
                  className="h-8 w-auto"
                />
                <span className="text-gray-900 font-bold text-sm">
                  Admin Panel
                </span>
              </Link>
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 lg:hidden" />
                <ChevronLeft className="h-5 w-5 hidden lg:block" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="hidden lg:flex w-full items-center justify-center p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* User Profile Section */}
        <div className={`px-4 py-4 border-b border-gray-200 ${!isOpen && 'lg:px-2 lg:py-3'}`}>
          <div className={`flex items-center ${isOpen ? 'gap-3' : 'lg:justify-center'}`}>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-white" />
            </div>
            {isOpen && (
              <div className="overflow-hidden">
                <p className="text-gray-900 text-sm font-semibold truncate">
                  {user?.displayName || user?.email?.split('@')[0]}
                </p>
                <p className="text-gray-500 text-xs truncate">Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 px-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {navSections.map((section) => (
            <div key={section.label} className="mb-3">
              {isOpen && (
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {section.label}
                </p>
              )}
              {!isOpen && <div className="my-2 mx-2 border-t border-gray-200 hidden lg:block" />}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                        ${!isOpen && 'lg:justify-center lg:px-2'}
                        ${
                          active
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }
                      `}
                      title={!isOpen ? item.label : undefined}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : ''}`} />
                      {isOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors
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

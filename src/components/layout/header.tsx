'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronDown, LogOut, Menu, User, X, MessageSquare, ClipboardCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogoWithText } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth/context';
import { messageService } from '@/lib/database/services/message.service';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count for students
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user || user.role === 'admin') return;

      try {
        const result = await messageService.getUnreadCount(user.id);
        if (result.success && typeof result.data === 'number') {
          setUnreadCount(result.data);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="group">
            <LogoWithText className="transition-all duration-200 group-hover:scale-105" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/sports"
            className="text-sm font-medium transition-colors hover:text-blue-600 relative group"
          >
            Courses
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/quizzes"
                className="text-sm font-medium transition-colors hover:text-blue-600 relative group"
              >
                Quizzes
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
              </Link>
              {user?.role !== 'admin' && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium transition-colors hover:text-blue-600 relative group"
                  >
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                  <Link
                    href="/progress"
                    className="text-sm font-medium transition-colors hover:text-blue-600 relative group"
                  >
                    Progress
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                  <Link
                    href="/charting"
                    className="text-sm font-medium transition-colors hover:text-blue-600 relative group flex items-center space-x-1"
                  >
                    <ClipboardCheck className="h-4 w-4" />
                    <span>Charting</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                  <Link
                    href="/messages"
                    className="text-sm font-medium transition-colors hover:text-blue-600 relative group flex items-center space-x-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-200"></span>
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium transition-colors hover:text-orange-600 relative group"
                >
                  Admin
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-200"></span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                {user?.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="max-w-24 truncate">{user?.displayName || user?.email}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md border bg-background shadow-lg z-50">
                  <div className="p-2">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center space-x-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link
              href="/sports"
              className="block text-sm font-medium transition-colors hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Courses
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/quizzes"
                  className="block text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Quizzes
                </Link>
                {user?.role !== 'admin' && (
                  <>
                    <Link
                      href="/dashboard"
                      className="block text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/progress"
                      className="block text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Progress
                    </Link>
                    <Link
                      href="/charting"
                      className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      <span>Charting</span>
                    </Link>
                    <Link
                      href="/messages"
                      className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs px-1">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="block text-sm font-medium transition-colors hover:text-primary"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
                <hr className="my-4" />
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <hr className="my-4" />
                <Link
                  href="/auth/login"
                  className="block text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="block text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
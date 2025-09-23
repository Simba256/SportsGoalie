'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">SportsCoach</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/sports"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Sports
          </Link>
          {isAuthenticated && (
            <>
              <Link
                href="/quizzes"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Quizzes
              </Link>
              {user?.role !== 'admin' && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/progress"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Progress
                  </Link>
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Admin
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
              Sports
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
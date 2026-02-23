'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  ChevronDown,
  LogOut,
  Menu,
  User,
  X,
  MessageSquare,
  ClipboardCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { messageService } from '@/lib/database/services/message.service';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Shrink-on-scroll (with hysteresis to prevent flicker)
  const [isShrunk, setIsShrunk] = useState(false);

  useEffect(() => {
    const SHRINK_AT = 64;   // shrink only after this point
    const EXPAND_AT = 16;   // expand back only below this point

    let ticking = false;

    const update = () => {
      const y = window.scrollY || 0;

      setIsShrunk((prev) => {
        if (!prev && y > SHRINK_AT) return true;     // expand -> shrink
        if (prev && y < EXPAND_AT) return false;     // shrink -> expand
        return prev;                                 // stay
      });

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    // init once
    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const pillContainer =
    'rounded-full border bg-background/60 ring-1 ring-primary/10 shadow-sm';

  const headerHeight = isShrunk ? 'h-[68px]' : 'h-[96px]';

  return (
    <header className="sticky top-0 z-50 border-b">
      <div className="bg-gradient-to-b from-primary/15 via-background/85 to-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div
          className={`container mx-auto flex ${headerHeight} items-center justify-between px-4 transition-all duration-200 ease-out`}
        >
          {/* LOGO — fills header height */}
          <Link href="/" onClick={closeMenus} className="flex h-full items-center">
            <div className="h-full py-2">
              <Image
                src="/logo.svg"
                alt="SmarterGoalie"
                width={600}
                height={240}
                priority
                unoptimized
                className="h-full w-auto object-contain"
              />
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center">
            <div className={`${pillContainer} px-1.5 py-1.5`}>
              <div className="flex items-center gap-1">
                <PillLink href="/sports" onClick={closeMenus}>
                  Courses
                </PillLink>

                {isAuthenticated && (
                  <>
                    <PillLink href="/quizzes" onClick={closeMenus}>
                      Quizzes
                    </PillLink>

                    {user?.role === 'admin' ? (
                      <>
                        <PillLink href="/admin" onClick={closeMenus}>
                          Admin
                        </PillLink>
                        <PillLink href="/coach" onClick={closeMenus}>
                          Curriculum
                        </PillLink>
                      </>
                    ) : user?.role === 'coach' ? (
                      <PillLink href="/coach" onClick={closeMenus}>
                        Coach
                      </PillLink>
                    ) : (
                      <>
                        <PillLink href="/dashboard" onClick={closeMenus}>
                          Dashboard
                        </PillLink>
                        <PillLink href="/progress" onClick={closeMenus}>
                          Progress
                        </PillLink>

                        <PillLink href="/charting" onClick={closeMenus} icon>
                          <ClipboardCheck className="h-4 w-4" />
                          <span>Charting</span>
                        </PillLink>

                        <PillLink href="/messages" onClick={closeMenus} icon>
                          <MessageSquare className="h-4 w-4" />
                          <span>Messages</span>
                          {unreadCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="ml-1 h-5 min-w-5 rounded-full px-1 text-[11px] flex items-center justify-center"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </PillLink>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </nav>

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`${pillContainer} h-12 px-4 rounded-full hover:bg-background/80`}
                >
                  <div className="flex items-center gap-2">
                    {user?.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt="Profile"
                        width={26}
                        height={26}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="max-w-40 truncate font-medium">
                      {user?.displayName || user?.email}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </div>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-background shadow-lg z-50">
                    <div className="p-2">
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                        onClick={closeMenus}
                      >
                        <User className="h-4 w-4" />
                        <span>Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          closeMenus();
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${pillContainer} p-1.5 flex items-center gap-1`}>
                <Button variant="ghost" size="sm" className="rounded-full px-5 h-10" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>

                <Button size="sm" className="rounded-full px-5 h-10 shadow-sm" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* MOBILE MENU */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden rounded-full bg-background/60 hover:bg-background/80 ring-1 ring-primary/10 shadow-sm h-11 w-11 p-0"
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
              setIsUserMenuOpen(false);
            }}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* MOBILE NAV */}
        {isMenuOpen && (
          <div className="border-t bg-background/85 backdrop-blur md:hidden">
            <nav className="container mx-auto px-4 py-4 space-y-1">
              <MobileLink href="/sports" onClick={closeMenus}>
                Courses
              </MobileLink>

              {isAuthenticated ? (
                <>
                  <MobileLink href="/quizzes" onClick={closeMenus}>
                    Quizzes
                  </MobileLink>

                  {user?.role === 'admin' ? (
                    <>
                      <MobileLink href="/admin" onClick={closeMenus}>
                        Admin
                      </MobileLink>
                      <MobileLink href="/coach" onClick={closeMenus}>
                        Curriculum
                      </MobileLink>
                    </>
                  ) : user?.role === 'coach' ? (
                    <MobileLink href="/coach" onClick={closeMenus}>
                      Coach
                    </MobileLink>
                  ) : (
                    <>
                      <MobileLink href="/dashboard" onClick={closeMenus}>
                        Dashboard
                      </MobileLink>
                      <MobileLink href="/progress" onClick={closeMenus}>
                        Progress
                      </MobileLink>
                      <MobileLink href="/charting" onClick={closeMenus} icon>
                        <ClipboardCheck className="h-4 w-4" />
                        <span>Charting</span>
                      </MobileLink>
                      <MobileLink href="/messages" onClick={closeMenus} icon>
                        <MessageSquare className="h-4 w-4" />
                        <span>Messages</span>
                        {unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-1 h-5 min-w-5 rounded-full px-1 text-[11px] flex items-center justify-center"
                          >
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                      </MobileLink>
                    </>
                  )}

                  <div className="my-3 h-px bg-border" />

                  <MobileLink href="/profile" onClick={closeMenus} icon>
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </MobileLink>

                  <button
                    onClick={() => {
                      closeMenus();
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="my-3 h-px bg-border" />
                  <MobileLink href="/auth/login" onClick={closeMenus}>
                    Sign In
                  </MobileLink>
                  <Link href="/auth/register" onClick={closeMenus} className="mt-2 block">
                    <Button className="w-full shadow-sm">Get Started</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function PillLink({
  href,
  children,
  onClick,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-primary/10"
    >
      {children}
      <span className="absolute inset-x-4 -bottom-[6px] h-0.5 w-0 bg-primary transition-all duration-200 group-hover:w-[calc(100%-2rem)]" />
    </Link>
  );
}

function MobileLink({
  href,
  children,
  onClick,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center rounded-md px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors ${
        icon ? 'gap-2' : ''
      }`}
    >
      {children}
    </Link>
  );
}

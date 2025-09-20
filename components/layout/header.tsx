import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary" />
            <span className="text-xl font-bold">SportsCoach</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/sports"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Sports
          </Link>
          <Link
            href="/quizzes"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Quizzes
          </Link>
          <Link
            href="/progress"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Progress
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  );
}

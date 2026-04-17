'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Trophy,
  BookOpen,
  Target,
  Flame,
  Brain,
  Footprints,
  Shapes,
  Grid3X3,
  Dumbbell,
  Heart,
  ArrowRight,
  TrendingUp,
  Play,
  ChevronRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SkeletonDashboard } from '@/components/ui/skeletons';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/auth/context';
import { useProgress } from '@/hooks/useProgress';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useRecentQuizzes } from '@/hooks/useRecentQuizzes';
import { CustomCurriculumDashboard } from '@/components/dashboard/CustomCurriculumDashboard';
import { PILLARS } from '@/types';
import { getPillarColorClasses, getPillarSlugFromDocId, getPillarByDocId } from '@/lib/utils/pillars';

const PILLAR_ICONS: Record<string, React.ElementType> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
};

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'student' && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, router]);

  if (user?.role === 'student' && !user?.onboardingCompleted) {
    return <SkeletonDashboard />;
  }

  // Route custom workflow students to their dashboard without loading standard hooks
  if (user?.role === 'student' && user?.workflowType === 'custom') {
    return <CustomCurriculumDashboard user={user} />;
  }

  return <StandardDashboard />;
}

function StandardDashboard() {
  const { user } = useAuth();
  const { userProgress, loading } = useProgress();
  const { enrolledSports, loading: enrollmentsLoading, error: enrollmentsError } = useEnrollment();
  const { quizzes: recentQuizzes, loading: quizzesLoading } = useRecentQuizzes(5);

  if (loading || enrollmentsLoading) {
    return <SkeletonDashboard />;
  }

  const stats = userProgress?.overallStats;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0];

  const totalSkills = enrolledSports.reduce((sum, e) => sum + e.progress.totalSkills, 0);
  const completedSkills = enrolledSports.reduce((sum, e) => sum + e.progress.completedSkills.length, 0);
  const overallPct = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Find next pillar to continue (most recently accessed, not completed)
  const activePillar = enrolledSports.find(
    (e) => e.progress.status === 'in_progress'
  ) || enrolledSports[0];

  return (
    <div className="bg-gray-50">
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[340px] md:h-[390px] flex flex-col items-center justify-center px-4 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/goalie-dashboard.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1748]/78 via-[#102a5d]/62 to-[#5f2033]/52" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <h1 className="text-white text-3xl md:text-5xl font-bold bg-white/10 border border-white/25 backdrop-blur-sm px-6 py-2 rounded-xl inline-block shadow-lg mb-2">
            {greeting}, {firstName}
          </h1>
          <p className="text-white text-sm md:text-base font-medium drop-shadow-md max-w-2xl px-4">
            {stats?.quizzesCompleted
              ? `You've learned ${overallPct}% of your course. Keep it up and improve your skills!`
              : 'Start your goalie training journey by exploring pillars and taking quizzes.'}
          </p>

          <div className="mt-4 w-full max-w-lg rounded-full bg-white/35 h-2.5 overflow-hidden">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${overallPct}%` }} />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 px-2">
            <div className="flex items-center gap-3 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-md shadow-sm">
              <ProgressRing percentage={overallPct} size={48} />
              <div className="text-left">
                <p className="text-[11px] font-medium text-white/80">Overall Progress</p>
                <p className="text-sm font-bold text-white">{overallPct}%</p>
              </div>
            </div>

            {activePillar && (
              <Link href={`/pillars/${activePillar.sport.id}`}>
                <button className="flex items-center gap-1 rounded-full border border-white/35 bg-white/90 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-white">
                  <Play className="h-3.5 w-3.5" />
                  Continue Learning
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-8">
      {/* ── Main Layout ────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Your Pillars — table-style list */}
          <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-base font-bold text-foreground">Your Pillars</h2>
              <Link href="/pillars" className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {enrollmentsError ? (
              <p className="text-red-500 text-sm text-center py-8">{enrollmentsError}</p>
            ) : enrolledSports.length === 0 ? (
              <EmptyPillars />
            ) : (
              <div className="divide-y divide-gray-50">
                {enrolledSports.map(({ sport, progress }) => {
                  const slug = getPillarSlugFromDocId(sport.id);
                  const info = slug ? PILLARS.find(p => p.slug === slug) : null;
                  const color = info?.color || 'blue';
                  const colorClasses = getPillarColorClasses(color);
                  const IconComponent = PILLAR_ICONS[info?.icon || 'Target'] || Target;
                  const pct = Math.round(progress.progressPercentage);

                  return (
                    <Link
                      key={sport.id}
                      href={`/pillars/${sport.id}`}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50/80 transition-colors group"
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient} flex-shrink-0`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {info?.shortName || sport.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {progress.completedSkills.length}/{progress.totalSkills} skills
                        </p>
                      </div>
                      <div className="w-24 hidden sm:block">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${colorClasses.bg}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${
                        pct >= 80 ? 'text-green-600' : pct > 0 ? 'text-foreground' : 'text-muted-foreground/60'
                      }`}>
                        {pct}%
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Continue Learning — highlight next skill */}
          {activePillar && (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">Continue Learning</h2>
                <Badge variant="outline" className="text-xs bg-blue-50 text-primary border-blue-200">
                  <Play className="h-3 w-3 mr-1" /> In Progress
                </Badge>
              </div>
              <Link href={`/pillars/${activePillar.sport.id}`} className="block group">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50/80 to-white border border-blue-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                  {(() => {
                    const slug = getPillarSlugFromDocId(activePillar.sport.id);
                    const info = slug ? PILLARS.find(p => p.slug === slug) : null;
                    const colorClasses = getPillarColorClasses(info?.color || 'blue');
                    const Icon = PILLAR_ICONS[info?.icon || 'Target'] || Target;
                    return (
                      <>
                        <div className={`h-14 w-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient} flex-shrink-0`}>
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                            {info?.name || activePillar.sport.name}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {activePillar.progress.completedSkills.length} of {activePillar.progress.totalSkills} skills completed
                          </p>
                          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden max-w-xs">
                            <div
                              className={`h-full rounded-full ${colorClasses.bg}`}
                              style={{ width: `${Math.round(activePillar.progress.progressPercentage)}%` }}
                            />
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </>
                    );
                  })()}
                </div>
              </Link>
            </div>
          )}
        </div>

        {/* RIGHT 1/3 */}
        <div className="space-y-6">

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Quizzes" value={stats?.quizzesCompleted || 0} icon={<Trophy className="h-4 w-4" />} color="red" />
            <StatCard label="Skills" value={stats?.skillsCompleted || 0} icon={<BookOpen className="h-4 w-4" />} color="blue" />
            <StatCard label="Avg Score" value={stats?.averageQuizScore ? `${Math.round(stats.averageQuizScore)}%` : '--'} icon={<Target className="h-4 w-4" />} color="green" />
            <StatCard label="Streak" value={stats?.currentStreak || 0} icon={<Flame className="h-4 w-4" />} color="orange" />
          </div>

          {/* Recent Results */}
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Recent Results</h3>
              <Link href="/quizzes" className="text-xs text-primary hover:text-blue-700 font-semibold flex items-center gap-1">
                View More <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {quizzesLoading ? (
              <div className="divide-y divide-border/50">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1"><div className="h-3 w-24 rounded bg-muted animate-pulse" /></div>
                    <div className="h-1.5 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="h-3 w-8 rounded bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : recentQuizzes.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Trophy className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                <p className="text-xs text-muted-foreground">No results yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recentQuizzes.slice(0, 5).map((quiz) => {
                  const pillarInfo = getPillarByDocId(quiz.sportId);
                  const pct = Math.round(quiz.percentage);
                  return (
                    <div key={quiz.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {pillarInfo?.shortName || 'Quiz'}
                        </p>
                      </div>
                      <div className="w-20">
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-xs font-bold w-10 text-right ${
                        pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-primary' : 'text-red-500'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <h3 className="text-sm font-bold text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              <QuickActionLink href="/pillars" icon={<BookOpen className="h-4 w-4 text-primary" />} bg="bg-blue-50" label="Browse Pillars" />
              <QuickActionLink href="/quizzes" icon={<Trophy className="h-4 w-4 text-green-600" />} bg="bg-green-50" label="Take a Quiz" />
              <QuickActionLink href="/progress" icon={<TrendingUp className="h-4 w-4 text-purple-600" />} bg="bg-purple-50" label="Analytics" />
              <QuickActionLink href="/charting" icon={<Target className="h-4 w-4 text-red-600" />} bg="bg-red-50" label="Charting" />
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}

/* ──────────────────── Sub-components ──────────────────── */


function ProgressRing({ percentage, size = 110 }: { percentage: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="url(#ring-grad)" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-foreground">{percentage}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">%</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string; value: string | number; icon: React.ReactNode;
  color: 'red' | 'blue' | 'green' | 'orange';
}) {
  const colorMap = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-primary',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-xl font-black text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function EmptyPillars() {
  return (
    <div className="text-center py-12 px-6">
      <div className="h-14 w-14 mx-auto mb-3 rounded-2xl bg-blue-50 flex items-center justify-center">
        <BookOpen className="h-7 w-7 text-blue-400" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">No courses yet</h3>
      <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
        Start your goaltending journey by exploring the fundamental pillars.
      </p>
      <Link href="/pillars">
        <Button size="sm">
          Explore Pillars
        </Button>
      </Link>
    </div>
  );
}

function QuickActionLink({ href, icon, bg, label }: { href: string; icon: React.ReactNode; bg: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group">
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
      <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{label}</span>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60 ml-auto group-hover:text-muted-foreground transition-colors" />
    </Link>
  );
}

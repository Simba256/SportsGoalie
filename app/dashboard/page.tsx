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
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const { userProgress, loading } = useProgress();
  const { enrolledSports, loading: enrollmentsLoading, error: enrollmentsError } = useEnrollment();
  const { quizzes: recentQuizzes, loading: quizzesLoading } = useRecentQuizzes(5);

  useEffect(() => {
    if (user?.role === 'student' && !user?.onboardingCompleted) {
      router.push('/onboarding');
    }
  }, [user, router]);

  const isCustomWorkflow = user?.role === 'student' && user?.workflowType === 'custom';

  if (user?.role === 'student' && !user?.onboardingCompleted) {
    return <LoadingSpinner />;
  }

  if (isCustomWorkflow && user) {
    return <CustomCurriculumDashboard user={user} />;
  }

  if (loading || enrollmentsLoading) {
    return <LoadingSpinner />;
  }

  const stats = userProgress?.overallStats;
  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0];

  // Compute overall progress across all enrolled pillars
  const totalSkills = enrolledSports.reduce((sum, e) => sum + e.progress.totalSkills, 0);
  const completedSkills = enrolledSports.reduce((sum, e) => sum + e.progress.completedSkills.length, 0);
  const overallPct = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Welcome Banner ── */}
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              {firstName}!
            </h1>
            <p className="text-white/60 text-sm mt-2 max-w-md">
              {stats?.quizzesCompleted
                ? `You've completed ${stats.quizzesCompleted} quiz${stats.quizzesCompleted !== 1 ? 'zes' : ''} with an average score of ${Math.round(stats.averageQuizScore)}%. Keep it going!`
                : 'Start your goalie training journey by exploring pillars and taking quizzes.'}
            </p>
          </div>
          {/* Overall progress ring */}
          <div className="hidden md:flex flex-col items-center">
            <ProgressRing percentage={overallPct} size={110} />
            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Overall Progress
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Quizzes Done"
          value={stats?.quizzesCompleted || 0}
          icon={<Trophy className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          label="Skills Attempted"
          value={stats?.skillsCompleted || 0}
          icon={<BookOpen className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Avg. Score"
          value={stats?.averageQuizScore ? `${Math.round(stats.averageQuizScore)}%` : '--'}
          icon={<Target className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Day Streak"
          value={stats?.currentStreak || 0}
          icon={<Flame className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* ── Main Grid: 2 cols ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT: 2/3 — My Courses (enrolled pillars) */}
        <div className="lg:col-span-2 space-y-6">

          {/* My Courses / Enrolled Pillars */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">My Courses</h2>
              {enrolledSports.length > 0 && (
                <Link href="/pillars" className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {enrollmentsError ? (
              <p className="text-red-500 text-sm text-center py-6">{enrollmentsError}</p>
            ) : enrolledSports.length === 0 ? (
              <EmptyPillars />
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {enrolledSports.slice(0, 4).map(({ sport, progress }) => (
                  <PillarCard key={sport.id} sport={sport} progress={progress} />
                ))}
              </div>
            )}

            {enrolledSports.length > 4 && (
              <div className="mt-4 text-center">
                <Link href="/pillars">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-500">
                    +{enrolledSports.length - 4} more pillars
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recent Quiz Scores */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">Recent Grades</h2>
              <Link href="/quizzes" className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                All quizzes <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {quizzesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600" />
              </div>
            ) : recentQuizzes.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="mx-auto h-10 w-10 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No quiz results yet</p>
                <Link href="/quizzes">
                  <Button size="sm" className="mt-3 bg-red-600 hover:bg-red-700 text-white text-xs">
                    Take a Quiz
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => {
                  const pillarInfo = getPillarByDocId(quiz.sportId);
                  const colorClasses = getPillarColorClasses(pillarInfo?.color || 'blue');
                  const pct = Math.round(quiz.percentage);

                  return (
                    <div
                      key={quiz.id}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient}`}>
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {pillarInfo?.name || 'Quiz'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {quiz.score}/{quiz.maxScore} points
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-bold ${
                          pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
                        }`}>
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: 1/3 — Performance + Quick Actions */}
        <div className="space-y-6">

          {/* Overall Performance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-5">Performance</h3>

            {/* Performance ring (mobile-visible version) */}
            <div className="flex justify-center mb-5 md:hidden">
              <ProgressRing percentage={overallPct} size={100} />
            </div>

            <div className="space-y-4">
              <ProgressRow label="Pillars Completed" current={stats?.sportsCompleted || 0} total={6} />
              <ProgressRow label="Skills Attempted" current={stats?.skillsCompleted || 0} total={Math.max(20, stats?.skillsCompleted || 0)} />
              <ProgressRow label="Quiz Average" current={Math.round(stats?.averageQuizScore || 0)} total={100} suffix="%" />

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">Time Spent Learning</span>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  {Math.round((stats?.totalTimeSpent || 0) / 60)}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Longest Streak</span>
                <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  {stats?.longestStreak || 0} days
                </span>
              </div>
            </div>

            {overallPct > 0 && (
              <div className="mt-5 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <p className="text-xs text-green-700 font-medium">
                  {overallPct >= 80
                    ? 'Excellent Progress!'
                    : overallPct >= 50
                    ? 'Great work — keep pushing!'
                    : 'Good start — keep going!'}
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionLink
                href="/pillars"
                icon={<BookOpen className="h-4 w-4 text-blue-600" />}
                bg="bg-blue-50"
                label="Browse Pillars"
                sub="Explore skills & lessons"
              />
              <QuickActionLink
                href="/quizzes"
                icon={<Trophy className="h-4 w-4 text-green-600" />}
                bg="bg-green-50"
                label="Take a Quiz"
                sub="Test your knowledge"
              />
              <QuickActionLink
                href="/progress"
                icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
                bg="bg-purple-50"
                label="Analytics"
                sub="Detailed progress"
              />
              <QuickActionLink
                href="/goals"
                icon={<Target className="h-4 w-4 text-red-600" />}
                bg="bg-red-50"
                label="Set Goals"
                sub="Track objectives"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Sub-components ──────────────────── */

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
    </div>
  );
}

/** SVG ring chart */
function ProgressRing({ percentage, size = 110 }: { percentage: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{percentage}</span>
        <span className="text-[10px] text-white/50 uppercase tracking-wider">%</span>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon, color,
}: {
  label: string; value: string | number; icon: React.ReactNode;
  color: 'red' | 'blue' | 'green' | 'orange';
}) {
  const colorMap = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function PillarCard({ sport, progress }: { sport: { id: string; name: string; icon?: string; description?: string }; progress: { progressPercentage: number; completedSkills: string[]; totalSkills: number; status: string; lastAccessedAt?: { toDate: () => Date } } }) {
  const slug = getPillarSlugFromDocId(sport.id);
  const info = slug ? PILLARS.find(p => p.slug === slug) : null;
  const color = info?.color || 'blue';
  const colorClasses = getPillarColorClasses(color);
  const IconComponent = PILLAR_ICONS[info?.icon || 'Target'] || Target;
  const pct = Math.round(progress.progressPercentage);

  return (
    <Link
      href={`/pillars/${sport.id}`}
      className="group block bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${colorClasses.gradient} flex-shrink-0`}>
          <IconComponent className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
            {info?.shortName || sport.name}
          </h4>
          <Badge
            variant="outline"
            className={`text-[10px] mt-0.5 px-1.5 py-0 h-[18px] ${
              progress.status === 'completed'
                ? 'bg-green-50 text-green-600 border-green-200'
                : progress.status === 'in_progress'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            }`}
          >
            {progress.status === 'completed' ? 'Done' : progress.status === 'in_progress' ? 'Active' : 'New'}
          </Badge>
        </div>
        <span className="text-lg font-bold text-gray-900">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClasses.bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-gray-400">{progress.completedSkills.length}/{progress.totalSkills} skills</span>
        {progress.lastAccessedAt && (
          <span className="text-[11px] text-gray-400">
            Last: {progress.lastAccessedAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </Link>
  );
}

function EmptyPillars() {
  return (
    <div className="text-center py-10">
      <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
        <BookOpen className="h-7 w-7 text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No courses yet</h3>
      <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
        Start your goaltending journey by exploring the fundamental pillars.
      </p>
      <Link href="/pillars">
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
          Explore Pillars
        </Button>
      </Link>
    </div>
  );
}

function ProgressRow({ label, current, total, suffix = '' }: { label: string; current: number; total: number; suffix?: string }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-900">{current}{suffix}/{total}{suffix}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 to-blue-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionLink({ href, icon, bg, label, sub }: { href: string; icon: React.ReactNode; bg: string; label: string; sub: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-[11px] text-gray-400">{sub}</p>
      </div>
    </Link>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  TrendingUp,
  Trophy,
  ClipboardCheck,
  UserPlus,
  ArrowRight,
  Sparkles,
  Eye,
  ChevronRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/context';
import { parentLinkService } from '@/lib/database';
import { LinkedChildSummary } from '@/types';

export default function ParentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
    if (!authLoading && user && user.role !== 'parent') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'parent') return;

    const loadChildren = async () => {
      try {
        setLoading(true);
        const result = await parentLinkService.getLinkedChildren(user.id);
        if (result.success && result.data) {
          setChildren(result.data);
        } else {
          setError(result.error?.message || 'Failed to load linked goalies');
        }
      } catch {
        setError('Failed to load linked goalies');
      } finally {
        setLoading(false);
      }
    };

    loadChildren();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!user || user.role !== 'parent') return null;

  const firstName = user.displayName?.split(' ')[0] || user.email?.split('@')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Aggregate stats
  const totalQuizzes = children.reduce((sum, c) => sum + (c.quizzesCompleted || 0), 0);
  const avgProgress = children.length > 0
    ? Math.round(children.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / children.length)
    : 0;
  const assessmentsDone = children.filter(c => c.hasCompletedAssessment).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-[#0f0f13] via-[#1a1a2e] to-[#16213e] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white mt-1">
              {firstName}!
            </h1>
            <p className="text-white/60 text-sm mt-2 max-w-md">
              {children.length > 0
                ? `You're tracking ${children.length} goalie${children.length !== 1 ? 's' : ''}. Stay updated on their progress and development.`
                : 'Link your goalie\'s account to start tracking their progress and development.'}
            </p>
          </div>
          {/* Progress ring */}
          <div className="hidden md:flex flex-col items-center">
            <ProgressRing percentage={avgProgress} size={110} />
            <p className="text-white/40 text-xs mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Avg Progress
            </p>
          </div>
        </div>
      </div>

      {/* Assessment prompt */}
      {!user.parentOnboardingComplete && children.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Complete Your Assessment</p>
              <p className="text-xs text-amber-700">Compare your perceptions with your goalie's self-assessment.</p>
            </div>
          </div>
          <Link href="/onboarding?role=parent">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              Start Assessment
            </Button>
          </Link>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Linked Goalies"
          value={children.length}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          label="Avg Progress"
          value={avgProgress > 0 ? `${avgProgress}%` : '--'}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          label="Total Quizzes"
          value={totalQuizzes}
          icon={<Trophy className="h-5 w-5" />}
          color="red"
        />
        <StatCard
          label="Assessments"
          value={`${assessmentsDone}/${children.length}`}
          icon={<ClipboardCheck className="h-5 w-5" />}
          color="orange"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* LEFT 2/3 — My Goalies */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-gray-900">My Goalies</h2>
              {children.length > 0 && (
                <Link href="/parent/goalies" className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>

            {children.length === 0 ? (
              <EmptyGoalies />
            ) : (
              <div className="space-y-3">
                {children.map((child) => (
                  <GoalieRow key={child.childId} child={child} />
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed — shows recent goalie activity */}
          {children.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5">Recent Activity</h2>
              <div className="space-y-3">
                {children
                  .filter(c => c.lastActiveAt)
                  .sort((a, b) => (b.lastActiveAt?.getTime() || 0) - (a.lastActiveAt?.getTime() || 0))
                  .slice(0, 5)
                  .map((child) => (
                    <div
                      key={`activity-${child.childId}`}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-bold">
                          {child.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {child.displayName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {child.quizzesCompleted || 0} quizzes completed · {Math.round(child.progressPercentage || 0)}% progress
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {formatDate(child.lastActiveAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                {children.filter(c => c.lastActiveAt).length === 0 && (
                  <div className="text-center py-6">
                    <Clock className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1/3 — Overview + Quick Actions */}
        <div className="space-y-6">
          {/* Overview Panel */}
          {children.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-5">Overview</h3>

              <div className="flex justify-center mb-5 md:hidden">
                <ProgressRing percentage={avgProgress} size={100} />
              </div>

              <div className="space-y-4">
                <ProgressRow
                  label="Goalies Linked"
                  current={children.length}
                  total={Math.max(children.length, 3)}
                />
                <ProgressRow
                  label="Assessments Done"
                  current={assessmentsDone}
                  total={children.length}
                />
                <ProgressRow
                  label="Avg Progress"
                  current={avgProgress}
                  total={100}
                  suffix="%"
                />

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">Total Quizzes</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-red-500" />
                    {totalQuizzes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Best Streak</span>
                  <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-orange-500" />
                    {Math.max(...children.map(c => c.currentStreak || 0), 0)} days
                  </span>
                </div>
              </div>

              {avgProgress > 0 && (
                <div className="mt-5 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700 font-medium">
                    {avgProgress >= 80
                      ? 'Your goalies are doing great!'
                      : avgProgress >= 50
                      ? 'Good progress across the board!'
                      : 'Your goalies are getting started!'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <QuickActionLink
                href="/parent/link-child"
                icon={<UserPlus className="h-4 w-4 text-blue-600" />}
                bg="bg-blue-50"
                label="Link a Goalie"
                sub="Add your child's account"
              />
              <QuickActionLink
                href="/onboarding?role=parent"
                icon={<ClipboardCheck className="h-4 w-4 text-green-600" />}
                bg="bg-green-50"
                label="Parent Assessment"
                sub="Complete your questionnaire"
              />
              <QuickActionLink
                href="/parent/perception"
                icon={<Eye className="h-4 w-4 text-purple-600" />}
                bg="bg-purple-50"
                label="Perception Compare"
                sub="See alignment with goalie"
              />
              {children.length > 0 && (
                <QuickActionLink
                  href={`/parent/child/${children[0].childId}`}
                  icon={<TrendingUp className="h-4 w-4 text-red-600" />}
                  bg="bg-red-50"
                  label="Goalie Details"
                  sub="View detailed progress"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Sub-components ──────────────────── */

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
          stroke="url(#parent-ring-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="parent-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#dc2626" />
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

function GoalieRow({ child }: { child: LinkedChildSummary }) {
  const pct = Math.round(child.progressPercentage || 0);

  return (
    <Link
      href={`/parent/child/${child.childId}`}
      className="group flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all duration-200"
    >
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-lg font-bold">
          {child.displayName.charAt(0).toUpperCase()}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
            {child.displayName}
          </h4>
          {child.pacingLevel && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-[18px] bg-blue-50 text-blue-600 border-blue-200"
            >
              {child.pacingLevel}
            </Badge>
          )}
          {child.hasCompletedAssessment ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          ) : (
            <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[11px] text-gray-400">{pct}% progress</span>
          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
            <Trophy className="h-3 w-3" /> {child.quizzesCompleted || 0} quizzes
          </span>
          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
            <Flame className="h-3 w-3" /> {child.currentStreak || 0} streak
          </span>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

function EmptyGoalies() {
  return (
    <div className="text-center py-10">
      <div className="h-14 w-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
        <Users className="h-7 w-7 text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">No linked goalies</h3>
      <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
        Link your goalie's account to track their progress and support their development.
      </p>
      <Link href="/parent/link-child">
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs">
          <UserPlus className="h-4 w-4 mr-1" />
          Link Your Goalie
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
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-red-500 transition-all duration-500"
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

function formatDate(date: Date | undefined): string {
  if (!date) return 'Never';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

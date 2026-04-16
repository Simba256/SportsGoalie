'use client';

import { Flame, Sparkles, Trophy } from 'lucide-react';
import { SkeletonBannerLight, SkeletonCardGrid } from '@/components/ui/skeletons';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAchievements } from '@/hooks/useProgress';
import { AchievementsList } from '@/components/achievements/AchievementsList';

export default function AchievementsPage() {
  return (
    <ProtectedRoute>
      <AchievementsContent />
    </ProtectedRoute>
  );
}

function AchievementsContent() {
  const { achievements, userAchievements, loading, error } = useAchievements();
  const completedAchievements = userAchievements.filter(a => a.isCompleted).length;
  const completionRate = achievements.length > 0
    ? Math.round((completedAchievements / achievements.length) * 100)
    : 0;
  const totalPoints = achievements
    .filter(a => userAchievements.find(ua => ua.achievementId === a.id && ua.isCompleted))
    .reduce((sum, a) => sum + a.points, 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <SkeletonBannerLight />
        <SkeletonCardGrid count={6} cols={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to load achievements</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Banner */}
      <section className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 rounded-b-none overflow-hidden bg-gradient-to-br from-slate-900 via-[#1a1a3e] to-slate-900">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/12 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-red-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative z-10 px-6 py-7 md:px-8 md:py-9">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
              Unlock Your Milestones,
              <span className="block text-red-500">Track Every Win.</span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-white/80 max-w-xl leading-relaxed">
              Keep building momentum through quizzes, consistency, and focused progress across all seven goalie pillars.
            </p>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-blue-300/30 bg-blue-500/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">Unlocked</p>
              <p className="mt-1 text-2xl font-black text-white">{completedAchievements}</p>
            </div>
            <div className="rounded-2xl border border-red-300/30 bg-red-500/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-100">Completion Rate</p>
              <p className="mt-1 text-2xl font-black text-white">{completionRate}%</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/70">Points Earned</p>
              <p className="mt-1 text-2xl font-black text-white">{totalPoints}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-blue-200/70 bg-blue-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Total Achievements</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-black text-slate-900">{achievements.length}</p>
            <Trophy className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="rounded-2xl border border-red-200/70 bg-red-50/80 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">In Progress</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-3xl font-black text-slate-900">{Math.max(achievements.length - completedAchievements, 0)}</p>
            <Flame className="h-5 w-5 text-red-600" />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Push</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-lg font-black text-slate-900">Keep Consistency</p>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-1 text-xs text-slate-500">A steady streak usually unlocks your next badge fastest.</p>
        </div>
      </div>

      {/* Achievements List */}
      <AchievementsList
        achievements={achievements}
        userAchievements={userAchievements}
        loading={loading}
      />
    </div>
  );
}
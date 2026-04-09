'use client';

import { Trophy } from 'lucide-react';
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
      <div className="relative rounded-3xl bg-gradient-to-br from-red-100/80 via-white to-blue-100/70 border border-red-200/60 p-6 md:p-8 overflow-hidden shadow-xl shadow-red-200/30">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-red-200/15 rounded-full blur-2xl" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground mt-1">
              Unlock badges and milestones as you progress through your learning journey.
            </p>
          </div>
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
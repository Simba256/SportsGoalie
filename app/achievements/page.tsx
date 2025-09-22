'use client';

import { Trophy } from 'lucide-react';
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
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to load achievements</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Trophy className="h-8 w-8" />
            <span>Achievements</span>
          </h1>
          <p className="text-muted-foreground">
            Unlock badges and milestones as you progress through your learning journey.
          </p>
        </div>

        {/* Achievements List */}
        <AchievementsList
          achievements={achievements}
          userAchievements={userAchievements}
          loading={loading}
        />
      </div>
    </div>
  );
}
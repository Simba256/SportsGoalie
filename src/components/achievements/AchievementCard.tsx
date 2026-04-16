'use client';

import { Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement, UserAchievement } from '@/types';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  isLocked?: boolean;
}

export function AchievementCard({ achievement, userAchievement, isLocked = false }: AchievementCardProps) {
  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'progress':
        return <Target className="h-6 w-6" />;
      case 'quiz':
        return <Trophy className="h-6 w-6" />;
      case 'streak':
        return <Zap className="h-6 w-6" />;
      case 'time':
        return <Clock className="h-6 w-6" />;
      default:
        return <Star className="h-6 w-6" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'uncommon':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'legendary':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isCompleted = userAchievement?.isCompleted || false;
  const progress = userAchievement?.progress || 0;

  return (
    <Card className={`rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
      isCompleted ? 'border-blue-200 bg-blue-50/30 hover:shadow-blue-100/50' :
      isLocked ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200 bg-white hover:shadow-slate-200/60'
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Achievement Icon */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            isCompleted
              ? 'bg-blue-100 text-blue-600'
              : isLocked
              ? 'bg-slate-100 text-slate-400'
              : 'bg-blue-100 text-blue-600'
          }`}>
            {getAchievementIcon(achievement.type)}
          </div>

          {/* Achievement Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {isLocked && achievement.isSecret ? '???' : achievement.name}
              </h3>
              <div className="flex items-center space-x-2">
                {isCompleted && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800 border border-blue-200">
                    Completed
                  </Badge>
                )}
                <Badge className={`text-xs border ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              {isLocked && achievement.isSecret ? 'Hidden achievement' : achievement.description}
            </p>

            {/* Progress Bar for Progressive Achievements */}
            {!isCompleted && progress > 0 && (
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-600 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  {progress}% complete
                </p>
              </div>
            )}

            {/* Achievement Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{achievement.points} points</span>
              {isCompleted && userAchievement?.unlockedAt && (
                <span>
                  Unlocked {new Date(userAchievement.unlockedAt.toDate()).toLocaleDateString()}
                </span>
              )}
              {!isCompleted && !isLocked && (
                <span>In Progress</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
        return 'bg-gray-100 text-gray-800 ring-gray-500/10';
      case 'uncommon':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'rare':
        return 'bg-blue-50 text-blue-700 ring-blue-600/20';
      case 'epic':
        return 'bg-purple-50 text-purple-700 ring-purple-600/20';
      case 'legendary':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-500/10';
    }
  };

  const isCompleted = userAchievement?.isCompleted || false;
  const progress = userAchievement?.progress || 0;

  return (
    <Card className={`transition-all hover:shadow-md ${
      isCompleted ? 'ring-2 ring-green-500/20 bg-green-50/30' :
      isLocked ? 'opacity-50' : ''
    }`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Achievement Icon */}
          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
            isCompleted
              ? 'bg-green-100 text-green-600'
              : isLocked
              ? 'bg-gray-100 text-gray-400'
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
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                )}
                <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                  {achievement.rarity}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {isLocked && achievement.isSecret ? 'Hidden achievement' : achievement.description}
            </p>

            {/* Progress Bar for Progressive Achievements */}
            {!isCompleted && progress > 0 && (
              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
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
'use client';

import { useState } from 'react';
import { Filter, Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementCard } from './AchievementCard';
import { Achievement, UserAchievement } from '@/types';

interface AchievementsListProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  loading?: boolean;
}

export function AchievementsList({ achievements, userAchievements, loading = false }: AchievementsListProps) {
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Create a map for quick lookup of user achievements
  const userAchievementMap = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );

  // Filter achievements
  const filteredAchievements = achievements.filter(achievement => {
    const matchesRarity = filterRarity === 'all' || achievement.rarity === filterRarity;
    const matchesType = filterType === 'all' || achievement.type === filterType;
    return matchesRarity && matchesType;
  });

  // Separate achievements by completion status
  const completedAchievements = filteredAchievements.filter(achievement =>
    userAchievementMap.get(achievement.id)?.isCompleted
  );

  const inProgressAchievements = filteredAchievements.filter(achievement => {
    const userAchievement = userAchievementMap.get(achievement.id);
    return userAchievement && !userAchievement.isCompleted && userAchievement.progress > 0;
  });

  const lockedAchievements = filteredAchievements.filter(achievement =>
    !userAchievementMap.has(achievement.id)
  );

  // Calculate stats
  const totalCompleted = userAchievements.filter(ua => ua.isCompleted).length;
  const totalPoints = completedAchievements.reduce((sum, achievement) => sum + achievement.points, 0);

  const rarityColors = {
    common: 'bg-slate-100 text-slate-700',
    uncommon: 'bg-blue-50 text-blue-700',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-red-50 text-red-700',
    legendary: 'bg-red-100 text-red-800'
  };

  const typeIcons = {
    progress: <Target className="h-4 w-4" />,
    quiz: <Trophy className="h-4 w-4" />,
    streak: <Zap className="h-4 w-4" />,
    time: <Clock className="h-4 w-4" />,
    special: <Star className="h-4 w-4" />
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-200 border-t-red-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-slate-900">
            <Trophy className="h-5 w-5 text-red-600" />
            <span>Achievement Progress</span>
          </CardTitle>
          <CardDescription className="text-slate-600">
            Track your learning milestones and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{totalCompleted}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalPoints}</div>
              <div className="text-sm text-slate-600">Points Earned</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
              <div className="text-sm text-slate-600">In Progress</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
              <div className="text-2xl font-bold text-slate-700">{achievements.length}</div>
              <div className="text-sm text-slate-600">Total Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="rounded-2xl border border-red-100/80 bg-gradient-to-r from-red-50/70 via-white to-blue-50/70 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="inline-flex items-center space-x-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <Filter className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Filters</span>
            </div>

            {/* Rarity Filter */}
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterRarity('all')}
                className={filterRarity === 'all' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                All Rarities
              </Button>
              {Object.entries(rarityColors).map(([rarity, _colorClass]) => (
                <Button
                  key={rarity}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterRarity(rarity)}
                  className={`capitalize ${filterRarity === rarity ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  {rarity}
                </Button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterType('all')}
                className={filterType === 'all' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                All Types
              </Button>
              {Object.entries(typeIcons).map(([type, icon]) => (
                <Button
                  key={type}
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className={`capitalize ${filterType === type ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <span className="mr-1">{icon}</span>
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Tabs */}
      <Tabs defaultValue="completed" className="space-y-4">
        <TabsList className="border border-slate-200 bg-white p-1">
          <TabsTrigger value="completed">
            Completed ({completedAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            In Progress ({inProgressAchievements.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            Locked ({lockedAchievements.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-4">
          {completedAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={userAchievementMap.get(achievement.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <Trophy className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed achievements yet</h3>
                <p className="text-muted-foreground">
                  Start learning and taking quizzes to unlock your first achievement!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          {inProgressAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  userAchievement={userAchievementMap.get(achievement.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No achievements in progress</h3>
                <p className="text-muted-foreground">
                  Continue your learning journey to make progress on achievements.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="locked" className="space-y-4">
          {lockedAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {lockedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isLocked={true}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <Star className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">All achievements unlocked!</h3>
                <p className="text-muted-foreground">
                  You've made progress on all available achievements. Great work!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
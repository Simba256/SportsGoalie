'use client';

import { useState } from 'react';
import { Filter, Trophy, Star, Clock, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    common: 'bg-gray-100 text-gray-800',
    uncommon: 'bg-green-50 text-green-700',
    rare: 'bg-blue-50 text-blue-700',
    epic: 'bg-purple-50 text-purple-700',
    legendary: 'bg-yellow-50 text-yellow-800'
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Achievement Progress</span>
          </CardTitle>
          <CardDescription>
            Track your learning milestones and accomplishments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalCompleted}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressAchievements.length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{achievements.length}</div>
              <div className="text-sm text-muted-foreground">Total Available</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            {/* Rarity Filter */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={filterRarity === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterRarity('all')}
              >
                All Rarities
              </Button>
              {Object.entries(rarityColors).map(([rarity, colorClass]) => (
                <Button
                  key={rarity}
                  variant={filterRarity === rarity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterRarity(rarity)}
                  className="capitalize"
                >
                  {rarity}
                </Button>
              ))}
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All Types
              </Button>
              {Object.entries(typeIcons).map(([type, icon]) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
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
        <TabsList>
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
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
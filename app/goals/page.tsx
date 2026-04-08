'use client';

import { Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GoalsList } from '@/components/goals/GoalsList';
import { AchievementsList } from '@/components/achievements/AchievementsList';
import { useAchievements } from '@/hooks/useProgress';

// Sample goals data - in a real app, this would come from the database
const sampleGoals = [
  {
    id: '1',
    title: 'Complete 5 Basketball Skills',
    description: 'Master fundamental basketball techniques including shooting, dribbling, and passing.',
    type: 'skill_completion' as const,
    targetValue: 5,
    currentValue: 3,
    unit: 'skills',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'high' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Maintain 7-Day Learning Streak',
    description: 'Study sports skills for at least 30 minutes every day for a week.',
    type: 'streak' as const,
    targetValue: 7,
    currentValue: 3,
    unit: 'days',
    deadline: undefined,
    priority: 'medium' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Achieve 90% Quiz Average',
    description: 'Improve quiz performance to maintain a 90% average score across all sports.',
    type: 'quiz_score' as const,
    targetValue: 90,
    currentValue: 75,
    unit: '%',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    priority: 'medium' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Complete Soccer Fundamentals',
    description: 'Finish the complete soccer learning path including all skills and assessments.',
    type: 'sport_completion' as const,
    targetValue: 1,
    currentValue: 1,
    unit: 'sport',
    deadline: undefined,
    priority: 'low' as const,
    isCompleted: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: '5',
    title: 'Study 20 Hours This Month',
    description: 'Dedicate at least 20 hours to learning sports skills this month.',
    type: 'time_spent' as const,
    targetValue: 20,
    currentValue: 12,
    unit: 'hours',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    priority: 'low' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
];

export default function GoalsAndAchievementsPage() {
  return (
    <ProtectedRoute>
      <GoalsAndAchievementsContent />
    </ProtectedRoute>
  );
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'skill_completion' | 'quiz_score' | 'time_spent' | 'streak' | 'sport_completion';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: Date;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  createdAt: Date;
}

type ActiveTab = 'goals' | 'achievements';

function GoalsAndAchievementsContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [activeTab, setActiveTab] = useState<ActiveTab>('goals');
  const { achievements, userAchievements, loading: achievementsLoading, error: achievementsError } = useAchievements();

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
    };
    setGoals([newGoal, ...goals]);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Target className="h-8 w-8" />
            <span>Goals & Achievements</span>
          </h1>
          <p className="text-muted-foreground">
            Set personal learning objectives and unlock achievements as you progress.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'goals'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Target className="h-4 w-4" />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'achievements'
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Trophy className="h-4 w-4" />
            Achievements
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'goals' ? (
          <GoalsList
            goals={goals}
            onCreateGoal={handleCreateGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            loading={false}
          />
        ) : (
          <>
            {achievementsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : achievementsError ? (
              <div className="text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Unable to load achievements</h3>
                <p className="text-muted-foreground">{achievementsError}</p>
              </div>
            ) : (
              <AchievementsList
                achievements={achievements}
                userAchievements={userAchievements}
                loading={achievementsLoading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

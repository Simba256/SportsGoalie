'use client';

import { Target } from 'lucide-react';
import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GoalsList } from '@/components/goals/GoalsList';

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
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    priority: 'high' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
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
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: '3',
    title: 'Achieve 90% Quiz Average',
    description: 'Improve quiz performance to maintain a 90% average score across all sports.',
    type: 'quiz_score' as const,
    targetValue: 90,
    currentValue: 75,
    unit: '%',
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month from now
    priority: 'medium' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
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
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
  },
  {
    id: '5',
    title: 'Study 20 Hours This Month',
    description: 'Dedicate at least 20 hours to learning sports skills this month.',
    type: 'time_spent' as const,
    targetValue: 20,
    currentValue: 12,
    unit: 'hours',
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    priority: 'low' as const,
    isCompleted: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
  },
];

export default function GoalsPage() {
  return (
    <ProtectedRoute>
      <GoalsContent />
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

function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);

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
            <span>Learning Goals</span>
          </h1>
          <p className="text-muted-foreground">
            Set personal learning objectives and track your progress towards achieving them.
          </p>
        </div>

        {/* Goals List */}
        <GoalsList
          goals={goals}
          onCreateGoal={handleCreateGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
          loading={false}
        />
      </div>
    </div>
  );
}
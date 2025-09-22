'use client';

import { useState } from 'react';
import { Plus, Target, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GoalCard } from './GoalCard';
import { CreateGoalForm } from './CreateGoalForm';

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

interface GoalsListProps {
  goals: Goal[];
  onCreateGoal?: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  onUpdateGoal?: (goalId: string, updates: Partial<Goal>) => void;
  onDeleteGoal?: (goalId: string) => void;
  loading?: boolean;
}

export function GoalsList({
  goals,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  loading = false
}: GoalsListProps) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter goals
  const filteredGoals = goals.filter(goal => {
    return filterPriority === 'all' || goal.priority === filterPriority;
  });

  // Separate goals by status
  const activeGoals = filteredGoals.filter(goal => !goal.isCompleted);
  const completedGoals = filteredGoals.filter(goal => goal.isCompleted);
  const overdueGoals = activeGoals.filter(goal =>
    goal.deadline && new Date() > goal.deadline
  );

  // Calculate stats
  const totalGoals = goals.length;
  const completedCount = completedGoals.length;
  const activeCount = activeGoals.length;
  const overdueCount = overdueGoals.length;

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (onCreateGoal) {
      onCreateGoal(goalData);
      setIsCreateDialogOpen(false);
    }
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
      {/* Goals Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Learning Goals</span>
              </CardTitle>
              <CardDescription>
                Set and track your learning objectives
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set a new learning goal to track your progress
                  </DialogDescription>
                </DialogHeader>
                <CreateGoalForm onSubmit={handleCreateGoal} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalGoals}</div>
              <div className="text-sm text-muted-foreground">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{activeCount}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Priority:</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={filterPriority === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('all')}
              >
                All
              </Button>
              <Button
                variant={filterPriority === 'high' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('high')}
              >
                High
              </Button>
              <Button
                variant={filterPriority === 'medium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('medium')}
              >
                Medium
              </Button>
              <Button
                variant={filterPriority === 'low' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPriority('low')}
              >
                Low
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeCount})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedCount})
          </TabsTrigger>
          {overdueCount > 0 && (
            <TabsTrigger value="overdue" className="text-red-600">
              Overdue ({overdueCount})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={onUpdateGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first learning goal to start tracking your progress.
                </p>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Goal</DialogTitle>
                      <DialogDescription>
                        Set a new learning goal to track your progress
                      </DialogDescription>
                    </DialogHeader>
                    <CreateGoalForm onSubmit={handleCreateGoal} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGoals.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {completedGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={onUpdateGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed goals yet</h3>
                <p className="text-muted-foreground">
                  Complete your active goals to see them here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {overdueCount > 0 && (
          <TabsContent value="overdue" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {overdueGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onUpdate={onUpdateGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
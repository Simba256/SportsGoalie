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
      {/* Goals Stats */}
      <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2 text-slate-900">
                <Target className="h-5 w-5 text-red-600" />
                <span>Learning Goals</span>
              </CardTitle>
              <CardDescription className="text-slate-600">
                Set and track your learning objectives
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-red-600 text-white hover:bg-red-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto border border-red-100 bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Create New Goal</DialogTitle>
                  <DialogDescription className="text-slate-600">
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
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{totalGoals}</div>
              <div className="text-sm text-slate-600">Total Goals</div>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{completedCount}</div>
              <div className="text-sm text-slate-600">Completed</div>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{activeCount}</div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
            <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
              <div className="text-sm text-slate-600">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="rounded-2xl border border-red-100/80 bg-gradient-to-r from-red-50/70 via-white to-blue-50/70 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <Filter className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700">Priority</span>
            </div>
            <div className="inline-flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterPriority('all')}
                className={filterPriority === 'all' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterPriority('high')}
                className={filterPriority === 'high' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                High
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterPriority('medium')}
                className={filterPriority === 'medium' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                Medium
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterPriority('low')}
                className={filterPriority === 'low' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-slate-700 hover:bg-slate-100'}
              >
                Low
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="border border-slate-200 bg-white p-1">
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
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No active goals</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first learning goal to start tracking your progress.
                </p>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 text-white hover:bg-red-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[85vh] overflow-y-auto border border-red-100 bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-slate-900">Create New Goal</DialogTitle>
                      <DialogDescription className="text-slate-600">
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
            <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <CardContent className="p-6 text-center">
                <Target className="mx-auto h-12 w-12 text-blue-400 mb-4" />
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
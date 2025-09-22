'use client';

import { Calendar, Target, Clock, CheckCircle, Circle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

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

interface GoalCardProps {
  goal: Goal;
  onUpdate?: (goalId: string, updates: Partial<Goal>) => void;
  onDelete?: (goalId: string) => void;
}

export function GoalCard({ goal, onUpdate, onDelete }: GoalCardProps) {
  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isOverdue = goal.deadline && new Date() > goal.deadline && !goal.isCompleted;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 ring-yellow-600/20';
      case 'low':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'skill_completion':
        return <Target className="h-4 w-4" />;
      case 'quiz_score':
        return <CheckCircle className="h-4 w-4" />;
      case 'time_spent':
        return <Clock className="h-4 w-4" />;
      case 'streak':
        return <Calendar className="h-4 w-4" />;
      case 'sport_completion':
        return <Target className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day(s)`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} day(s)`;
    } else {
      return `Due ${deadline.toLocaleDateString()}`;
    }
  };

  const handleMarkComplete = () => {
    if (onUpdate) {
      onUpdate(goal.id, {
        isCompleted: true,
        currentValue: goal.targetValue
      });
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      goal.isCompleted ? 'ring-2 ring-green-500/20 bg-green-50/30' :
      isOverdue ? 'ring-2 ring-red-500/20 bg-red-50/30' : ''
    }`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                goal.isCompleted
                  ? 'bg-green-100 text-green-600'
                  : 'bg-blue-100 text-blue-600'
              }`}>
                {getTypeIcon(goal.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{goal.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {goal.isCompleted && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Completed
                </Badge>
              )}
              <Badge className={getPriorityColor(goal.priority)}>
                {goal.priority}
              </Badge>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {goal.currentValue} / {goal.targetValue} {goal.unit}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}% complete</span>
              {goal.deadline && !goal.isCompleted && (
                <span className={isOverdue ? 'text-red-600' : ''}>
                  {formatDeadline(goal.deadline)}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          {!goal.isCompleted && (
            <div className="flex items-center justify-between pt-2">
              <div className="flex space-x-2">
                {progress >= 100 && (
                  <Button size="sm" onClick={handleMarkComplete}>
                    Mark Complete
                  </Button>
                )}
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(goal.id)}
                  className="text-muted-foreground hover:text-red-600"
                >
                  Delete
                </Button>
              )}
            </div>
          )}

          {/* Completion info */}
          {goal.isCompleted && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span>Goal completed! Great work!</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
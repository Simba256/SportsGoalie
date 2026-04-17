'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Target, Clock, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  type: z.enum(['skill_completion', 'quiz_score', 'time_spent', 'streak', 'sport_completion']),
  targetValue: z.number().min(1, 'Target value must be at least 1'),
  unit: z.string().min(1, 'Unit is required'),
  deadline: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
});

type GoalFormData = z.infer<typeof goalSchema>;

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

interface CreateGoalFormProps {
  onSubmit: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
}

const goalTypes = [
  {
    value: 'skill_completion',
    label: 'Complete Skills',
    icon: <Target className="h-4 w-4" />,
    description: 'Set a goal to complete a specific number of skills',
    defaultUnit: 'skills',
  },
  {
    value: 'quiz_score',
    label: 'Quiz Performance',
    icon: <Trophy className="h-4 w-4" />,
    description: 'Achieve a target average quiz score',
    defaultUnit: '%',
  },
  {
    value: 'time_spent',
    label: 'Learning Time',
    icon: <Clock className="h-4 w-4" />,
    description: 'Spend a certain amount of time learning',
    defaultUnit: 'hours',
  },
  {
    value: 'streak',
    label: 'Learning Streak',
    icon: <Zap className="h-4 w-4" />,
    description: 'Maintain a learning streak for consecutive days',
    defaultUnit: 'days',
  },
  {
    value: 'sport_completion',
    label: 'Complete Sports',
    icon: <Target className="h-4 w-4" />,
    description: 'Complete learning paths for specific sports',
    defaultUnit: 'sports',
  },
];

export function CreateGoalForm({ onSubmit }: CreateGoalFormProps) {
  const [selectedType, setSelectedType] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setValue('type', type as any);

    // Set default unit based on type
    const goalType = goalTypes.find(gt => gt.value === type);
    if (goalType) {
      setValue('unit', goalType.defaultUnit);
    }
  };

  const onFormSubmit = (data: GoalFormData) => {
    const goalData: Omit<Goal, 'id' | 'createdAt'> = {
      title: data.title,
      description: data.description,
      type: data.type,
      targetValue: data.targetValue,
      currentValue: 0,
      unit: data.unit,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      priority: data.priority,
      isCompleted: false,
    };

    onSubmit(goalData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Goal Type Selection */}
      <div className="space-y-3">
        <Label className="text-slate-800">Goal Type</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {goalTypes.map((type) => (
            <Card
              key={type.value}
              className={`cursor-pointer transition-all ${
                selectedType === type.value
                  ? 'border-red-200 bg-red-50/60 ring-2 ring-red-200'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              onClick={() => handleTypeChange(type.value)}
            >
              <CardContent className="p-3">
                <div className="flex items-start space-x-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${selectedType === type.value ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-slate-900">{type.label}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                      {type.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.type && (
          <p className="text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Goal Details */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-slate-800">Goal Title</Label>
          <Input
            id="title"
            placeholder="e.g., Complete 5 basketball skills this month"
            className="border-slate-200 focus-visible:ring-red-500/30 focus-visible:border-red-300"
            {...register('title')}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-slate-800">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe what you want to achieve and why it's important to you..."
            rows={3}
            className="border-slate-200 focus-visible:ring-red-500/30 focus-visible:border-red-300"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="targetValue" className="text-slate-800">Target Value</Label>
            <Input
              id="targetValue"
              type="number"
              min="1"
              placeholder="10"
              className="border-slate-200 focus-visible:ring-red-500/30 focus-visible:border-red-300"
              {...register('targetValue', { valueAsNumber: true })}
            />
            {errors.targetValue && (
              <p className="text-sm text-red-600">{errors.targetValue.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit" className="text-slate-800">Unit</Label>
            <Input
              id="unit"
              placeholder="skills"
              className="border-slate-200 focus-visible:ring-red-500/30 focus-visible:border-red-300"
              {...register('unit')}
            />
            {errors.unit && (
              <p className="text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority" className="text-slate-800">Priority</Label>
          <Select
            onValueChange={(value) => setValue('priority', value as any)}
            defaultValue="medium"
          >
            <SelectTrigger className="border-slate-200 focus:ring-red-500/30 focus:border-red-300">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deadline" className="text-slate-800">Deadline (Optional)</Label>
          <Input
            id="deadline"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            className="border-slate-200 focus-visible:ring-red-500/30 focus-visible:border-red-300"
            {...register('deadline')}
          />
          {errors.deadline && (
            <p className="text-sm text-red-600">{errors.deadline.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full bg-red-600 text-white hover:bg-red-700" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
      </Button>
    </form>
  );
}
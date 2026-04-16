'use client';

import { BookOpen, CheckCircle2, Flame, Target, Trophy } from 'lucide-react';
import { useState } from 'react';
import { SkeletonCardGrid } from '@/components/ui/skeletons';
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

  const completedGoalsCount = goals.filter(goal => goal.isCompleted).length;
  const activeGoalsCount = goals.length - completedGoalsCount;
  const goalCompletionRate = goals.length > 0
    ? Math.round((completedGoalsCount / goals.length) * 100)
    : 0;
  const unlockedAchievements = userAchievements.filter(a => a.isCompleted).length;

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
    <div className="bg-gray-50">
      <section
        className="relative -mx-4 -mt-4 md:-mx-6 md:-mt-6 h-[340px] md:h-[390px] flex flex-col justify-center px-6 md:px-10 overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/goals-achieve.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#090f2b]/90 via-[#0f1f4a]/82 to-[#18214f]/70" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent via-gray-100/55 to-gray-50" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-white/10 backdrop-blur-[3px]" />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-white/15 backdrop-blur-[6px]" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white">
            Build Clear Goals,
            <span className="block text-red-500">Earn Every Milestone.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base font-medium text-white/85 leading-relaxed">
            Stay consistent with focused learning objectives and track the achievements you unlock along the way.
          </p>
        </div>
      </section>

      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-10 space-y-6 md:space-y-7">
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-7">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 shadow-sm h-[150px] md:h-[165px]">
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">Total Goals</p>
                <div className="w-9 h-9 rounded-lg bg-blue-100/80 flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">{goals.length}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-red-50 border border-red-100 shadow-sm h-[150px] md:h-[165px]">
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-red-700">Active Goals</p>
                <div className="w-9 h-9 rounded-lg bg-red-100/70 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">{activeGoalsCount}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm h-[150px] md:h-[165px]">
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Completion Rate</p>
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">{goalCompletionRate}%</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm h-[150px] md:h-[165px]">
            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Unlocked Achievements</p>
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">{unlockedAchievements}</p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-red-100/80 bg-gradient-to-r from-red-50/70 via-white to-blue-50/70 p-2">
          <div className="inline-flex w-full flex-wrap gap-1.5 rounded-xl border border-slate-200/80 bg-white/90 p-1.5 sm:w-auto">
            <button
              onClick={() => setActiveTab('goals')}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'goals'
                  ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Target className="h-4 w-4" />
              Goals
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === 'achievements'
                  ? 'bg-red-600 text-white shadow-sm hover:bg-red-700'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Achievements
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6">
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
                <SkeletonCardGrid count={6} cols={3} />
              ) : achievementsError ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
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
        </section>
      </main>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Flame, Target, Trophy } from 'lucide-react';
import { SkeletonCardGrid } from '@/components/ui/skeletons';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { GoalsList } from '@/components/goals/GoalsList';
import { AchievementsList } from '@/components/achievements/AchievementsList';
import { useAchievements } from '@/hooks/useProgress';

const BLUE = '#37b5ff';

const sampleGoals = [
  { id: '1', title: 'Complete 5 Basketball Skills', description: 'Master fundamental basketball techniques including shooting, dribbling, and passing.', type: 'skill_completion' as const, targetValue: 5, currentValue: 3, unit: 'skills', deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), priority: 'high' as const, isCompleted: false, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: '2', title: 'Maintain 7-Day Learning Streak', description: 'Study sports skills for at least 30 minutes every day for a week.', type: 'streak' as const, targetValue: 7, currentValue: 3, unit: 'days', deadline: undefined, priority: 'medium' as const, isCompleted: false, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: '3', title: 'Achieve 90% Quiz Average', description: 'Improve quiz performance to maintain a 90% average score across all sports.', type: 'quiz_score' as const, targetValue: 90, currentValue: 75, unit: '%', deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), priority: 'medium' as const, isCompleted: false, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  { id: '4', title: 'Complete Soccer Fundamentals', description: 'Finish the complete soccer learning path including all skills and assessments.', type: 'sport_completion' as const, targetValue: 1, currentValue: 1, unit: 'sport', deadline: undefined, priority: 'low' as const, isCompleted: true, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
  { id: '5', title: 'Study 20 Hours This Month', description: 'Dedicate at least 20 hours to learning sports skills this month.', type: 'time_spent' as const, targetValue: 20, currentValue: 12, unit: 'hours', deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), priority: 'low' as const, isCompleted: false, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
];

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

export default function GoalsAndAchievementsPage() {
  return (
    <ProtectedRoute>
      <GoalsAndAchievementsContent />
    </ProtectedRoute>
  );
}

function GoalsAndAchievementsContent() {
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [activeTab, setActiveTab] = useState<ActiveTab>('goals');
  const { achievements, userAchievements, loading: achievementsLoading, error: achievementsError } = useAchievements();

  const completedGoalsCount = goals.filter(g => g.isCompleted).length;
  const activeGoalsCount = goals.length - completedGoalsCount;
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoalsCount / goals.length) * 100) : 0;
  const unlockedAchievements = userAchievements.filter(a => a.isCompleted).length;

  const handleCreateGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    setGoals([{ ...goalData, id: Math.random().toString(36).substr(2, 9), createdAt: new Date() }, ...goals]);
  };

  const handleUpdateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, ...updates } : g));
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(g => g.id !== goalId));
  };

  return (
    <div style={{ background: 'linear-gradient(145deg, #000f28 0%, #062344 46%, #0a3159 100%)', minHeight: '100vh' }}>
      <style>{`
        .goals-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (min-width: 768px) { .goals-stats { grid-template-columns: repeat(4, 1fr); } }
      `}</style>

      {/* Hero */}
      <section style={{ position: 'relative', height: '280px', display: 'flex', alignItems: 'flex-end', backgroundImage: "url('/goals-achieve.png')", backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,15,40,0.92) 0%, rgba(6,35,68,0.85) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, bottom: 0, background: 'linear-gradient(to top, #000f28 0%, transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px 32px' }}>
          <h1 style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Build Clear Goals, <span style={{ color: BLUE }}>Earn Every Milestone.</span>
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Stay consistent with focused learning objectives and track the achievements you unlock along the way.</p>
        </div>
      </section>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Stats */}
        <div className="goals-stats">
          {[
            { label: 'Total Goals', value: goals.length, icon: <Target size={17} color={BLUE} /> },
            { label: 'Active Goals', value: activeGoalsCount, icon: <Flame size={17} color={BLUE} /> },
            { label: 'Completion Rate', value: `${goalCompletionRate}%`, icon: <CheckCircle2 size={17} color={BLUE} /> },
            { label: 'Achievements', value: unlockedAchievements, icon: <Trophy size={17} color={BLUE} /> },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
                <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(55,181,255,0.12)', border: '1px solid rgba(55,181,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</div>
              </div>
              <p style={{ fontSize: '42px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(2,18,44,0.8)', border: '1px solid rgba(55,181,255,0.15)', borderRadius: '12px', padding: '5px', width: 'fit-content' }}>
          {([{ key: 'goals', label: 'Goals', icon: <Target size={14} /> }, { key: 'achievements', label: 'Achievements', icon: <Trophy size={14} /> }] as { key: ActiveTab; label: string; icon: React.ReactNode }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === t.key ? BLUE : 'transparent',
                color: activeTab === t.key ? '#000f28' : 'rgba(255,255,255,0.5)',
              }}
            >{t.icon}{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ background: 'rgba(2,18,44,0.82)', border: '1px solid rgba(55,181,255,0.18)', borderRadius: '18px', padding: '24px 28px' }}>
          {activeTab === 'goals' ? (
            <GoalsList goals={goals} onCreateGoal={handleCreateGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} loading={false} />
          ) : (
            <>
              {achievementsLoading ? (
                <SkeletonCardGrid count={6} cols={3} />
              ) : achievementsError ? (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <BookOpen size={48} color="rgba(255,255,255,0.15)" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Unable to load achievements</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>{achievementsError}</p>
                </div>
              ) : (
                <AchievementsList achievements={achievements} userAchievements={userAchievements} loading={achievementsLoading} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

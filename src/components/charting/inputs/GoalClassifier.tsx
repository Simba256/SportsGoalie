'use client';

import { GoalEntry } from '@/types/charting';
import { YesNoToggle } from './YesNoToggle';
import { Shield, ShieldAlert } from 'lucide-react';

interface GoalClassifierProps {
  goalCount: number;
  goals: GoalEntry[];
  onChange: (goals: GoalEntry[]) => void;
}

export function GoalClassifier({ goalCount, goals, onChange }: GoalClassifierProps) {
  if (goalCount === 0) return null;

  // Ensure goals array has entries for all goals
  const ensuredGoals: GoalEntry[] = Array.from({ length: goalCount }, (_, i) => {
    return goals[i] || { goalNumber: i + 1, isGoodGoal: true, voiceNote: undefined };
  });

  const updateGoal = (index: number, isGoodGoal: boolean) => {
    const updated = [...ensuredGoals];
    updated[index] = { ...updated[index], isGoodGoal, voiceNote: isGoodGoal ? undefined : updated[index].voiceNote };
    onChange(updated);
  };

  const updateVoiceNote = (index: number, voiceNote: string) => {
    const updated = [...ensuredGoals];
    updated[index] = { ...updated[index], voiceNote };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Goal Classification
      </p>

      {ensuredGoals.map((goal, i) => (
        <div
          key={i}
          className={`rounded-xl border p-4 space-y-3 transition-colors ${
            goal.isGoodGoal
              ? 'bg-white/[0.04] border-white/10'
              : 'bg-red-900/10 border-red-500/25'
          }`}
        >
          {/* Goal header */}
          <div className="flex items-center gap-2">
            {goal.isGoodGoal ? (
              <Shield className="w-4 h-4 text-blue-500" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-bold text-white">
              Goal #{goal.goalNumber}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              goal.isGoodGoal
                ? 'bg-[rgba(55,181,255,0.12)] text-[#37b5ff]'
                : 'bg-red-900/20 text-red-400'
            }`}>
              {goal.isGoodGoal ? 'Good Goal' : 'Weak Goal'}
            </span>
          </div>

          {/* Good / Bad toggle */}
          <YesNoToggle
            value={goal.isGoodGoal}
            onChange={(val) => updateGoal(i, val)}
            triggerVoiceOn="no"
            voicePrompt="What decision would you make differently?"
            onVoiceComplete={(text) => updateVoiceNote(i, text)}
            initialVoiceText={goal.voiceNote}
          />
        </div>
      ))}
    </div>
  );
}

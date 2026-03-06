'use client';

import { useState } from 'react';
import { AssessmentQuestion, IntelligenceScore } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Info } from 'lucide-react';

interface AssessmentQuestionV2Props {
  question: AssessmentQuestion;
  categoryName: string;
  categoryColor: string;
  questionNumber: number;
  totalQuestionsInCategory: number;
  onAnswer: (optionId: string, score: IntelligenceScore) => void;
  disabled?: boolean;
}

/**
 * Color classes for different categories
 */
const CATEGORY_COLOR_CLASSES: Record<string, { badge: string; selected: string; shadow: string }> = {
  purple: {
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    selected: 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-400',
    shadow: 'shadow-purple-500/20',
  },
  blue: {
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    selected: 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-400',
    shadow: 'shadow-blue-500/20',
  },
  cyan: {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    selected: 'bg-gradient-to-r from-cyan-600/20 to-teal-600/20 border-cyan-400',
    shadow: 'shadow-cyan-500/20',
  },
  red: {
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    selected: 'bg-gradient-to-r from-red-600/20 to-orange-600/20 border-red-400',
    shadow: 'shadow-red-500/20',
  },
  green: {
    badge: 'bg-green-500/20 text-green-300 border-green-500/30',
    selected: 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-400',
    shadow: 'shadow-green-500/20',
  },
  orange: {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    selected: 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border-orange-400',
    shadow: 'shadow-orange-500/20',
  },
  indigo: {
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    selected: 'bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border-indigo-400',
    shadow: 'shadow-indigo-500/20',
  },
};

/**
 * Assessment question component with 1.0-4.0 scoring.
 * Auto-advances after selection with visual feedback.
 */
export function AssessmentQuestionV2({
  question,
  categoryName,
  categoryColor,
  questionNumber,
  totalQuestionsInCategory,
  onAnswer,
  disabled,
}: AssessmentQuestionV2Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = CATEGORY_COLOR_CLASSES[categoryColor] || CATEGORY_COLOR_CLASSES.blue;

  const handleSelect = async (optionId: string, score: IntelligenceScore) => {
    if (disabled || isSubmitting) return;

    setSelectedId(optionId);
    setIsSubmitting(true);

    // Brief delay for visual feedback before auto-advancing
    await new Promise(resolve => setTimeout(resolve, 500));

    onAnswer(optionId, score);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Category badge and question number */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn('px-3 py-1 rounded-full text-xs font-medium border', colorClasses.badge)}>
          {categoryName}
        </div>
        <span className="text-sm text-slate-500">
          {questionNumber} / {totalQuestionsInCategory}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <div className="flex items-start justify-center gap-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {question.question}
          </h3>
          {question.tooltip && (
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="flex-shrink-0 p-1 text-slate-500 hover:text-cyan-400 transition-colors mt-1"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && question.tooltip && (
          <div className="mt-4 p-4 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-300 text-left max-w-lg mx-auto">
            {question.tooltip}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + index); // A, B, C, D, E

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.score)}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                'flex items-center gap-4',
                isSelected
                  ? cn(colorClasses.selected, 'text-white scale-[1.02] shadow-lg', colorClasses.shadow)
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500',
                (disabled || isSubmitting) && !isSelected && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Letter badge */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors',
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-700 text-slate-400'
                )}
              >
                {isSelected ? <Check className="w-5 h-5" /> : letter}
              </div>

              {/* Option text */}
              <span className="flex-1 font-medium">{option.text}</span>
            </button>
          );
        })}
      </div>

      {/* Loading indicator */}
      {isSubmitting && (
        <div className="mt-6 flex items-center justify-center">
          <svg className="animate-spin h-6 w-6 text-cyan-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
}

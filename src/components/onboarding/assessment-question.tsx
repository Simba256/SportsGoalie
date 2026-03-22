'use client';

import { useState } from 'react';
import { AssessmentQuestion, IntelligenceScore } from '@/types';
import { cn } from '@/lib/utils';
import { Check, Info } from 'lucide-react';

interface AssessmentQuestionProps {
  question: AssessmentQuestion;
  categoryName: string;
  categoryColor: string;
  questionNumber: number;
  totalQuestionsInCategory: number;
  onAnswer: (optionId: string, score: IntelligenceScore) => void;
  disabled?: boolean;
}

const CATEGORY_COLOR_CLASSES: Record<string, { badge: string; selected: string; shadow: string }> = {
  purple: {
    badge: 'bg-purple-100 text-purple-600 border-purple-200',
    selected: 'bg-purple-50 border-purple-500',
    shadow: 'shadow-purple-500/10',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-600 border-blue-200',
    selected: 'bg-blue-50 border-blue-500',
    shadow: 'shadow-blue-500/10',
  },
  cyan: {
    badge: 'bg-cyan-100 text-cyan-600 border-cyan-200',
    selected: 'bg-cyan-50 border-cyan-500',
    shadow: 'shadow-cyan-500/10',
  },
  red: {
    badge: 'bg-red-100 text-red-600 border-red-200',
    selected: 'bg-red-50 border-red-500',
    shadow: 'shadow-red-500/10',
  },
  green: {
    badge: 'bg-green-100 text-green-600 border-green-200',
    selected: 'bg-green-50 border-green-500',
    shadow: 'shadow-green-500/10',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-600 border-orange-200',
    selected: 'bg-orange-50 border-orange-500',
    shadow: 'shadow-orange-500/10',
  },
  indigo: {
    badge: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    selected: 'bg-indigo-50 border-indigo-500',
    shadow: 'shadow-indigo-500/10',
  },
};

export function AssessmentQuestionComponent({
  question,
  categoryName,
  categoryColor,
  questionNumber,
  totalQuestionsInCategory,
  onAnswer,
  disabled,
}: AssessmentQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = CATEGORY_COLOR_CLASSES[categoryColor] || CATEGORY_COLOR_CLASSES.blue;

  const handleSelect = async (optionId: string, score: IntelligenceScore) => {
    if (disabled || isSubmitting) return;

    setSelectedId(optionId);
    setIsSubmitting(true);

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
        <span className="text-sm text-gray-400">
          {questionNumber} / {totalQuestionsInCategory}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-8">
        <div className="flex items-start justify-center gap-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {question.question}
          </h3>
          {question.tooltip && (
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors mt-1"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tooltip */}
        {showTooltip && question.tooltip && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 text-left max-w-lg mx-auto">
            {question.tooltip}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + index);

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.score)}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                'flex items-center gap-4',
                isSelected
                  ? cn(colorClasses.selected, 'text-gray-900 scale-[1.02] shadow-md', colorClasses.shadow)
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                (disabled || isSubmitting) && !isSelected && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Letter badge */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors',
                  isSelected
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-400'
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
          <svg className="animate-spin h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
}

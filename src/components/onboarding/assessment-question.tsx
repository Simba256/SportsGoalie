'use client';

import { useEffect, useState } from 'react';
import { AssessmentQuestion, IntelligenceScore } from '@/types';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';

interface AssessmentQuestionProps {
  question: AssessmentQuestion;
  categoryName: string;
  categoryColor: string;
  questionNumber: number;
  totalQuestionsInCategory: number;
  onAnswer: (optionId: string, score: IntelligenceScore) => void;
  onBack: () => void;
  canGoBack: boolean;
  initialSelectedOptionId?: string | null;
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
  onBack,
  canGoBack,
  initialSelectedOptionId,
  disabled,
}: AssessmentQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedOptionId ?? null);
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = CATEGORY_COLOR_CLASSES[categoryColor] || CATEGORY_COLOR_CLASSES.blue;

  useEffect(() => {
    setSelectedId(initialSelectedOptionId ?? null);
  }, [question.id, initialSelectedOptionId]);

  const handleSelect = (optionId: string) => {
    if (disabled) return;

    setSelectedId(optionId);
  };

  const handleNext = () => {
    if (disabled || !selectedId) return;

    const selectedOption = question.options.find(option => option.id === selectedId);
    if (!selectedOption) return;

    onAnswer(selectedOption.id, selectedOption.score);
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
              onClick={() => handleSelect(option.id)}
              disabled={disabled}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                'flex items-center gap-4',
                isSelected
                  ? cn(colorClasses.selected, 'text-gray-900 scale-[1.02] shadow-md', colorClasses.shadow)
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                disabled && !isSelected && 'opacity-50 cursor-not-allowed'
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

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={disabled || !canGoBack}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-semibold transition-colors',
            'border-gray-300 text-gray-700 bg-white hover:bg-gray-50',
            (disabled || !canGoBack) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={disabled || !selectedId}
          className={cn(
            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors',
            'bg-red-600 text-white hover:bg-red-700',
            (disabled || !selectedId) && 'opacity-50 cursor-not-allowed'
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

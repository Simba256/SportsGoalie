'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { OnboardingQuestion } from '@/types';

interface RatingQuestionProps {
  question: OnboardingQuestion;
  onAnswer: (value: number, points: number) => void;
  disabled?: boolean;
}

/**
 * Rating scale question component (1-5 slider).
 */
export function RatingQuestion({
  question,
  onAnswer,
  disabled,
}: RatingQuestionProps) {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const min = question.ratingMin || 1;
  const max = question.ratingMax || 5;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  const handleSelect = async (value: number) => {
    if (disabled || isSubmitting) return;

    setSelectedValue(value);
    setIsSubmitting(true);

    // Points = value (1-5)
    const points = value;

    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 400));

    onAnswer(value, points);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question */}
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {question.question}
        </h3>
        {question.description && (
          <p className="text-slate-400">{question.description}</p>
        )}
      </div>

      {/* Rating scale */}
      <div className="mb-6">
        <div className="flex justify-between gap-2 sm:gap-4">
          {values.map(value => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={disabled || isSubmitting}
              className={cn(
                'flex-1 aspect-square max-w-20 sm:max-w-24',
                'rounded-xl border-2 transition-all duration-300',
                'flex items-center justify-center',
                'text-2xl sm:text-3xl font-bold',
                selectedValue === value
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-400 border-transparent text-white scale-110 shadow-lg shadow-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 hover:text-white',
                (disabled || isSubmitting) && 'cursor-not-allowed opacity-50'
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {/* Labels */}
      {question.ratingLabels && (
        <div className="flex justify-between text-sm text-slate-500 px-2">
          <span className="max-w-[45%]">{question.ratingLabels.min}</span>
          <span className="max-w-[45%] text-right">{question.ratingLabels.max}</span>
        </div>
      )}
    </div>
  );
}

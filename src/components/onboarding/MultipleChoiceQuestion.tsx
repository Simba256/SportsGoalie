'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { OnboardingQuestion } from '@/types';
import { Check } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: OnboardingQuestion;
  onAnswer: (optionId: string, points: number) => void;
  disabled?: boolean;
}

/**
 * Multiple choice question component with card-based options.
 */
export function MultipleChoiceQuestion({
  question,
  onAnswer,
  disabled,
}: MultipleChoiceQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = question.options || [];

  const handleSelect = async (optionId: string, points: number) => {
    if (disabled || isSubmitting) return;

    setSelectedId(optionId);
    setIsSubmitting(true);

    // Brief delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    onAnswer(optionId, points);
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

      {/* Options */}
      <div className="grid gap-3">
        {options.map((option, index) => {
          const isSelected = selectedId === option.id;
          const letter = String.fromCharCode(65 + index); // A, B, C, D

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.points)}
              disabled={disabled || isSubmitting}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-300',
                'flex items-center gap-4',
                isSelected
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-cyan-400 text-white scale-[1.02] shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500',
                (disabled || isSubmitting) && !isSelected && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Letter badge */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg',
                  isSelected
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
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
    </div>
  );
}

/**
 * True/False question component (special case of multiple choice).
 */
export function TrueFalseQuestion({
  question,
  onAnswer,
  disabled,
}: MultipleChoiceQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = question.options || [
    { id: 'true', text: 'True', points: 0 },
    { id: 'false', text: 'False', points: 0 },
  ];

  const handleSelect = async (optionId: string, points: number) => {
    if (disabled || isSubmitting) return;

    setSelectedId(optionId);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 400));

    onAnswer(optionId, points);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Question */}
      <div className="text-center mb-10">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          {question.question}
        </h3>
        {question.description && (
          <p className="text-slate-400">{question.description}</p>
        )}
      </div>

      {/* True/False buttons */}
      <div className="flex gap-4 justify-center">
        {options.map(option => {
          const isSelected = selectedId === option.id;
          const isTrue = option.id === 'true';

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.points)}
              disabled={disabled || isSubmitting}
              className={cn(
                'px-12 py-6 rounded-xl border-2 font-bold text-xl transition-all duration-300',
                isSelected
                  ? isTrue
                    ? 'bg-green-600/20 border-green-400 text-green-300 scale-105 shadow-lg shadow-green-500/20'
                    : 'bg-red-600/20 border-red-400 text-red-300 scale-105 shadow-lg shadow-red-500/20'
                  : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-700/50 hover:border-slate-500 hover:text-white',
                (disabled || isSubmitting) && !isSelected && 'opacity-50 cursor-not-allowed'
              )}
            >
              {option.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

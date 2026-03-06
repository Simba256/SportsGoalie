'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { IntakeQuestion } from '@/types';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, Info, AlertTriangle } from 'lucide-react';

interface IntakeScreenProps {
  screen: number; // 0-based index (now represents question index)
  totalScreens: number; // Total number of questions
  questions: IntakeQuestion[]; // All questions for current batch (we'll show first one)
  responses: Record<string, string | string[]>;
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

/**
 * Intake screen component for Front Door questions.
 * Displays ONE question at a time with single/multi-select options.
 */
export function IntakeScreen({
  screen,
  totalScreens,
  questions,
  responses,
  onAnswer,
  onNext,
  onBack,
  loading = false,
}: IntakeScreenProps) {
  // Get the current question (first question in the array)
  const currentQuestion = questions[0];

  // Check if current question is answered
  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.isRequired) return true;

    const response = responses[currentQuestion.id];
    if (!response || (Array.isArray(response) && response.length === 0)) {
      return false;
    }
    return true;
  }, [currentQuestion, responses]);

  // Check if response triggers PIPEDA consent flow
  const requiresParentalConsent = useMemo(() => {
    if (!currentQuestion) return false;
    const response = responses[currentQuestion.id];
    if (response && !Array.isArray(response)) {
      const option = currentQuestion.options.find(o => o.id === response);
      if (option?.triggersFlow === 'under_13_pipeda') {
        return true;
      }
    }
    return false;
  }, [currentQuestion, responses]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: totalScreens }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-all duration-300',
                i === screen
                  ? 'bg-cyan-400 scale-125'
                  : i < screen
                  ? 'bg-cyan-600'
                  : 'bg-slate-700'
              )}
            />
          ))}
        </div>
        <p className="text-center text-sm text-slate-500">
          Question {screen + 1} of {totalScreens}
        </p>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <IntakeQuestionCard
          question={currentQuestion}
          value={responses[currentQuestion.id]}
          onChange={(value) => onAnswer(currentQuestion.id, value)}
        />
      </div>

      {/* PIPEDA notice */}
      {requiresParentalConsent && (
        <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-200 font-medium">
              Parent/Guardian Consent Required
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Since you're under 13, we'll need your parent or guardian to give permission before you can continue.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={screen === 0 || loading}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={onNext}
          disabled={!canProceed || loading}
          className={cn(
            'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400',
            'text-white font-medium px-8 transition-all',
            (!canProceed || loading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            <>
              {screen === totalScreens - 1 ? 'Continue' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface IntakeQuestionCardProps {
  question: IntakeQuestion;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

function IntakeQuestionCard({ question, value, onChange }: IntakeQuestionCardProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const isMultiSelect = question.type === 'multi_select';

  const handleOptionClick = (optionId: string) => {
    if (isMultiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionId)) {
        onChange(currentValues.filter(v => v !== optionId));
      } else {
        onChange([...currentValues, optionId]);
      }
    } else {
      onChange(optionId);
    }
  };

  const isSelected = (optionId: string) => {
    if (isMultiSelect) {
      return Array.isArray(value) && value.includes(optionId);
    }
    return value === optionId;
  };

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {question.question}
          </h2>
          {question.tooltip && (
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              className="flex-shrink-0 p-1 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Info className="w-5 h-5" />
            </button>
          )}
        </div>
        {isMultiSelect && (
          <p className="text-slate-400 text-sm">Select all that apply</p>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && question.tooltip && (
        <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-300 text-center max-w-md mx-auto">
          {question.tooltip}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-3">
        {question.options.map((option, index) => {
          const selected = isSelected(option.id);
          const letter = String.fromCharCode(65 + index); // A, B, C, D...
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                'flex items-center gap-4',
                selected
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-cyan-400 text-white scale-[1.02]'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
              )}
            >
              {/* Letter badge indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors',
                  selected
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                    : 'bg-slate-700 text-slate-400',
                  isMultiSelect && 'rounded-md'
                )}
              >
                {selected ? <Check className="w-5 h-5 text-white" /> : letter}
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

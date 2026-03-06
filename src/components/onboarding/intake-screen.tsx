'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { IntakeQuestion } from '@/types';
import { cn } from '@/lib/utils';
import { Check, ChevronRight, ChevronLeft, Info, AlertTriangle } from 'lucide-react';

interface IntakeScreenProps {
  screen: number; // 0-based index
  totalScreens: number;
  questions: IntakeQuestion[];
  responses: Record<string, string | string[]>;
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

/**
 * Screen titles for each intake screen
 */
const SCREEN_TITLES = [
  'Tell us about you',
  'Where are you playing?',
  'What brought you here?',
  'One more thing',
];

/**
 * Intake screen component for Front Door questions.
 * Displays 1-3 questions per screen with single/multi-select options.
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
  // Check if all required questions on this screen are answered
  const canProceed = useMemo(() => {
    for (const question of questions) {
      if (question.isRequired) {
        const response = responses[question.id];
        if (!response || (Array.isArray(response) && response.length === 0)) {
          return false;
        }
      }
    }
    return true;
  }, [questions, responses]);

  // Check if any response triggers PIPEDA consent flow
  const requiresParentalConsent = useMemo(() => {
    for (const question of questions) {
      const response = responses[question.id];
      if (response && !Array.isArray(response)) {
        const option = question.options.find(o => o.id === response);
        if (option?.triggersFlow === 'under_13_pipeda') {
          return true;
        }
      }
    }
    return false;
  }, [questions, responses]);

  return (
    <div className="flex-1 flex flex-col p-6 max-w-2xl mx-auto w-full">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {Array.from({ length: totalScreens }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
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
          Screen {screen + 1} of {totalScreens}
        </p>
      </div>

      {/* Screen title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
        {SCREEN_TITLES[screen] || `Screen ${screen + 1}`}
      </h2>

      {/* Questions */}
      <div className="flex-1 space-y-8">
        {questions.map((question) => (
          <IntakeQuestionCard
            key={question.id}
            question={question}
            value={responses[question.id]}
            onChange={(value) => onAnswer(question.id, value)}
          />
        ))}
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
    <div className="space-y-4">
      {/* Question text */}
      <div className="flex items-start gap-2">
        <p className="text-lg font-medium text-white flex-1">
          {question.question}
          {question.isRequired && <span className="text-red-400 ml-1">*</span>}
        </p>
        {question.tooltip && (
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex-shrink-0 p-1 text-slate-500 hover:text-cyan-400 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && question.tooltip && (
        <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-slate-300">
          {question.tooltip}
        </div>
      )}

      {/* Options */}
      <div className="grid gap-2">
        {question.options.map((option) => {
          const selected = isSelected(option.id);
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all duration-200',
                'flex items-center gap-3',
                selected
                  ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border-cyan-400 text-white'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500'
              )}
            >
              {/* Checkbox/Radio indicator */}
              <div
                className={cn(
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  selected
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-400 border-transparent'
                    : 'bg-transparent border-slate-600',
                  isMultiSelect && 'rounded-md'
                )}
              >
                {selected && <Check className="w-4 h-4 text-white" />}
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

'use client';

import { useState, useMemo } from 'react';
import { IntakeQuestion } from '@/types';
import { Check, ChevronRight, ChevronLeft, Info, AlertTriangle, Loader2 } from 'lucide-react';

const BLUE = '#37b5ff';
const GREEN = '#4ade80';
const AMBER = '#fbbf24';

interface IntakeScreenProps {
  screen: number;
  totalScreens: number;
  questions: IntakeQuestion[];
  responses: Record<string, string | string[]>;
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  loading?: boolean;
}

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
  const currentQuestion = questions[0];

  const canProceed = useMemo(() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.isRequired) return true;
    const response = responses[currentQuestion.id];
    if (!response || (Array.isArray(response) && response.length === 0)) return false;
    return true;
  }, [currentQuestion, responses]);

  const requiresParentalConsent = useMemo(() => {
    if (!currentQuestion) return false;
    const response = responses[currentQuestion.id];
    if (response && !Array.isArray(response)) {
      const option = currentQuestion.options.find(o => o.id === response);
      if (option?.triggersFlow === 'under_13_pipeda') return true;
    }
    return false;
  }, [currentQuestion, responses]);

  if (!currentQuestion) return null;

  return (
    <>
      <style>{`
        .is-opt:hover { border-color: rgba(55,181,255,0.4) !important; background: rgba(55,181,255,0.06) !important; }
        .is-nav-back:hover:not(:disabled) { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.2) !important; }
        .is-nav-next:hover:not(:disabled) { opacity: 0.88 !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .is-fade { animation: fade-up 0.35s ease both; }
      `}</style>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>

        {/* Progress dots */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            {Array.from({ length: totalScreens }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === screen ? '28px' : '10px',
                  height: '10px',
                  borderRadius: '99px',
                  background: i === screen ? BLUE : i < screen ? `${GREEN}80` : 'rgba(255,255,255,0.12)',
                  transition: 'all 0.3s ease',
                  boxShadow: i === screen ? `0 0 8px ${BLUE}60` : 'none',
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            Question {screen + 1} of {totalScreens}
          </p>
        </div>

        {/* Question card */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <IntakeQuestionCard
            question={currentQuestion}
            value={responses[currentQuestion.id]}
            onChange={(value) => onAnswer(currentQuestion.id, value)}
          />
        </div>

        {/* PIPEDA notice */}
        {requiresParentalConsent && (
          <div style={{
            marginTop: '24px', padding: '16px',
            background: `${AMBER}10`,
            border: `1px solid ${AMBER}30`,
            borderRadius: '12px',
            display: 'flex', alignItems: 'flex-start', gap: '12px',
          }}>
            <AlertTriangle style={{ width: '18px', height: '18px', color: AMBER, flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ color: AMBER, fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>
                Parent/Guardian Consent Required
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px' }}>
                Since you&apos;re under 13, we&apos;ll need your parent or guardian to give permission before you can continue.
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ marginTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            className="is-nav-back"
            onClick={onBack}
            disabled={screen === 0 || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)',
              padding: '10px 18px', borderRadius: '10px',
              fontWeight: 600, fontSize: '14px', cursor: screen === 0 ? 'not-allowed' : 'pointer',
              opacity: screen === 0 ? 0.4 : 1, transition: 'all 0.2s',
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>

          <button
            className="is-nav-next"
            onClick={onNext}
            disabled={!canProceed || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: !canProceed || loading
                ? 'rgba(55,181,255,0.25)'
                : `linear-gradient(135deg, ${BLUE} 0%, #0ea5e9 100%)`,
              border: 'none', color: '#fff',
              padding: '10px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px',
              cursor: !canProceed || loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              boxShadow: canProceed && !loading ? `0 4px 16px rgba(55,181,255,0.25)` : 'none',
            }}
          >
            {loading ? (
              <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Saving...</>
            ) : (
              <>{screen === totalScreens - 1 ? 'Continue' : 'Next'}<ChevronRight style={{ width: '16px', height: '16px' }} /></>
            )}
          </button>
        </div>
      </div>
    </>
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
      onChange(currentValues.includes(optionId)
        ? currentValues.filter(v => v !== optionId)
        : [...currentValues, optionId]);
    } else {
      onChange(optionId);
    }
  };

  const isSelected = (optionId: string) => {
    if (isMultiSelect) return Array.isArray(value) && value.includes(optionId);
    return value === optionId;
  };

  return (
    <div className="is-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Question text */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <h2 style={{ fontSize: 'clamp(20px,4vw,28px)', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
            {question.question}
          </h2>
          {question.tooltip && (
            <button
              onClick={() => setShowTooltip(!showTooltip)}
              style={{ flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}
            >
              <Info style={{ width: '18px', height: '18px' }} />
            </button>
          )}
        </div>
        {isMultiSelect && (
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>Select all that apply</p>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && question.tooltip && (
        <div style={{
          padding: '14px', background: 'rgba(55,181,255,0.07)',
          border: '1px solid rgba(55,181,255,0.2)', borderRadius: '12px',
          fontSize: '13px', color: 'rgba(255,255,255,0.6)', textAlign: 'center', maxWidth: '460px', margin: '0 auto',
        }}>
          {question.tooltip}
        </div>
      )}

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {question.options.map((option, index) => {
          const selected = isSelected(option.id);
          const letter = String.fromCharCode(65 + index);
          return (
            <button
              key={option.id}
              onClick={() => handleOptionClick(option.id)}
              className={selected ? undefined : 'is-opt'}
              style={{
                width: '100%', padding: '14px 16px',
                borderRadius: '12px',
                border: selected ? `2px solid ${BLUE}` : '1px solid rgba(255,255,255,0.1)',
                background: selected ? 'rgba(55,181,255,0.1)' : 'rgba(2,18,44,0.6)',
                textAlign: 'left', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '14px',
                transform: selected ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.2s',
                boxShadow: selected ? `0 4px 16px rgba(55,181,255,0.15)` : 'none',
              }}
            >
              {/* Letter badge */}
              <div style={{
                flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '15px', transition: 'all 0.2s',
                background: selected ? BLUE : 'rgba(255,255,255,0.08)',
                color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
              }}>
                {selected ? <Check style={{ width: '18px', height: '18px' }} /> : letter}
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: '15px', color: selected ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                {option.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

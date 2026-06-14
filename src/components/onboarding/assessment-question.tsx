'use client';

import { useEffect, useState } from 'react';
import { AssessmentQuestion, IntelligenceScore } from '@/types';
import { Check, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const BLUE = '#37b5ff';

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

const COLOR_ACCENT: Record<string, string> = {
  purple: '#a78bfa',
  blue: '#37b5ff',
  cyan: '#2dd4bf',
  red: '#f87171',
  green: '#4ade80',
  orange: '#fb923c',
  indigo: '#818cf8',
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

  const accent = COLOR_ACCENT[categoryColor] || BLUE;

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
    <>
      <style>{`
        .aq-opt:hover { border-color: rgba(255,255,255,0.2) !important; background: rgba(255,255,255,0.04) !important; }
        .aq-back:hover:not(:disabled) { border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.75) !important; }
        .aq-next:hover:not(:disabled) { opacity: 0.88 !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .aq-fade { animation: fade-up 0.3s ease both; }
        .aq-opts::-webkit-scrollbar { width: 4px; }
        .aq-opts::-webkit-scrollbar-track { background: transparent; }
        .aq-opts::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 4px; }
        .aq-opts { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) transparent; }
        @media (max-width: 700px) {
          .aq-two-col { flex-direction: column !important; }
          .aq-left-col { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important; padding-bottom: 20px !important; padding-right: 0 !important; }
        }
      `}</style>

      {/* Two-column layout: question on the left, options+nav on the right */}
      <div
        className="aq-two-col"
        style={{
          width: '100%',
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'row',
          gap: '0',
          height: '100%',
          minHeight: 0,
          alignItems: 'stretch',
        }}
      >
        {/* LEFT — category badge + question text */}
        <div
          className="aq-left-col aq-fade"
          style={{
            flex: '1 1 42%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '40px',
            paddingBottom: '28%',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Category + counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              padding: '5px 14px', borderRadius: '40px', fontSize: '12px', fontWeight: 700,
              background: `${accent}15`, border: `1px solid ${accent}35`, color: accent,
            }}>
              {categoryName}
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
              {questionNumber} / {totalQuestionsInCategory}
            </span>
          </div>

          {/* Question text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <h3 style={{ fontSize: 'clamp(20px,2.4vw,28px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>
              {question.question}
            </h3>
            {question.tooltip && (
              <button
                onClick={() => setShowTooltip(!showTooltip)}
                style={{
                  flexShrink: 0, background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '4px', marginTop: '4px',
                  color: showTooltip ? accent : 'rgba(255,255,255,0.3)',
                  transition: 'color 0.2s',
                }}
              >
                <Info style={{ width: '17px', height: '17px' }} />
              </button>
            )}
          </div>

          {showTooltip && question.tooltip && (
            <div style={{
              marginTop: '14px', padding: '12px',
              background: `${accent}0c`, border: `1px solid ${accent}25`,
              borderRadius: '12px', fontSize: '13px',
              color: 'rgba(255,255,255,0.6)',
            }}>
              {question.tooltip}
            </div>
          )}
        </div>

        {/* RIGHT — options + navigation */}
        <div
          style={{
            flex: '1 1 58%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            paddingLeft: '40px',
            paddingTop: '8px',
          }}
        >
          {/* Options — flex: 1 + minHeight: 0 so it fills space and scrolls, keeping nav always visible */}
          <div
            className="aq-fade aq-opts"
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', paddingRight: '6px' }}
          >
            {question.options.map((option, index) => {
              const isSelected = selectedId === option.id;
              const letter = String.fromCharCode(65 + index);
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  disabled={disabled}
                  className={isSelected ? undefined : 'aq-opt'}
                  style={{
                    width: '100%', padding: '12px 16px',
                    borderRadius: '12px',
                    border: isSelected ? `2px solid ${accent}` : '2px solid rgba(255,255,255,0.08)',
                    background: isSelected ? `${accent}12` : 'rgba(2,18,44,0.55)',
                    textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    boxShadow: isSelected ? `0 0 0 1px ${accent}30, 0 4px 16px ${accent}18` : 'none',
                    opacity: disabled && !isSelected ? 0.5 : 1,
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    flexShrink: 0, width: '34px', height: '34px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
                    background: isSelected ? accent : 'rgba(255,255,255,0.07)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}>
                    {isSelected ? <Check style={{ width: '16px', height: '16px' }} /> : letter}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '15px', color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation — flexShrink: 0 keeps it always visible below the scrollable options */}
          <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={onBack}
              disabled={disabled || !canGoBack}
              className="aq-back"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '10px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '14px', fontWeight: 600,
                cursor: disabled || !canGoBack ? 'not-allowed' : 'pointer',
                opacity: disabled || !canGoBack ? 0.4 : 1,
                transition: 'all 0.2s',
              }}
            >
              <ChevronLeft style={{ width: '16px', height: '16px' }} />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={disabled || !selectedId}
              className="aq-next"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 24px', borderRadius: '10px',
                background: !selectedId || disabled
                  ? `${accent}30`
                  : `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
                border: 'none', color: '#fff',
                fontSize: '14px', fontWeight: 700,
                cursor: disabled || !selectedId ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
                boxShadow: selectedId && !disabled ? `0 4px 16px ${accent}30` : 'none',
              }}
            >
              Next
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

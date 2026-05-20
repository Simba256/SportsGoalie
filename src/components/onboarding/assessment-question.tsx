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
        .aq-opt:hover { border-color: rgba(255,255,255,0.18) !important; background: rgba(255,255,255,0.04) !important; }
        .aq-back:hover:not(:disabled) { border-color: rgba(255,255,255,0.2) !important; color: rgba(255,255,255,0.75) !important; }
        .aq-next:hover:not(:disabled) { opacity: 0.88 !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .aq-fade { animation: fade-up 0.3s ease both; }
      `}</style>
      <div style={{ width: '100%', maxWidth: '620px', margin: '0 auto' }}>

        {/* Category badge + question number */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{
            padding: '5px 14px', borderRadius: '40px', fontSize: '12px', fontWeight: 700,
            background: `${accent}15`, border: `1px solid ${accent}35`, color: accent,
          }}>
            {categoryName}
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
            {questionNumber} / {totalQuestionsInCategory}
          </span>
        </div>

        {/* Question */}
        <div className="aq-fade" style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: 'clamp(19px,3.5vw,26px)', fontWeight: 800, color: '#fff', lineHeight: 1.35 }}>
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
                <Info style={{ width: '18px', height: '18px' }} />
              </button>
            )}
          </div>

          {showTooltip && question.tooltip && (
            <div style={{
              marginTop: '16px', padding: '14px',
              background: `${accent}0c`, border: `1px solid ${accent}25`,
              borderRadius: '12px', fontSize: '13px',
              color: 'rgba(255,255,255,0.6)', textAlign: 'left',
              maxWidth: '500px', margin: '16px auto 0',
            }}>
              {question.tooltip}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="aq-fade" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  width: '100%', padding: '14px 16px',
                  borderRadius: '12px',
                  border: isSelected ? `2px solid ${accent}` : '1px solid rgba(255,255,255,0.09)',
                  background: isSelected ? `${accent}12` : 'rgba(2,18,44,0.55)',
                  textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.2s',
                  boxShadow: isSelected ? `0 4px 20px ${accent}20` : 'none',
                  opacity: disabled && !isSelected ? 0.5 : 1,
                }}
              >
                <div style={{
                  flexShrink: 0, width: '36px', height: '36px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '15px', transition: 'all 0.2s',
                  background: isSelected ? accent : 'rgba(255,255,255,0.07)',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                  {isSelected ? <Check style={{ width: '18px', height: '18px' }} /> : letter}
                </div>
                <span style={{ flex: 1, fontWeight: 600, fontSize: '15px', color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
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
    </>
  );
}

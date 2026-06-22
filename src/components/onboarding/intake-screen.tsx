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
  const [showTooltip, setShowTooltip] = useState(false);
  const currentQuestion = questions[0];
  const isMultiSelect = currentQuestion?.type === 'multi_select';

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

  const currentValue = responses[currentQuestion.id];

  const handleOptionClick = (optionId: string) => {
    if (isMultiSelect) {
      const currentValues = Array.isArray(currentValue) ? currentValue : [];
      onAnswer(
        currentQuestion.id,
        currentValues.includes(optionId)
          ? currentValues.filter(v => v !== optionId)
          : [...currentValues, optionId]
      );
    } else {
      onAnswer(currentQuestion.id, optionId);
    }
  };

  const isSelected = (optionId: string) => {
    if (isMultiSelect) return Array.isArray(currentValue) && currentValue.includes(optionId);
    return currentValue === optionId;
  };

  return (
    <>
      <style>{`
        .is-opt:hover { border-color: rgba(55,181,255,0.35) !important; background: rgba(55,181,255,0.05) !important; }
        .is-nav-back:hover:not(:disabled) { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.2) !important; }
        .is-nav-next:hover:not(:disabled) { opacity: 0.88 !important; }
        @keyframes fade-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .is-fade { animation: fade-up 0.3s ease both; }
        .is-opts::-webkit-scrollbar { width: 4px; }
        .is-opts::-webkit-scrollbar-track { background: transparent; }
        .is-opts::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .is-opts { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.15) transparent; }
        @media (max-width: 700px) {
          .is-two-col { flex-direction: column !important; }
          .is-left-col { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.06) !important;
                         padding-right: 0 !important; padding-bottom: 16px !important; flex: 0 0 auto !important; overflow-y: visible !important; }
          .is-nav { margin-left: 0 !important; }
        }
      `}</style>

      {/*
        Outer shell:
        - flex: 1  →  fills the main-content slot in page.tsx (which now has minHeight:0)
        - minHeight: 0  →  allows this to shrink below its content size
        - overflow: hidden  →  hard clip so inner children respect the allocated height
      */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '20px 24px 16px',
        boxSizing: 'border-box',
      }}>

        {/* ── Progress dots ── */}
        <div style={{ flexShrink: 0, marginBottom: '18px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            {Array.from({ length: totalScreens }).map((_, i) => (
              <div key={i} style={{
                width: i === screen ? '28px' : '10px',
                height: '10px',
                borderRadius: '99px',
                background: i === screen ? BLUE : i < screen ? `${GREEN}80` : 'rgba(255,255,255,0.12)',
                transition: 'all 0.3s ease',
                boxShadow: i === screen ? `0 0 8px ${BLUE}60` : 'none',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Question {screen + 1} of {totalScreens}
          </p>
        </div>

        {/*
          Two-column row:
          - flex: 1, minHeight: 0  →  takes all remaining height, can shrink
          - overflow: hidden  →  hard clip so the right column's overflowY:auto works
        */}
        <div
          className="is-two-col is-fade"
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            gap: 0,
          }}
        >
          {/* LEFT — question text, vertically centred */}
          <div
            className="is-left-col"
            style={{
              flex: '0 0 40%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              paddingRight: '40px',
              overflowY: 'auto',
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <h2 style={{ fontSize: 'clamp(17px,2vw,25px)', fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: 0 }}>
                {currentQuestion.question}
              </h2>
              {currentQuestion.tooltip && (
                <button
                  onClick={() => setShowTooltip(s => !s)}
                  style={{
                    flexShrink: 0, background: 'transparent', border: 'none', cursor: 'pointer',
                    padding: '4px', marginTop: '3px',
                    color: showTooltip ? BLUE : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.2s',
                  }}
                >
                  <Info style={{ width: '17px', height: '17px' }} />
                </button>
              )}
            </div>
            {showTooltip && currentQuestion.tooltip && (
              <div style={{
                marginTop: '12px', padding: '12px',
                background: 'rgba(55,181,255,0.07)', border: '1px solid rgba(55,181,255,0.2)',
                borderRadius: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.6)',
              }}>
                {currentQuestion.tooltip}
              </div>
            )}
          </div>

          {/* RIGHT — options only, scrolls when too many */}
          <div
            className="is-opts"
            style={{
              flex: 1,
              overflowY: 'auto',
              paddingLeft: '40px',
              paddingTop: '4px',
              paddingRight: '6px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {isMultiSelect && (
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 2px', flexShrink: 0 }}>
                Select all that apply
              </p>
            )}

            {currentQuestion.options.map((option, index) => {
              const selected = isSelected(option.id);
              const letter = String.fromCharCode(65 + index);
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className={selected ? undefined : 'is-opt'}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: '12px',
                    border: selected ? `2px solid ${BLUE}` : '2px solid rgba(255,255,255,0.08)',
                    background: selected ? 'rgba(55,181,255,0.1)' : 'rgba(2,18,44,0.55)',
                    textAlign: 'left', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    boxShadow: selected ? `0 0 0 1px rgba(55,181,255,0.25), 0 4px 16px rgba(55,181,255,0.12)` : 'none',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    flexShrink: 0, width: '34px', height: '34px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '14px', transition: 'all 0.2s',
                    background: selected ? BLUE : 'rgba(255,255,255,0.07)',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
                  }}>
                    {selected ? <Check style={{ width: '16px', height: '16px' }} /> : letter}
                  </div>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: '15px', color: selected ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                    {option.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── PIPEDA (below columns, before nav) ── */}
        {requiresParentalConsent && (
          <div style={{
            flexShrink: 0, marginTop: '10px', padding: '14px 16px',
            background: `${AMBER}10`, border: `1px solid ${AMBER}30`,
            borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px',
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

        {/*
          Navigation — a flex SIBLING of the two-column row (not inside it).
          flexShrink:0 means it always takes its natural height and is never hidden.
          marginLeft:40% aligns the buttons under the right column.
        */}
        <div
          className="is-nav"
          style={{
            flexShrink: 0,
            marginTop: '12px',
            marginLeft: '40%',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
          }}
        >
          <button
            className="is-nav-back"
            onClick={onBack}
            disabled={screen === 0 || loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)', padding: '10px 18px', borderRadius: '10px',
              fontWeight: 600, fontSize: '14px',
              cursor: screen === 0 || loading ? 'not-allowed' : 'pointer',
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
              border: 'none', color: '#fff', padding: '10px 24px', borderRadius: '10px',
              fontWeight: 700, fontSize: '14px',
              cursor: !canProceed || loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
              boxShadow: canProceed && !loading ? `0 4px 16px rgba(55,181,255,0.25)` : 'none',
            }}
          >
            {loading
              ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Saving...</>
              : <>{screen === totalScreens - 1 ? 'Continue' : 'Next'}<ChevronRight style={{ width: '16px', height: '16px' }} /></>
            }
          </button>
        </div>
      </div>
    </>
  );
}

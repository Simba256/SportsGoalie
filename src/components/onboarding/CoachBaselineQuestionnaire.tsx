'use client';

import React, { useState, useMemo } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { generateCoachV2IntelligenceProfile } from '@/lib/scoring/v2-baseline-scoring';
import {
  COACH_BASELINE_SECTIONS,
  getCoachActiveQuestions,
} from '@/data/coach-baseline-profile-v1';
import type {
  CBQuestion,
  CBSection,
  CBQuestionOption,
  CBSectionKey,
} from '@/data/coach-baseline-profile-v1';
import {
  Mic,
  ChevronRight,
  ChevronLeft,
  Info,
  Check,
  Loader2,
  Shield,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const GOLD = '#D4A93B';
const NAVY = '#000f28';

const cardStyle: React.CSSProperties = {
  background: 'rgba(2,18,44,0.85)',
  border: '1px solid rgba(212,169,59,0.14)',
  borderRadius: '16px',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  background: `linear-gradient(135deg, ${GOLD} 0%, #B8891E 100%)`,
  border: 'none',
  color: NAVY,
  padding: '14px 32px',
  borderRadius: '12px',
  fontWeight: 800,
  fontSize: '16px',
  cursor: 'pointer',
  transition: 'opacity 0.2s, transform 0.2s',
  boxShadow: `0 8px 32px rgba(212,169,59,0.22)`,
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'hero' | 'privacy_gate' | 'nda_note' | 'section_intro' | 'question' | 'closing';

interface CState {
  phase: Phase;
  sectionIndex: number;
  questionIndex: number;
  responses: Record<string, string | string[]>;
  openExtras: Record<string, string>;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
  userName: string;
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoachBaselineQuestionnaire({ userId, userName: _userName, onComplete }: Props): React.ReactElement {
  const [state, setState] = useState<CState>({
    phase: 'hero',
    sectionIndex: 0,
    questionIndex: 0,
    responses: {},
    openExtras: {},
  });

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [micTooltip, setMicTooltip] = useState<boolean>(false);

  // ── Derived state ──────────────────────────────────────────────────────────

  const currentSection: CBSection = COACH_BASELINE_SECTIONS[state.sectionIndex];

  const activeQuestions: CBQuestion[] = useMemo(
    () => getCoachActiveQuestions(currentSection, state.responses),
    [currentSection, state.responses]
  );

  const currentQuestion: CBQuestion | undefined = activeQuestions[state.questionIndex];

  const totalSections = COACH_BASELINE_SECTIONS.length;

  // ── Progress ───────────────────────────────────────────────────────────────

  const progressPct = useMemo((): number => {
    if (
      state.phase === 'hero' ||
      state.phase === 'privacy_gate' ||
      state.phase === 'nda_note'
    )
      return 0;
    if (state.phase === 'closing') return 100;
    const sectionContrib = state.sectionIndex / totalSections;
    const questionContrib =
      activeQuestions.length > 0
        ? state.questionIndex / activeQuestions.length / totalSections
        : 0;
    return Math.round((sectionContrib + questionContrib) * 100);
  }, [state.phase, state.sectionIndex, state.questionIndex, activeQuestions.length, totalSections]);

  // ── Response helpers ───────────────────────────────────────────────────────

  const setResponse = (key: string, value: string | string[]): void => {
    setState((prev) => ({
      ...prev,
      responses: { ...prev.responses, [key]: value },
    }));
  };

  const setOpenExtra = (key: string, value: string): void => {
    setState((prev) => ({
      ...prev,
      openExtras: { ...prev.openExtras, [key]: value },
    }));
  };

  const toggleMultiSelect = (questionId: string, optionId: string): void => {
    const current = state.responses[questionId];
    const arr: string[] = Array.isArray(current) ? current : [];
    const next = arr.includes(optionId)
      ? arr.filter((v) => v !== optionId)
      : [...arr, optionId];
    setResponse(questionId, next);
  };

  // ── canProceed ─────────────────────────────────────────────────────────────

  const canProceed = useMemo((): boolean => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;

    const val = state.responses[currentQuestion.id];

    if (currentQuestion.inputType === 'email_phone') {
      const emailVal = state.responses[`${currentQuestion.id}-email`];
      return typeof emailVal === 'string' && emailVal.trim().length > 0;
    }
    if (currentQuestion.inputType === 'location') {
      const cityVal = state.responses[`${currentQuestion.id}-city`];
      return typeof cityVal === 'string' && cityVal.trim().length > 0;
    }
    if (currentQuestion.inputType === 'multi_select') {
      return Array.isArray(val) && val.length > 0;
    }
    if (currentQuestion.inputType === 'open_text') return true;
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return Array.isArray(val) && val.length > 0;
  }, [currentQuestion, state.responses]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const goNext = (): void => {
    setShowTooltip(false);

    if (state.phase === 'hero') {
      setState((prev) => ({ ...prev, phase: 'privacy_gate' }));
      return;
    }

    if (state.phase === 'privacy_gate') {
      setState((prev) => ({ ...prev, phase: 'nda_note' }));
      return;
    }

    if (state.phase === 'nda_note') {
      setState((prev) => ({
        ...prev,
        phase: 'section_intro',
        sectionIndex: 0,
        questionIndex: 0,
      }));
      return;
    }

    if (state.phase === 'section_intro') {
      setState((prev) => ({ ...prev, phase: 'question', questionIndex: 0 }));
      return;
    }

    if (state.phase === 'question') {
      const isLastQuestion = state.questionIndex >= activeQuestions.length - 1;

      if (!isLastQuestion) {
        setState((prev) => ({ ...prev, questionIndex: prev.questionIndex + 1 }));
        return;
      }

      const isLastSection = state.sectionIndex >= totalSections - 1;

      if (isLastSection) {
        setState((prev) => ({ ...prev, phase: 'closing' }));
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: 'section_intro',
        sectionIndex: prev.sectionIndex + 1,
        questionIndex: 0,
      }));
      return;
    }
  };

  const goBack = (): void => {
    setShowTooltip(false);

    if (state.phase === 'question') {
      if (state.questionIndex > 0) {
        setState((prev) => ({ ...prev, questionIndex: prev.questionIndex - 1 }));
        return;
      }
      if (state.sectionIndex === 0) {
        setState((prev) => ({ ...prev, phase: 'nda_note' }));
      } else {
        setState((prev) => ({ ...prev, phase: 'section_intro' }));
      }
      return;
    }

    if (state.phase === 'section_intro') {
      if (state.sectionIndex === 0) {
        setState((prev) => ({ ...prev, phase: 'nda_note' }));
      } else {
        setState((prev) => ({
          ...prev,
          sectionIndex: prev.sectionIndex - 1,
          phase: 'question',
          questionIndex: Math.max(
            0,
            getCoachActiveQuestions(
              COACH_BASELINE_SECTIONS[prev.sectionIndex - 1],
              prev.responses
            ).length - 1
          ),
        }));
      }
      return;
    }

    if (state.phase === 'nda_note') {
      setState((prev) => ({ ...prev, phase: 'privacy_gate' }));
      return;
    }

    if (state.phase === 'privacy_gate') {
      setState((prev) => ({ ...prev, phase: 'hero' }));
      return;
    }

    if (state.phase === 'closing') {
      const lastSectionIdx = totalSections - 1;
      const lastSection = COACH_BASELINE_SECTIONS[lastSectionIdx];
      const lastSectionQuestions = getCoachActiveQuestions(lastSection, state.responses);
      setState((prev) => ({
        ...prev,
        phase: 'question',
        sectionIndex: lastSectionIdx,
        questionIndex: Math.max(0, lastSectionQuestions.length - 1),
      }));
      return;
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const saveProfile = async (): Promise<void> => {
    setSaving(true);
    setError(null);
    try {
      const sectionKeys: CBSectionKey[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

      // Run scoring engine on raw V2 responses to produce an Intelligence Profile
      const intelligenceProfile = generateCoachV2IntelligenceProfile(userId, state.responses);

      await setDoc(doc(db, 'coachBaselineProfiles', userId), {
        userId,
        submittedAt: serverTimestamp(),
        responses: state.responses,
        openExtras: state.openExtras,
        sectionsCompleted: sectionKeys,
        intelligenceProfile: {
          overallScore: intelligenceProfile.overallScore,
          pacingLevel: intelligenceProfile.pacingLevel,
          categoryScores: intelligenceProfile.categoryScores,
          identifiedGaps: intelligenceProfile.identifiedGaps,
          identifiedStrengths: intelligenceProfile.identifiedStrengths,
          contentRecommendations: intelligenceProfile.contentRecommendations,
          chartingEmphasis: intelligenceProfile.chartingEmphasis,
        },
      });
      await updateDoc(doc(db, 'users', userId), {
        coachOnboardingComplete: true,
        coachOnboardingCompletedAt: serverTimestamp(),
        coachPacingLevel: intelligenceProfile.pacingLevel,
        coachOverallScore: intelligenceProfile.overallScore,
      });
      onComplete();
    } catch {
      setError('Unable to save your profile. Please try again.');
      setSaving(false);
    }
  };

  // ── Render helpers ─────────────────────────────────────────────────────────

  const renderProgressBar = (): React.ReactElement => (
    <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.07)', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${progressPct}%`,
          background: `linear-gradient(90deg, ${GOLD}, #B8891E)`,
          transition: 'width 0.5s ease',
          borderRadius: '99px',
        }}
      />
    </div>
  );

  const renderSectionBadge = (key: string, size: number = 36): React.ReactElement => (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '10px',
        background: `rgba(212,169,59,0.15)`,
        border: `1px solid rgba(212,169,59,0.3)`,
        color: GOLD,
        fontWeight: 900,
        fontSize: `${Math.round(size * 0.44)}px`,
        flexShrink: 0,
      }}
    >
      {key}
    </div>
  );

  // ── Input renderers ────────────────────────────────────────────────────────

  const renderTextInput = (q: CBQuestion): React.ReactElement => {
    const val = state.responses[q.id];
    return (
      <input
        type="text"
        value={typeof val === 'string' ? val : ''}
        onChange={(e) => setResponse(q.id, e.target.value)}
        placeholder="Type your answer here..."
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'rgba(2,18,44,0.7)',
          border: `1px solid rgba(212,169,59,0.18)`,
          borderRadius: '12px',
          color: '#fff',
          fontSize: '15px',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.2s',
        }}
        className="cbq-input"
      />
    );
  };

  const renderEmailPhone = (q: CBQuestion): React.ReactElement => {
    const emailVal = state.responses[`${q.id}-email`];
    const phoneVal = state.responses[`${q.id}-phone`];
    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} className="cbq-ep-row">
        <input
          type="email"
          value={typeof emailVal === 'string' ? emailVal : ''}
          onChange={(e) => setResponse(`${q.id}-email`, e.target.value)}
          placeholder="Email address"
          style={{
            flex: '1 1 200px',
            padding: '14px 16px',
            background: 'rgba(2,18,44,0.7)',
            border: `1px solid rgba(212,169,59,0.18)`,
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          className="cbq-input"
        />
        <input
          type="tel"
          value={typeof phoneVal === 'string' ? phoneVal : ''}
          onChange={(e) => setResponse(`${q.id}-phone`, e.target.value)}
          placeholder="Phone number"
          style={{
            flex: '1 1 200px',
            padding: '14px 16px',
            background: 'rgba(2,18,44,0.7)',
            border: `1px solid rgba(212,169,59,0.18)`,
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          className="cbq-input"
        />
      </div>
    );
  };

  const renderLocation = (q: CBQuestion): React.ReactElement => {
    const cityVal = state.responses[`${q.id}-city`];
    const stateVal = state.responses[`${q.id}-state`];
    const countryVal = state.responses[`${q.id}-country`];
    return (
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} className="cbq-loc-row">
        {[
          { key: 'city', label: 'City', val: cityVal },
          { key: 'state', label: 'State / Province', val: stateVal },
          { key: 'country', label: 'Country', val: countryVal },
        ].map(({ key, label, val }) => (
          <input
            key={key}
            type="text"
            value={typeof val === 'string' ? val : ''}
            onChange={(e) => setResponse(`${q.id}-${key}`, e.target.value)}
            placeholder={label}
            style={{
              flex: '1 1 150px',
              padding: '14px 16px',
              background: 'rgba(2,18,44,0.7)',
              border: `1px solid rgba(212,169,59,0.18)`,
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            className="cbq-input"
          />
        ))}
      </div>
    );
  };

  const renderOptionCard = (
    q: CBQuestion,
    option: CBQuestionOption,
    index: number,
    isMulti: boolean
  ): React.ReactElement => {
    const currentVal = state.responses[q.id];
    const selected = isMulti
      ? Array.isArray(currentVal) && currentVal.includes(option.id)
      : currentVal === option.id;

    const letter = String.fromCharCode(65 + index);
    const extraKey = `${q.id}::${option.id}`;
    const extraVal = state.openExtras[extraKey] ?? '';

    const handleClick = (): void => {
      if (isMulti) {
        toggleMultiSelect(q.id, option.id);
      } else {
        setResponse(q.id, option.id);
      }
    };

    return (
      <div key={option.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleClick}
          className={selected ? undefined : 'cbq-opt'}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '12px',
            border: selected ? `2px solid ${GOLD}` : '2px solid rgba(255,255,255,0.08)',
            background: selected ? 'rgba(212,169,59,0.1)' : 'rgba(2,18,44,0.55)',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
            boxShadow: selected
              ? `0 0 0 1px rgba(212,169,59,0.22), 0 4px 16px rgba(212,169,59,0.1)`
              : 'none',
          }}
        >
          <div
            style={{
              flexShrink: 0,
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '14px',
              transition: 'all 0.2s',
              background: selected ? GOLD : 'rgba(255,255,255,0.07)',
              color: selected ? NAVY : 'rgba(255,255,255,0.4)',
            }}
          >
            {selected ? <Check style={{ width: '16px', height: '16px' }} /> : letter}
          </div>
          <span
            style={{
              flex: 1,
              fontWeight: 600,
              fontSize: '15px',
              color: selected ? '#fff' : 'rgba(255,255,255,0.75)',
            }}
          >
            {option.text}
          </span>
        </button>

        {option.hasOpenText && selected && (
          <textarea
            value={extraVal}
            onChange={(e) => setOpenExtra(extraKey, e.target.value)}
            placeholder="Tell us in your own words..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 14px',
              background: 'rgba(2,18,44,0.7)',
              border: `1px solid rgba(212,169,59,0.25)`,
              borderRadius: '10px',
              color: '#fff',
              fontSize: '14px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              marginLeft: '46px',
              maxWidth: 'calc(100% - 46px)',
            }}
            className="cbq-textarea"
          />
        )}
      </div>
    );
  };

  const renderRadio = (q: CBQuestion): React.ReactElement => {
    const options = q.options ?? [];
    const currentRadioVal = state.responses[q.id];
    const showSub =
      q.subQuestion &&
      typeof currentRadioVal === 'string' &&
      q.subQuestion.showWhenParentValues.includes(currentRadioVal);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((option, index) => renderOptionCard(q, option, index, false))}
        {showSub && q.subQuestion && (
          <div style={{ marginTop: '8px' }}>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', marginBottom: '8px' }}>
              {q.subQuestion.question}
            </p>
            <textarea
              value={state.openExtras[`${q.id}::sub`] ?? ''}
              onChange={(e) => setOpenExtra(`${q.id}::sub`, e.target.value)}
              placeholder="Write your answer here..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'rgba(2,18,44,0.7)',
                border: `1px solid rgba(212,169,59,0.18)`,
                borderRadius: '10px',
                color: '#fff',
                fontSize: '14px',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              className="cbq-textarea"
            />
          </div>
        )}
      </div>
    );
  };

  const renderMultiSelect = (q: CBQuestion): React.ReactElement => {
    const options = q.options ?? [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 4px' }}>
          Select all that apply
        </p>
        {options.map((option, index) => renderOptionCard(q, option, index, true))}
      </div>
    );
  };

  const renderScale = (q: CBQuestion): React.ReactElement => {
    const currentVal = state.responses[q.id];
    const selected = typeof currentVal === 'string' ? currentVal : '';
    return (
      <div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '12px' }}>
          {['1', '2', '3', '4', '5'].map((n) => {
            const isActive = selected === n;
            return (
              <button
                key={n}
                onClick={() => setResponse(q.id, n)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: isActive ? `2px solid ${GOLD}` : '2px solid rgba(255,255,255,0.15)',
                  background: isActive ? GOLD : 'rgba(2,18,44,0.7)',
                  color: isActive ? NAVY : 'rgba(255,255,255,0.5)',
                  fontWeight: 800,
                  fontSize: '17px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isActive ? `0 0 12px rgba(212,169,59,0.32)` : 'none',
                }}
                className="cbq-scale-dot"
              >
                {n}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', maxWidth: '40%' }}>
            {q.scaleLeft}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', maxWidth: '40%', textAlign: 'right' }}>
            {q.scaleRight}
          </span>
        </div>
      </div>
    );
  };

  const renderOpenText = (q: CBQuestion): React.ReactElement => {
    const currentVal = state.responses[q.id];
    const textVal = typeof currentVal === 'string' ? currentVal : '';
    const skipOption = q.options?.find((o) => o.isSkip);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={textVal}
            onChange={(e) => setResponse(q.id, e.target.value)}
            placeholder="Write your answer here..."
            rows={5}
            style={{
              width: '100%',
              padding: '14px 50px 14px 14px',
              background: 'rgba(2,18,44,0.7)',
              border: `1px solid rgba(212,169,59,0.18)`,
              borderRadius: '12px',
              color: '#fff',
              fontSize: '15px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              lineHeight: 1.6,
            }}
            className="cbq-textarea"
          />
          <div style={{ position: 'absolute', bottom: '12px', right: '12px' }}>
            <div style={{ position: 'relative' }}>
              <button
                onMouseEnter={() => setMicTooltip(true)}
                onMouseLeave={() => setMicTooltip(false)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(212,169,59,0.12)',
                  border: `1px solid rgba(212,169,59,0.25)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  color: `rgba(212,169,59,0.6)`,
                }}
              >
                <Mic style={{ width: '15px', height: '15px' }} />
              </button>
              {micTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '38px',
                    right: 0,
                    background: 'rgba(2,18,44,0.95)',
                    border: `1px solid rgba(212,169,59,0.2)`,
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  Voice recording — Coming Soon
                </div>
              )}
            </div>
          </div>
        </div>

        {skipOption && (
          <button
            onClick={() => setResponse(q.id, skipOption.id)}
            style={{
              alignSelf: 'flex-start',
              padding: '7px 16px',
              borderRadius: '99px',
              border: `1px solid rgba(255,255,255,0.15)`,
              background:
                textVal === skipOption.id
                  ? 'rgba(212,169,59,0.12)'
                  : 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            className="cbq-skip-pill"
          >
            {skipOption.text}
          </button>
        )}
      </div>
    );
  };

  const renderInputForQuestion = (q: CBQuestion): React.ReactElement => {
    switch (q.inputType) {
      case 'text':
        return renderTextInput(q);
      case 'email_phone':
        return renderEmailPhone(q);
      case 'location':
        return renderLocation(q);
      case 'radio':
        return renderRadio(q);
      case 'multi_select':
        return renderMultiSelect(q);
      case 'scale':
        return renderScale(q);
      case 'open_text':
        return renderOpenText(q);
      default:
        return <div />;
    }
  };

  // ── Phase renders ──────────────────────────────────────────────────────────

  const renderHero = (): React.ReactElement => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '680px', width: '100%', textAlign: 'center' }} className="cbq-fade">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 14px',
            background: `rgba(212,169,59,0.12)`,
            border: `1px solid rgba(212,169,59,0.3)`,
            borderRadius: '99px',
            marginBottom: '18px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: GOLD,
            }}
          >
            Smarter Goalie — Coach Pathway
          </span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(26px,5vw,46px)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: '10px',
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          THE COACH BASELINE PROFILE
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px,1.8vw,17px)',
            fontStyle: 'italic',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '28px',
          }}
        >
          Your view of your goalie — your program — and your willingness to grow.
        </p>

        <div style={{ ...cardStyle, padding: '20px', textAlign: 'left', marginBottom: '20px' }}>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Welcome, Coach. Whether you have coached for many years or this is your first season, your role in your goalie&rsquo;s development is irreplaceable. The goalie&rsquo;s coach sees what nobody else sees — the practice habits, the game intensity, the response to instruction, the way a young athlete handles the unique pressure of this position. Smarter Goalie has worked with coaches for decades. We have seen the gap most coaches were never trained to fill — and we have built the support system that fills it. Without judgment. Without overstepping. Just shoulder-to-shoulder partnership in raising the standard of goaltender development. Your honest answers shape how Smarter Goalie serves your program.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: GOLD, marginBottom: '28px', letterSpacing: '0.04em' }}>
          44 questions &middot; 8 sections &middot; 12–18 minutes &middot; Progress saves automatically
        </p>

        <button onClick={goNext} style={btnPrimary} className="cbq-btn">
          BEGIN THE COACH BASELINE PROFILE
          <ChevronRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );

  const renderPrivacyGate = (): React.ReactElement => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '540px', width: '100%' }} className="cbq-fade">
        <div style={{ ...cardStyle, padding: '28px', textAlign: 'center', borderColor: `rgba(212,169,59,0.22)` }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              background: `rgba(212,169,59,0.12)`,
              border: `1px solid rgba(212,169,59,0.35)`,
              borderRadius: '99px',
              marginBottom: '22px',
            }}
          >
            <Shield style={{ width: '14px', height: '14px', color: GOLD }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: GOLD,
              }}
            >
              PRIVACY REQUEST
            </span>
          </div>

          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.65,
              marginBottom: '28px',
            }}
          >
            We ask that you complete this questionnaire alone — without your goalie or your goalie&rsquo;s parents present. Your honest, independent perspective is what allows Smarter Goalie to align coach, goalie, and parent views into one coherent picture for the goalie&rsquo;s development.
          </p>

          <button
            onClick={goNext}
            style={{
              ...btnPrimary,
              justifyContent: 'center',
              fontSize: '15px',
              padding: '14px 28px',
              width: '100%',
              boxSizing: 'border-box',
            }}
            className="cbq-btn"
          >
            <Check style={{ width: '18px', height: '18px' }} />
            Yes — I will complete this alone
          </button>
        </div>
      </div>
    </div>
  );

  const renderNdaNote = (): React.ReactElement => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '600px', width: '100%' }} className="cbq-fade">
        <div
          style={{
            ...cardStyle,
            padding: '28px',
            borderColor: `rgba(212,169,59,0.22)`,
          }}
        >
          <div
            style={{
              height: '3px',
              background: `linear-gradient(90deg, ${GOLD}, #B8891E, transparent)`,
              borderRadius: '99px',
              marginBottom: '28px',
            }}
          />

          <p
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: GOLD,
              marginBottom: '18px',
            }}
          >
            A NOTE ABOUT YOUR INVOLVEMENT
          </p>

          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255,255,255,0.68)',
              lineHeight: 1.7,
              marginBottom: '24px',
            }}
          >
            Coaches, parents, and team support members who actively engage with the Smarter Goalie operation become guardians of original teaching IP that has been built and refined over decades. For that reason, a simple NDA accompanies any meaningful partnership with Smarter Goalie — to protect the work for every goalie who depends on it. And — if you experience Smarter Goalie and wish to deepen your involvement — we have a special Affiliate path with offers crafted specifically for you. We will identify those offers as your engagement grows. Thank you for being part of this work.
          </p>

          <button
            onClick={goNext}
            style={{ ...btnPrimary, fontSize: '15px' }}
            className="cbq-btn"
          >
            CONTINUE
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderSectionIntro = (): React.ReactElement => {
    const section = COACH_BASELINE_SECTIONS[state.sectionIndex];
    const isCoachMikeSection = section.key === 'E';

    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '560px', width: '100%' }} className="cbq-fade">
          <div
            style={{
              ...cardStyle,
              padding: '32px',
              borderColor: `rgba(212,169,59,0.2)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              {renderSectionBadge(section.key, 44)}
              <div>
                <p
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: `${GOLD}80`,
                    marginBottom: '4px',
                  }}
                >
                  Section {state.sectionIndex + 1} of {totalSections}
                </p>
                <h2
                  style={{
                    fontSize: 'clamp(16px,2.5vw,22px)',
                    fontWeight: 900,
                    color: '#fff',
                    lineHeight: 1.2,
                    margin: 0,
                  }}
                >
                  {section.title}
                </h2>
              </div>
            </div>

            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.4)',
                marginBottom: section.intro ? '16px' : '24px',
                fontStyle: 'italic',
              }}
            >
              {section.categoryLabel}
            </p>

            {section.intro && (
              <div style={{ marginBottom: '24px' }}>
                {isCoachMikeSection && (
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: GOLD,
                      marginBottom: '8px',
                    }}
                  >
                    COACH MIKE:
                  </p>
                )}
                <p
                  style={{
                    fontSize: '15px',
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  {section.intro}
                </p>
              </div>
            )}

            <button
              onClick={goNext}
              style={{ ...btnPrimary, fontSize: '15px' }}
              className="cbq-btn"
            >
              START SECTION {section.key}
              <ChevronRight style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderQuestion = (): React.ReactElement => {
    if (!currentQuestion) return <div />;

    const sectionLetter = currentSection.key;
    const questionNum = state.questionIndex + 1;
    const totalQ = activeQuestions.length;

    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '760px',
          margin: '0 auto',
          padding: '20px 24px 16px',
          boxSizing: 'border-box',
        }}
      >
        {/* Section + progress */}
        <div style={{ flexShrink: 0, marginBottom: '20px' }} className="cbq-fade">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            {renderSectionBadge(sectionLetter, 32)}
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Section {state.sectionIndex + 1} of {totalSections} — Question {questionNum} of {totalQ}
            </p>
          </div>
          <div
            style={{
              height: '3px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round((questionNum / totalQ) * 100)}%`,
                background: `linear-gradient(90deg, ${GOLD}, #B8891E)`,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div
          style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}
          className="cbq-fade cbq-scroll"
        >
          {/* Question text */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
            <h2
              style={{
                fontSize: 'clamp(16px,2.2vw,22px)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.4,
                margin: 0,
                flex: 1,
              }}
            >
              {currentQuestion.question}
            </h2>
            {currentQuestion.tooltip && (
              <button
                onClick={() => setShowTooltip((s) => !s)}
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  marginTop: '2px',
                  color: showTooltip ? GOLD : 'rgba(255,255,255,0.3)',
                  transition: 'color 0.2s',
                }}
              >
                <Info style={{ width: '18px', height: '18px' }} />
              </button>
            )}
          </div>

          {/* subLabel */}
          {currentQuestion.subLabel && (
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                marginBottom: '10px',
                fontStyle: 'italic',
              }}
            >
              {currentQuestion.subLabel}
            </p>
          )}

          {/* Tooltip */}
          {showTooltip && currentQuestion.tooltip && (
            <div
              style={{
                marginBottom: '12px',
                padding: '12px 14px',
                background: 'rgba(212,169,59,0.07)',
                border: `1px solid rgba(212,169,59,0.22)`,
                borderRadius: '10px',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.55,
              }}
            >
              {currentQuestion.tooltip}
            </div>
          )}

          {/* Note */}
          {currentQuestion.note && (
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.4)',
                fontStyle: 'italic',
                marginBottom: '16px',
                lineHeight: 1.6,
              }}
            >
              <span style={{ color: `${GOLD}cc`, fontWeight: 600 }}>Smarter Goalie: </span>
              {currentQuestion.note}
            </p>
          )}

          {/* Input */}
          <div style={{ marginBottom: '16px' }}>
            {renderInputForQuestion(currentQuestion)}
          </div>
        </div>

        {/* Nav */}
        <div
          style={{
            flexShrink: 0,
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <button
            onClick={goBack}
            disabled={state.sectionIndex === 0 && state.questionIndex === 0}
            className="cbq-nav-back"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.45)',
              padding: '10px 18px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              cursor:
                state.sectionIndex === 0 && state.questionIndex === 0
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                state.sectionIndex === 0 && state.questionIndex === 0 ? 0.4 : 1,
              transition: 'all 0.2s',
            }}
          >
            <ChevronLeft style={{ width: '16px', height: '16px' }} />
            Back
          </button>

          <button
            onClick={goNext}
            disabled={!canProceed}
            className="cbq-nav-next"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: canProceed
                ? `linear-gradient(135deg, ${GOLD} 0%, #B8891E 100%)`
                : 'rgba(212,169,59,0.2)',
              border: 'none',
              color: canProceed ? NAVY : 'rgba(255,255,255,0.3)',
              padding: '10px 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: canProceed ? 'pointer' : 'not-allowed',
              transition: 'opacity 0.2s',
              boxShadow: canProceed ? `0 4px 16px rgba(212,169,59,0.22)` : 'none',
            }}
          >
            Next →
            <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      </div>
    );
  };

  const renderClosing = (): React.ReactElement => (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ maxWidth: '640px', width: '100%', textAlign: 'center' }} className="cbq-fade">
        <div style={{ ...cardStyle, padding: '28px', marginBottom: '20px' }}>
          <div
            style={{
              height: '3px',
              background: `linear-gradient(90deg, ${GOLD}, #B8891E, ${GOLD})`,
              borderRadius: '99px',
              marginBottom: '22px',
            }}
          />
          <p
            style={{
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: `${GOLD}99`,
              marginBottom: '14px',
            }}
          >
            Profile Complete
          </p>
          <p
            style={{
              fontSize: 'clamp(14px,2vw,16px)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              marginBottom: '14px',
            }}
          >
            Thank you, Coach. You just did something most coaches never sit down to do. You looked at your knowledge, your program, your goalie, your communication, your psychology, your time, your hopes. You answered honestly — including in areas you may have never been asked to think about before. That is the work most coaches never do. And it is exactly the work the goaltender position has needed for decades.
          </p>
          <p
            style={{
              fontSize: 'clamp(14px,2vw,16px)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              marginBottom: '14px',
            }}
          >
            You just gave us your{' '}
            <strong style={{ color: '#fff' }}>Coach Baseline Profile</strong> — the foundation we will build from with you, alongside your goalie and their parent, from this day forward.
          </p>
          <p
            style={{
              fontSize: 'clamp(14px,2vw,16px)',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.7,
              marginBottom: '0',
            }}
          >
            Coach Mike personally reads every submission.{' '}
            <strong style={{ color: GOLD }}>Welcome to the Smarter Goalie way.</strong>
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              marginBottom: '16px',
            }}
          >
            <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
          </div>
        )}

        <button
          onClick={saveProfile}
          disabled={saving}
          style={{
            ...btnPrimary,
            opacity: saving ? 0.75 : 1,
            cursor: saving ? 'not-allowed' : 'pointer',
            fontSize: '15px',
          }}
          className={saving ? undefined : 'cbq-btn'}
        >
          {saving ? (
            <>
              <Loader2
                style={{ width: '18px', height: '18px', animation: 'cbq-spin 1s linear infinite' }}
              />
              Saving...
            </>
          ) : (
            <>
              SUBMIT MY BASELINE PROFILE →
              <ChevronRight style={{ width: '18px', height: '18px' }} />
            </>
          )}
        </button>

        <button
          onClick={goBack}
          style={{
            display: 'block',
            margin: '14px auto 0',
            background: 'transparent',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '13px',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
          className="cbq-prefer-not"
        >
          Go back and review
        </button>
      </div>
    </div>
  );

  // ── Phase switcher ─────────────────────────────────────────────────────────

  const renderPhase = (): React.ReactElement => {
    switch (state.phase) {
      case 'hero':
        return renderHero();
      case 'privacy_gate':
        return renderPrivacyGate();
      case 'nda_note':
        return renderNdaNote();
      case 'section_intro':
        return renderSectionIntro();
      case 'question':
        return renderQuestion();
      case 'closing':
        return renderClosing();
      default:
        return <div />;
    }
  };

  // ── Root render ────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        .cbq-opt:hover { border-color: rgba(212,169,59,0.38) !important; background: rgba(212,169,59,0.06) !important; }
        .cbq-btn:hover { opacity: 0.88 !important; transform: scale(1.01) !important; }
        .cbq-nav-back:hover:not(:disabled) { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.2) !important; }
        .cbq-nav-next:hover:not(:disabled) { opacity: 0.88 !important; }
        .cbq-scale-dot:hover { border-color: rgba(212,169,59,0.5) !important; background: rgba(212,169,59,0.1) !important; }
        .cbq-skip-pill:hover { background: rgba(212,169,59,0.1) !important; color: rgba(255,255,255,0.65) !important; }
        .cbq-prefer-not:hover { color: rgba(255,255,255,0.55) !important; }
        .cbq-input:focus { border-color: rgba(212,169,59,0.5) !important; box-shadow: 0 0 0 3px rgba(212,169,59,0.1) !important; }
        .cbq-textarea:focus { border-color: rgba(212,169,59,0.42) !important; box-shadow: 0 0 0 3px rgba(212,169,59,0.08) !important; }
        @keyframes cbq-fade-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cbq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cbq-fade { animation: cbq-fade-up 0.4s ease both; }
        .cbq-scroll::-webkit-scrollbar { width: 4px; }
        .cbq-scroll::-webkit-scrollbar-track { background: transparent; }
        .cbq-scroll::-webkit-scrollbar-thumb { background: rgba(212,169,59,0.15); border-radius: 4px; }
        .cbq-scroll { scrollbar-width: thin; scrollbar-color: rgba(212,169,59,0.15) transparent; }
        @media (max-width: 600px) {
          .cbq-ep-row { flex-direction: column !important; }
          .cbq-loc-row { flex-direction: column !important; }
        }
      `}</style>

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflowY: 'auto',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          color: '#fff',
        }}
      >
        {/* Global progress bar */}
        {renderProgressBar()}

        {/* Phase content */}
        {renderPhase()}
      </div>
    </>
  );
}

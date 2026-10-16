'use client';

import {
  describeVisibility,
  isQuizLive,
  type QuizVisibilityInput,
} from '@/lib/training/quiz-visibility';

const BLUE = '#37b5ff';
const GREEN = '#22c55e';
const AMBER = '#fbbf24';

interface QuizVisibilityControlProps {
  quiz: QuizVisibilityInput;
  onChange: (live: boolean) => void;
}

/**
 * One switch for "goalies can see this Knowledge Check", with a line underneath saying
 * what it means right now or what is still missing. Replaces the separate Active and
 * Published switches, which both had to be on and gave no hint when one was not.
 */
export function QuizVisibilityControl({ quiz, onChange }: QuizVisibilityControlProps) {
  const on = isQuizLive(quiz);
  const status = describeVisibility(quiz, on);
  const color = status.state === 'live' ? GREEN : status.state === 'blocked' ? AMBER : 'rgba(255,255,255,0.55)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Show this Knowledge Check to goalies"
          onClick={() => onChange(!on)}
          style={{
            width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
            position: 'relative', flexShrink: 0, transition: 'background 0.2s',
            background: on ? BLUE : 'rgba(255,255,255,0.15)',
          }}
        >
          <span
            style={{
              position: 'absolute', top: '3px', left: on ? '21px' : '3px', width: '16px', height: '16px',
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
            }}
          />
        </button>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', fontWeight: 500 }}>
          Show to goalies
        </span>
      </div>
      <p role="status" style={{ color, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>
        {status.line}
      </p>
    </div>
  );
}

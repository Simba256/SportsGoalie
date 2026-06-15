'use client';

import { VMPRating } from '@/types/charting';

const OPTIONS: { value: VMPRating; label: string; sub: string; color: string; border: string; bg: string }[] = [
  {
    value: 'low',
    label: 'Low',
    sub: 'Not consistent',
    color: '#FF6B6B',
    border: 'rgba(255,107,107,0.5)',
    bg: 'rgba(255,107,107,0.12)',
  },
  {
    value: 'medium_spotty',
    label: 'Medium / Spotty',
    sub: 'Inconsistent effort',
    color: '#B388FF',
    border: 'rgba(179,136,255,0.5)',
    bg: 'rgba(179,136,255,0.12)',
  },
  {
    value: 'high_consistent',
    label: 'High / Consistent',
    sub: 'Locked in',
    color: '#00FF99',
    border: 'rgba(0,255,153,0.5)',
    bg: 'rgba(0,255,153,0.12)',
  },
];

interface Props {
  value?: VMPRating;
  onChange: (v: VMPRating) => void;
  disabled?: boolean;
}

export function VMPSelector({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        V.M.P. Rating
      </p>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {OPTIONS.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => !disabled && onChange(opt.value)}
              disabled={disabled}
              style={{
                flex: 1,
                minWidth: '90px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: active ? `2px solid ${opt.border}` : '1px solid rgba(255,255,255,0.1)',
                background: active ? opt.bg : 'rgba(255,255,255,0.03)',
                color: active ? opt.color : 'rgba(255,255,255,0.4)',
                cursor: disabled ? 'default' : 'pointer',
                transition: 'all 0.18s',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{opt.label}</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>{opt.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

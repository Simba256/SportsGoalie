'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, ChevronUp, ClipboardCheck } from 'lucide-react';
import type { DynamicChartingEntry, FormTemplate } from '@/types';
import { toDateSafe } from '@/lib/utils/timestamp';
import { checkInName } from '@/lib/charting/check-ins';
import { CheckInAnswers } from './CheckInAnswers';

const BLUE = '#37b5ff';

interface PillarCheckInListProps {
  entries: DynamicChartingEntry[];
  templates: Record<string, FormTemplate>;
  /** When given, each row also names the goalie (admin lists that mix goalies). */
  goalieName?: (studentId: string) => string;
}

/**
 * The pillar check-ins a goalie has saved, newest first, each opening to the
 * answers. Read-only: this is what coach and admin pages show for a check-in,
 * where sessions-based pages show a logged game or practice.
 */
export function PillarCheckInList({ entries, templates, goalieName }: PillarCheckInListProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {entries.map((entry) => {
        const template = templates[entry.formTemplateId];
        const date = toDateSafe(entry.submittedAt);
        const open = openId === entry.id;
        const Chevron = open ? ChevronUp : ChevronDown;
        return (
          <div key={entry.id} style={{ background: 'rgba(2,18,44,0.7)', border: '1px solid rgba(55,181,255,0.12)', borderRadius: '14px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : entry.id)}
              aria-expanded={open}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${BLUE}15`, border: `1px solid ${BLUE}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <ClipboardCheck size={18} color={BLUE} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>
                    {checkInName(template)}
                    {goalieName && <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}> · {goalieName(entry.studentId)}</span>}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase',
                    padding: '2px 8px', borderRadius: '20px',
                    color: entry.isComplete ? '#4ade80' : '#fbbf24',
                    background: entry.isComplete ? 'rgba(74,222,128,0.1)' : 'rgba(251,191,36,0.1)',
                    border: entry.isComplete ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(251,191,36,0.3)',
                  }}>
                    {entry.isComplete ? '✓ Complete' : 'Partial'}
                  </span>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
                  <Calendar size={11} /> {date ? format(date, 'EEE, MMM d, yyyy · h:mm a') : 'Date unavailable'}
                </span>
              </div>
              <Chevron size={15} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
            </button>

            {open && (
              <div style={{ borderTop: '1px solid rgba(55,181,255,0.1)', background: 'rgba(2,18,44,0.5)', padding: '16px' }}>
                {template ? (
                  <CheckInAnswers entry={entry} template={template} />
                ) : (
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                    The chart this check-in was answered on can no longer be found, so its answers cannot be laid out.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

import type { DynamicChartingEntry, FormTemplate, FieldResponse } from '@/types';
import { formatResponseValue, isRatingField } from '@/components/charting/pillar-chrome';

const MUTED = 'rgba(255,255,255,0.38)';
const LABEL = 'rgba(255,255,255,0.55)';

/**
 * What the goalie actually answered on one pillar check-in — every question with
 * its answer, grouped by section, so the page shows the content of the chart and
 * not only that one was submitted. Unanswered questions are left out.
 *
 * Used on the goalie's Analytics page and on the coach and admin charting pages.
 */
export function CheckInAnswers({ entry, template }: { entry: DynamicChartingEntry; template: FormTemplate }) {
  const sections = [...template.sections]
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const sectionData = entry.responses?.[section.id];
      if (!sectionData || Array.isArray(sectionData)) return null;
      const answered = [...section.fields]
        .sort((a, b) => a.order - b.order)
        .map((field) => ({ field, response: (sectionData as Record<string, FieldResponse>)[field.id] }))
        .filter(({ response }) => formatResponseValue(response?.value) !== null || response?.comments);
      return answered.length > 0 ? { section, answered } : null;
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  if (sections.length === 0) {
    return <p style={{ fontSize: '12px', color: MUTED }}>No answers were recorded on this check-in.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {sections.map(({ section, answered }) => (
        <div key={section.id}>
          <p style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(55,181,255,0.75)', marginBottom: '6px' }}>
            {section.title}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {answered.map(({ field, response }) => {
              const display = formatResponseValue(response?.value);
              return (
                <div key={field.id}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '14px' }}>
                    <span style={{ fontSize: '12.5px', color: LABEL, fontWeight: 500, minWidth: 0 }}>{field.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                      {display ?? '—'}
                      {display !== null && typeof response?.value === 'number' && isRatingField(field) && (
                        <span style={{ fontSize: '10.5px', fontWeight: 600, color: MUTED }}>/{field.validation?.max ?? 10}</span>
                      )}
                    </span>
                  </div>
                  {response?.comments && (
                    <p style={{ marginTop: '3px', fontSize: '11.5px', color: MUTED, fontStyle: 'italic', lineHeight: 1.5 }}>{response.comments}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {entry.additionalComments && (
        <p style={{ fontSize: '12px', color: LABEL, lineHeight: 1.55 }}>
          <span style={{ fontWeight: 800, color: '#fff' }}>Notes: </span>{entry.additionalComments}
        </p>
      )}
    </div>
  );
}

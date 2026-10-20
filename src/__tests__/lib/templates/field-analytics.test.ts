import { describe, it, expect } from 'vitest';

import { defaultAnalyticsType } from '@/lib/templates/field-analytics';
import { parseOptions } from '@/lib/templates/field-options';
import { formTemplateService } from '@/lib/database/services/form-template.service';
import type { FieldType, FormField, FormTemplate } from '@/types';

/**
 * 11 Sept report: "Text and Text Area fields cannot feed analytics" and
 * "Radio and checkbox options will not save a set value". Both came from the
 * builder handing the validator something it then refused.
 */

const ALL_FIELD_TYPES: FieldType[] = [
  'yesno', 'radio', 'checkbox', 'numeric', 'scale', 'text', 'textarea', 'date', 'time',
];

function fieldOf(type: FieldType, index: number): FormField {
  return {
    id: `f${index}`,
    label: `Field ${index}`,
    type,
    order: index + 1,
    options: type === 'radio' || type === 'checkbox' ? ['one', 'two'] : undefined,
    validation: type === 'scale' ? { min: 1, max: 10 } : {},
    analytics: { enabled: true, type: defaultAnalyticsType(type) },
  } as unknown as FormField;
}

describe('defaultAnalyticsType', () => {
  it('never hands an enabled field the type "none"', () => {
    for (const type of ALL_FIELD_TYPES) {
      expect(defaultAnalyticsType(type), type).not.toBe('none');
    }
  });

  it('counts what the goalie wrote on text and text area fields', () => {
    expect(defaultAnalyticsType('text')).toBe('count');
    expect(defaultAnalyticsType('textarea')).toBe('count');
  });

  it('keeps the types that already worked', () => {
    expect(defaultAnalyticsType('yesno')).toBe('percentage');
    expect(defaultAnalyticsType('scale')).toBe('average');
    expect(defaultAnalyticsType('numeric')).toBe('average');
    expect(defaultAnalyticsType('radio')).toBe('distribution');
    expect(defaultAnalyticsType('checkbox')).toBe('distribution');
  });

  it('gives every field type a default the template validator accepts', () => {
    const template = {
      name: 'Validator check',
      sport: 'Hockey',
      pillar: 'combined',
      isActive: false,
      isArchived: false,
      allowPartialSubmission: true,
      sections: [
        {
          id: 's1',
          title: 'All types',
          order: 1,
          fields: ALL_FIELD_TYPES.map(fieldOf),
        },
      ],
    } as unknown as FormTemplate;

    const { errors } = formTemplateService.validateTemplate(template);
    const analyticsErrors = errors.filter((e) => e.path.includes('analytics'));

    expect(analyticsErrors).toEqual([]);
  });
});

describe('parseOptions', () => {
  it('splits on commas and trims', () => {
    expect(parseOptions('poor, improving ,team work, excellent')).toEqual([
      'poor', 'improving', 'team work', 'excellent',
    ]);
  });

  it('drops empty pieces from stray or trailing commas', () => {
    expect(parseOptions('a,, b,')).toEqual(['a', 'b']);
  });

  it('is empty for an empty or blank box', () => {
    expect(parseOptions('')).toEqual([]);
    expect(parseOptions('   ,  ')).toEqual([]);
  });

  it('lets the validator accept a radio field whose options were only typed, never blurred', () => {
    const typed = 'poor, improving, excellent';
    const field = {
      ...fieldOf('radio', 0),
      options: parseOptions(typed),
    } as FormField;

    const template = {
      name: 'Options check',
      sport: 'Hockey',
      pillar: 'combined',
      isActive: false,
      isArchived: false,
      allowPartialSubmission: true,
      sections: [{ id: 's1', title: 'Radio', order: 1, fields: [field] }],
    } as unknown as FormTemplate;

    const { errors } = formTemplateService.validateTemplate(template);
    expect(errors.filter((e) => e.path.includes('options'))).toEqual([]);
  });
});

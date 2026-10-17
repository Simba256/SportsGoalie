import { describe, it, expect } from 'vitest';

import { averageRatingPercent, ratingPercentages, ratingScale } from '@/lib/charting/rating-average';
import { isRatingField } from '@/components/charting/pillar-chrome';
import type { DynamicChartingEntry, FormField, FormTemplate } from '@/types';

/**
 * The pillars page averaged raw answers, so a template that rated one question
 * out of 10 and another out of 5 produced a number that meant neither. Every
 * rating now goes through the one percentage rule (7 out of 10 reads 70%).
 */

const field = (id: string, type: string, validation?: { min?: number; max?: number }) =>
  ({ id, type, label: id, validation }) as unknown as FormField;

const template = (fields: FormField[]): FormTemplate =>
  ({ id: 't', sections: [{ id: 's1', fields }] }) as unknown as FormTemplate;

const entry = (answers: Record<string, unknown>): DynamicChartingEntry =>
  ({
    responses: {
      s1: Object.fromEntries(Object.entries(answers).map(([id, value]) => [id, { value }])),
    },
  }) as unknown as DynamicChartingEntry;

describe('ratingScale', () => {
  it('reads the limits set on a scale field', () => {
    expect(ratingScale(field('a', 'scale', { min: 1, max: 5 }))).toEqual({ min: 1, max: 5 });
  });

  it('treats a scale field with no limits as 1 to 10', () => {
    expect(ratingScale(field('a', 'scale'))).toEqual({ min: 1, max: 10 });
  });

  it('counts a number field only when both limits are set', () => {
    expect(ratingScale(field('a', 'numeric', { min: 1, max: 5 }))).toEqual({ min: 1, max: 5 });
    expect(ratingScale(field('a', 'numeric', { min: 0 }))).toBeNull();
    expect(ratingScale(field('a', 'numeric'))).toBeNull();
  });

  it('is not a rating for other field types or a missing field', () => {
    expect(ratingScale(field('a', 'text'))).toBeNull();
    expect(ratingScale(undefined)).toBeNull();
  });

  it('agrees with isRatingField', () => {
    const fields = [
      field('a', 'scale'),
      field('b', 'numeric', { min: 1, max: 5 }),
      field('c', 'numeric'),
      field('d', 'text'),
    ];
    fields.forEach((f) => expect(isRatingField(f)).toBe(ratingScale(f) !== null));
  });
});

describe('ratingPercentages', () => {
  it('turns each answer into a percent of its own scale', () => {
    const t = template([field('a', 'scale', { min: 1, max: 10 }), field('b', 'scale', { min: 1, max: 5 })]);
    expect(ratingPercentages(entry({ a: 7, b: 4 }), t)).toEqual([70, 80]);
  });

  it('leaves out counts and unanswered fields', () => {
    const t = template([field('a', 'scale'), field('shots', 'numeric'), field('b', 'scale')]);
    expect(ratingPercentages(entry({ a: 5, shots: 31 }), t)).toEqual([50]);
  });

  it('reads every instance of a repeating section', () => {
    const t = template([field('a', 'scale', { min: 1, max: 10 })]);
    const repeated = {
      responses: { s1: [{ a: { value: 2 } }, { a: { value: 8 } }] },
    } as unknown as DynamicChartingEntry;
    expect(ratingPercentages(repeated, t)).toEqual([20, 80]);
  });

  it('is empty when the entry has no answers for the section', () => {
    const t = template([field('a', 'scale')]);
    expect(ratingPercentages({ responses: {} } as unknown as DynamicChartingEntry, t)).toEqual([]);
  });
});

describe('averageRatingPercent', () => {
  it('does not average a 1-5 and a 1-10 answer as raw numbers', () => {
    const t = template([field('a', 'scale', { min: 1, max: 10 }), field('b', 'scale', { min: 1, max: 5 })]);
    // raw mean would be 4 (a bare "4"); as percentages 40% and 80% give 60%
    expect(averageRatingPercent(entry({ a: 4, b: 4 }), t)).toBe(60);
  });

  it('reads 7 out of 10 as 70%', () => {
    expect(averageRatingPercent(entry({ a: 7 }), template([field('a', 'scale')]))).toBe(70);
  });

  it('reads the bottom of the scale as a real answer, not zero', () => {
    expect(averageRatingPercent(entry({ a: 1 }), template([field('a', 'scale')]))).toBe(10);
  });

  it('is null when there is nothing to average', () => {
    expect(averageRatingPercent(entry({ shots: 20 }), template([field('shots', 'numeric')]))).toBeNull();
  });
});

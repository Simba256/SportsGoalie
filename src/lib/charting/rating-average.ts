import type { DynamicChartingEntry, FormField, FormTemplate } from '@/types';
import { scaleToPercentage } from '@/lib/scoring/scale-score';

/**
 * The scale a rating field is answered on, or null for a field that is not a
 * rating. A scale field with no limits set is 1-10; a number field counts as a
 * rating only when both limits are set (shots faced, period and clock have no
 * ceiling and are not ratings).
 */
export function ratingScale(field: FormField | undefined): { min: number; max: number } | null {
  if (!field) return null;
  if (field.type === 'scale') {
    return { min: field.validation?.min ?? 1, max: field.validation?.max ?? 10 };
  }
  if (
    field.type === 'numeric' &&
    field.validation?.min !== undefined &&
    field.validation?.max !== undefined
  ) {
    return { min: field.validation.min, max: field.validation.max };
  }
  return null;
}

/**
 * Every rating answer on an entry as a percentage of the scale it was answered
 * on. Create Template charts rate out of 10 and the built-in game and practice
 * charts out of 5, so raw answers cannot be averaged together: a 4 out of 5 and
 * a 4 out of 10 are not the same answer.
 */
export function ratingPercentages(entry: DynamicChartingEntry, template: FormTemplate): number[] {
  const percentages: number[] = [];

  template.sections.forEach((section) => {
    const sectionData = entry.responses?.[section.id];
    if (!sectionData) return;
    const instances = Array.isArray(sectionData) ? sectionData : [sectionData];
    instances.forEach((instance) => {
      section.fields.forEach((field) => {
        const scale = ratingScale(field);
        if (!scale) return;
        const value = (instance as Record<string, { value: unknown }>)[field.id]?.value;
        if (typeof value !== 'number' || isNaN(value)) return;
        const percent = scaleToPercentage(value, scale.max, scale.min);
        if (percent !== null) percentages.push(percent);
      });
    });
  });

  return percentages;
}

/** Mean of an entry's rating answers as a whole percent, or null if it has none. */
export function averageRatingPercent(entry: DynamicChartingEntry, template: FormTemplate): number | null {
  const percentages = ratingPercentages(entry, template);
  if (percentages.length === 0) return null;
  return Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length);
}

import type { DynamicChartingEntry, FormTemplate } from '@/types';
import { toDateSafe } from '@/lib/utils/timestamp';

/**
 * Small rules for pillar check-ins, shared by every page that lists them.
 *
 * A pillar check-in is saved as a `dynamic_charting_entries` document with no
 * session. The coach and admin charting pages were built around sessions, so a
 * check-in never reached them. These helpers let those pages read the check-ins
 * the way the goalie's own Analytics page does.
 */

/** Shown when the chart a check-in was answered on can no longer be found. */
export const UNNAMED_CHART = 'Pillar chart';

export function checkInName(template: Pick<FormTemplate, 'name'> | null | undefined): string {
  const name = template?.name?.trim();
  return name ? name : UNNAMED_CHART;
}

export function templatesById(templates: FormTemplate[]): Record<string, FormTemplate> {
  const byId: Record<string, FormTemplate> = {};
  templates.forEach((t) => {
    byId[t.id] = t;
  });
  return byId;
}

export interface CheckInTally {
  count: number;
  /** Newest check-in, or null when none carries a readable date. */
  latest: Date | null;
}

/** Check-ins per goalie. Dates are read with toDateSafe, which tolerates older timestamp shapes. */
export function tallyByStudent(entries: DynamicChartingEntry[]): Map<string, CheckInTally> {
  const tallies = new Map<string, CheckInTally>();
  entries.forEach((entry) => {
    const tally = tallies.get(entry.studentId) ?? { count: 0, latest: null };
    tally.count += 1;
    const date = toDateSafe(entry.submittedAt);
    if (date && (!tally.latest || date > tally.latest)) tally.latest = date;
    tallies.set(entry.studentId, tally);
  });
  return tallies;
}

/** Keeps the check-ins of one goalie, or all of them when no goalie is picked. */
export function checkInsFor(entries: DynamicChartingEntry[], studentId?: string): DynamicChartingEntry[] {
  return studentId ? entries.filter((e) => e.studentId === studentId) : entries;
}

/** Keeps check-ins submitted on or after `start`. A check-in with no readable date is kept, never silently dropped. */
export function checkInsSince(entries: DynamicChartingEntry[], start: Date | null): DynamicChartingEntry[] {
  if (!start) return entries;
  return entries.filter((entry) => {
    const date = toDateSafe(entry.submittedAt);
    return date ? date >= start : true;
  });
}

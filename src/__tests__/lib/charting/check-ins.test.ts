import { describe, it, expect } from 'vitest';

import {
  UNNAMED_CHART,
  checkInName,
  checkInsFor,
  checkInsSince,
  tallyByStudent,
  templatesById,
} from '@/lib/charting/check-ins';
import type { DynamicChartingEntry, FormTemplate } from '@/types';

/**
 * 16 Oct: a goalie charted two games through Pillar Check-Ins and the coach and
 * admin charting pages said "No game sessions yet". Those pages read sessions;
 * a pillar check-in has none. These are the rules the pages now share.
 */

const stamp = (iso: string | null) => (iso ? { toDate: () => new Date(iso) } : undefined);

const entry = (id: string, studentId: string, submittedAt: string | null): DynamicChartingEntry =>
  ({ id, studentId, formTemplateId: 'tpl-1', submittedAt: stamp(submittedAt) }) as unknown as DynamicChartingEntry;

describe('checkInName', () => {
  it("uses the chart's own name", () => {
    expect(checkInName({ name: 'Game Performance' })).toBe('Game Performance');
  });

  it('trims the name', () => {
    expect(checkInName({ name: '  Game Performance  ' })).toBe('Game Performance');
  });

  it('falls back when the chart is missing or unnamed', () => {
    expect(checkInName(undefined)).toBe(UNNAMED_CHART);
    expect(checkInName(null)).toBe(UNNAMED_CHART);
    expect(checkInName({ name: '   ' })).toBe(UNNAMED_CHART);
    expect(checkInName({ name: '' })).toBe(UNNAMED_CHART);
  });
});

describe('templatesById', () => {
  it('keys the charts by id', () => {
    const a = { id: 'a', name: 'A' } as FormTemplate;
    const b = { id: 'b', name: 'B' } as FormTemplate;
    expect(templatesById([a, b])).toEqual({ a, b });
  });

  it('is empty for no charts', () => {
    expect(templatesById([])).toEqual({});
  });
});

describe('tallyByStudent', () => {
  it('counts check-ins per goalie and keeps the newest date', () => {
    const tallies = tallyByStudent([
      entry('1', 'tony', '2026-10-14T10:00:00Z'),
      entry('2', 'tony', '2026-10-16T10:00:00Z'),
      entry('3', 'sam', '2026-10-01T10:00:00Z'),
    ]);

    expect(tallies.get('tony')?.count).toBe(2);
    expect(tallies.get('tony')?.latest).toEqual(new Date('2026-10-16T10:00:00Z'));
    expect(tallies.get('sam')?.count).toBe(1);
    expect(tallies.size).toBe(2);
  });

  it('still counts a check-in whose date cannot be read', () => {
    const tallies = tallyByStudent([entry('1', 'tony', null), entry('2', 'tony', '2026-10-16T10:00:00Z')]);

    expect(tallies.get('tony')?.count).toBe(2);
    expect(tallies.get('tony')?.latest).toEqual(new Date('2026-10-16T10:00:00Z'));
  });

  it('has no newest date when no check-in has a readable one', () => {
    expect(tallyByStudent([entry('1', 'tony', null)]).get('tony')).toEqual({ count: 1, latest: null });
  });

  it('is empty for no check-ins', () => {
    expect(tallyByStudent([]).size).toBe(0);
  });
});

describe('checkInsFor', () => {
  const all = [entry('1', 'tony', '2026-10-14T10:00:00Z'), entry('2', 'sam', '2026-10-15T10:00:00Z')];

  it("keeps one goalie's check-ins", () => {
    expect(checkInsFor(all, 'tony').map((e) => e.id)).toEqual(['1']);
  });

  it('keeps every goalie when none is picked', () => {
    expect(checkInsFor(all)).toHaveLength(2);
    expect(checkInsFor(all, undefined)).toHaveLength(2);
  });

  it('is empty for a goalie with no check-ins', () => {
    expect(checkInsFor(all, 'nobody')).toEqual([]);
  });
});

describe('checkInsSince', () => {
  const all = [
    entry('old', 'tony', '2026-08-01T10:00:00Z'),
    entry('new', 'tony', '2026-10-14T10:00:00Z'),
    entry('undated', 'tony', null),
  ];

  it('keeps check-ins on or after the start date', () => {
    const ids = checkInsSince(all, new Date('2026-10-01T00:00:00Z')).map((e) => e.id);
    expect(ids).toContain('new');
    expect(ids).not.toContain('old');
  });

  it('keeps a check-in on the start date itself', () => {
    expect(checkInsSince(all, new Date('2026-10-14T10:00:00Z')).map((e) => e.id)).toContain('new');
  });

  it('never drops a check-in just because its date cannot be read', () => {
    expect(checkInsSince(all, new Date('2026-10-01T00:00:00Z')).map((e) => e.id)).toContain('undated');
  });

  it('keeps everything when there is no start date', () => {
    expect(checkInsSince(all, null)).toHaveLength(3);
  });
});

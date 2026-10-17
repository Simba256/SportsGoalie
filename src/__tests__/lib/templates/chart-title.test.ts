import { describe, it, expect } from 'vitest';

import { chartTitle } from '@/lib/templates/chart-title';

/**
 * 9 Oct: a goalie looking for his tournament chart could not find it, because
 * the only name on the way there was the pillar's. The chart's own name leads.
 */
describe('chartTitle', () => {
  it("leads with the chart's own name and keeps the pillar above it", () => {
    expect(chartTitle('Tournament Day Chart', 'Game Performance Charting System')).toEqual({
      title: 'Tournament Day Chart',
      pillarLabel: 'Game Performance Charting System',
    });
  });

  it('falls back to the pillar name when the chart has no name', () => {
    expect(chartTitle('', 'Skating Tech')).toEqual({ title: 'Skating Tech', pillarLabel: null });
    expect(chartTitle('   ', 'Skating Tech')).toEqual({ title: 'Skating Tech', pillarLabel: null });
    expect(chartTitle(undefined, 'Skating Tech')).toEqual({ title: 'Skating Tech', pillarLabel: null });
    expect(chartTitle(null, 'Skating Tech')).toEqual({ title: 'Skating Tech', pillarLabel: null });
  });

  it('does not repeat the pillar name when the chart is named the same', () => {
    expect(chartTitle('  skating   tech ', 'Skating Tech')).toEqual({
      title: 'Skating Tech',
      pillarLabel: null,
    });
  });

  it('trims the chart name before showing it', () => {
    expect(chartTitle('  SG Camp & Tournament Day Chart ', 'Game Performance Charting System').title).toBe(
      'SG Camp & Tournament Day Chart'
    );
  });
});

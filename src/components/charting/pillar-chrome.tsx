'use client';

import { Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart } from 'lucide-react';
import { FieldResponseValue } from '@/types';

/**
 * Shared visual language for the pillar-charting area (`/charting/pillars/**`).
 *
 * Three pages draw the same navy panel, the same cyan→mint accent line and the
 * same pillar icon set; before this they each carried their own copy, so a tweak
 * to one drifted the others. Nothing here is specific to a single page.
 */

export const CYAN = '#37b5ff';
export const MINT = '#34d399';
export const CORAL = '#f87171';

export const PILLAR_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  Brain, Footprints, Shapes, Target, Grid3X3, Dumbbell, Heart,
};

/** Body panel — the standard card used everywhere in charting. */
export const panelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'linear-gradient(160deg, #0c2e56 0%, #04213f 30%, #0a2d52 100%)',
  border: '1px solid rgba(55,181,255,0.18)',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
};

/** Header panel — flatter gradient so the page title sits on an even ground. */
export const headerPanelStyle: React.CSSProperties = {
  ...panelStyle,
  background: 'linear-gradient(135deg, #04213f 0%, #0a2d52 100%)',
};

export const accentLineStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: `linear-gradient(90deg, transparent 0%, ${CYAN} 40%, ${MINT} 70%, transparent 100%)`,
};

/**
 * A submitted answer rendered for reading rather than editing.
 *
 * Returns null — not an empty string — when the student never answered, so
 * callers can choose between hiding the row and showing a placeholder.
 */
export function formatResponseValue(value: FieldResponseValue | undefined): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : null;
  return String(value);
}

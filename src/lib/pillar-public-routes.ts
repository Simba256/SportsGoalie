/** Shared public 7-Pillars routing (no auth). */

export type PillarFromKey =
  | 'goalie'
  | 'team-programs'
  | 'goalie-coach'
  | 'parent-role'
  | 'organization'
  | 'who-we-are'
  | 'the-system';

export interface PillarFromContext {
  href: string;
  label: string;
}

export const PILLAR_FROM_CONTEXT: Record<PillarFromKey, PillarFromContext> = {
  goalie: { href: '/goalie', label: 'GOALIE' },
  'team-programs': { href: '/team-programs', label: 'TEAM PROGRAMS' },
  'goalie-coach': { href: '/goalie-coach', label: 'GOALIE COACH' },
  'parent-role': { href: '/parent-role', label: 'PARENT' },
  organization: { href: '/organization', label: 'ORGANIZATION' },
  'who-we-are': { href: '/who-we-are', label: 'WHO WE ARE' },
  'the-system': { href: '/the-system', label: 'THE SYSTEM' },
};

export const DEFAULT_PILLAR_FROM: PillarFromKey = 'goalie';

export const PUBLIC_PILLARS = [
  { id: 1, num: '01', label: 'Mind-Set', accent: '#00f2ff' },
  { id: 2, num: '02', label: 'Skating Tech', accent: '#60cdff' },
  { id: 3, num: '03', label: '7AMS', accent: '#37b5ff' },
  { id: 4, num: '04', label: '6 Zone Grid', accent: '#0ea5e9' },
  { id: 5, num: '05', label: 'Form Tech', accent: '#38bdf8' },
  { id: 6, num: '06', label: 'Game & Practice', accent: '#22d3ee' },
  { id: 7, num: '07', label: 'Lifestyle', accent: '#60cdff' },
] as const;

export function resolvePillarFrom(raw: string | null | undefined): PillarFromKey {
  if (raw && raw in PILLAR_FROM_CONTEXT) return raw as PillarFromKey;
  return DEFAULT_PILLAR_FROM;
}

export function sevenPillarsHubHref(from: PillarFromKey | string) {
  const key = resolvePillarFrom(from);
  return `/7-pillars?from=${encodeURIComponent(key)}`;
}

export function pillarDetailHref(pillarId: string | number, from: PillarFromKey | string) {
  const key = resolvePillarFrom(from);
  return `/pillar/${pillarId}?from=${encodeURIComponent(key)}`;
}

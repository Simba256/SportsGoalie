/** Shared public 8-Pillars routing (no auth). The `/7-pillars` URL keeps its slug — links are already shared. */

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

/**
 * The public marketing site's pillar list — eight pillars, numbered the way
 * Michael's 20 August list and the in-app list number them.
 *
 * `num` is the number shown on the card; `id` is the /pillar/[id] page that
 * card opens. They differ for Practice and Lifestyle on purpose: the public
 * site still has one combined "Game & Practice" sales page (id 6) and one
 * Lifestyle page (id 7), and every link Michael has already shared points at
 * those ids. Game and Practice are separate cards that both open id 6 until
 * Michael sends the Practice page copy, at which point Practice takes id 7 and
 * Lifestyle id 8 (with a redirect from the old /pillar/7 link).
 */
export const PUBLIC_PILLARS = [
  { id: 1, num: '01', label: 'MindSet', accent: '#00f2ff' },
  { id: 2, num: '02', label: 'Skating', accent: '#60cdff' },
  { id: 3, num: '03', label: '7AMS', accent: '#37b5ff' },
  { id: 4, num: '04', label: '6 Zone – 7 Point System™', accent: '#0ea5e9' },
  { id: 5, num: '05', label: 'Form', accent: '#38bdf8' },
  { id: 6, num: '06', label: 'Game', accent: '#22d3ee' },
  { id: 6, num: '07', label: 'Practice', accent: '#5eead4' },
  { id: 7, num: '08', label: 'Lifestyle', accent: '#60cdff' },
] as const;

/** The label a pillar page carries in its crumb and prev/next buttons, keyed by /pillar/[id]. */
export const PUBLIC_PILLAR_PAGE_NUMBER: Record<number, string> = {
  1: '01',
  2: '02',
  3: '03',
  4: '04',
  5: '05',
  6: '06–07',
  7: '08',
};

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

/**
 * Which Coach Mike clips sit on which page, from Michael's placement doc
 * (4 Oct 2026, section 2 "Sits on a page") and his answers of 17 Oct 2026.
 * Wire by clip ID: to move a clip, move its line here and nothing else.
 *
 * Keyed by the pillar's Firestore document id, which is what the pillar page
 * route carries. Order is the order the buttons stack, top first.
 */

export interface PlacedClip {
  clipId: string;
  /** Button text on wider screens. A phone shows just "HEAR COACH MIKE". */
  label: string;
}

/**
 * The welcome for each pillar, V-A-19 to V-A-26, which sits first, directly
 * under the pillar's name. The Mind-Vault has no welcome of its own: it is part
 * of MindSet, so V-A-19 is MindSet's.
 */
export const PILLAR_WELCOME_CLIPS: Record<string, PlacedClip> = {
  pillar_mindset: { clipId: 'V-A-19', label: 'HEAR COACH MIKE: WELCOME TO MINDSET' },
  pillar_skating: { clipId: 'V-A-20', label: 'HEAR COACH MIKE: WELCOME TO SKATING TECH' },
  pillar_positioning: { clipId: 'V-A-21', label: 'HEAR COACH MIKE: WELCOME TO THE 7 ANGLE-MARKER SYSTEM' },
  pillar_seven_point: { clipId: 'V-A-22', label: 'HEAR COACH MIKE: WELCOME TO THE 6 ZONE, 7 POINT SYSTEM' },
  pillar_form: { clipId: 'V-A-23', label: 'HEAR COACH MIKE: WELCOME TO FORM TECH' },
  pillar_game: { clipId: 'V-A-24', label: 'HEAR COACH MIKE: WELCOME TO GAME PERFORMANCE' },
  pillar_practice: { clipId: 'V-A-25', label: 'HEAR COACH MIKE: WELCOME TO THE PRACTICE SYSTEM' },
  pillar_lifestyle: { clipId: 'V-A-26', label: 'HEAR COACH MIKE: WELCOME TO LIFESTYLE AND HOCKEY' },
};

/**
 * The foundational tools. V-A-11 and V-A-12 are not welcomes and do not belong
 * to one page: a client may take only Form, or MindSet, or the 6 Zone, 7 Point
 * System, and still needs them. They are defined once here and placed on any
 * pillar that needs them through `PILLAR_FOUNDATIONAL_TOOLS`.
 */
export const FOUNDATIONAL_TOOLS = {
  vmp: { clipId: 'V-A-11', label: 'HEAR COACH MIKE: V.M.P., VISUAL, MENTAL, PHYSICAL' },
  noWaste: { clipId: 'V-A-12', label: 'HEAR COACH MIKE: NO WASTED MOVEMENT, ENERGY OR TIME' },
} as const satisfies Record<string, PlacedClip>;

export type FoundationalToolKey = keyof typeof FOUNDATIONAL_TOOLS;

/**
 * Which foundational tools sit on which pillar, in the order they stack after
 * the welcome. Michael has not named the pillars yet, so none carries one. To
 * place a tool, add a line, e.g. `pillar_form: ['vmp', 'noWaste']`.
 */
export const PILLAR_FOUNDATIONAL_TOOLS: Record<string, readonly FoundationalToolKey[]> = {};

export const PILLAR_TEACHING_CLIPS: Record<string, readonly PlacedClip[]> = {
  // Pillar 03 · 7 Angle-Marker System: V-A-06, then V-A-08, V-A-09 and V-A-10.
  //
  // V-A-08 opens "In the 7 Angle-Marker System", so it sits here and not under
  // Pillar 04 (moved 12 Oct, as agreed in the 6 Oct reply).
  pillar_positioning: [
    { clipId: 'V-A-06', label: 'HEAR COACH MIKE: THE 7 ANGLE-MARKER SYSTEM' },
    { clipId: 'V-A-08', label: 'HEAR COACH MIKE: ANGLES 1 AND 7 ARE THE SAME' },
    { clipId: 'V-A-09', label: 'HEAR COACH MIKE: THE 4 LEVEL ARCH SYSTEM' },
    { clipId: 'V-A-10', label: 'HEAR COACH MIKE: THE THREE LANES OF ATTACK' },
  ],
  // Pillar 04 · 6 Zone – 7 Point System: V-A-07 alone.
  pillar_seven_point: [
    { clipId: 'V-A-07', label: 'HEAR COACH MIKE: THE 6 ZONE, 7 POINT SYSTEM' },
  ],
};

/**
 * Everything on one pillar's screen, top first: its welcome, then any
 * foundational tools placed on it, then the clips that teach that pillar.
 */
export function clipsForPillar(pillarId: string): readonly PlacedClip[] {
  const welcome = PILLAR_WELCOME_CLIPS[pillarId];
  const tools = (PILLAR_FOUNDATIONAL_TOOLS[pillarId] ?? []).map(key => FOUNDATIONAL_TOOLS[key]);
  const teaching = PILLAR_TEACHING_CLIPS[pillarId] ?? [];
  return [...(welcome ? [welcome] : []), ...tools, ...teaching];
}

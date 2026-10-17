/**
 * Which Coach Mike clips sit on which page, from Michael's placement doc
 * (4 Oct 2026, section 2 "Sits on a page"). Wire by clip ID: to move a clip,
 * move its line here and nothing else.
 *
 * Keyed by the pillar's Firestore document id, which is what the pillar page
 * route carries. Order is the order the buttons stack, top first.
 */

export interface PlacedClip {
  clipId: string;
  /** Button text on wider screens. A phone shows just "HEAR COACH MIKE". */
  label: string;
}

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

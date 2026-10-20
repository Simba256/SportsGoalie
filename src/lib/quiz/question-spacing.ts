/**
 * How close together two Knowledge Check questions may be placed.
 *
 * The builder used to start every session at a 5 second minimum, which got in the
 * way of a fast drill and had to be changed by hand each time the builder opened.
 * The gap now starts at the smallest the builder can place at all.
 *
 * Timestamps in the builder are whole seconds, so one second is the closest two
 * questions can be. Two in the same second are not allowed: the player shows a
 * question only once the clock is past the last point it checked, so the second
 * of two at the same moment would never appear and the quiz could not finish.
 */

/** The smallest step between two questions the builder can place. */
const ONE_SECOND = 1;

export const DEFAULT_QUESTION_SPACING = ONE_SECOND;
export const MAX_QUESTION_SPACING = 120;

/** A value for the gap box that the builder can work with. */
export function clampQuestionSpacing(value: number): number {
  if (Number.isNaN(value)) return DEFAULT_QUESTION_SPACING;
  return Math.max(ONE_SECOND, Math.min(MAX_QUESTION_SPACING, value));
}

/** Whether a question at `timestamp` is closer than allowed to any in `others`. */
export function questionsTooClose(
  timestamp: number,
  others: readonly number[],
  minGap: number
): boolean {
  const gap = Math.max(ONE_SECOND, minGap);
  return others.some(other => Math.abs(other - timestamp) < gap);
}

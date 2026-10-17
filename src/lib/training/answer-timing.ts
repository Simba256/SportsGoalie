/**
 * Whole seconds a goalie took over a question, from the moment it was put on
 * screen to the moment they answered.
 *
 * The player used to store `timeToAnswer: 0` for every answer, so the results
 * page read "0m 0s to answer" under each question (item 6 of Michael's 4 Oct
 * run). Nothing was being measured. An answer with no start time recorded is
 * stored as 0, which the results page treats as "not measured" and leaves out
 * rather than printing as a time.
 */
export function secondsToAnswer(shownAtMs: number | null, answeredAtMs: number): number {
  if (shownAtMs === null || !Number.isFinite(shownAtMs) || !Number.isFinite(answeredAtMs)) return 0;
  return Math.max(0, Math.round((answeredAtMs - shownAtMs) / 1000));
}

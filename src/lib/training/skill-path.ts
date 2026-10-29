/**
 * Where a quiz's "Continue Learning" button goes: the skill the quiz belongs to.
 *
 * The button used to push `/sports/<sportId>/skills/<skillId>`. That route was
 * renamed to `/pillars/...` and the old one no longer exists, so every goalie who
 * finished a quiz and pressed it landed on "page not found" (item 3 of Michael's
 * 4 Oct run). The quiz's `sportId` is the pillar document id the skill page loads
 * its `[id]` segment with.
 *
 * A quiz saved without a skill falls back to its pillar, and one without either
 * falls back to the dashboard, so the button never builds a `/pillars//skills/`
 * address that 404s again.
 */
export function skillPagePath(
  sportId: string | null | undefined,
  skillId: string | null | undefined,
): string {
  if (sportId && skillId) return `/pillars/${sportId}/skills/${skillId}`;
  if (sportId) return `/pillars/${sportId}`;
  return '/dashboard';
}

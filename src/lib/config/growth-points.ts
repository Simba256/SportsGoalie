export const GROWTH_POINTS = {
  // Base earning events
  MODULE_COMPLETE: 50,
  KNOWLEDGE_CHECK_COMPLETE: 25,
  CHART_LOGGED: 15,
  GOAL_COMPLETE: 50,
  PILLAR_COMPLETE: 500,
  ALL_PILLARS_COMPLETE: 5000,

  // Knowledge check score bonuses (added on top of base 25 pts)
  KC_OWNING_IT_BONUS: 25,   // 70–79%
  KC_CLUB_80_BONUS: 50,     // 80–94%
  KC_CLUB_95_BONUS: 100,    // 95–100%

  // Streak milestone rewards
  STREAK_7_DAYS: 100,
  STREAK_14_DAYS: 200,
  STREAK_30_DAYS: 500,
} as const;

export type GrowthPointsEvent = keyof typeof GROWTH_POINTS;

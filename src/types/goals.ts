// ─── Learning goals ──────────────────────────────────────────────────
// Stored in the `student_goals` collection, one document per goal.

export type GoalType =
  | 'skill_completion'
  | 'quiz_score'
  | 'time_spent'
  | 'streak'
  | 'sport_completion';

export type GoalPriority = 'low' | 'medium' | 'high';

export interface Goal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  targetValue: number;
  /**
   * Progress towards the target. While a goal is open this is worked out from the
   * goalie's live stats (see goalProgress); it is stored only when the goal is
   * marked complete, so a finished goal keeps the value it finished on.
   */
  currentValue: number;
  unit: string;
  deadline?: Date;
  priority: GoalPriority;
  isCompleted: boolean;
  createdAt: Date;
  /**
   * For goals that count up over time (skills, learning time, sports): the goalie's
   * running total on the day the goal was set, so progress counts from then rather
   * than from the beginning of their account. Always 0 for the other types.
   */
  baselineValue: number;
}

/** What the create-goal form hands back. The page adds the baseline before saving. */
export type NewGoal = Omit<Goal, 'id' | 'createdAt' | 'baselineValue'>;

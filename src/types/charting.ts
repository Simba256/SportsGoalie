import { Timestamp } from 'firebase/firestore';

// Session Types
export type SessionType = 'game' | 'practice';
export type SessionStatus = 'scheduled' | 'pre-game' | 'in-progress' | 'completed';
export type PerformanceLevel = 'poor' | 'improving' | 'good' | 'strong';
export type ConsistencyLevel = 'consistent' | 'inconsistent';
export type DecisionMakingLevel = 'strong' | 'improving' | 'needs_work';
export type SkatingLevel = 'in_sync' | 'improving' | 'weak' | 'not_in_sync';

// Yes/No Response with Comments
export interface YesNoResponse {
  value: boolean;
  comments: string;
}

// Pre-Game Section Types
export interface GameReadiness {
  wellRested: YesNoResponse;
  fueledForGame: YesNoResponse;
}

export interface MindSetPreGame {
  mindCleared: YesNoResponse;
  mentalImagery: YesNoResponse;
}

export interface PreGameRoutine {
  ballExercises: YesNoResponse;
  stretching: YesNoResponse;
  other: YesNoResponse;
}

export interface WarmUp {
  lookedEngaged: YesNoResponse;
  lackedFocus: YesNoResponse;
  teamWarmUpNeedsAdjustment: YesNoResponse;
}

export interface PreGameData {
  gameReadiness: GameReadiness;
  mindSet: MindSetPreGame;
  preGameRoutine: PreGameRoutine;
  warmUp: WarmUp;
}

// Game Overview Types
export interface GoalsByPeriod {
  period1: number;
  period2: number;
  period3: number;
}

export interface GameOverview {
  goodGoals: GoalsByPeriod;
  badGoals: GoalsByPeriod;
  degreeOfChallenge: {
    period1: number; // 1-10 scale
    period2: number;
    period3: number;
  };
}

// Period Performance Types
export interface MindSetPeriod {
  focusConsistent: YesNoResponse;
  focusInconsistent: YesNoResponse;
  decisionMakingStrong: YesNoResponse;
  decisionMakingImproving: YesNoResponse;
  decisionMakingNeedsWork: YesNoResponse;
  bodyLanguageConsistent: YesNoResponse;
  bodyLanguageInconsistent: YesNoResponse;
}

export interface SkatingPerformance {
  inSyncWithPuck: YesNoResponse;
  improving: YesNoResponse;
  weak: YesNoResponse;
  notInSync: YesNoResponse;
}

export interface PositionalAboveIcingLine {
  poor: YesNoResponse;
  improving: YesNoResponse;
  good: YesNoResponse;
  angleIssue: {
    selectedAngles: number[]; // Array of 1-7
    comments: string;
  };
  fourArchLevel?: {
    selectedPoints: number[]; // Array of 1-7
    comments: string;
  };
}

export interface PositionalBelowIcingLine {
  poor: YesNoResponse;
  improving: YesNoResponse;
  good: YesNoResponse;
  strong: YesNoResponse;
}

export interface ReboundControl {
  poor: YesNoResponse;
  improving: YesNoResponse;
  good: YesNoResponse;
  consistent: YesNoResponse;
  inconsistent: YesNoResponse;
}

export interface FreezingPuck {
  poor: YesNoResponse;
  improving: YesNoResponse;
  good: YesNoResponse;
  consistent: YesNoResponse;
  inconsistent: YesNoResponse;
}

export interface TeamPlay {
  settingUpDefense: {
    poor: YesNoResponse;
    improving: YesNoResponse;
    good: YesNoResponse;
  };
  settingUpForwards: {
    poor: YesNoResponse;
    improving: YesNoResponse;
    good: YesNoResponse;
  };
}

export interface PeriodData {
  mindSet: MindSetPeriod;
  skating: SkatingPerformance;
  positionalAboveIcing: PositionalAboveIcingLine;
  positionalBelowIcing: PositionalBelowIcingLine;
  reboundControl: ReboundControl;
  freezingPuck: FreezingPuck;
  teamPlay?: TeamPlay; // Only in Period 3
}

// Overtime Types
export interface OvertimeData {
  mindSetFocus: {
    poor: YesNoResponse;
    needsWork: YesNoResponse;
    good: YesNoResponse;
  };
  mindSetDecisionMaking: {
    strong: YesNoResponse;
    improving: YesNoResponse;
    needsWork: YesNoResponse;
  };
  skatingPerformance: {
    poor: YesNoResponse;
    needsWork: YesNoResponse;
    good: YesNoResponse;
  };
  positionalGame: {
    poor: YesNoResponse;
    needsWork: YesNoResponse;
    good: YesNoResponse;
  };
  reboundControl: {
    poor: YesNoResponse;
    needsWork: YesNoResponse;
    good: YesNoResponse;
  };
  freezingPuck: {
    poor: YesNoResponse;
    needsWork: YesNoResponse;
    good: YesNoResponse;
  };
}

// Shootout Types
export interface ShootoutData {
  result: 'won' | 'lost';
  shotsSaved: number; // 0-10
  shotsScored: number; // 0-10
  dekesSaved: number; // 0-10
  dekesScored: number; // 0-10
  comments: string;
}

// Post-Game Types
export interface PostGameData {
  reviewCompleted: YesNoResponse;
  reviewNotCompleted: YesNoResponse;
}

// Main Session Interface
export interface Session {
  id: string;
  studentId: string;
  type: SessionType;
  status: SessionStatus;
  date: Timestamp;
  opponent?: string;
  location?: string;
  result?: 'win' | 'loss' | 'tie';
  tags?: string[]; // e.g., 'home', 'away', 'tournament', 'league'
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // userId
}

// Main Charting Entry Interface
export interface ChartingEntry {
  id: string;
  sessionId: string;
  studentId: string;
  submittedBy: string; // userId
  submitterRole: 'student' | 'admin';
  submittedAt: Timestamp;
  lastUpdatedAt: Timestamp;

  // Pre-Game Phase
  preGame?: PreGameData;

  // Game Overview
  gameOverview?: GameOverview;

  // Period Data
  period1?: PeriodData;
  period2?: PeriodData;
  period3?: PeriodData;

  // Overtime (optional)
  overtime?: OvertimeData;

  // Shootout (optional)
  shootout?: ShootoutData;

  // Post-Game
  postGame?: PostGameData;

  // Overall notes
  additionalComments?: string;
}

// Analytics & Stats Types
export interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  gameSessions: number;
  practiceSessions: number;
  completionRate: number; // percentage
  averageSessionsPerWeek: number;
  averageSessionsPerMonth: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Timestamp;
  streakDates: string[]; // ISO date strings for calendar display
}

export interface GoalsAnalytics {
  totalGoodGoals: number;
  totalBadGoals: number;
  goodBadRatio: number;
  goalsByPeriod: {
    period1: { good: number; bad: number };
    period2: { good: number; bad: number };
    period3: { good: number; bad: number };
  };
  averageDegreeOfChallenge: number;
}

export interface CategoryPerformance {
  category: string;
  poorCount: number;
  improvingCount: number;
  goodCount: number;
  strongCount: number;
  currentLevel: PerformanceLevel;
  trend: 'improving' | 'stable' | 'declining';
  lastUpdated: Timestamp;
}

export interface PreGameRoutineAdherence {
  wellRestedPercentage: number;
  properlyFueledPercentage: number;
  mentalImageryPercentage: number;
  ballExercisesPercentage: number;
  stretchingPercentage: number;
  overallPrepScore: number; // 0-100
}

export interface PeriodPerformanceAnalytics {
  bestPeriod: 1 | 2 | 3;
  worstPeriod: 1 | 2 | 3;
  period1Consistency: number; // percentage
  period2Consistency: number;
  period3Consistency: number;
}

export interface ShootoutAnalytics {
  totalShootouts: number;
  winRate: number; // percentage
  shotSavePercentage: number;
  dekeSavePercentage: number;
  totalSaves: number;
  totalGoalsAgainst: number;
}

export interface StudentChartingAnalytics {
  studentId: string;
  sessionStats: SessionStats;
  streak: StreakData;
  goalsAnalytics: GoalsAnalytics;
  categoryPerformances: CategoryPerformance[];
  preGameRoutineAdherence: PreGameRoutineAdherence;
  periodPerformance: PeriodPerformanceAnalytics;
  shootoutAnalytics: ShootoutAnalytics;
  lastCalculated: Timestamp;
}

// Summary/Insight Types
export interface PerformanceInsight {
  type: 'improvement' | 'concern' | 'achievement' | 'pattern';
  category: string;
  message: string;
  data?: Record<string, unknown>;
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
}

// Form Input Types (for UI)
export interface SessionFormData {
  type: SessionType;
  date: Date;
  opponent?: string;
  location?: string;
  tags?: string[];
}

export interface ChartingFormData {
  phase: 'pre-game' | 'period-1' | 'period-2' | 'period-3' | 'overtime' | 'shootout' | 'post-game';
  data: Partial<ChartingEntry>;
}

// Admin Dashboard Types
export interface StudentSummary {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalSessions: number;
  completionRate: number;
  currentStreak: number;
  lastSessionDate?: Timestamp;
  overallPerformance: 'excellent' | 'good' | 'needs-attention';
  recentTrend: 'improving' | 'stable' | 'declining';
}

export interface CohortAnalytics {
  totalStudents: number;
  activeStudents: number; // charted in last 7 days
  averageCompletionRate: number;
  totalSessionsThisWeek: number;
  totalSessionsThisMonth: number;
  topPerformers: StudentSummary[];
  needsAttention: StudentSummary[];
}

// Comparison Types
export interface SessionComparison {
  session1: Session;
  session2: Session;
  entry1?: ChartingEntry;
  entry2?: ChartingEntry;
  differences: {
    category: string;
    field: string;
    value1: string | number;
    value2: string | number;
    change: 'improved' | 'declined' | 'same';
  }[];
}

// Export Filter/Query Types
export interface ChartingQueryOptions {
  studentId?: string;
  sessionType?: SessionType;
  dateFrom?: Date;
  dateTo?: Date;
  status?: SessionStatus;
  tags?: string[];
  limit?: number;
  orderBy?: 'date' | 'createdAt' | 'updatedAt';
  orderDirection?: 'asc' | 'desc';
}

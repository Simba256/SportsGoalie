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
  // Dynamic form fields
  equipment?: { value?: boolean | string };
  mentalPrep?: { value?: boolean | string };
  physical?: { value?: boolean | string };
  warmup?: { value?: boolean | string };
  [key: string]: unknown; // Allow additional dynamic fields
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
  inSync?: { value?: boolean }; // Alternative field name
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
  thisMonthSessions?: number;
  thisWeekSessions?: number;
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

/** V2 per-period averages used inside V2GameAnalytics */
export interface V2PeriodAverage {
  period: 'period1' | 'period2' | 'period3' | 'overtime';
  sampleSize: number;
  avgMindControl: number; // 1-5
  avgFactorRatio: number; // 1-5
  totalGoalsAgainst: number;
  totalGoodGoals: number;
  totalBadGoals: number;
}

/** Aggregates sourced from v2 game chart entries (v2PreGame/v2Periods/v2PostGame) */
export interface V2GameAnalytics {
  totalV2Games: number; // entries with any v2 game field populated

  // Mind Management (from v2PreGame)
  mindManagement: {
    sampleSize: number;
    routineCompletedRate: number; // 0-100
    anxietyPresentRate: number; // 0-100
    targetStateAchievedRate: number; // 0-100
    avgMentalStateRating: number; // 1-5
  };

  // Period aggregates (from v2Periods)
  periods: V2PeriodAverage[];
  overallAvgMindControl: number; // averaged across all periods seen
  overallAvgFactorRatio: number; // averaged across all periods seen

  // Goal aggregates (from v2Periods[*].goals[] + goalsAgainst)
  totalGoalsAgainst: number;
  totalGoodGoals: number;
  totalBadGoals: number;
  goodBadRatio: number;

  // Post-Game summaries (from v2PostGame)
  postGame: {
    sampleSize: number;
    avgOverallGameFactor: number; // 1-5
    avgGameRetention: number; // 1-5
    avgGoodDecisionRate: number; // percentage already in the data (0-100)
    mindVaultEntriesCaptured: number;
  };
}

/** Aggregates sourced from v2Practice entries */
export interface V2PracticeAnalytics {
  totalV2Practices: number;

  avgPracticeValue: number; // 1-5
  avgTechnicalEye: number; // 1-5

  designatedTrainingRate: number; // 0-100, % of practices with designated training
  totalDesignatedTrainingMinutes: number;
  avgDesignatedTrainingMinutes: number; // averaged across practices that had it

  videoCapturedRate: number; // 0-100

  // Practice Index breakdown across all practices (item-occurrences, not unique)
  indexCounts: {
    immediate_development: number;
    refinement: number;
    maintenance: number;
  };
  totalIndexItemsWorkedOn: number;

  // Improvement ratings
  avgImprovementRating: number; // 1-5
  improvementRatingsCount: number;
  mindVaultEntriesCaptured: number;
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
  // V2 analytics — populated from v2 chart entries. Optional for back-compat
  // with historical analytics docs that predate the v2 migration.
  v2GameAnalytics?: V2GameAnalytics;
  v2PracticeAnalytics?: V2PracticeAnalytics;
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

// ─── V2 Charting Types (Confirmed Build Spec - March 2026) ──────────────────

/** Pre-game mind management start time options */
export type MindManagementStartTime =
  | 'at_the_rink'
  | '1_hour_before'
  | '2_hours_before'
  | '3_plus_hours_before'
  | 'wake_up_thinking';

/** V2 Pre-Game Section — completed before leaving for the rink */
export interface V2PreGameData {
  personalStartTime: MindManagementStartTime;
  mentalStateRating: number; // 1-5
  mentalStateVoiceNote?: string;
  routineCompleted: boolean;
  routineVoiceNote?: string; // captured if No
  anxietyPresent: boolean;
  anxietyVoiceNote?: string; // captured if Yes → feeds Mind Vault
  targetStateAchieved: boolean;
  targetStateVoiceNote?: string; // captured if No
}

/** Individual goal classification within a period */
export interface GoalEntry {
  goalNumber: number;
  isGoodGoal: boolean;
  voiceNote?: string; // captured if Bad Goal
}

/** V2 Per-Period Section — completed post-game from memory */
export interface V2PeriodData {
  mindControlRating: number; // 1-5 stars
  mindControlVoiceNote?: string; // captured if 1-2
  periodFactorRatio: number; // 1-5
  goalsAgainst: number;
  goals: GoalEntry[];
  // Architecture placeholder for 8 additional factor ratio fields (PENDING)
  factorRatios?: Record<string, number>;
}

/** V2 Post-Game Section — completed immediately after the game */
export interface V2PostGameData {
  overallFeeling: string; // voice transcription, raw/unfiltered
  overallGameFactorRating: number; // 1-5
  overallGameFactorVoiceNote?: string; // captured if 4-5
  mindControlAverage: number; // auto-calculated from period data
  goodGoalCount: number; // auto-calculated
  badGoalCount: number; // auto-calculated
  goodDecisionRate: number; // percentage, auto-calculated
  gameRetentionRating: number; // 1-5
  gameRetentionVoiceNote?: string;
  mindVaultEntry: string; // voice transcription
  factorRatioSummary: number; // auto-calculated average of period factor ratios
}

/** Complete V2 Game Chart Entry */
export interface V2GameChartEntry {
  id: string;
  sessionId: string;
  studentId: string;
  version: 'v2';
  preGame?: V2PreGameData;
  periods: {
    period1?: V2PeriodData;
    period2?: V2PeriodData;
    period3?: V2PeriodData;
    overtime?: V2PeriodData;
  };
  postGame?: V2PostGameData;
  completedSections: ('preGame' | 'periods' | 'postGame')[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Practice Index item priority categories */
export type PracticeIndexCategory =
  | 'immediate_development' // broke down in last game — highest priority
  | 'refinement'            // growing but not yet owned
  | 'maintenance';          // under control, keep sharp

/** Auto-generated practice item from game chart data */
export interface PracticeIndexItem {
  id: string;
  label: string;
  description?: string;
  category: PracticeIndexCategory;
  sourceGameSessionId?: string;
  sourceField?: string; // which game chart field generated this
  priority: number; // 1 = highest
}

/** V2 Practice Chart Entry */
export interface V2PracticeChartEntry {
  id: string;
  sessionId: string;
  studentId: string;
  version: 'v2';
  practiceIndex: PracticeIndexItem[]; // auto-generated from recent games
  practiceValueRating: number; // 1-5
  designatedTrainingReceived: boolean;
  designatedTrainingDuration?: number; // minutes, in 5-min increments
  indexItemsWorkedOn: string[]; // PracticeIndexItem IDs
  videoCaptured: boolean;
  videoUrl?: string;
  improvementRatings: { itemId: string; rating: number }[]; // 1-5 per item
  mindVaultEntry: string; // voice transcription
  technicalEyeDevelopmentRating: number; // 1-5
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Mind Vault entry stored from games and practices */
export interface MindVaultEntry {
  id: string;
  studentId: string;
  sessionId: string;
  sessionType: SessionType;
  source: 'pre_game_anxiety' | 'post_game' | 'practice';
  content: string; // voice transcription
  createdAt: Timestamp;
}

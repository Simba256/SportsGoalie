import { BaseDatabaseService } from '../base.service';
import {
  Session,
  ChartingEntry,
  SessionType,
  SessionStatus,
  SessionStats,
  StreakData,
  GoalsAnalytics,
  CategoryPerformance,
  PreGameRoutineAdherence,
  PeriodPerformanceAnalytics,
  ShootoutAnalytics,
  StudentChartingAnalytics,
  PerformanceInsight,
  StudentSummary,
  CohortAnalytics,
  ChartingQueryOptions,
  ApiResponse,
  PaginatedResponse,
} from '@/types';
import { Timestamp, query, where, orderBy, limit as firestoreLimit, getDocs, collection, doc, setDoc } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { db } from '../../firebase/config';

/**
 * Service for managing goaltending charting system including sessions and charting entries.
 *
 * This service provides functionality for:
 * - Session management (games and practices)
 * - Charting entry operations
 * - Analytics and statistics calculation
 * - Student progress tracking
 * - Admin dashboard data
 *
 * @example
 * ```typescript
 * // Create a new session
 * const session = await chartingService.createSession({
 *   studentId: 'student123',
 *   type: 'game',
 *   date: new Date(),
 *   opponent: 'Team ABC',
 *   location: 'Home Arena'
 * });
 *
 * // Create a charting entry
 * const entry = await chartingService.createChartingEntry({
 *   sessionId: session.data.id,
 *   studentId: 'student123',
 *   submittedBy: 'admin123',
 *   submitterRole: 'admin',
 *   preGame: { ... }
 * });
 * ```
 */
export class ChartingService extends BaseDatabaseService {
  private readonly SESSIONS_COLLECTION = 'sessions';
  private readonly CHARTING_ENTRIES_COLLECTION = 'charting_entries';
  private readonly ANALYTICS_COLLECTION = 'charting_analytics';

  // ==================== SESSION OPERATIONS ====================

  /**
   * Creates a new session (game or practice)
   */
  async createSession(
    sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.SESSIONS_COLLECTION, undefined, {
      type: sessionData.type,
      studentId: sessionData.studentId
    });

    const data = {
      ...sessionData,
      status: sessionData.status || 'scheduled',
      tags: sessionData.tags || [],
    };

    const result = await this.create<Session>(this.SESSIONS_COLLECTION, data);

    if (result.success) {
      logger.info('Session created successfully', 'ChartingService', {
        sessionId: result.data!.id,
        type: sessionData.type,
        studentId: sessionData.studentId
      });
    }

    return result;
  }

  /**
   * Retrieves a session by ID
   */
  async getSession(sessionId: string): Promise<ApiResponse<Session | null>> {
    logger.database('read', this.SESSIONS_COLLECTION, sessionId);
    return await this.getById<Session>(this.SESSIONS_COLLECTION, sessionId);
  }

  /**
   * Updates a session
   */
  async updateSession(
    sessionId: string,
    updates: Partial<Omit<Session, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<ApiResponse<void>> {
    logger.database('update', this.SESSIONS_COLLECTION, sessionId, updates);
    return await this.update(this.SESSIONS_COLLECTION, sessionId, updates);
  }

  /**
   * Deletes a session and all associated charting entries
   */
  async deleteSession(sessionId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.SESSIONS_COLLECTION, sessionId);

    // First, delete all charting entries for this session
    const entries = await this.getChartingEntriesBySession(sessionId);
    if (entries.success && entries.data) {
      for (const entry of entries.data) {
        await this.deleteChartingEntry(entry.id);
      }
    }

    return await this.delete(this.SESSIONS_COLLECTION, sessionId);
  }

  /**
   * Gets all sessions for a student
   */
  async getSessionsByStudent(
    studentId: string,
    options?: ChartingQueryOptions
  ): Promise<ApiResponse<Session[]>> {
    logger.database('query', this.SESSIONS_COLLECTION, undefined, { studentId });

    try {
      let q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('studentId', '==', studentId)
      );

      // Apply filters
      if (options?.sessionType) {
        q = query(q, where('type', '==', options.sessionType));
      }

      if (options?.status) {
        q = query(q, where('status', '==', options.status));
      }

      if (options?.dateFrom) {
        q = query(q, where('date', '>=', Timestamp.fromDate(options.dateFrom)));
      }

      if (options?.dateTo) {
        q = query(q, where('date', '<=', Timestamp.fromDate(options.dateTo)));
      }

      // Apply ordering
      const orderByField = options?.orderBy || 'date';
      const orderDirection = options?.orderDirection || 'desc';
      q = query(q, orderBy(orderByField, orderDirection));

      // Apply limit
      if (options?.limit) {
        q = query(q, firestoreLimit(options.limit));
      }

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));

      return {
        success: true,
        data: sessions,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get sessions by student', 'ChartingService', error);
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: 'Failed to retrieve sessions',
          details: error
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Gets upcoming sessions for a student
   */
  async getUpcomingSessions(studentId: string, limitCount: number = 10): Promise<ApiResponse<Session[]>> {
    logger.database('query', this.SESSIONS_COLLECTION, undefined, { studentId, type: 'upcoming' });

    try {
      const now = Timestamp.now();
      const q = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('studentId', '==', studentId),
        where('date', '>=', now),
        where('status', 'in', ['scheduled', 'pre-game', 'in-progress']),
        orderBy('date', 'asc'),
        firestoreLimit(limitCount)
      );

      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Session));

      return {
        success: true,
        data: sessions,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get upcoming sessions', 'ChartingService', error);
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: 'Failed to retrieve upcoming sessions',
          details: error
        },
        timestamp: new Date()
      };
    }
  }

  // ==================== CHARTING ENTRY OPERATIONS ====================

  /**
   * Creates a new charting entry
   */
  async createChartingEntry(
    entryData: Omit<ChartingEntry, 'id' | 'submittedAt' | 'lastUpdatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.CHARTING_ENTRIES_COLLECTION, undefined, {
      sessionId: entryData.sessionId,
      studentId: entryData.studentId,
      submitterRole: entryData.submitterRole
    });

    const data = {
      ...entryData,
      submittedAt: Timestamp.now(),
      lastUpdatedAt: Timestamp.now(),
    };

    const result = await this.create<ChartingEntry>(this.CHARTING_ENTRIES_COLLECTION, data);

    if (result.success) {
      logger.info('Charting entry created successfully', 'ChartingService', {
        entryId: result.data!.id,
        sessionId: entryData.sessionId,
        studentId: entryData.studentId
      });

      // Update session status if it's the first entry
      await this.updateSession(entryData.sessionId, { status: 'in-progress' });

      // Trigger analytics recalculation (async, don't wait)
      this.recalculateStudentAnalytics(entryData.studentId).catch(err =>
        logger.error('Failed to recalculate analytics', 'ChartingService', err)
      );
    }

    return result;
  }

  /**
   * Retrieves a charting entry by ID
   */
  async getChartingEntry(entryId: string): Promise<ApiResponse<ChartingEntry | null>> {
    logger.database('read', this.CHARTING_ENTRIES_COLLECTION, entryId);
    return await this.getById<ChartingEntry>(this.CHARTING_ENTRIES_COLLECTION, entryId);
  }

  /**
   * Updates a charting entry
   */
  async updateChartingEntry(
    entryId: string,
    updates: Partial<Omit<ChartingEntry, 'id' | 'submittedAt' | 'sessionId' | 'studentId'>>
  ): Promise<ApiResponse<void>> {
    logger.database('update', this.CHARTING_ENTRIES_COLLECTION, entryId, updates);

    const data = {
      ...updates,
      lastUpdatedAt: Timestamp.now(),
    };

    const result = await this.update(this.CHARTING_ENTRIES_COLLECTION, entryId, data);

    if (result.success) {
      // Get the entry to find studentId for analytics recalculation
      const entry = await this.getChartingEntry(entryId);
      if (entry.success && entry.data) {
        this.recalculateStudentAnalytics(entry.data.studentId).catch(err =>
          logger.error('Failed to recalculate analytics', 'ChartingService', err)
        );
      }
    }

    return result;
  }

  /**
   * Deletes a charting entry
   */
  async deleteChartingEntry(entryId: string): Promise<ApiResponse<void>> {
    logger.database('delete', this.CHARTING_ENTRIES_COLLECTION, entryId);

    // Get the entry to find studentId before deletion
    const entry = await this.getChartingEntry(entryId);
    const result = await this.delete(this.CHARTING_ENTRIES_COLLECTION, entryId);

    if (result.success && entry.success && entry.data) {
      this.recalculateStudentAnalytics(entry.data.studentId).catch(err =>
        logger.error('Failed to recalculate analytics', 'ChartingService', err)
      );
    }

    return result;
  }

  /**
   * Gets all charting entries for a session
   */
  async getChartingEntriesBySession(sessionId: string): Promise<ApiResponse<ChartingEntry[]>> {
    logger.database('query', this.CHARTING_ENTRIES_COLLECTION, undefined, { sessionId });

    try {
      const q = query(
        collection(db, this.CHARTING_ENTRIES_COLLECTION),
        where('sessionId', '==', sessionId),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChartingEntry));

      return {
        success: true,
        data: entries,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get charting entries by session', 'ChartingService', error);
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: 'Failed to retrieve charting entries',
          details: error
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Gets all charting entries for a student
   */
  async getChartingEntriesByStudent(
    studentId: string,
    limitCount?: number
  ): Promise<ApiResponse<ChartingEntry[]>> {
    logger.database('query', this.CHARTING_ENTRIES_COLLECTION, undefined, { studentId });

    try {
      let q = query(
        collection(db, this.CHARTING_ENTRIES_COLLECTION),
        where('studentId', '==', studentId),
        orderBy('submittedAt', 'desc')
      );

      if (limitCount) {
        q = query(q, firestoreLimit(limitCount));
      }

      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChartingEntry));

      return {
        success: true,
        data: entries,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to get charting entries by student', 'ChartingService', error);
      return {
        success: false,
        error: {
          code: 'QUERY_FAILED',
          message: 'Failed to retrieve charting entries',
          details: error
        },
        timestamp: new Date()
      };
    }
  }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Calculates and stores comprehensive analytics for a student
   */
  async recalculateStudentAnalytics(studentId: string): Promise<ApiResponse<StudentChartingAnalytics>> {
    logger.info('Recalculating student analytics', 'ChartingService', { studentId });

    try {
      // Get all sessions and entries for the student
      const sessionsResult = await this.getSessionsByStudent(studentId);
      const entriesResult = await this.getChartingEntriesByStudent(studentId);

      if (!sessionsResult.success || !entriesResult.success) {
        throw new Error('Failed to fetch student data');
      }

      const sessions = sessionsResult.data || [];
      const entries = entriesResult.data || [];

      // Calculate analytics
      const analytics: StudentChartingAnalytics = {
        studentId,
        sessionStats: this.calculateSessionStats(sessions),
        streak: this.calculateStreak(sessions),
        goalsAnalytics: this.calculateGoalsAnalytics(entries),
        categoryPerformances: this.calculateCategoryPerformances(entries),
        preGameRoutineAdherence: this.calculatePreGameRoutineAdherence(entries),
        periodPerformance: this.calculatePeriodPerformance(entries),
        shootoutAnalytics: this.calculateShootoutAnalytics(entries),
        lastCalculated: Timestamp.now(),
      };

      // Store analytics (create or update using setDoc with merge)
      const analyticsRef = doc(db, this.ANALYTICS_COLLECTION, studentId);
      await setDoc(analyticsRef, analytics, { merge: true });

      return {
        success: true,
        data: analytics,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Failed to recalculate student analytics', 'ChartingService', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_CALCULATION_FAILED',
          message: 'Failed to calculate student analytics',
          details: error
        },
        timestamp: new Date()
      };
    }
  }

  /**
   * Gets analytics for a student
   */
  async getStudentAnalytics(studentId: string): Promise<ApiResponse<StudentChartingAnalytics | null>> {
    logger.database('read', this.ANALYTICS_COLLECTION, studentId);
    const result = await this.getById<StudentChartingAnalytics>(this.ANALYTICS_COLLECTION, studentId);

    // If no analytics found, calculate them
    if (result.success && !result.data) {
      return await this.recalculateStudentAnalytics(studentId);
    }

    return result;
  }

  // ==================== ANALYTICS CALCULATION HELPERS ====================

  private calculateSessionStats(sessions: Session[]): SessionStats {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const gameSessions = sessions.filter(s => s.type === 'game');
    const practiceSessions = sessions.filter(s => s.type === 'practice');

    // Calculate sessions per week/month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sessionsThisWeek = sessions.filter(s =>
      s.date.toDate() >= oneWeekAgo
    ).length;

    const sessionsThisMonth = sessions.filter(s =>
      s.date.toDate() >= oneMonthAgo
    ).length;

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      gameSessions: gameSessions.length,
      practiceSessions: practiceSessions.length,
      completionRate: sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0,
      averageSessionsPerWeek: sessionsThisWeek > 0 ? sessionsThisWeek / 1 : 0,
      averageSessionsPerMonth: sessionsThisMonth > 0 ? sessionsThisMonth / 1 : 0,
    };
  }

  private calculateStreak(sessions: Session[]): StreakData {
    const completedSessions = sessions
      .filter(s => s.status === 'completed')
      .sort((a, b) => b.date.toMillis() - a.date.toMillis());

    if (completedSessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: Timestamp.now(),
        streakDates: [],
      };
    }

    // Calculate current streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;
    const streakDates: string[] = [];

    for (let i = 0; i < completedSessions.length - 1; i++) {
      const current = completedSessions[i].date.toDate();
      const next = completedSessions[i + 1].date.toDate();

      streakDates.push(current.toISOString().split('T')[0]);

      const daysDiff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff <= 7) { // Within a week = consecutive
        tempStreak++;
        if (i === 0) currentStreak = tempStreak;
      } else {
        if (i === 0) currentStreak = 1;
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return {
      currentStreak,
      longestStreak,
      lastActiveDate: completedSessions[0].date,
      streakDates,
    };
  }

  private calculateGoalsAnalytics(entries: ChartingEntry[]): GoalsAnalytics {
    let totalGoodGoals = 0;
    let totalBadGoals = 0;
    const goalsByPeriod = {
      period1: { good: 0, bad: 0 },
      period2: { good: 0, bad: 0 },
      period3: { good: 0, bad: 0 },
    };
    let totalChallenge = 0;
    let challengeCount = 0;

    entries.forEach(entry => {
      if (entry.gameOverview) {
        const { goodGoals, badGoals, degreeOfChallenge } = entry.gameOverview;

        totalGoodGoals += goodGoals.period1 + goodGoals.period2 + goodGoals.period3;
        totalBadGoals += badGoals.period1 + badGoals.period2 + badGoals.period3;

        goalsByPeriod.period1.good += goodGoals.period1;
        goalsByPeriod.period1.bad += badGoals.period1;
        goalsByPeriod.period2.good += goodGoals.period2;
        goalsByPeriod.period2.bad += badGoals.period2;
        goalsByPeriod.period3.good += goodGoals.period3;
        goalsByPeriod.period3.bad += badGoals.period3;

        totalChallenge += degreeOfChallenge.period1 + degreeOfChallenge.period2 + degreeOfChallenge.period3;
        challengeCount += 3;
      }
    });

    return {
      totalGoodGoals,
      totalBadGoals,
      goodBadRatio: totalBadGoals > 0 ? totalGoodGoals / totalBadGoals : totalGoodGoals,
      goalsByPeriod,
      averageDegreeOfChallenge: challengeCount > 0 ? totalChallenge / challengeCount : 0,
    };
  }

  private calculateCategoryPerformances(entries: ChartingEntry[]): CategoryPerformance[] {
    // Placeholder - implement detailed category analysis
    return [];
  }

  private calculatePreGameRoutineAdherence(entries: ChartingEntry[]): PreGameRoutineAdherence {
    let wellRestedCount = 0;
    let fueledCount = 0;
    let mentalImageryCount = 0;
    let ballExercisesCount = 0;
    let stretchingCount = 0;
    let totalEntries = 0;

    entries.forEach(entry => {
      if (entry.preGame) {
        totalEntries++;
        if (entry.preGame.gameReadiness.wellRested.value) wellRestedCount++;
        if (entry.preGame.gameReadiness.fueledForGame.value) fueledCount++;
        if (entry.preGame.mindSet.mentalImagery.value) mentalImageryCount++;
        if (entry.preGame.preGameRoutine.ballExercises.value) ballExercisesCount++;
        if (entry.preGame.preGameRoutine.stretching.value) stretchingCount++;
      }
    });

    const total = totalEntries || 1;
    return {
      wellRestedPercentage: (wellRestedCount / total) * 100,
      properlyFueledPercentage: (fueledCount / total) * 100,
      mentalImageryPercentage: (mentalImageryCount / total) * 100,
      ballExercisesPercentage: (ballExercisesCount / total) * 100,
      stretchingPercentage: (stretchingCount / total) * 100,
      overallPrepScore: ((wellRestedCount + fueledCount + mentalImageryCount + ballExercisesCount + stretchingCount) / (total * 5)) * 100,
    };
  }

  private calculatePeriodPerformance(entries: ChartingEntry[]): PeriodPerformanceAnalytics {
    // Placeholder - implement detailed period analysis
    return {
      bestPeriod: 2,
      worstPeriod: 1,
      period1Consistency: 0,
      period2Consistency: 0,
      period3Consistency: 0,
    };
  }

  private calculateShootoutAnalytics(entries: ChartingEntry[]): ShootoutAnalytics {
    let totalShootouts = 0;
    let wins = 0;
    let totalShotsSaved = 0;
    let totalShotsScored = 0;
    let totalDekesSaved = 0;
    let totalDekesScored = 0;

    entries.forEach(entry => {
      if (entry.shootout) {
        totalShootouts++;
        if (entry.shootout.result === 'won') wins++;
        totalShotsSaved += entry.shootout.shotsSaved;
        totalShotsScored += entry.shootout.shotsScored;
        totalDekesSaved += entry.shootout.dekesSaved;
        totalDekesScored += entry.shootout.dekesScored;
      }
    });

    const totalShots = totalShotsSaved + totalShotsScored;
    const totalDekes = totalDekesSaved + totalDekesScored;

    return {
      totalShootouts,
      winRate: totalShootouts > 0 ? (wins / totalShootouts) * 100 : 0,
      shotSavePercentage: totalShots > 0 ? (totalShotsSaved / totalShots) * 100 : 0,
      dekeSavePercentage: totalDekes > 0 ? (totalDekesSaved / totalDekes) * 100 : 0,
      totalSaves: totalShotsSaved + totalDekesSaved,
      totalGoalsAgainst: totalShotsScored + totalDekesScored,
    };
  }

  // ==================== ADMIN OPERATIONS ====================

  /**
   * Gets all students with their summary stats for admin dashboard
   */
  async getAllStudentsSummary(): Promise<ApiResponse<StudentSummary[]>> {
    // This would need to be implemented with proper admin permissions
    // Placeholder for now
    return {
      success: true,
      data: [],
      timestamp: new Date()
    };
  }

  /**
   * Gets cohort-wide analytics for admin dashboard
   */
  async getCohortAnalytics(): Promise<ApiResponse<CohortAnalytics>> {
    // Placeholder for cohort analytics
    return {
      success: true,
      data: {
        totalStudents: 0,
        activeStudents: 0,
        averageCompletionRate: 0,
        totalSessionsThisWeek: 0,
        totalSessionsThisMonth: 0,
        topPerformers: [],
        needsAttention: [],
      },
      timestamp: new Date()
    };
  }
}

// Export singleton instance
export const chartingService = new ChartingService();

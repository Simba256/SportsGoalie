import { BaseDatabaseService } from '../base.service';
import { quizService } from './quiz.service';
import { sportsService } from './sports.service';
import { userService } from './user.service';
import {
  ApiResponse,
  QuizAttempt,
  SportProgress,
  SkillProgress,
  QueryOptions
} from '@/types';
import { logger } from '../../utils/logger';

export interface StudentAnalytics {
  userId: string;
  overview: {
    totalTimeSpent: number; // in minutes
    activeDays: number;
    lastActiveDate: Date | null;
    totalSportsEnrolled: number;
    totalSkillsStarted: number;
    totalQuizzesTaken: number;
  };
  performance: {
    averageQuizScore: number;
    bestQuizScore: number;
    worstQuizScore: number;
    totalQuizzesPassed: number;
    totalQuizzesFailed: number;
    passRate: number;
  };
  progress: {
    sportsCompleted: number;
    sportsInProgress: number;
    skillsCompleted: number;
    skillsInProgress: number;
    completionRate: number;
  };
  engagement: {
    currentStreak: number;
    longestStreak: number;
    averageSessionDuration: number; // in minutes
    studyPattern: 'morning' | 'afternoon' | 'evening' | 'night' | 'varied';
  };
  recentActivity: ActivityRecord[];
}

export interface ActivityRecord {
  id: string;
  type: 'quiz_completed' | 'skill_started' | 'skill_completed' | 'sport_enrolled' | 'achievement_unlocked';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface QuizPerformanceData {
  quizId: string;
  quizTitle: string;
  sportName: string;
  skillName: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  timeSpent: number;
  passed: boolean;
  lastAttempt: Date;
}

export interface ProgressOverTimeData {
  date: string;
  skillsCompleted: number;
  quizzesTaken: number;
  averageScore: number;
  timeSpent: number;
}

export interface SkillPerformanceData {
  skillId: string;
  skillName: string;
  sportName: string;
  progress: number;
  timeSpent: number;
  quizScore: number | null;
  status: 'not_started' | 'in_progress' | 'completed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * Service for comprehensive student analytics and reporting.
 * Provides detailed insights into student performance, progress, and engagement.
 */
export class StudentAnalyticsService extends BaseDatabaseService {
  /**
   * Get comprehensive analytics for a specific student
   */
  async getStudentAnalytics(userId: string): Promise<ApiResponse<StudentAnalytics>> {
    logger.info('Fetching student analytics', 'StudentAnalyticsService', { userId });

    try {
      const [
        sportsProgress,
        quizAttempts,
        skillProgress,
        userProgress
      ] = await Promise.all([
        this.query<SportProgress>('sport_progress', {
          where: [{ field: 'userId', operator: '==', value: userId }]
        }),
        // Query quiz attempts - filter by status='submitted' OR isCompleted=true for compatibility
        this.query<QuizAttempt>('quiz_attempts', {
          where: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'submitted' }
          ]
        }),
        this.query<SkillProgress>('skill_progress', {
          where: [{ field: 'userId', operator: '==', value: userId }]
        }),
        userService.getUserProgress(userId)
      ]);

      const sports = sportsProgress.data?.items || [];
      const quizzes = quizAttempts.data?.items || [];
      const skills = skillProgress.data?.items || [];
      const progress = userProgress.data;

      // Initialize default user progress if it doesn't exist
      if (!progress) {
        logger.warn('User progress not found, using defaults', 'StudentAnalyticsService', { userId });
      }

      // Calculate overview metrics
      const totalTimeSpent = progress?.overallStats.totalTimeSpent || 0;
      const activeDaysSet = new Set<string>();

      // Track active days from quiz attempts
      quizzes.forEach(quiz => {
        if (quiz.submittedAt) {
          const date = quiz.submittedAt.toDate ? quiz.submittedAt.toDate() : new Date(quiz.submittedAt);
          activeDaysSet.add(date.toISOString().split('T')[0]);
        }
      });

      // Find last active date
      const lastActiveDate = quizzes.length > 0
        ? new Date(Math.max(...quizzes.map(q => {
            const date = q.submittedAt?.toDate ? q.submittedAt.toDate() : new Date(q.submittedAt || 0);
            return date.getTime();
          })))
        : null;

      // Calculate performance metrics
      const quizScores = quizzes.map(q => q.percentage);
      const averageQuizScore = quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;
      const bestQuizScore = quizScores.length > 0 ? Math.max(...quizScores) : 0;
      const worstQuizScore = quizScores.length > 0 ? Math.min(...quizScores) : 0;
      const passedQuizzes = quizzes.filter(q => q.passed).length;
      const failedQuizzes = quizzes.filter(q => !q.passed).length;
      const passRate = quizzes.length > 0
        ? Math.round((passedQuizzes / quizzes.length) * 100)
        : 0;

      // Calculate progress metrics
      const sportsCompleted = sports.filter(s => s.status === 'completed').length;
      const sportsInProgress = sports.filter(s => s.status === 'in_progress').length;
      const skillsCompleted = skills.filter(s => s.status === 'completed').length;
      const skillsInProgress = skills.filter(s => s.status === 'in_progress').length;
      const totalItems = sports.length + skills.length;
      const completedItems = sportsCompleted + skillsCompleted;
      const completionRate = totalItems > 0
        ? Math.round((completedItems / totalItems) * 100)
        : 0;

      // Calculate engagement metrics
      const currentStreak = progress?.overallStats.currentStreak || 0;
      const longestStreak = progress?.overallStats.longestStreak || 0;
      const totalSessions = activeDaysSet.size || 1;
      const averageSessionDuration = Math.round(totalTimeSpent / totalSessions);

      // Determine study pattern based on quiz submission times
      const studyPattern = this.determineStudyPattern(quizzes);

      // Build recent activity
      const recentActivity = await this.buildRecentActivity(userId, quizzes, skills, sports);

      const analytics: StudentAnalytics = {
        userId,
        overview: {
          totalTimeSpent,
          activeDays: activeDaysSet.size,
          lastActiveDate,
          totalSportsEnrolled: sports.length,
          totalSkillsStarted: skills.length,
          totalQuizzesTaken: quizzes.length,
        },
        performance: {
          averageQuizScore,
          bestQuizScore,
          worstQuizScore,
          totalQuizzesPassed: passedQuizzes,
          totalQuizzesFailed: failedQuizzes,
          passRate,
        },
        progress: {
          sportsCompleted,
          sportsInProgress,
          skillsCompleted,
          skillsInProgress,
          completionRate,
        },
        engagement: {
          currentStreak,
          longestStreak,
          averageSessionDuration,
          studyPattern,
        },
        recentActivity,
      };

      return {
        success: true,
        data: analytics,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch student analytics', 'StudentAnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'ANALYTICS_FETCH_FAILED',
          message: 'Failed to fetch student analytics',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get quiz performance breakdown for a student
   */
  async getQuizPerformance(userId: string): Promise<ApiResponse<QuizPerformanceData[]>> {
    logger.info('Fetching quiz performance', 'StudentAnalyticsService', { userId });

    try {
      const attemptsResult = await this.query<QuizAttempt>('quiz_attempts', {
        where: [
          { field: 'userId', operator: '==', value: userId },
          { field: 'status', operator: '==', value: 'submitted' }
        ]
      });

      const attempts = attemptsResult.data?.items || [];

      // Group attempts by quiz
      const quizMap = new Map<string, QuizAttempt[]>();
      attempts.forEach(attempt => {
        if (!quizMap.has(attempt.quizId)) {
          quizMap.set(attempt.quizId, []);
        }
        quizMap.get(attempt.quizId)!.push(attempt);
      });

      // Build performance data
      const performanceData: QuizPerformanceData[] = [];

      for (const [quizId, quizAttempts] of quizMap.entries()) {
        const quiz = await quizService.getQuiz(quizId);
        const skill = quiz.data?.skillId ? await sportsService.getSkill(quiz.data.skillId) : null;
        const sport = quiz.data?.sportId ? await sportsService.getSport(quiz.data.sportId) : null;

        const scores = quizAttempts.map(a => a.percentage);
        const times = quizAttempts.map(a => a.timeSpent);
        const lastAttempt = quizAttempts.reduce((latest, current) => {
          const currentDate = current.submittedAt?.toDate ? current.submittedAt.toDate() : new Date(current.submittedAt || 0);
          const latestDate = latest.submittedAt?.toDate ? latest.submittedAt.toDate() : new Date(latest.submittedAt || 0);
          return currentDate > latestDate ? current : latest;
        });

        performanceData.push({
          quizId,
          quizTitle: quiz.data?.title || 'Unknown Quiz',
          sportName: sport?.data?.name || 'Unknown Sport',
          skillName: skill?.data?.name || 'Unknown Skill',
          attempts: quizAttempts.length,
          bestScore: Math.max(...scores),
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          timeSpent: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
          passed: lastAttempt.passed,
          lastAttempt: lastAttempt.submittedAt?.toDate ? lastAttempt.submittedAt.toDate() : new Date(lastAttempt.submittedAt || 0),
        });
      }

      // Sort by last attempt date (most recent first)
      performanceData.sort((a, b) => b.lastAttempt.getTime() - a.lastAttempt.getTime());

      return {
        success: true,
        data: performanceData,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch quiz performance', 'StudentAnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'QUIZ_PERFORMANCE_FAILED',
          message: 'Failed to fetch quiz performance',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get progress over time data for charts
   */
  async getProgressOverTime(userId: string, days: number = 30): Promise<ApiResponse<ProgressOverTimeData[]>> {
    logger.info('Fetching progress over time', 'StudentAnalyticsService', { userId, days });

    try {
      const [quizAttemptsResult, skillProgressResult] = await Promise.all([
        this.query<QuizAttempt>('quiz_attempts', {
          where: [
            { field: 'userId', operator: '==', value: userId },
            { field: 'status', operator: '==', value: 'submitted' }
          ]
        }),
        this.query<SkillProgress>('skill_progress', {
          where: [{ field: 'userId', operator: '==', value: userId }]
        })
      ]);

      const quizAttempts = quizAttemptsResult.data?.items || [];
      const skillProgress = skillProgressResult.data?.items || [];

      // Build data for each day
      const progressData: ProgressOverTimeData[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        // Quizzes taken on this day
        const dayQuizzes = quizAttempts.filter(q => {
          const attemptDate = q.submittedAt?.toDate ? q.submittedAt.toDate() : new Date(q.submittedAt || 0);
          return attemptDate.toISOString().split('T')[0] === dateStr;
        });

        // Skills completed on or before this day
        const skillsCompletedByDate = skillProgress.filter(s => {
          if (s.status !== 'completed' || !s.completedAt) return false;
          const completedDate = s.completedAt.toDate ? s.completedAt.toDate() : new Date(s.completedAt);
          return completedDate.toISOString().split('T')[0] <= dateStr;
        }).length;

        const avgScore = dayQuizzes.length > 0
          ? Math.round(dayQuizzes.reduce((sum, q) => sum + q.percentage, 0) / dayQuizzes.length)
          : 0;

        const timeSpent = dayQuizzes.reduce((sum, q) => sum + (q.timeSpent || 0), 0);

        progressData.push({
          date: dateStr,
          skillsCompleted: skillsCompletedByDate,
          quizzesTaken: dayQuizzes.length,
          averageScore: avgScore,
          timeSpent: Math.round(timeSpent / 60), // Convert to hours
        });
      }

      return {
        success: true,
        data: progressData,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch progress over time', 'StudentAnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'PROGRESS_OVER_TIME_FAILED',
          message: 'Failed to fetch progress over time',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get skill performance breakdown
   */
  async getSkillPerformance(userId: string): Promise<ApiResponse<SkillPerformanceData[]>> {
    logger.info('Fetching skill performance', 'StudentAnalyticsService', { userId });

    try {
      const skillProgressResult = await this.query<SkillProgress>('skill_progress', {
        where: [{ field: 'userId', operator: '==', value: userId }]
      });

      const skillProgress = skillProgressResult.data?.items || [];
      const performanceData: SkillPerformanceData[] = [];

      for (const progress of skillProgress) {
        const [skill, sport] = await Promise.all([
          sportsService.getSkill(progress.skillId),
          sportsService.getSport(progress.sportId)
        ]);

        performanceData.push({
          skillId: progress.skillId,
          skillName: skill.data?.name || 'Unknown Skill',
          sportName: sport.data?.name || 'Unknown Sport',
          progress: progress.progressPercentage,
          timeSpent: Math.round(progress.timeSpent / 60), // Convert to hours
          quizScore: progress.quizScore || null,
          status: progress.status,
          difficulty: skill.data?.difficulty || 'beginner',
        });
      }

      // Sort by progress percentage (descending)
      performanceData.sort((a, b) => b.progress - a.progress);

      return {
        success: true,
        data: performanceData,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to fetch skill performance', 'StudentAnalyticsService', error);
      return {
        success: false,
        error: {
          code: 'SKILL_PERFORMANCE_FAILED',
          message: 'Failed to fetch skill performance',
        },
        timestamp: new Date(),
      };
    }
  }

  // Private helper methods

  private determineStudyPattern(quizAttempts: QuizAttempt[]): 'morning' | 'afternoon' | 'evening' | 'night' | 'varied' {
    if (quizAttempts.length === 0) return 'varied';

    const hourCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    quizAttempts.forEach(attempt => {
      const date = attempt.submittedAt?.toDate ? attempt.submittedAt.toDate() : new Date(attempt.submittedAt || 0);
      const hour = date.getHours();

      if (hour >= 6 && hour < 12) hourCounts.morning++;
      else if (hour >= 12 && hour < 17) hourCounts.afternoon++;
      else if (hour >= 17 && hour < 22) hourCounts.evening++;
      else hourCounts.night++;
    });

    const total = quizAttempts.length;
    const threshold = total * 0.5; // 50% threshold for pattern

    if (hourCounts.morning >= threshold) return 'morning';
    if (hourCounts.afternoon >= threshold) return 'afternoon';
    if (hourCounts.evening >= threshold) return 'evening';
    if (hourCounts.night >= threshold) return 'night';

    return 'varied';
  }

  private async buildRecentActivity(
    userId: string,
    quizzes: QuizAttempt[],
    skills: SkillProgress[],
    sports: SportProgress[]
  ): Promise<ActivityRecord[]> {
    const activities: ActivityRecord[] = [];

    // Add quiz completions
    const recentQuizzes = quizzes
      .sort((a, b) => {
        const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
        const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5);

    for (const quiz of recentQuizzes) {
      const quizData = await quizService.getQuiz(quiz.quizId);
      activities.push({
        id: quiz.id,
        type: 'quiz_completed',
        title: `Completed ${quizData.data?.title || 'Quiz'}`,
        description: `Score: ${quiz.percentage}% ${quiz.passed ? '✓ Passed' : '✗ Failed'}`,
        timestamp: quiz.submittedAt?.toDate ? quiz.submittedAt.toDate() : new Date(quiz.submittedAt || 0),
        metadata: {
          score: quiz.percentage,
          passed: quiz.passed,
        },
      });
    }

    // Add skill completions
    const completedSkills = skills
      .filter(s => s.status === 'completed' && s.completedAt)
      .sort((a, b) => {
        const dateA = a.completedAt?.toDate ? a.completedAt.toDate() : new Date(a.completedAt || 0);
        const dateB = b.completedAt?.toDate ? b.completedAt.toDate() : new Date(b.completedAt || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 3);

    for (const skill of completedSkills) {
      const skillData = await sportsService.getSkill(skill.skillId);
      activities.push({
        id: skill.id,
        type: 'skill_completed',
        title: `Completed ${skillData.data?.name || 'Skill'}`,
        description: `Finished in ${Math.round(skill.timeSpent / 60)} hours`,
        timestamp: skill.completedAt?.toDate ? skill.completedAt.toDate() : new Date(skill.completedAt || 0),
      });
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return activities.slice(0, 10); // Return top 10 most recent
  }
}

// Export singleton instance
export const studentAnalyticsService = new StudentAnalyticsService();

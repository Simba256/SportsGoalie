import { BaseDatabaseService } from '../base.service';
import {
  DynamicStudentAnalytics,
  DynamicChartingEntry,
  FormTemplate,
  FormField,
  FieldAnalyticsResult,
  CategoryAnalyticsResult,
  TrendDirection,
  ApiResponse,
  AnalyticsQueryOptions,
} from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { formTemplateService } from './form-template.service';
import { dynamicChartingService } from './dynamic-charting.service';

/**
 * Service for calculating analytics from dynamic form responses
 * Supports multiple analytics types: percentage, average, sum, trend, distribution, etc.
 */
export class DynamicAnalyticsService extends BaseDatabaseService {
  private readonly ANALYTICS_COLLECTION = 'dynamic_charting_analytics';
  private readonly CALCULATION_VERSION = 1; // Increment when algorithm changes

  // ==================== MAIN ANALYTICS CALCULATION ====================

  /**
   * Recalculates all analytics for a student based on their entries
   */
  async recalculateStudentAnalytics(
    studentId: string,
    templateId: string,
    options: AnalyticsQueryOptions = {}
  ): Promise<ApiResponse<DynamicStudentAnalytics>> {
    logger.info('Recalculating student analytics', 'DynamicAnalyticsService', {
      studentId,
      templateId,
    });

    try {
      // Get template
      const templateResult = await formTemplateService.getTemplate(templateId);
      if (!templateResult.success || !templateResult.data) {
        return {
          success: false,
          message: 'Template not found',
          error: {
            code: 'TEMPLATE_NOT_FOUND',
            message: 'Form template does not exist',
          },
          timestamp: new Date(),
        };
      }

      const template = templateResult.data;

      // Get all entries for this student and template
      const entriesResult = await dynamicChartingService.getDynamicEntriesByStudent(
        studentId,
        templateId
      );

      if (!entriesResult.success || !entriesResult.data) {
        return {
          success: false,
          message: 'Failed to fetch entries',
          error: {
            code: 'ENTRIES_FETCH_ERROR',
            message: 'Could not retrieve student entries',
          },
          timestamp: new Date(),
        };
      }

      let entries = entriesResult.data;

      // Apply date filters if provided
      if (options.dateFrom || options.dateTo) {
        entries = this.filterEntriesByDate(entries, options.dateFrom, options.dateTo);
      }

      // Filter by completion if specified
      if (!options.includePartialEntries) {
        entries = entries.filter((e) => e.isComplete);
      }

      // Calculate analytics
      const analytics = await this.calculateAnalytics(studentId, template, entries);

      // Save to database
      const analyticsId = `${studentId}_${templateId}`;
      await this.createWithId(this.ANALYTICS_COLLECTION, analyticsId, analytics);

      logger.info('Student analytics calculated successfully', 'DynamicAnalyticsService', {
        studentId,
        templateId,
        entriesAnalyzed: entries.length,
      });

      return {
        success: true,
        data: analytics,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error calculating student analytics', error, 'DynamicAnalyticsService');
      return {
        success: false,
        message: 'Failed to calculate analytics',
        error: {
          code: 'CALCULATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Gets cached analytics for a student
   */
  async getStudentAnalytics(
    studentId: string,
    templateId: string
  ): Promise<ApiResponse<DynamicStudentAnalytics>> {
    const analyticsId = `${studentId}_${templateId}`;
    return await this.getById<DynamicStudentAnalytics>(this.ANALYTICS_COLLECTION, analyticsId);
  }

  // ==================== ANALYTICS CALCULATION LOGIC ====================

  /**
   * Main analytics calculation function
   */
  private async calculateAnalytics(
    studentId: string,
    template: FormTemplate,
    entries: DynamicChartingEntry[]
  ): Promise<Omit<DynamicStudentAnalytics, 'id' | 'createdAt' | 'updatedAt'>> {
    // Session stats
    const sessionStats = this.calculateSessionStats(entries);

    // Streak data
    const streak = this.calculateStreak(entries);

    // Field-level analytics
    const fieldAnalytics: { [fieldId: string]: FieldAnalyticsResult } = {};
    const categoryAnalytics: { [category: string]: CategoryAnalyticsResult } = {};

    // Process each section and field
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.analytics.enabled && field.analytics.type !== 'none') {
          const fieldResult = this.calculateFieldAnalytics(
            field,
            section.id,
            entries,
            section.isRepeatable
          );

          if (fieldResult) {
            fieldAnalytics[field.id] = fieldResult;

            // Group by category
            if (field.analytics.category) {
              if (!categoryAnalytics[field.analytics.category]) {
                categoryAnalytics[field.analytics.category] = {
                  category: field.analytics.category,
                  fields: [],
                  fieldCount: 0,
                  overallScore: 0,
                  trend: 'stable',
                  fieldResults: [],
                  topPerformingFields: [],
                  needsImprovementFields: [],
                };
              }

              categoryAnalytics[field.analytics.category].fields.push(field.id);
              categoryAnalytics[field.analytics.category].fieldResults.push(fieldResult);
            }
          }
        }
      }
    }

    // Calculate category-level metrics
    for (const category in categoryAnalytics) {
      const categoryData = categoryAnalytics[category];
      categoryData.fieldCount = categoryData.fields.length;

      // Calculate overall score (average of all field scores)
      const scores = categoryData.fieldResults
        .map((fr) => this.getFieldScore(fr))
        .filter((s) => s !== null) as number[];

      if (scores.length > 0) {
        categoryData.overallScore =
          scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }

      // Determine category trend (majority trend)
      const trends = categoryData.fieldResults
        .map((fr) => fr.percentageTrend || fr.averageTrend)
        .filter((t) => t !== undefined) as TrendDirection[];

      categoryData.trend = this.getMajorityTrend(trends);

      // Identify top and struggling fields
      const fieldScores = categoryData.fieldResults.map((fr, idx) => ({
        fieldLabel: fr.fieldLabel,
        score: this.getFieldScore(fr) || 0,
      }));

      fieldScores.sort((a, b) => b.score - a.score);
      categoryData.topPerformingFields = fieldScores.slice(0, 3).map((f) => f.fieldLabel);
      categoryData.needsImprovementFields = fieldScores
        .slice(-3)
        .reverse()
        .map((f) => f.fieldLabel);
    }

    // Overall performance
    const allScores = Object.values(fieldAnalytics)
      .map((fa) => this.getFieldScore(fa))
      .filter((s) => s !== null) as number[];

    const overallPerformanceScore =
      allScores.length > 0 ? allScores.reduce((sum, s) => sum + s, 0) / allScores.length : 0;

    // Overall trend
    const allTrends = Object.values(fieldAnalytics)
      .map((fa) => fa.percentageTrend || fa.averageTrend)
      .filter((t) => t !== undefined) as TrendDirection[];

    const overallTrend = this.getMajorityTrend(allTrends);

    // Top strengths and areas for improvement
    const fieldScores = Object.values(fieldAnalytics).map((fa) => ({
      label: fa.fieldLabel,
      score: this.getFieldScore(fa) || 0,
    }));

    fieldScores.sort((a, b) => b.score - a.score);
    const topStrengths = fieldScores.slice(0, 5).map((f) => f.label);
    const areasForImprovement = fieldScores
      .slice(-5)
      .reverse()
      .map((f) => f.label);

    return {
      studentId,
      formTemplateId: template.id,
      formTemplateName: template.name,
      sessionStats,
      streak,
      fieldAnalytics,
      categoryAnalytics,
      overallPerformanceScore,
      overallTrend,
      topStrengths,
      areasForImprovement,
      lastCalculated: Timestamp.now(),
      calculationVersion: this.CALCULATION_VERSION,
    };
  }

  // ==================== FIELD ANALYTICS CALCULATION ====================

  /**
   * Calculates analytics for a single field
   */
  private calculateFieldAnalytics(
    field: FormField,
    sectionId: string,
    entries: DynamicChartingEntry[],
    isRepeatable?: boolean
  ): FieldAnalyticsResult | null {
    // Extract values for this field from all entries
    const values = this.extractFieldValues(field.id, sectionId, entries, isRepeatable);

    if (values.length === 0) {
      return null;
    }

    const result: FieldAnalyticsResult = {
      fieldId: field.id,
      fieldLabel: field.analytics.displayName || field.label,
      fieldType: field.type,
      analyticsType: field.analytics.type,
      category: field.analytics.category,
      dataPoints: values.length,
    };

    // Calculate based on analytics type
    switch (field.analytics.type) {
      case 'percentage':
        this.calculatePercentageAnalytics(result, values, field);
        break;

      case 'average':
        this.calculateAverageAnalytics(result, values, field);
        break;

      case 'sum':
        this.calculateSumAnalytics(result, values);
        break;

      case 'distribution':
        this.calculateDistributionAnalytics(result, values);
        break;

      case 'consistency':
        this.calculateConsistencyAnalytics(result, values);
        break;

      case 'trend':
        this.calculateTrendAnalytics(result, values, field);
        break;

      case 'count':
        this.calculateCountAnalytics(result, values);
        break;
    }

    // Target tracking
    if (field.analytics.targetValue !== undefined) {
      const currentValue = result.percentage || result.average || 0;
      result.targetValue = field.analytics.targetValue;
      result.targetProgress = Math.min(100, (currentValue / field.analytics.targetValue) * 100);
      result.isOnTarget = currentValue >= field.analytics.targetValue;
    }

    return result;
  }

  /**
   * Percentage analytics (for yes/no fields)
   */
  private calculatePercentageAnalytics(
    result: FieldAnalyticsResult,
    values: any[],
    field: FormField
  ): void {
    const trueValues = values.filter((v) => v === true || v === 'true').length;
    result.percentage = Math.round((trueValues / values.length) * 100);

    // Calculate trend (recent vs older)
    const recentCount = Math.min(5, values.length);
    const recentValues = values.slice(0, recentCount);
    const olderValues = values.slice(recentCount, recentCount * 2);

    if (olderValues.length > 0) {
      const recentPercent =
        (recentValues.filter((v) => v === true || v === 'true').length / recentValues.length) *
        100;
      const olderPercent =
        (olderValues.filter((v) => v === true || v === 'true').length / olderValues.length) * 100;

      const higherIsBetter = field.analytics.higherIsBetter !== false;
      result.percentageTrend = this.determineTrend(recentPercent, olderPercent, higherIsBetter);
    }
  }

  /**
   * Average analytics (for numeric/scale fields)
   */
  private calculateAverageAnalytics(
    result: FieldAnalyticsResult,
    values: any[],
    field: FormField
  ): void {
    const numericValues = values.map(Number).filter((n) => !isNaN(n));

    if (numericValues.length === 0) return;

    result.average = this.round(
      numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length,
      2
    );
    result.min = Math.min(...numericValues);
    result.max = Math.max(...numericValues);

    // Median
    const sorted = [...numericValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    result.median =
      sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

    // Trend
    const recentCount = Math.min(5, numericValues.length);
    const recentValues = numericValues.slice(0, recentCount);
    const olderValues = numericValues.slice(recentCount, recentCount * 2);

    if (olderValues.length > 0) {
      result.recentAverage = this.round(
        recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length,
        2
      );
      result.olderAverage = this.round(
        olderValues.reduce((sum, v) => sum + v, 0) / olderValues.length,
        2
      );

      const higherIsBetter = field.analytics.higherIsBetter !== false;
      result.averageTrend = this.determineTrend(
        result.recentAverage,
        result.olderAverage,
        higherIsBetter
      );

      result.improvementRate = this.round(
        ((result.recentAverage - result.olderAverage) / result.olderAverage) * 100,
        1
      );
    }
  }

  /**
   * Sum analytics
   */
  private calculateSumAnalytics(result: FieldAnalyticsResult, values: any[]): void {
    const numericValues = values.map(Number).filter((n) => !isNaN(n));
    result.sum = numericValues.reduce((sum, v) => sum + v, 0);
  }

  /**
   * Distribution analytics (for radio/checkbox fields)
   */
  private calculateDistributionAnalytics(result: FieldAnalyticsResult, values: any[]): void {
    const distribution: { [option: string]: { count: number; percentage: number } } = {};

    // Flatten array values (for checkbox fields)
    const flatValues = values.flatMap((v) => (Array.isArray(v) ? v : [v]));

    // Count occurrences
    flatValues.forEach((value) => {
      const key = String(value);
      if (!distribution[key]) {
        distribution[key] = { count: 0, percentage: 0 };
      }
      distribution[key].count++;
    });

    // Calculate percentages
    const total = flatValues.length;
    Object.keys(distribution).forEach((key) => {
      distribution[key].percentage = Math.round((distribution[key].count / total) * 100);
    });

    result.distribution = distribution;

    // Most common option
    let maxCount = 0;
    let mostCommon = '';
    Object.entries(distribution).forEach(([key, data]) => {
      if (data.count > maxCount) {
        maxCount = data.count;
        mostCommon = key;
      }
    });

    result.mostCommon = mostCommon;
  }

  /**
   * Consistency analytics
   */
  private calculateConsistencyAnalytics(result: FieldAnalyticsResult, values: any[]): void {
    const numericValues = values.map(Number).filter((n) => !isNaN(n));

    if (numericValues.length < 2) {
      result.consistencyScore = 100;
      return;
    }

    // Calculate standard deviation
    const mean = numericValues.reduce((sum, v) => sum + v, 0) / numericValues.length;
    const squareDiffs = numericValues.map((v) => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, v) => sum + v, 0) / numericValues.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    result.standardDeviation = this.round(stdDev, 2);

    // Consistency score (lower std dev = higher consistency)
    // Normalize to 0-100 scale (assuming max std dev of mean/2 = 0% consistency)
    const maxStdDev = mean / 2;
    result.consistencyScore = Math.round(Math.max(0, (1 - stdDev / maxStdDev) * 100));
  }

  /**
   * Trend analytics
   */
  private calculateTrendAnalytics(
    result: FieldAnalyticsResult,
    values: any[],
    field: FormField
  ): void {
    const numericValues = values.map(Number).filter((n) => !isNaN(n));

    if (numericValues.length < 2) return;

    const recentCount = Math.min(5, numericValues.length);
    const recentAvg =
      numericValues.slice(0, recentCount).reduce((sum, v) => sum + v, 0) / recentCount;
    const olderAvg =
      numericValues.slice(recentCount).reduce((sum, v) => sum + v, 0) /
      (numericValues.length - recentCount);

    const higherIsBetter = field.analytics.higherIsBetter !== false;
    result.percentageTrend = this.determineTrend(recentAvg, olderAvg, higherIsBetter);
    result.average = this.round(recentAvg, 2);
  }

  /**
   * Count analytics
   */
  private calculateCountAnalytics(result: FieldAnalyticsResult, values: any[]): void {
    result.count = values.filter((v) => v !== null && v !== undefined && v !== '').length;
  }

  // ==================== HELPER METHODS ====================

  /**
   * Extracts field values from entries
   */
  private extractFieldValues(
    fieldId: string,
    sectionId: string,
    entries: DynamicChartingEntry[],
    isRepeatable?: boolean
  ): any[] {
    const values: any[] = [];

    entries.forEach((entry) => {
      const sectionData = entry.responses[sectionId];

      if (!sectionData) return;

      if (isRepeatable) {
        const sectionArray = sectionData as any[];
        sectionArray.forEach((instance) => {
          const fieldResponse = instance[fieldId];
          if (fieldResponse !== undefined) {
            const value = typeof fieldResponse === 'object' ? fieldResponse.value : fieldResponse;
            if (value !== null && value !== undefined && value !== '') {
              values.push(value);
            }
          }
        });
      } else {
        const sectionObj = sectionData as any;
        const fieldResponse = sectionObj[fieldId];
        if (fieldResponse !== undefined) {
          const value = typeof fieldResponse === 'object' ? fieldResponse.value : fieldResponse;
          if (value !== null && value !== undefined && value !== '') {
            values.push(value);
          }
        }
      }
    });

    return values;
  }

  /**
   * Calculates session statistics
   */
  private calculateSessionStats(entries: DynamicChartingEntry[]) {
    const totalSessions = entries.length;
    const completedSessions = entries.filter((e) => e.isComplete).length;
    const partialSessions = totalSessions - completedSessions;

    const completionRate =
      totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

    const avgCompletionPercentage =
      totalSessions > 0
        ? Math.round(
            entries.reduce((sum, e) => sum + e.completionPercentage, 0) / totalSessions
          )
        : 0;

    // Date calculations
    const sortedEntries = [...entries].sort(
      (a, b) => b.submittedAt.toMillis() - a.submittedAt.toMillis()
    );

    const firstSessionDate = sortedEntries[sortedEntries.length - 1]?.submittedAt;
    const lastSessionDate = sortedEntries[0]?.submittedAt;

    // Calculate averages
    let averageSessionsPerWeek = 0;
    let averageSessionsPerMonth = 0;

    if (firstSessionDate && lastSessionDate) {
      const daysDiff =
        (lastSessionDate.toMillis() - firstSessionDate.toMillis()) / (1000 * 60 * 60 * 24);

      if (daysDiff > 0) {
        averageSessionsPerWeek = this.round((totalSessions / daysDiff) * 7, 1);
        averageSessionsPerMonth = this.round((totalSessions / daysDiff) * 30, 1);
      }
    }

    return {
      totalSessions,
      completedSessions,
      partialSessions,
      completionRate,
      averageCompletionPercentage,
      firstSessionDate,
      lastSessionDate,
      averageSessionsPerWeek,
      averageSessionsPerMonth,
    };
  }

  /**
   * Calculates streak data
   */
  private calculateStreak(entries: DynamicChartingEntry[]) {
    const dates = entries
      .map((e) => {
        const date = e.submittedAt.toDate();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      })
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < dates.length; i++) {
      const currentDate = new Date(dates[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toISOString() === expectedDate.toISOString()) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      currentStreak,
      longestStreak,
      lastActiveDate: entries[0]?.submittedAt || Timestamp.now(),
      streakDates: dates,
    };
  }

  /**
   * Determines trend direction
   */
  private determineTrend(
    recentValue: number,
    olderValue: number,
    higherIsBetter: boolean
  ): TrendDirection {
    const threshold = 5; // 5% threshold for "stable"
    const diff = recentValue - olderValue;
    const percentDiff = (Math.abs(diff) / olderValue) * 100;

    if (percentDiff < threshold) {
      return 'stable';
    }

    if (higherIsBetter) {
      return diff > 0 ? 'improving' : 'declining';
    } else {
      return diff < 0 ? 'improving' : 'declining';
    }
  }

  /**
   * Gets majority trend from array of trends
   */
  private getMajorityTrend(trends: TrendDirection[]): TrendDirection {
    if (trends.length === 0) return 'stable';

    const counts = trends.reduce((acc, trend) => {
      acc[trend] = (acc[trend] || 0) + 1;
      return acc;
    }, {} as { [key in TrendDirection]?: number });

    let maxCount = 0;
    let majorityTrend: TrendDirection = 'stable';

    (Object.keys(counts) as TrendDirection[]).forEach((trend) => {
      if (counts[trend]! > maxCount) {
        maxCount = counts[trend]!;
        majorityTrend = trend;
      }
    });

    return majorityTrend;
  }

  /**
   * Converts field analytics to a 0-100 score
   */
  private getFieldScore(fieldAnalytics: FieldAnalyticsResult): number | null {
    if (fieldAnalytics.percentage !== undefined) {
      return fieldAnalytics.percentage;
    }

    if (fieldAnalytics.average !== undefined && fieldAnalytics.max !== undefined) {
      // Normalize to 0-100
      const range = fieldAnalytics.max - (fieldAnalytics.min || 0);
      if (range === 0) return 100;
      return Math.round(((fieldAnalytics.average - (fieldAnalytics.min || 0)) / range) * 100);
    }

    if (fieldAnalytics.consistencyScore !== undefined) {
      return fieldAnalytics.consistencyScore;
    }

    return null;
  }

  /**
   * Filters entries by date range
   */
  private filterEntriesByDate(
    entries: DynamicChartingEntry[],
    dateFrom?: Date,
    dateTo?: Date
  ): DynamicChartingEntry[] {
    return entries.filter((entry) => {
      const entryDate = entry.submittedAt.toDate();

      if (dateFrom && entryDate < dateFrom) {
        return false;
      }

      if (dateTo && entryDate > dateTo) {
        return false;
      }

      return true;
    });
  }

  /**
   * Rounds a number to specified decimal places
   */
  private round(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
}

// Export singleton instance
export const dynamicAnalyticsService = new DynamicAnalyticsService();

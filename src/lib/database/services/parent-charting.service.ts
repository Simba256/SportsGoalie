import { BaseDatabaseService } from '../base.service';
import {
  ParentChartEntry,
  ParentPreGameData,
  ParentPostGameData,
  ParentPeriodRatings,
  ApiResponse,
} from '@/types';
import {
  query,
  where,
  getDocs,
  collection,
} from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { db } from '../../firebase/config';

export class ParentChartingService extends BaseDatabaseService {
  private readonly COLLECTION = 'parent_charting_entries';

  async getChartBySession(
    sessionId: string,
    parentId: string
  ): Promise<ApiResponse<ParentChartEntry | null>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('sessionId', '==', sessionId),
        where('parentId', '==', parentId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { success: true, data: null, timestamp: new Date() };
      }
      const d = snapshot.docs[0];
      return {
        success: true,
        data: { id: d.id, ...d.data() } as ParentChartEntry,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get parent chart by session', 'ParentChartingService', error);
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to load parent chart', details: error },
        timestamp: new Date(),
      };
    }
  }

  async createChart(
    data: Omit<ParentChartEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.create<ParentChartEntry>(this.COLLECTION, data);
  }

  async updateSection(
    entryId: string,
    updates: {
      preGame?: ParentPreGameData;
      periods?: {
        period1?: ParentPeriodRatings;
        period2?: ParentPeriodRatings;
        period3?: ParentPeriodRatings;
      };
      postGame?: ParentPostGameData;
      completedSections: ('preGame' | 'periods' | 'postGame')[];
    }
  ): Promise<ApiResponse<void>> {
    return this.update<ParentChartEntry>(this.COLLECTION, entryId, updates);
  }

  async getChartsByStudent(
    studentId: string
  ): Promise<ApiResponse<ParentChartEntry[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() } as ParentChartEntry))
        .sort((a, b) => {
          const ta = (a.createdAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? 0;
          const tb = (b.createdAt as unknown as { toMillis?: () => number })?.toMillis?.() ?? 0;
          return tb - ta;
        });
      return { success: true, data: entries, timestamp: new Date() };
    } catch (error) {
      logger.error('Failed to get parent charts by student', 'ParentChartingService', error);
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to load parent charts', details: error },
        timestamp: new Date(),
      };
    }
  }

  async getChartsBySessionForAdmin(
    sessionId: string
  ): Promise<ApiResponse<ParentChartEntry[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('sessionId', '==', sessionId)
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(
        d => ({ id: d.id, ...d.data() } as ParentChartEntry)
      );
      return { success: true, data: entries, timestamp: new Date() };
    } catch (error) {
      logger.error('Failed to get parent charts for session', 'ParentChartingService', error);
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to load parent charts for session', details: error },
        timestamp: new Date(),
      };
    }
  }
}

export const parentChartingService = new ParentChartingService();

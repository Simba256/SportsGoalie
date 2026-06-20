import { BaseDatabaseService } from '../base.service';
import {
  CoachChartEntry,
  CoachPreGameData,
  CoachPostGameData,
  ApiResponse,
} from '@/types';
import {
  query,
  where,
  getDocs,
  collection,
  orderBy as firestoreOrderBy,
} from 'firebase/firestore';
import { logger } from '../../utils/logger';
import { db } from '../../firebase/config';

export class CoachChartingService extends BaseDatabaseService {
  private readonly COLLECTION = 'coach_charting_entries';

  async getChartBySession(
    sessionId: string,
    coachId: string
  ): Promise<ApiResponse<CoachChartEntry | null>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('sessionId', '==', sessionId),
        where('coachId', '==', coachId)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return { success: true, data: null, timestamp: new Date() };
      }
      const d = snapshot.docs[0];
      return {
        success: true,
        data: { id: d.id, ...d.data() } as CoachChartEntry,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Failed to get coach chart by session', 'CoachChartingService', error);
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to load coach chart', details: error },
        timestamp: new Date(),
      };
    }
  }

  async createChart(
    data: Omit<CoachChartEntry, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    return this.create<CoachChartEntry>(this.COLLECTION, data);
  }

  async updateSection(
    entryId: string,
    updates: {
      preGame?: CoachPreGameData;
      periods?: CoachChartEntry['periods'];
      postGame?: CoachPostGameData;
      completedSections: ('preGame' | 'periods' | 'postGame')[];
    }
  ): Promise<ApiResponse<void>> {
    return this.update<CoachChartEntry>(this.COLLECTION, entryId, updates);
  }

  async getChartsByStudent(
    studentId: string,
    coachId: string
  ): Promise<ApiResponse<CoachChartEntry[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('studentId', '==', studentId),
        where('coachId', '==', coachId),
        firestoreOrderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map(
        d => ({ id: d.id, ...d.data() } as CoachChartEntry)
      );
      return { success: true, data: entries, timestamp: new Date() };
    } catch (error) {
      logger.error('Failed to get coach charts by student', 'CoachChartingService', error);
      return {
        success: false,
        error: { code: 'QUERY_FAILED', message: 'Failed to load coach charts', details: error },
        timestamp: new Date(),
      };
    }
  }
}

export const coachChartingService = new CoachChartingService();

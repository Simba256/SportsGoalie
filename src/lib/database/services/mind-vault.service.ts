import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BaseDatabaseService } from '../base.service';
import type {
  MindVaultEntry,
  CreateMindVaultEntryData,
  MindVaultCategory,
  MindVaultCategorySummary,
} from '@/types/mind-vault';
import type { ApiResponse } from '@/types';

export class MindVaultService extends BaseDatabaseService {
  private readonly COLLECTION = 'mind_vault_entries';

  /**
   * Get all entries for a student
   */
  async getEntriesByStudent(studentId: string): Promise<ApiResponse<MindVaultEntry[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('studentId', '==', studentId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MindVaultEntry[];

      return { success: true, data: entries, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: (error as Error).message },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Get entries for a specific category
   */
  async getEntriesByCategory(
    studentId: string,
    category: MindVaultCategory
  ): Promise<ApiResponse<MindVaultEntry[]>> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('studentId', '==', studentId),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const entries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MindVaultEntry[];

      return { success: true, data: entries, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: (error as Error).message },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Add a new entry to the Mind Vault
   */
  async addEntry(data: CreateMindVaultEntryData): Promise<ApiResponse<{ id: string }>> {
    console.log('[MindVaultService] addEntry called with:', { category: data.category, subcategory: data.subcategory });
    try {
      const result = await this.create<MindVaultEntry>(this.COLLECTION, data);
      console.log('[MindVaultService] addEntry result:', { success: result.success, error: result.error });
      return result;
    } catch (error) {
      console.error('[MindVaultService] addEntry error:', error);
      return {
        success: false,
        error: { code: 'CREATE_ERROR', message: (error as Error).message },
        timestamp: new Date(),
      };
    }
  }

  /**
   * Update an existing entry
   */
  async updateEntry(
    id: string,
    updates: Partial<Pick<MindVaultEntry, 'content' | 'subcategory'>>
  ): Promise<ApiResponse<void>> {
    return this.update<MindVaultEntry>(this.COLLECTION, id, updates);
  }

  /**
   * Delete an entry
   */
  async deleteEntry(id: string): Promise<ApiResponse<void>> {
    return this.delete(this.COLLECTION, id);
  }

  /**
   * Get summary counts per category for dashboard
   */
  async getCategorySummary(studentId: string): Promise<ApiResponse<MindVaultCategorySummary[]>> {
    try {
      const result = await this.getEntriesByStudent(studentId);
      if (!result.success || !result.data) {
        return { success: true, data: [], timestamp: new Date() };
      }

      const entries = result.data;
      const categoryMap = new Map<MindVaultCategory, { count: number; lastUpdated: Timestamp | null }>();

      for (const entry of entries) {
        const existing = categoryMap.get(entry.category);
        if (existing) {
          existing.count++;
          if (entry.createdAt && (!existing.lastUpdated || entry.createdAt.toMillis() > existing.lastUpdated.toMillis())) {
            existing.lastUpdated = entry.createdAt;
          }
        } else {
          categoryMap.set(entry.category, {
            count: 1,
            lastUpdated: entry.createdAt || null,
          });
        }
      }

      const summaries: MindVaultCategorySummary[] = [];
      categoryMap.forEach((value, key) => {
        summaries.push({
          category: key,
          entryCount: value.count,
          lastUpdated: value.lastUpdated,
        });
      });

      return { success: true, data: summaries, timestamp: new Date() };
    } catch (error) {
      return {
        success: false,
        error: { code: 'FETCH_ERROR', message: (error as Error).message },
        timestamp: new Date(),
      };
    }
  }
}

export const mindVaultService = new MindVaultService();

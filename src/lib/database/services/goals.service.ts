import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { BaseDatabaseService } from '../base.service';
import type { Goal, NewGoal } from '@/types/goals';
import type { ApiResponse } from '@/types';

type NewGoalRecord = NewGoal & { baselineValue: number };

/** Learning goals a goalie sets for themselves. One document per goal in `student_goals`. */
export class GoalsService extends BaseDatabaseService {
  private readonly COLLECTION = 'student_goals';

  private failure(error: unknown, fallbackCode: string, fallbackMessage: string) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code || fallbackCode)
        : fallbackCode;
    // Unlike the other collections this one needs its own Firestore rule. Say so in
    // words a tester can pass on, rather than surfacing the raw SDK message.
    const message = code.includes('permission-denied')
      ? 'Goals cannot be saved yet because the database has not been given permission for them. Please tell us and we will fix it.'
      : fallbackMessage;
    return { success: false as const, error: { code, message, details: error }, message, timestamp: new Date() };
  }

  private toGoal(id: string, data: DocumentData): Goal {
    const toDate = (value: unknown): Date | undefined =>
      value instanceof Timestamp ? value.toDate() : undefined;

    return {
      id,
      title: String(data.title ?? ''),
      description: String(data.description ?? ''),
      type: data.type,
      targetValue: Number(data.targetValue) || 0,
      currentValue: Number(data.currentValue) || 0,
      unit: String(data.unit ?? ''),
      deadline: toDate(data.deadline),
      priority: data.priority,
      isCompleted: data.isCompleted === true,
      createdAt: toDate(data.createdAt) ?? new Date(),
      baselineValue: Number(data.baselineValue) || 0,
    };
  }

  /** All of a goalie's goals, newest first. Sorted here so the query needs no composite index. */
  async getGoalsByStudent(studentId: string): Promise<ApiResponse<Goal[]>> {
    try {
      const snapshot = await getDocs(
        query(collection(db, this.COLLECTION), where('studentId', '==', studentId))
      );
      const goals = snapshot.docs
        .map((d) => this.toGoal(d.id, d.data()))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      return { success: true, data: goals, timestamp: new Date() };
    } catch (error) {
      console.warn('[GoalsService] getGoalsByStudent failed:', error);
      return this.failure(error, 'FETCH_ERROR', 'Your goals could not be loaded. Please refresh and try again.');
    }
  }

  async createGoal(studentId: string, goal: NewGoalRecord): Promise<ApiResponse<{ id: string }>> {
    try {
      return await this.create<Goal & { studentId: string }>(this.COLLECTION, {
        studentId,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        unit: goal.unit,
        // Left undefined when there is no deadline, so the field is omitted rather than null.
        deadline: goal.deadline,
        priority: goal.priority,
        isCompleted: goal.isCompleted,
        baselineValue: goal.baselineValue,
      });
    } catch (error) {
      console.warn('[GoalsService] createGoal failed:', error);
      return this.failure(error, 'CREATE_ERROR', 'Your goal could not be saved. Please try again.');
    }
  }

  /** Only what the page changes after creation: finishing a goal. */
  async updateGoal(
    id: string,
    updates: Partial<Pick<Goal, 'isCompleted' | 'currentValue'>>
  ): Promise<ApiResponse<void>> {
    try {
      return await this.update<Goal>(this.COLLECTION, id, updates);
    } catch (error) {
      console.warn('[GoalsService] updateGoal failed:', error);
      return this.failure(error, 'UPDATE_ERROR', 'Your goal could not be updated. Please try again.');
    }
  }

  async deleteGoal(id: string): Promise<ApiResponse<void>> {
    try {
      return await this.delete(this.COLLECTION, id);
    } catch (error) {
      console.warn('[GoalsService] deleteGoal failed:', error);
      return this.failure(error, 'DELETE_ERROR', 'Your goal could not be deleted. Please try again.');
    }
  }
}

export const goalsService = new GoalsService();

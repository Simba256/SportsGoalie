import { BaseDatabaseService } from '../base.service';
import { Lesson, LessonProgress, ApiResponse, PaginatedResponse } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { logger } from '@/lib/utils/logger';

/**
 * Lessons are admin-authored study material tied to a Skill. A Skill can have
 * many Lessons (and many Quizzes — handled by videoQuizService).
 *
 * Visibility rules for goalies:
 * - A lesson is only surfaced if the parent skill's `difficulty` is in the
 *   goalie's unlocked levels for that pillar. See ProgressService for the
 *   per-pillar level model.
 * - Within an unlocked level, all lessons with `isActive=true` and
 *   `status='published'` are returned.
 *
 * Progress:
 * - `markLessonViewed` is idempotent and records the first open of a lesson.
 * - `markLessonComplete` stamps completedAt. Completion bumps the parent
 *   skill_progress to at least 'in_progress' via ProgressService.
 */
export class LessonService extends BaseDatabaseService {
  private readonly LESSONS_COLLECTION = 'lessons';
  private readonly LESSON_PROGRESS_COLLECTION = 'lesson_progress';

  // ──────────────────────────────────────────────────────────────────────────
  // Admin CRUD
  // ──────────────────────────────────────────────────────────────────────────

  async createLesson(
    lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<{ id: string }>> {
    logger.database('create', this.LESSONS_COLLECTION, undefined, { skillId: lesson.skillId });
    return this.create<Lesson>(this.LESSONS_COLLECTION, lesson);
  }

  async getLesson(lessonId: string): Promise<ApiResponse<Lesson | null>> {
    return this.getById<Lesson>(this.LESSONS_COLLECTION, lessonId);
  }

  async updateLesson(
    lessonId: string,
    updates: Partial<Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<ApiResponse<void>> {
    return this.update<Lesson>(this.LESSONS_COLLECTION, lessonId, updates);
  }

  async deleteLesson(lessonId: string): Promise<ApiResponse<void>> {
    return this.delete(this.LESSONS_COLLECTION, lessonId);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Reads scoped to a Skill / Pillar
  // ──────────────────────────────────────────────────────────────────────────

  /** All active, published lessons for a skill, ordered by `order` ascending. */
  async getLessonsBySkill(skillId: string): Promise<ApiResponse<PaginatedResponse<Lesson>>> {
    return this.query<Lesson>(this.LESSONS_COLLECTION, {
      where: [
        { field: 'skillId', operator: '==', value: skillId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'order', direction: 'asc' }],
    });
  }

  /** All lessons (including drafts/inactive) for a skill — admin view. */
  async getAllLessonsBySkillForAdmin(skillId: string): Promise<ApiResponse<PaginatedResponse<Lesson>>> {
    return this.query<Lesson>(this.LESSONS_COLLECTION, {
      where: [{ field: 'skillId', operator: '==', value: skillId }],
      orderBy: [{ field: 'order', direction: 'asc' }],
    });
  }

  /** All active lessons for an entire pillar. */
  async getLessonsBySport(sportId: string): Promise<ApiResponse<PaginatedResponse<Lesson>>> {
    return this.query<Lesson>(this.LESSONS_COLLECTION, {
      where: [
        { field: 'sportId', operator: '==', value: sportId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'order', direction: 'asc' }],
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Per-user progress
  // ──────────────────────────────────────────────────────────────────────────

  private progressDocId(userId: string, lessonId: string): string {
    return `${userId}_${lessonId}`;
  }

  async getLessonProgress(
    userId: string,
    lessonId: string
  ): Promise<ApiResponse<LessonProgress | null>> {
    return this.getById<LessonProgress>(
      this.LESSON_PROGRESS_COLLECTION,
      this.progressDocId(userId, lessonId)
    );
  }

  /** All lesson-progress records for a user (optionally filtered to a pillar). */
  async getLessonProgressForUser(
    userId: string,
    options: { sportId?: string; skillId?: string } = {}
  ): Promise<ApiResponse<PaginatedResponse<LessonProgress>>> {
    const where: { field: string; operator: '=='; value: unknown }[] = [
      { field: 'userId', operator: '==', value: userId },
    ];
    if (options.sportId) where.push({ field: 'sportId', operator: '==', value: options.sportId });
    if (options.skillId) where.push({ field: 'skillId', operator: '==', value: options.skillId });

    return this.query<LessonProgress>(this.LESSON_PROGRESS_COLLECTION, { where });
  }

  /**
   * Idempotently record that the goalie has opened a lesson. Creates the
   * progress record if missing; otherwise bumps `lastAccessedAt`.
   */
  async markLessonViewed(userId: string, lesson: Lesson): Promise<ApiResponse<LessonProgress>> {
    const id = this.progressDocId(userId, lesson.id);
    const existing = await this.getById<LessonProgress>(this.LESSON_PROGRESS_COLLECTION, id);
    const now = Timestamp.now();

    if (existing.success && existing.data) {
      const patch: Partial<LessonProgress> = { lastAccessedAt: now };
      await this.update<LessonProgress>(this.LESSON_PROGRESS_COLLECTION, id, patch);
      return {
        success: true,
        data: { ...existing.data, ...patch },
        timestamp: new Date(),
      };
    }

    const record: Omit<LessonProgress, 'id'> = {
      userId,
      lessonId: lesson.id,
      skillId: lesson.skillId,
      sportId: lesson.sportId,
      timeSpentSeconds: 0,
      viewedAt: now,
      lastAccessedAt: now,
    };

    const created = await this.createWithId<LessonProgress>(
      this.LESSON_PROGRESS_COLLECTION,
      id,
      record
    );

    if (!created.success) {
      return {
        success: false,
        error: created.error,
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: { id, ...record },
      timestamp: new Date(),
    };
  }

  /**
   * Mark a lesson as complete and accumulate time spent. Does NOT update
   * skill/sport progress on its own — call ProgressService.recordLessonAttempt
   * to cascade skill + pillar rollups.
   */
  async markLessonComplete(
    userId: string,
    lesson: Lesson,
    addedTimeSeconds: number = 0
  ): Promise<ApiResponse<LessonProgress>> {
    const id = this.progressDocId(userId, lesson.id);
    const existingResult = await this.getById<LessonProgress>(this.LESSON_PROGRESS_COLLECTION, id);
    const now = Timestamp.now();

    if (!existingResult.success || !existingResult.data) {
      // Create fresh as already-complete
      const record: Omit<LessonProgress, 'id'> = {
        userId,
        lessonId: lesson.id,
        skillId: lesson.skillId,
        sportId: lesson.sportId,
        timeSpentSeconds: Math.max(0, addedTimeSeconds),
        viewedAt: now,
        completedAt: now,
        lastAccessedAt: now,
      };

      const created = await this.createWithId<LessonProgress>(
        this.LESSON_PROGRESS_COLLECTION,
        id,
        record
      );

      if (!created.success) {
        return { success: false, error: created.error, timestamp: new Date() };
      }

      return { success: true, data: { id, ...record }, timestamp: new Date() };
    }

    const existing = existingResult.data;
    const patch: Partial<LessonProgress> = {
      timeSpentSeconds: existing.timeSpentSeconds + Math.max(0, addedTimeSeconds),
      completedAt: existing.completedAt ?? now,
      lastAccessedAt: now,
    };

    await this.update<LessonProgress>(this.LESSON_PROGRESS_COLLECTION, id, patch);
    return {
      success: true,
      data: { ...existing, ...patch } as LessonProgress,
      timestamp: new Date(),
    };
  }
}

export const lessonService = new LessonService();

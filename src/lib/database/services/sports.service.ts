import { BaseDatabaseService } from '../base.service';
import {
  Sport,
  Skill,
  SportProgress,
  SkillProgress,
  ApiResponse,
  PaginatedResponse,
  QueryOptions,
  SearchFilters,
  DifficultyLevel,
} from '@/types';

export class SportsService extends BaseDatabaseService {
  private readonly SPORTS_COLLECTION = 'sports';
  private readonly SKILLS_COLLECTION = 'skills';
  private readonly SPORT_PROGRESS_COLLECTION = 'sport_progress';
  private readonly SKILL_PROGRESS_COLLECTION = 'skill_progress';

  // Sports CRUD operations
  async createSport(
    sport: Omit<Sport, 'id' | 'createdAt' | 'updatedAt' | 'skillsCount' | 'metadata'>
  ): Promise<ApiResponse<{ id: string }>> {
    const sportData = {
      ...sport,
      skillsCount: 0,
      metadata: {
        totalEnrollments: 0,
        totalCompletions: 0,
        averageRating: 0,
        totalRatings: 0,
        averageCompletionTime: 0,
      },
    };

    return this.create<Sport>(this.SPORTS_COLLECTION, sportData);
  }

  async getSport(sportId: string): Promise<ApiResponse<Sport | null>> {
    return this.getById<Sport>(this.SPORTS_COLLECTION, sportId);
  }

  async updateSport(
    sportId: string,
    updates: Partial<Omit<Sport, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>>
  ): Promise<ApiResponse<void>> {
    return this.update<Sport>(this.SPORTS_COLLECTION, sportId, updates);
  }

  async deleteSport(sportId: string): Promise<ApiResponse<void>> {
    // Check if sport has skills
    const skills = await this.getSkillsBySport(sportId);
    if (skills.data && skills.data.items.length > 0) {
      return {
        success: false,
        error: {
          code: 'SPORT_HAS_SKILLS',
          message: 'Cannot delete sport that has skills. Delete skills first.',
        },
        timestamp: new Date(),
      };
    }

    return this.delete(this.SPORTS_COLLECTION, sportId);
  }

  async getAllSports(options: QueryOptions & SearchFilters = {}): Promise<ApiResponse<PaginatedResponse<Sport>>> {
    const queryOptions: QueryOptions = {
      orderBy: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'order', direction: 'asc' },
        { field: 'name', direction: 'asc' },
      ],
      ...options,
    };

    // Add filters
    const whereClause = [
      { field: 'isActive', operator: '==' as const, value: true },
    ];

    if (options.difficulty && options.difficulty.length > 0) {
      whereClause.push({
        field: 'difficulty',
        operator: 'in' as const,
        value: options.difficulty,
      });
    }

    if (options.categories && options.categories.length > 0) {
      whereClause.push({
        field: 'category',
        operator: 'in' as const,
        value: options.categories,
      });
    }

    queryOptions.where = whereClause;

    return this.query<Sport>(this.SPORTS_COLLECTION, queryOptions);
  }

  async getFeaturedSports(limit: number = 6): Promise<ApiResponse<PaginatedResponse<Sport>>> {
    return this.query<Sport>(this.SPORTS_COLLECTION, {
      where: [
        { field: 'isActive', operator: '==', value: true },
        { field: 'isFeatured', operator: '==', value: true },
      ],
      orderBy: [{ field: 'order', direction: 'asc' }],
      limit,
    });
  }

  async searchSports(searchQuery: string, filters: SearchFilters = {}): Promise<ApiResponse<PaginatedResponse<Sport>>> {
    // For full-text search, this would integrate with Algolia or similar
    // For now, we'll do a simple name/description search
    const queryOptions: QueryOptions = {
      orderBy: [{ field: 'name', direction: 'asc' }],
      limit: filters.duration?.max || 50,
    };

    const whereClause = [
      { field: 'isActive', operator: '==' as const, value: true },
    ];

    if (filters.difficulty && filters.difficulty.length > 0) {
      whereClause.push({
        field: 'difficulty',
        operator: 'in' as const,
        value: filters.difficulty,
      });
    }

    if (filters.categories && filters.categories.length > 0) {
      whereClause.push({
        field: 'category',
        operator: 'in' as const,
        value: filters.categories,
      });
    }

    queryOptions.where = whereClause;

    const result = await this.query<Sport>(this.SPORTS_COLLECTION, queryOptions);

    // Client-side filtering for search query (in production, use proper search engine)
    if (result.success && result.data && searchQuery) {
      const filteredItems = result.data.items.filter(sport =>
        sport.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sport.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sport.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      result.data.items = filteredItems;
      result.data.total = filteredItems.length;
    }

    return result;
  }

  // Skills CRUD operations
  async createSkill(
    skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>
  ): Promise<ApiResponse<{ id: string }>> {
    const skillData = {
      ...skill,
      metadata: {
        totalCompletions: 0,
        averageCompletionTime: skill.estimatedTimeToComplete,
        averageRating: 0,
        totalRatings: 0,
        difficulty: skill.difficulty,
      },
    };

    const result = await this.create<Skill>(this.SKILLS_COLLECTION, skillData);

    if (result.success) {
      // Increment sport skills count
      await this.incrementField(this.SPORTS_COLLECTION, skill.sportId, 'skillsCount');
    }

    return result;
  }

  async getSkill(skillId: string): Promise<ApiResponse<Skill | null>> {
    return this.getById<Skill>(this.SKILLS_COLLECTION, skillId);
  }

  async updateSkill(
    skillId: string,
    updates: Partial<Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'metadata'>>
  ): Promise<ApiResponse<void>> {
    return this.update<Skill>(this.SKILLS_COLLECTION, skillId, updates);
  }

  async deleteSkill(skillId: string): Promise<ApiResponse<void>> {
    // Get skill to find sport ID
    const skillResult = await this.getSkill(skillId);
    if (!skillResult.success || !skillResult.data) {
      return {
        success: false,
        error: {
          code: 'SKILL_NOT_FOUND',
          message: 'Skill not found',
        },
        timestamp: new Date(),
      };
    }

    const result = await this.delete(this.SKILLS_COLLECTION, skillId);

    if (result.success) {
      // Decrement sport skills count
      await this.incrementField(this.SPORTS_COLLECTION, skillResult.data.sportId, 'skillsCount', -1);
    }

    return result;
  }

  async getSkillsBySport(
    sportId: string,
    options: QueryOptions = {}
  ): Promise<ApiResponse<PaginatedResponse<Skill>>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'sportId', operator: '==', value: sportId },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'order', direction: 'asc' }],
      ...options,
    };

    return this.query<Skill>(this.SKILLS_COLLECTION, queryOptions);
  }

  async getSkillsByDifficulty(
    sportId: string,
    difficulty: DifficultyLevel
  ): Promise<ApiResponse<PaginatedResponse<Skill>>> {
    return this.query<Skill>(this.SKILLS_COLLECTION, {
      where: [
        { field: 'sportId', operator: '==', value: sportId },
        { field: 'difficulty', operator: '==', value: difficulty },
        { field: 'isActive', operator: '==', value: true },
      ],
      orderBy: [{ field: 'order', direction: 'asc' }],
    });
  }

  async getSkillPrerequisites(skillId: string): Promise<ApiResponse<Skill[]>> {
    const skillResult = await this.getSkill(skillId);
    if (!skillResult.success || !skillResult.data) {
      return {
        success: false,
        error: {
          code: 'SKILL_NOT_FOUND',
          message: 'Skill not found',
        },
        timestamp: new Date(),
      };
    }

    const prerequisites = skillResult.data.prerequisites;
    if (!prerequisites || prerequisites.length === 0) {
      return {
        success: true,
        data: [],
        timestamp: new Date(),
      };
    }

    const prerequisiteSkills: Skill[] = [];
    for (const prereqId of prerequisites) {
      const prereqResult = await this.getSkill(prereqId);
      if (prereqResult.success && prereqResult.data) {
        prerequisiteSkills.push(prereqResult.data);
      }
    }

    return {
      success: true,
      data: prerequisiteSkills,
      timestamp: new Date(),
    };
  }

  // Progress tracking
  async createSportProgress(
    userId: string,
    sportId: string
  ): Promise<ApiResponse<{ id: string }>> {
    const progressData: Omit<SportProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      sportId,
      status: 'not_started',
      completedSkills: [],
      totalSkills: 0,
      progressPercentage: 0,
      timeSpent: 0,
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: new Date() as any,
      },
      startedAt: new Date() as any,
      lastAccessedAt: new Date() as any,
    };

    // Get total skills count
    const skillsResult = await this.getSkillsBySport(sportId);
    if (skillsResult.success && skillsResult.data) {
      progressData.totalSkills = skillsResult.data.total;
    }

    return this.create<SportProgress>(this.SPORT_PROGRESS_COLLECTION, progressData);
  }

  async getSportProgress(
    userId: string,
    sportId: string
  ): Promise<ApiResponse<SportProgress | null>> {
    const result = await this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'sportId', operator: '==', value: sportId },
      ],
      limit: 1,
    });

    return {
      success: result.success,
      data: result.data?.items[0] || null,
      error: result.error,
      timestamp: new Date(),
    };
  }

  async updateSportProgress(
    userId: string,
    sportId: string,
    updates: Partial<SportProgress>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getSportProgress(userId, sportId);
    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'Sport progress not found',
        },
        timestamp: new Date(),
      };
    }

    return this.update<SportProgress>(
      this.SPORT_PROGRESS_COLLECTION,
      (progressResult.data as any).id,
      updates
    );
  }

  async createSkillProgress(
    userId: string,
    skillId: string,
    sportId: string
  ): Promise<ApiResponse<{ id: string }>> {
    const progressData: Omit<SkillProgress, 'id' | 'createdAt' | 'updatedAt'> = {
      userId,
      skillId,
      sportId,
      status: 'not_started',
      progressPercentage: 0,
      timeSpent: 0,
      bookmarked: false,
      notes: '',
      lastAccessedAt: new Date() as any,
    };

    return this.create<SkillProgress>(this.SKILL_PROGRESS_COLLECTION, progressData);
  }

  async getSkillProgress(
    userId: string,
    skillId: string
  ): Promise<ApiResponse<SkillProgress | null>> {
    const result = await this.query<SkillProgress>(this.SKILL_PROGRESS_COLLECTION, {
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'skillId', operator: '==', value: skillId },
      ],
      limit: 1,
    });

    return {
      success: result.success,
      data: result.data?.items[0] || null,
      error: result.error,
      timestamp: new Date(),
    };
  }

  async updateSkillProgress(
    userId: string,
    skillId: string,
    updates: Partial<SkillProgress>
  ): Promise<ApiResponse<void>> {
    const progressResult = await this.getSkillProgress(userId, skillId);
    if (!progressResult.success || !progressResult.data) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_NOT_FOUND',
          message: 'Skill progress not found',
        },
        timestamp: new Date(),
      };
    }

    return this.update<SkillProgress>(
      this.SKILL_PROGRESS_COLLECTION,
      (progressResult.data as any).id,
      updates
    );
  }

  async getUserProgress(userId: string): Promise<ApiResponse<{
    sports: SportProgress[];
    skills: SkillProgress[];
  }>> {
    const [sportsResult, skillsResult] = await Promise.all([
      this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
        where: [{ field: 'userId', operator: '==', value: userId }],
      }),
      this.query<SkillProgress>(this.SKILL_PROGRESS_COLLECTION, {
        where: [{ field: 'userId', operator: '==', value: userId }],
      }),
    ]);

    if (!sportsResult.success || !skillsResult.success) {
      return {
        success: false,
        error: {
          code: 'PROGRESS_FETCH_ERROR',
          message: 'Failed to fetch user progress',
        },
        timestamp: new Date(),
      };
    }

    return {
      success: true,
      data: {
        sports: sportsResult.data?.items || [],
        skills: skillsResult.data?.items || [],
      },
      timestamp: new Date(),
    };
  }

  // Batch operations
  async reorderSkills(
    sportId: string,
    skillOrders: Array<{ skillId: string; order: number }>
  ): Promise<ApiResponse<void>> {
    const operations = skillOrders.map(({ skillId, order }) => ({
      type: 'update' as const,
      collection: this.SKILLS_COLLECTION,
      id: skillId,
      data: { order },
    }));

    return this.batchWrite(operations);
  }

  async reorderSports(
    sportOrders: Array<{ sportId: string; order: number }>
  ): Promise<ApiResponse<void>> {
    const operations = sportOrders.map(({ sportId, order }) => ({
      type: 'update' as const,
      collection: this.SPORTS_COLLECTION,
      id: sportId,
      data: { order },
    }));

    return this.batchWrite(operations);
  }

  // Analytics and reporting
  async getSportAnalytics(sportId: string): Promise<ApiResponse<{
    totalEnrollments: number;
    totalCompletions: number;
    completionRate: number;
    averageCompletionTime: number;
    skillCompletionRates: Array<{ skillId: string; completionRate: number }>;
  }>> {
    const [sportResult, skillsResult, progressResult] = await Promise.all([
      this.getSport(sportId),
      this.getSkillsBySport(sportId),
      this.query<SportProgress>(this.SPORT_PROGRESS_COLLECTION, {
        where: [{ field: 'sportId', operator: '==', value: sportId }],
      }),
    ]);

    if (!sportResult.success || !skillsResult.success || !progressResult.success) {
      return {
        success: false,
        error: {
          code: 'ANALYTICS_FETCH_ERROR',
          message: 'Failed to fetch sport analytics',
        },
        timestamp: new Date(),
      };
    }

    const sport = sportResult.data!;
    const skills = skillsResult.data!.items;
    const progresses = progressResult.data!.items;

    const totalEnrollments = progresses.length;
    const totalCompletions = progresses.filter(p => p.status === 'completed').length;
    const completionRate = totalEnrollments > 0 ? (totalCompletions / totalEnrollments) * 100 : 0;

    const completedProgresses = progresses.filter(p => p.status === 'completed');
    const averageCompletionTime = completedProgresses.length > 0
      ? completedProgresses.reduce((sum, p) => sum + p.timeSpent, 0) / completedProgresses.length
      : 0;

    const skillCompletionRates = skills.map(skill => {
      const skillProgresses = progresses.filter(p => p.completedSkills.includes(skill.id));
      const completionRate = totalEnrollments > 0 ? (skillProgresses.length / totalEnrollments) * 100 : 0;
      return {
        skillId: skill.id,
        completionRate,
      };
    });

    return {
      success: true,
      data: {
        totalEnrollments,
        totalCompletions,
        completionRate,
        averageCompletionTime,
        skillCompletionRates,
      },
      timestamp: new Date(),
    };
  }

  // Real-time subscriptions
  subscribeToSports(
    callback: (sports: Sport[]) => void,
    filters: SearchFilters = {}
  ): () => void {
    const queryOptions: QueryOptions = {
      where: [{ field: 'isActive', operator: '==', value: true }],
      orderBy: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'order', direction: 'asc' },
      ],
    };

    if (filters.difficulty && filters.difficulty.length > 0) {
      queryOptions.where?.push({
        field: 'difficulty',
        operator: 'in',
        value: filters.difficulty,
      });
    }

    return this.subscribeToCollection<Sport>(
      this.SPORTS_COLLECTION,
      queryOptions,
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }

  subscribeToSkills(
    sportId: string,
    callback: (skills: Skill[]) => void
  ): () => void {
    return this.subscribeToCollection<Skill>(
      this.SKILLS_COLLECTION,
      {
        where: [
          { field: 'sportId', operator: '==', value: sportId },
          { field: 'isActive', operator: '==', value: true },
        ],
        orderBy: [{ field: 'order', direction: 'asc' }],
      },
      (update) => {
        if (update.type === 'modified') {
          callback(update.data);
        }
      }
    );
  }
}

// Export singleton instance
export const sportsService = new SportsService();
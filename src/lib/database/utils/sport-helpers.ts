import type { Sport, Skill, SportProgress, SkillProgress, DifficultyLevel, SearchFilters, QueryOptions, WhereClause } from '@/types';

/**
 * Helper utilities for sports and skills operations
 * These utilities extract common patterns and complex logic from the main service
 */

/**
 * Creates initial metadata for a new sport
 * @returns Default sport metadata with zero values
 */
export const createDefaultSportMetadata = () => ({
  totalEnrollments: 0,
  totalCompletions: 0,
  averageRating: 0,
  totalRatings: 0,
  averageCompletionTime: 0,
});

/**
 * Creates initial metadata for a new skill
 * @returns Default skill metadata with zero values
 */
export const createDefaultSkillMetadata = () => ({
  totalCompletions: 0,
  averageCompletionTime: 0,
  averageRating: 0,
  totalRatings: 0,
  difficulty: 'beginner' as DifficultyLevel,
});

/**
 * Validates sport data before creation/update
 * @param sportData - The sport data to validate
 * @returns Validation result with any errors
 */
export const validateSportData = (sportData: Partial<Sport>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (sportData.name && sportData.name.length < 2) {
    errors.push('Sport name must be at least 2 characters long');
  }

  if (sportData.estimatedTimeToComplete && sportData.estimatedTimeToComplete < 1) {
    errors.push('Estimated time to complete must be at least 1 hour');
  }

  if (sportData.order && sportData.order < 0) {
    errors.push('Order must be a positive number');
  }

  if (sportData.prerequisites && sportData.prerequisites.length > 5) {
    errors.push('Cannot have more than 5 prerequisites');
  }

  if (sportData.tags && sportData.tags.length > 10) {
    errors.push('Cannot have more than 10 tags');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates skill data before creation/update
 * @param skillData - The skill data to validate
 * @returns Validation result with any errors
 */
export const validateSkillData = (skillData: Partial<Skill>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (skillData.name && skillData.name.length < 2) {
    errors.push('Skill name must be at least 2 characters long');
  }

  if (skillData.estimatedTimeToComplete && skillData.estimatedTimeToComplete < 1) {
    errors.push('Estimated time to complete must be at least 1 minute');
  }

  if (skillData.order && skillData.order < 0) {
    errors.push('Order must be a positive number');
  }

  if (skillData.prerequisites && skillData.prerequisites.length > 3) {
    errors.push('Cannot have more than 3 prerequisites');
  }

  if (skillData.learningObjectives && skillData.learningObjectives.length === 0) {
    errors.push('Must have at least one learning objective');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Builds query filters for sports search
 * @param filters - Search filters to apply
 * @returns Array of where clauses for the query
 */
export const buildSportsQueryFilters = (filters: SearchFilters): WhereClause[] => {
  const whereClause: WhereClause[] = [];

  // Always filter for active sports unless admin context
  whereClause.push({
    field: 'isActive',
    operator: '==',
    value: true,
  });

  if (filters.difficulty && filters.difficulty.length > 0) {
    whereClause.push({
      field: 'difficulty',
      operator: 'in',
      value: filters.difficulty,
    });
  }

  if (filters.categories && filters.categories.length > 0) {
    whereClause.push({
      field: 'category',
      operator: 'in',
      value: filters.categories,
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    whereClause.push({
      field: 'tags',
      operator: 'array-contains-any',
      value: filters.tags,
    });
  }

  if (filters.duration) {
    if (filters.duration.min !== undefined) {
      whereClause.push({
        field: 'estimatedTimeToComplete',
        operator: '>=',
        value: filters.duration.min,
      });
    }
    if (filters.duration.max !== undefined) {
      whereClause.push({
        field: 'estimatedTimeToComplete',
        operator: '<=',
        value: filters.duration.max,
      });
    }
  }

  if (filters.rating?.min !== undefined) {
    whereClause.push({
      field: 'metadata.averageRating',
      operator: '>=',
      value: filters.rating.min,
    });
  }

  return whereClause;
};

/**
 * Builds query filters for skills search
 * @param filters - Search filters to apply
 * @param sportId - Optional sport ID to filter by
 * @returns Array of where clauses for the query
 */
export const buildSkillsQueryFilters = (filters: SearchFilters, sportId?: string): WhereClause[] => {
  const whereClause: WhereClause[] = [];

  // Always filter for active skills
  whereClause.push({
    field: 'isActive',
    operator: '==',
    value: true,
  });

  if (sportId) {
    whereClause.push({
      field: 'sportId',
      operator: '==',
      value: sportId,
    });
  }

  if (filters.difficulty && filters.difficulty.length > 0) {
    whereClause.push({
      field: 'difficulty',
      operator: 'in',
      value: filters.difficulty,
    });
  }

  if (filters.tags && filters.tags.length > 0) {
    whereClause.push({
      field: 'tags',
      operator: 'array-contains-any',
      value: filters.tags,
    });
  }

  if (filters.duration) {
    if (filters.duration.min !== undefined) {
      whereClause.push({
        field: 'estimatedTimeToComplete',
        operator: '>=',
        value: filters.duration.min,
      });
    }
    if (filters.duration.max !== undefined) {
      whereClause.push({
        field: 'estimatedTimeToComplete',
        operator: '<=',
        value: filters.duration.max,
      });
    }
  }

  if (filters.hasVideo !== undefined) {
    whereClause.push({
      field: 'hasVideo',
      operator: '==',
      value: filters.hasVideo,
    });
  }

  if (filters.hasQuiz !== undefined) {
    whereClause.push({
      field: 'hasQuiz',
      operator: '==',
      value: filters.hasQuiz,
    });
  }

  return whereClause;
};

/**
 * Calculates sport progress percentage
 * @param completedSkills - Number of completed skills
 * @param totalSkills - Total number of skills in the sport
 * @returns Progress percentage (0-100)
 */
export const calculateSportProgress = (completedSkills: number, totalSkills: number): number => {
  if (totalSkills === 0) return 0;
  return Math.round((completedSkills / totalSkills) * 100);
};

/**
 * Calculates skill progress percentage
 * @param timeSpent - Time spent on the skill (minutes)
 * @param estimatedTime - Estimated time to complete (minutes)
 * @param isCompleted - Whether the skill is completed
 * @returns Progress percentage (0-100)
 */
export const calculateSkillProgress = (
  timeSpent: number,
  estimatedTime: number,
  isCompleted: boolean
): number => {
  if (isCompleted) return 100;
  if (estimatedTime === 0) return 0;

  const progress = Math.round((timeSpent / estimatedTime) * 100);
  return Math.min(progress, 99); // Cap at 99% until marked as completed
};

/**
 * Determines the next skill in a sport progression
 * @param skills - All skills in the sport
 * @param completedSkillIds - IDs of completed skills
 * @returns Next skill to complete, or null if all completed
 */
export const getNextSkill = (skills: Skill[], completedSkillIds: string[]): Skill | null => {
  // Sort skills by order
  const sortedSkills = skills.sort((a, b) => a.order - b.order);

  // Find first skill not completed
  for (const skill of sortedSkills) {
    if (!completedSkillIds.includes(skill.id)) {
      // Check if prerequisites are met
      const prerequisitesMet = skill.prerequisites.every(prereqId =>
        completedSkillIds.includes(prereqId)
      );

      if (prerequisitesMet) {
        return skill;
      }
    }
  }

  return null; // All skills completed or no available skills
};

/**
 * Gets skills that are available to start (prerequisites met)
 * @param skills - All skills in the sport
 * @param completedSkillIds - IDs of completed skills
 * @returns Array of skills available to start
 */
export const getAvailableSkills = (skills: Skill[], completedSkillIds: string[]): Skill[] => {
  return skills.filter(skill => {
    // Skip if already completed
    if (completedSkillIds.includes(skill.id)) return false;

    // Check if prerequisites are met
    return skill.prerequisites.every(prereqId =>
      completedSkillIds.includes(prereqId)
    );
  }).sort((a, b) => a.order - b.order);
};

/**
 * Updates sport metadata after a skill completion
 * @param sport - The sport to update
 * @param completionTime - Time taken to complete the skill (minutes)
 * @returns Updated sport metadata
 */
export const updateSportMetadataOnCompletion = (
  sport: Sport,
  completionTime: number
): Sport['metadata'] => {
  const newTotalCompletions = sport.metadata.totalCompletions + 1;
  const newAverageTime = sport.metadata.averageCompletionTime === 0
    ? completionTime
    : Math.round(
        (sport.metadata.averageCompletionTime * sport.metadata.totalCompletions + completionTime) /
        newTotalCompletions
      );

  return {
    ...sport.metadata,
    totalCompletions: newTotalCompletions,
    averageCompletionTime: newAverageTime,
  };
};

/**
 * Updates skill metadata after a completion
 * @param skill - The skill to update
 * @param completionTime - Time taken to complete the skill (minutes)
 * @param rating - Optional rating given by the user
 * @returns Updated skill metadata
 */
export const updateSkillMetadataOnCompletion = (
  skill: Skill,
  completionTime: number,
  rating?: number
): Skill['metadata'] => {
  const newTotalCompletions = skill.metadata.totalCompletions + 1;
  const newAverageTime = skill.metadata.averageCompletionTime === 0
    ? completionTime
    : Math.round(
        (skill.metadata.averageCompletionTime * skill.metadata.totalCompletions + completionTime) /
        newTotalCompletions
      );

  let newAverageRating = skill.metadata.averageRating;
  let newTotalRatings = skill.metadata.totalRatings;

  if (rating !== undefined) {
    newTotalRatings = skill.metadata.totalRatings + 1;
    newAverageRating = skill.metadata.averageRating === 0
      ? rating
      : Math.round(
          ((skill.metadata.averageRating * skill.metadata.totalRatings + rating) /
          newTotalRatings) * 10
        ) / 10; // Round to 1 decimal place
  }

  return {
    ...skill.metadata,
    totalCompletions: newTotalCompletions,
    averageCompletionTime: newAverageTime,
    averageRating: newAverageRating,
    totalRatings: newTotalRatings,
  };
};

/**
 * Validates that a user can start a particular skill
 * @param skill - The skill to validate
 * @param completedSkillIds - IDs of skills the user has completed
 * @returns Validation result
 */
export const validateSkillAccess = (
  skill: Skill,
  completedSkillIds: string[]
): { canAccess: boolean; reason?: string } => {
  if (!skill.isActive) {
    return { canAccess: false, reason: 'Skill is not currently available' };
  }

  const unmetPrerequisites = skill.prerequisites.filter(
    prereqId => !completedSkillIds.includes(prereqId)
  );

  if (unmetPrerequisites.length > 0) {
    return {
      canAccess: false,
      reason: `Must complete prerequisite skills first: ${unmetPrerequisites.join(', ')}`
    };
  }

  return { canAccess: true };
};

/**
 * Formats sport/skill duration for display
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Gets difficulty level color for UI display
 * @param difficulty - The difficulty level
 * @returns CSS color class or hex color
 */
export const getDifficultyColor = (difficulty: DifficultyLevel): string => {
  switch (difficulty) {
    case 'beginner':
      return '#22C55E'; // green-500
    case 'intermediate':
      return '#F59E0B'; // amber-500
    case 'advanced':
      return '#EF4444'; // red-500
    default:
      return '#6B7280'; // gray-500
  }
};

/**
 * Generates a sport/skill slug from name for URLs
 * @param name - The sport or skill name
 * @returns URL-friendly slug
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
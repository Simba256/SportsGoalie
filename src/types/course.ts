import type { DifficultyLevel } from './index';

/**
 * Course type for structured learning content
 */
export interface Course {
  id: string;
  title: string;
  description: string;
  sportId: string;
  difficulty: DifficultyLevel;
  duration: number; // in hours
  category: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

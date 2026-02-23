import { Timestamp } from 'firebase/firestore';

/**
 * Custom Curriculum Types
 * For coach-guided (custom workflow) students
 */

// Content type in curriculum item
export type CurriculumContentType = 'lesson' | 'quiz' | 'custom_lesson' | 'custom_quiz';

// Status of curriculum item
export type CurriculumItemStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';

/**
 * Custom curriculum for a student
 * Contains the personalized learning path assigned by coach/admin
 */
export interface CustomCurriculum {
  id: string;
  studentId: string;
  coachId: string; // Coach who created/last modified
  items: CustomCurriculumItem[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastModifiedBy: string; // userId of coach/admin who last modified
}

/**
 * Individual item in custom curriculum
 * Can reference existing content or custom content
 */
export interface CustomCurriculumItem {
  id: string;
  type: CurriculumContentType;
  contentId?: string; // Reference to existing content (lesson/quiz ID) if not custom
  customContent?: CustomContent; // For coach-created content (stored inline)
  pillarId: string;
  levelId: string;
  order: number; // Order in curriculum sequence
  status: CurriculumItemStatus;
  unlockedAt?: Timestamp;
  completedAt?: Timestamp;
  assignedAt: Timestamp;
  dueDate?: Timestamp; // Optional deadline
  notes?: string; // Coach notes for this assignment
}

/**
 * Custom content created by coach
 * Can be embedded in curriculum or stored in library
 */
export interface CustomContent {
  title: string;
  description: string;
  content: string; // Rich text or markdown
  videoUrl?: string; // YouTube, Vimeo, or direct URL
  attachments?: string[]; // Firebase Storage URLs
  createdBy: string; // coachId
  isStudentSpecific: boolean; // true = only for this student, false = can be reused
  estimatedTimeMinutes?: number;
  learningObjectives?: string[];
  tags?: string[];
}

/**
 * Custom content library
 * Reusable content created by coaches
 */
export interface CustomContentLibrary {
  id: string;
  createdBy: string; // coachId
  title: string;
  description: string;
  type: 'lesson' | 'quiz';
  content: string; // Rich text or markdown
  videoUrl?: string;
  attachments?: string[]; // Firebase Storage URLs
  pillarId?: string; // Optional categorization
  levelId?: string; // Optional categorization
  tags: string[];
  isPublic: boolean; // Can other coaches use it?
  usageCount: number; // How many students assigned
  estimatedTimeMinutes?: number;
  learningObjectives?: string[];
  metadata?: CustomContentMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Metadata for custom content
 */
export interface CustomContentMetadata {
  views: number;
  completions: number;
  averageTimeSpent?: number; // minutes
  averageRating?: number;
  totalRatings: number;
  lastUsedAt?: Timestamp;
}

/**
 * Data to create curriculum for student
 */
export interface CreateCurriculumData {
  studentId: string;
  coachId: string;
  items?: Omit<CustomCurriculumItem, 'id' | 'assignedAt'>[];
}

/**
 * Data to add item to curriculum
 */
export interface AddCurriculumItemData {
  type: CurriculumContentType;
  contentId?: string;
  customContent?: Omit<CustomContent, 'createdBy'>;
  pillarId: string;
  levelId: string;
  order?: number; // Auto-assigned if not provided
  unlocked?: boolean; // Default: false
  dueDate?: Date;
  notes?: string;
}

/**
 * Data to create custom content in library
 */
export interface CreateCustomContentData {
  title: string;
  description: string;
  type: 'lesson' | 'quiz';
  content: string;
  videoUrl?: string;
  attachments?: File[]; // Files to upload
  pillarId?: string;
  levelId?: string;
  tags?: string[];
  isPublic?: boolean; // Default: false
  estimatedTimeMinutes?: number;
  learningObjectives?: string[];
}

/**
 * Query options for curriculum
 */
export interface CurriculumQueryOptions {
  studentId?: string;
  coachId?: string;
  pillarId?: string;
  levelId?: string;
  status?: CurriculumItemStatus;
  includeCompleted?: boolean;
}

/**
 * Curriculum progress summary
 */
export interface CurriculumProgress {
  studentId: string;
  totalItems: number;
  completedItems: number;
  inProgressItems: number;
  lockedItems: number;
  progressPercentage: number;
  nextItem?: CustomCurriculumItem;
  lastCompletedItem?: CustomCurriculumItem;
  estimatedTimeRemaining?: number; // minutes
}

/**
 * Curriculum assignment notification
 */
export interface CurriculumNotification {
  studentId: string;
  coachId: string;
  itemId: string;
  type: 'assigned' | 'unlocked' | 'due_soon' | 'overdue' | 'completed';
  itemTitle: string;
  message: string;
  dueDate?: Timestamp;
  createdAt: Timestamp;
}

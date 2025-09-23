export interface Course {
  id: string;
  title: string;
  description: string;
  sportId: string;
  skillId?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  category: string;
  imageUrl?: string;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  price?: number; // for future monetization
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  type: 'video' | 'article' | 'quiz' | 'practice';
  content?: string;
  videoUrl?: string;
  isRequired: boolean;
  isActive: boolean;
}

export interface CourseProgress {
  id: string;
  userId: string;
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPercentage: number;
  completedModules: string[];
  currentModule?: string;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent: number; // in minutes
  lastAccessedAt: Date;
}

export interface CourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  progress: CourseProgress;
}
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'admin';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';
export type QuestionType = 'multiple_choice' | 'true_false' | 'descriptive' | 'fill_in_blank';
export type MediaType = 'image' | 'video' | 'youtube';
export type ContentType = 'video' | 'article' | 'tutorial';
export type NotificationType = 'progress' | 'quiz_result' | 'new_content' | 'reminder' | 'achievement';
export type AchievementType = 'progress' | 'quiz' | 'streak' | 'time' | 'special';

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  profileImage?: string;
  emailVerified: boolean;
  preferences: UserPreferences;
  profile?: UserProfile;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  emailNotifications: {
    progress: boolean;
    quizResults: boolean;
    newContent: boolean;
    reminders: boolean;
  };
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  bio?: string;
  dateOfBirth?: Date;
  location?: {
    country: string;
    city: string;
  };
  sportsInterests: string[];
  experienceLevel: DifficultyLevel;
  goals: string[];
}

// Sport Types
export interface Sport {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  difficulty: DifficultyLevel;
  estimatedTimeToComplete: number; // hours
  skillsCount: number;
  imageUrl?: string;
  tags: string[];
  prerequisites?: string[]; // sport IDs
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  metadata: SportMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface SportMetadata {
  totalEnrollments: number;
  totalCompletions: number;
  averageRating: number;
  totalRatings: number;
  averageCompletionTime: number; // hours
}

// Skill Types
export interface Skill {
  id: string;
  sportId: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedTimeToComplete: number; // minutes
  content?: string; // Rich HTML content
  externalResources: ExternalResource[];
  media?: SkillMedia;
  prerequisites: string[]; // skill IDs
  learningObjectives: string[];
  tags: string[];
  hasVideo: boolean;
  hasQuiz: boolean;
  isActive: boolean;
  order: number;
  metadata: SkillMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface ExternalResource {
  id: string;
  title: string;
  url: string;
  type: 'website' | 'pdf' | 'video' | 'other';
  description?: string;
}

export interface SkillMedia {
  text: string;
  images: MediaItem[];
  videos: VideoItem[];
}

export interface MediaItem {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface VideoItem {
  id: string;
  youtubeId: string;
  title: string;
  duration: number; // seconds
  thumbnail: string;
  order: number;
}

export interface SkillMetadata {
  totalCompletions: number;
  averageCompletionTime: number; // minutes
  averageRating: number;
  totalRatings: number;
  difficulty: DifficultyLevel;
}

// Quiz Types - Import comprehensive Quiz interface from quiz.ts to avoid duplication
export { Quiz, QuizSettings, Question, QuizMetadata, QuizAttempt, QuestionAnswer, QuizAnswer } from './quiz';


export interface QuizQuestion {
  id: string;
  quizId: string;
  type: QuestionType;
  question: string;
  options?: string[]; // for MCQ and image_choice
  correctAnswer: string | number;
  explanation: string;
  points: number;
  media?: QuestionMedia;
  order: number;
  difficulty: DifficultyLevel;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface QuestionMedia {
  type: MediaType;
  url: string;
  caption?: string;
  alt?: string; // for images
}



// Progress Types
export interface SportProgress {
  id: string;
  userId: string;
  sportId: string;
  status: ProgressStatus;
  completedSkills: string[];
  totalSkills: number;
  progressPercentage: number;
  timeSpent: number; // minutes
  currentSkillId?: string;
  streak: StreakInfo;
  rating?: number;
  review?: string;
  startedAt: Timestamp;
  completedAt?: Timestamp;
  lastAccessedAt: Timestamp;
}

export interface SkillProgress {
  id: string;
  userId: string;
  skillId: string;
  sportId: string;
  status: ProgressStatus;
  progressPercentage: number;
  timeSpent: number; // minutes
  bookmarked: boolean;
  notes: string;
  rating?: number;
  quizScore?: number;
  videoProgress?: VideoProgress;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  lastAccessedAt?: Timestamp;
}

export interface VideoProgress {
  watchTime: number; // seconds watched
  totalDuration: number; // total video duration
  progressPercentage: number;
  isCompleted: boolean;
  bookmarks: VideoBookmark[];
}

export interface VideoBookmark {
  id: string;
  timestamp: number; // seconds
  note: string;
  createdAt: Timestamp;
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastActiveDate: Timestamp;
}

export interface UserProgress {
  userId: string;
  overallStats: OverallStats;
  achievements: string[]; // achievement IDs
  lastUpdated: Timestamp;
}

export interface OverallStats {
  totalTimeSpent: number; // minutes
  skillsCompleted: number;
  sportsCompleted: number;
  quizzesCompleted: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  level: number;
  experiencePoints: number;
}

// Content Types
export interface Content {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  content: string; // Rich HTML content
  thumbnail: string;
  media: ContentMedia;
  tags: string[];
  category: string;
  difficulty: DifficultyLevel;
  relatedSports: string[];
  relatedSkills: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Timestamp;
  author: Author;
  metadata: ContentMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ContentMedia {
  type: MediaType;
  url: string;
  duration?: number; // for videos
  transcript?: string;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
}

export interface ContentMetadata {
  views: number;
  likes: number;
  shares: number;
  averageRating: number;
  totalRatings: number;
  bookmarks: number;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  expiresAt?: Timestamp;
}

export interface NotificationData {
  sportId?: string;
  skillId?: string;
  quizId?: string;
  contentId?: string;
  actionUrl?: string;
  achievementId?: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  criteria: AchievementCriteria;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  isSecret: boolean; // Hidden until unlocked
  metadata: AchievementMetadata;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AchievementCriteria {
  condition: string;
  value: number;
  sportId?: string;
  skillId?: string;
  timeframe?: number; // in days
}

export interface AchievementMetadata {
  totalUnlocked: number;
  unlockRate: number; // percentage
  firstUnlockedAt?: Timestamp;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  progress: number; // for progressive achievements
  isCompleted: boolean;
  unlockedAt?: Timestamp;
  isNotified: boolean;
}

// App Configuration Types
export interface AppSettings {
  id: string;
  maintenanceMode: boolean;
  featuresEnabled: FeatureFlags;
  supportedLanguages: string[];
  maxQuizAttempts: number;
  sessionTimeout: number; // minutes
  cacheSettings: CacheSettings;
  rateLimit: RateLimitSettings;
  analytics: AnalyticsSettings;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface FeatureFlags {
  registration: boolean;
  quizzes: boolean;
  achievements: boolean;
  notifications: boolean;
  contentCreation: boolean;
  videoLearning: boolean;
  socialFeatures: boolean;
  analyticsTracking: boolean;
}

export interface CacheSettings {
  userDataTTL: number; // milliseconds
  contentTTL: number;
  quizTTL: number;
  staticAssetsTTL: number;
}

export interface RateLimitSettings {
  apiCallsPerMinute: number;
  quizAttemptsPerHour: number;
  contentUploadPerDay: number;
}

export interface AnalyticsSettings {
  trackPageViews: boolean;
  trackUserActions: boolean;
  trackPerformance: boolean;
  dataRetentionDays: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  message?: string;
  timestamp: Date;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: unknown;
  field?: string; // for validation errors
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  totalPages: number;
}

// Database Query Types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: OrderByClause[];
  where?: WhereClause[];
  cursor?: string; // for cursor-based pagination
}

export interface OrderByClause {
  field: string;
  direction: 'asc' | 'desc';
}

export interface WhereClause {
  field: string;
  operator: '==' | '!=' | '<' | '<=' | '>' | '>=' | 'in' | 'not-in' | 'array-contains' | 'array-contains-any';
  value: unknown;
}

// Real-time Update Types
export interface RealtimeUpdate<T> {
  type: 'added' | 'modified' | 'removed';
  data: T;
  oldData?: T;
  timestamp: Date;
}

export type RealtimeListener<T> = (update: RealtimeUpdate<T>) => void;

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  refreshOnAccess?: boolean;
  compress?: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  preferences?: Partial<UserPreferences>;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  newPassword: string;
  confirmPassword: string;
  token: string;
}

export interface ProfileUpdateForm {
  firstName?: string;
  lastName?: string;
  bio?: string;
  dateOfBirth?: Date;
  location?: {
    country: string;
    city: string;
  };
  sportsInterests?: string[];
  experienceLevel?: DifficultyLevel;
  goals?: string[];
}

export interface PreferencesUpdateForm {
  notifications?: boolean;
  theme?: 'light' | 'dark';
  language?: string;
  timezone?: string;
  emailNotifications?: {
    progress?: boolean;
    quizResults?: boolean;
    newContent?: boolean;
    reminders?: boolean;
  };
}

// Search Types
export interface SearchFilters {
  difficulty?: DifficultyLevel[];
  categories?: string[];
  tags?: string[];
  duration?: {
    min?: number;
    max?: number;
  };
  rating?: {
    min?: number;
  };
  hasVideo?: boolean;
  hasQuiz?: boolean;
  isFree?: boolean;
}

export interface SearchResult<T> {
  item: T;
  score: number; // relevance score
  highlights?: { [field: string]: string };
}

export interface SearchResponse<T> {
  results: SearchResult<T>[];
  total: number;
  facets?: { [key: string]: { [value: string]: number } };
  suggestions?: string[];
  query: string;
  took: number; // search time in ms
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: string;
  eventName: string;
  properties: { [key: string]: unknown };
  timestamp: Timestamp;
  userAgent?: string;
  ipAddress?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  duration?: number; // seconds
  pageViews: number;
  events: number;
  referrer?: string;
  userAgent: string;
  ipAddress?: string;
}

// Validation Schema Types (for Zod integration)
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Migration Types
export interface Migration {
  id: string;
  version: string;
  name: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
  executedAt?: Timestamp;
}

export interface MigrationState {
  currentVersion: string;
  executedMigrations: string[];
  lastMigrationAt: Timestamp;
}

// Backup Types
export interface BackupInfo {
  id: string;
  type: 'full' | 'incremental';
  collections: string[];
  size: number; // bytes
  recordCount: number;
  createdAt: Timestamp;
  completedAt?: Timestamp;
  status: 'in_progress' | 'completed' | 'failed';
  error?: string;
}

// System Health Types
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: ServiceHealth;
    storage: ServiceHealth;
    authentication: ServiceHealth;
    cache: ServiceHealth;
  };
  lastChecked: Date;
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number; // milliseconds
  error?: string;
  lastChecked: Date;
}
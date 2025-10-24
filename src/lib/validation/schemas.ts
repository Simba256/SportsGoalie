import { z } from 'zod';

// Base schemas for common patterns
const timestampSchema = z.date().or(z.any()); // Firebase Timestamp
const idSchema = z.string().min(1, 'ID is required');
const emailSchema = z.string().email('Invalid email format');
const urlSchema = z.string().url('Invalid URL format').optional();

// Enum schemas
export const userRoleSchema = z.enum(['student', 'admin'], {
  errorMap: () => ({ message: 'Role must be either student or admin' }),
});

export const difficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'], {
  errorMap: () => ({ message: 'Difficulty must be beginner, intermediate, or advanced' }),
});

export const progressStatusSchema = z.enum(['not_started', 'in_progress', 'completed'], {
  errorMap: () => ({ message: 'Status must be not_started, in_progress, or completed' }),
});

export const questionTypeSchema = z.enum(['multiple_choice', 'true_false', 'descriptive', 'fill_in_blank'], {
  errorMap: () => ({ message: 'Question type must be multiple_choice, true_false, descriptive, or fill_in_blank' }),
});

export const mediaTypeSchema = z.enum(['image', 'video', 'youtube'], {
  errorMap: () => ({ message: 'Media type must be image, video, or youtube' }),
});

export const contentTypeSchema = z.enum(['video', 'article', 'tutorial'], {
  errorMap: () => ({ message: 'Content type must be video, article, or tutorial' }),
});

export const notificationTypeSchema = z.enum(['progress', 'quiz_result', 'new_content', 'reminder', 'achievement'], {
  errorMap: () => ({ message: 'Notification type must be progress, quiz_result, new_content, reminder, or achievement' }),
});

export const achievementTypeSchema = z.enum(['progress', 'quiz', 'streak', 'time', 'special'], {
  errorMap: () => ({ message: 'Achievement type must be progress, quiz, streak, time, or special' }),
});

export const themeSchema = z.enum(['light', 'dark'], {
  errorMap: () => ({ message: 'Theme must be light or dark' }),
});

export const prioritySchema = z.enum(['low', 'medium', 'high'], {
  errorMap: () => ({ message: 'Priority must be low, medium, or high' }),
});

export const raritySchema = z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary'], {
  errorMap: () => ({ message: 'Rarity must be common, uncommon, rare, epic, or legendary' }),
});

// User schemas
export const userPreferencesSchema = z.object({
  notifications: z.boolean(),
  theme: themeSchema,
  language: z.string().min(2, 'Language code must be at least 2 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
  emailNotifications: z.object({
    progress: z.boolean(),
    quizResults: z.boolean(),
    newContent: z.boolean(),
    reminders: z.boolean(),
  }),
});

export const userProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  bio: z.string().max(500, 'Bio too long').optional(),
  dateOfBirth: z.date().optional(),
  location: z.object({
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
  }).optional(),
  sportsInterests: z.array(z.string()),
  experienceLevel: difficultyLevelSchema,
  goals: z.array(z.string()),
});

export const userSchema = z.object({
  id: idSchema,
  email: emailSchema,
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  role: userRoleSchema,
  profileImage: urlSchema,
  emailVerified: z.boolean(),
  preferences: userPreferencesSchema,
  profile: userProfileSchema.optional(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  lastLoginAt: timestampSchema.optional(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLoginAt: true,
});

export const updateUserSchema = createUserSchema.partial().omit({
  email: true, // Email updates require special handling
});

// Sport schemas
export const sportMetadataSchema = z.object({
  totalEnrollments: z.number().min(0),
  totalCompletions: z.number().min(0),
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().min(0),
  averageCompletionTime: z.number().min(0),
});

export const sportSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'Sport name is required').max(100, 'Sport name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  icon: z.string().min(1, 'Icon is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'),
  category: z.string().min(1, 'Category is required'),
  difficulty: difficultyLevelSchema,
  estimatedTimeToComplete: z.number().min(1, 'Estimated time must be positive'),
  skillsCount: z.number().min(0),
  imageUrl: urlSchema,
  tags: z.array(z.string()),
  prerequisites: z.array(idSchema).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  order: z.number().min(0),
  metadata: sportMetadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: idSchema,
});

export const createSportSchema = sportSchema.omit({
  id: true,
  skillsCount: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSportSchema = createSportSchema.partial().omit({
  createdBy: true,
});

// Skill schemas
export const externalResourceSchema = z.object({
  id: idSchema,
  title: z.string().min(1, 'Resource title is required'),
  url: z.string().url('Invalid resource URL'),
  type: z.enum(['website', 'pdf', 'video', 'other']),
  description: z.string().optional(),
});

export const mediaItemSchema = z.object({
  id: idSchema,
  url: z.string().url('Invalid media URL'),
  alt: z.string().min(1, 'Alt text is required'),
  caption: z.string().optional(),
  order: z.number().min(0),
});

export const videoItemSchema = z.object({
  id: idSchema,
  youtubeId: z.string().min(1, 'YouTube ID is required'),
  title: z.string().min(1, 'Video title is required'),
  duration: z.number().min(1, 'Duration must be positive'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  order: z.number().min(0),
});

export const skillMediaSchema = z.object({
  text: z.string(),
  images: z.array(mediaItemSchema),
  videos: z.array(videoItemSchema),
});

export const skillMetadataSchema = z.object({
  totalCompletions: z.number().min(0),
  averageCompletionTime: z.number().min(0),
  averageRating: z.number().min(0).max(5),
  totalRatings: z.number().min(0),
  difficulty: difficultyLevelSchema,
});

export const skillSchema = z.object({
  id: idSchema,
  sportId: idSchema,
  name: z.string().min(1, 'Skill name is required').max(100, 'Skill name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  difficulty: difficultyLevelSchema,
  estimatedTimeToComplete: z.number().min(1, 'Estimated time must be positive'),
  content: z.string().optional(),
  externalResources: z.array(externalResourceSchema),
  media: skillMediaSchema.optional(),
  prerequisites: z.array(idSchema),
  learningObjectives: z.array(z.string().min(1, 'Learning objective cannot be empty')),
  tags: z.array(z.string()),
  hasVideo: z.boolean(),
  hasQuiz: z.boolean(),
  isActive: z.boolean(),
  order: z.number().min(0),
  metadata: skillMetadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: idSchema,
});

export const createSkillSchema = skillSchema.omit({
  id: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSkillSchema = createSkillSchema.partial().omit({
  sportId: true,
  createdBy: true,
});

// Quiz schemas
export const quizMetadataSchema = z.object({
  totalAttempts: z.number().min(0),
  totalCompletions: z.number().min(0),
  averageScore: z.number().min(0).max(100),
  averageTimeSpent: z.number().min(0),
});

export const quizSchema = z.object({
  id: idSchema,
  skillId: idSchema,
  sportId: idSchema,
  title: z.string().min(1, 'Quiz title is required').max(100, 'Quiz title too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  difficulty: difficultyLevelSchema,
  timeLimit: z.number().min(1, 'Time limit must be positive'),
  passingScore: z.number().min(0, 'Passing score cannot be negative').max(100, 'Passing score cannot exceed 100'),
  maxAttempts: z.number().min(1, 'Max attempts must be positive'),
  allowReview: z.boolean(),
  shuffleQuestions: z.boolean(),
  showAnswersAfterCompletion: z.boolean(),
  isActive: z.boolean(),
  metadata: quizMetadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  createdBy: idSchema,
});

export const createQuizSchema = quizSchema.omit({
  id: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuizSchema = createQuizSchema.partial().omit({
  skillId: true,
  sportId: true,
  createdBy: true,
});

// Quiz Question schemas
export const questionMediaSchema = z.object({
  type: mediaTypeSchema,
  url: z.string().url('Invalid media URL'),
  caption: z.string().optional(),
  alt: z.string().optional(),
});

export const quizQuestionSchema = z.object({
  id: idSchema,
  quizId: idSchema,
  type: questionTypeSchema,
  question: z.string().min(1, 'Question is required').max(1000, 'Question too long'),
  options: z.array(z.string().min(1, 'Option cannot be empty')).optional(),
  correctAnswer: z.union([z.string(), z.number()]),
  explanation: z.string().max(500, 'Explanation too long'),
  points: z.number().min(1, 'Points must be positive'),
  media: questionMediaSchema.optional(),
  order: z.number().min(0),
  difficulty: difficultyLevelSchema,
  tags: z.array(z.string()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createQuizQuestionSchema = quizQuestionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateQuizQuestionSchema = createQuizQuestionSchema.partial().omit({
  quizId: true,
});

// Quiz Attempt schemas
export const quizAnswerSchema = z.object({
  questionId: idSchema,
  answer: z.union([z.string(), z.number()]),
  isCorrect: z.boolean(),
  timeSpent: z.number().min(0, 'Time spent cannot be negative'),
  skipped: z.boolean(),
});

export const quizAttemptSchema = z.object({
  id: idSchema,
  userId: idSchema,
  quizId: idSchema,
  skillId: idSchema,
  sportId: idSchema,
  answers: z.array(quizAnswerSchema),
  score: z.number().min(0),
  maxScore: z.number().min(0),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  isCompleted: z.boolean(),
  startedAt: timestampSchema,
  completedAt: timestampSchema.optional(),
  submittedAt: timestampSchema.optional(),
});

export const createQuizAttemptSchema = quizAttemptSchema.omit({
  id: true,
  answers: true,
  score: true,
  percentage: true,
  timeSpent: true,
  isCompleted: true,
  completedAt: true,
  submittedAt: true,
});

// Progress schemas
export const streakInfoSchema = z.object({
  current: z.number().min(0),
  longest: z.number().min(0),
  lastActiveDate: timestampSchema,
});

export const sportProgressSchema = z.object({
  userId: idSchema,
  sportId: idSchema,
  status: progressStatusSchema,
  completedSkills: z.array(idSchema),
  totalSkills: z.number().min(0),
  progressPercentage: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  currentSkillId: idSchema.optional(),
  streak: streakInfoSchema,
  rating: z.number().min(1).max(5).optional(),
  review: z.string().max(1000, 'Review too long').optional(),
  startedAt: timestampSchema,
  completedAt: timestampSchema.optional(),
  lastAccessedAt: timestampSchema,
});

export const videoBookmarkSchema = z.object({
  id: idSchema,
  timestamp: z.number().min(0),
  note: z.string().max(500, 'Note too long'),
  createdAt: timestampSchema,
});

export const videoProgressSchema = z.object({
  watchTime: z.number().min(0),
  totalDuration: z.number().min(0),
  progressPercentage: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  bookmarks: z.array(videoBookmarkSchema),
});

export const skillProgressSchema = z.object({
  userId: idSchema,
  skillId: idSchema,
  sportId: idSchema,
  status: progressStatusSchema,
  progressPercentage: z.number().min(0).max(100),
  timeSpent: z.number().min(0),
  bookmarked: z.boolean(),
  notes: z.string().max(1000, 'Notes too long'),
  rating: z.number().min(1).max(5).optional(),
  quizScore: z.number().min(0).max(100).optional(),
  videoProgress: videoProgressSchema.optional(),
  startedAt: timestampSchema.optional(),
  completedAt: timestampSchema.optional(),
  lastAccessedAt: timestampSchema.optional(),
});

export const overallStatsSchema = z.object({
  totalTimeSpent: z.number().min(0),
  skillsCompleted: z.number().min(0),
  sportsCompleted: z.number().min(0),
  quizzesCompleted: z.number().min(0),
  averageQuizScore: z.number().min(0).max(100),
  currentStreak: z.number().min(0),
  longestStreak: z.number().min(0),
  totalPoints: z.number().min(0),
  level: z.number().min(1),
  experiencePoints: z.number().min(0),
});

export const userProgressSchema = z.object({
  userId: idSchema,
  overallStats: overallStatsSchema,
  achievements: z.array(idSchema),
  lastUpdated: timestampSchema,
});

// Notification schemas
export const notificationDataSchema = z.object({
  sportId: idSchema.optional(),
  skillId: idSchema.optional(),
  quizId: idSchema.optional(),
  contentId: idSchema.optional(),
  actionUrl: z.string().optional(),
  achievementId: idSchema.optional(),
});

export const notificationSchema = z.object({
  id: idSchema,
  userId: idSchema,
  type: notificationTypeSchema,
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  message: z.string().min(1, 'Message is required').max(500, 'Message too long'),
  data: notificationDataSchema,
  isRead: z.boolean(),
  priority: prioritySchema,
  createdAt: timestampSchema,
  expiresAt: timestampSchema.optional(),
});

export const createNotificationSchema = notificationSchema.omit({
  id: true,
  isRead: true,
  createdAt: true,
});

// Achievement schemas
export const achievementCriteriaSchema = z.object({
  condition: z.string().min(1, 'Condition is required'),
  value: z.number().min(0),
  sportId: idSchema.optional(),
  skillId: idSchema.optional(),
  timeframe: z.number().min(1).optional(),
});

export const achievementMetadataSchema = z.object({
  totalUnlocked: z.number().min(0),
  unlockRate: z.number().min(0).max(100),
  firstUnlockedAt: timestampSchema.optional(),
});

export const achievementSchema = z.object({
  id: idSchema,
  name: z.string().min(1, 'Achievement name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  icon: z.string().min(1, 'Icon is required'),
  type: achievementTypeSchema,
  criteria: achievementCriteriaSchema,
  points: z.number().min(1, 'Points must be positive'),
  rarity: raritySchema,
  isActive: z.boolean(),
  isSecret: z.boolean(),
  metadata: achievementMetadataSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createAchievementSchema = achievementSchema.omit({
  id: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
});

export const userAchievementSchema = z.object({
  userId: idSchema,
  achievementId: idSchema,
  progress: z.number().min(0).max(100),
  isCompleted: z.boolean(),
  unlockedAt: timestampSchema.optional(),
  isNotified: z.boolean(),
});

// Form validation schemas
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: emailSchema,
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  role: userRoleSchema,
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms',
  }),
  agreeToPrivacy: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the privacy policy',
  }),
  preferences: userPreferencesSchema.partial().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
});

export const resetPasswordFormSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  token: z.string().min(1, 'Reset token is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const profileUpdateFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').optional(),
  bio: z.string().max(500, 'Bio too long').optional(),
  dateOfBirth: z.date().optional(),
  location: z.object({
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
  }).optional(),
  sportsInterests: z.array(z.string()).optional(),
  experienceLevel: difficultyLevelSchema.optional(),
  goals: z.array(z.string()).optional(),
});

export const preferencesUpdateFormSchema = z.object({
  notifications: z.boolean().optional(),
  theme: themeSchema.optional(),
  language: z.string().min(2, 'Language code must be at least 2 characters').optional(),
  timezone: z.string().min(1, 'Timezone is required').optional(),
  emailNotifications: z.object({
    progress: z.boolean().optional(),
    quizResults: z.boolean().optional(),
    newContent: z.boolean().optional(),
    reminders: z.boolean().optional(),
  }).optional(),
});

// Search and filter schemas
export const searchFiltersSchema = z.object({
  difficulty: z.array(difficultyLevelSchema).optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  duration: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  rating: z.object({
    min: z.number().min(0).max(5).optional(),
  }).optional(),
  hasVideo: z.boolean().optional(),
  hasQuiz: z.boolean().optional(),
  isFree: z.boolean().optional(),
});

export const queryOptionsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  orderBy: z.array(z.object({
    field: z.string().min(1),
    direction: z.enum(['asc', 'desc']),
  })).optional(),
  where: z.array(z.object({
    field: z.string().min(1),
    operator: z.enum(['==', '!=', '<', '<=', '>', '>=', 'in', 'not-in', 'array-contains', 'array-contains-any']),
    value: z.any(),
  })).optional(),
  cursor: z.string().optional(),
});

// Export helper function for validation
export function validateWithSchema<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string; code: string }>;
} {
  try {
    const result = schema.parse(data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = (error.issues || error.errors || []).map((err: any) => ({
        field: err.path?.join('.') || '',
        message: err.message || 'Validation error',
        code: err.code || 'invalid',
      }));
      return {
        success: false,
        errors,
      };
    }
    return {
      success: false,
      errors: [{ field: 'unknown', message: 'Validation failed', code: 'unknown' }],
    };
  }
}
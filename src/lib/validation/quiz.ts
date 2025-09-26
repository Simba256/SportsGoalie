import { z } from 'zod';

// Quiz validation schemas
export const quizBasicInfoSchema = z.object({
  title: z
    .string()
    .min(1, 'Quiz title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  instructions: z
    .string()
    .max(1000, 'Instructions must be less than 1000 characters')
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must be less than 50 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: 'Difficulty level is required',
  }),
  estimatedDuration: z
    .number()
    .min(1, 'Duration must be at least 1 minute')
    .max(480, 'Duration cannot exceed 8 hours'),
  passingScore: z
    .number()
    .min(0, 'Passing score cannot be negative')
    .max(100, 'Passing score cannot exceed 100%')
    .default(70),
  maxAttempts: z
    .number()
    .min(1, 'Must allow at least 1 attempt')
    .max(10, 'Cannot exceed 10 attempts')
    .default(3),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
  sportId: z.string().optional(),
  skillId: z.string().optional(),
});

export const questionOptionSchema = z.object({
  id: z.string(),
  text: z
    .string()
    .min(1, 'Option text is required')
    .max(200, 'Option text must be less than 200 characters'),
  isCorrect: z.boolean().default(false),
  explanation: z
    .string()
    .max(300, 'Explanation must be less than 300 characters')
    .optional(),
  order: z.number().min(0),
});

export const questionMediaSchema = z.object({
  id: z.string(),
  type: z.enum(['image', 'video'], {
    required_error: 'Media type is required',
  }),
  url: z.string().url('Invalid media URL'),
  alt: z.string().optional(),
  caption: z.string().optional(),
  order: z.number().min(0),
});

export const baseQuestionSchema = z.object({
  id: z.string(),
  title: z
    .string()
    .min(1, 'Question title is required')
    .max(150, 'Title must be less than 150 characters')
    .trim(),
  content: z
    .string()
    .min(1, 'Question content is required')
    .max(1000, 'Content must be less than 1000 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard'], {
    required_error: 'Question difficulty is required',
  }),
  points: z
    .number()
    .min(1, 'Points must be at least 1')
    .max(10, 'Points cannot exceed 10')
    .default(1),
  timeLimit: z
    .number()
    .min(10, 'Time limit must be at least 10 seconds')
    .max(600, 'Time limit cannot exceed 10 minutes')
    .optional(),
  isRequired: z.boolean().default(true),
  explanation: z
    .string()
    .max(500, 'Explanation must be less than 500 characters')
    .optional(),
  tags: z.array(z.string().max(30)).max(10, 'Cannot exceed 10 tags').default([]),
  media: z.array(questionMediaSchema).max(5, 'Cannot exceed 5 media files').default([]),
  order: z.number().min(0),
  createdAt: z.any(), // Firebase Timestamp
  updatedAt: z.any(), // Firebase Timestamp
  createdBy: z.string(),
});

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('multiple_choice'),
  options: z
    .array(questionOptionSchema)
    .min(2, 'Must have at least 2 options')
    .max(6, 'Cannot exceed 6 options')
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length >= 1,
      'Must have at least one correct answer'
    )
    .refine(
      (options) => options.filter(opt => opt.isCorrect).length <= 3,
      'Cannot have more than 3 correct answers'
    ),
  allowMultiple: z.boolean().default(false),
  shuffleOptions: z.boolean().default(true),
});

export const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('true_false'),
  correctAnswer: z.boolean({
    required_error: 'Correct answer is required for true/false questions',
  }),
});

export const descriptiveQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('descriptive'),
  maxLength: z
    .number()
    .min(50, 'Minimum answer length must be at least 50 characters')
    .max(2000, 'Maximum answer length cannot exceed 2000 characters')
    .default(500),
  autoGrade: z.boolean().default(false),
  keywords: z
    .array(z.string().max(50))
    .max(20, 'Cannot exceed 20 keywords')
    .default([]),
});

export const fillInBlankQuestionSchema = baseQuestionSchema.extend({
  type: z.literal('fill_in_blank'),
  correctAnswers: z
    .array(z.string().min(1, 'Answer cannot be empty').max(100))
    .min(1, 'Must have at least one correct answer')
    .max(5, 'Cannot exceed 5 correct answers'),
  caseSensitive: z.boolean().default(false),
});

// Union type for all question types
export const questionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
  descriptiveQuestionSchema,
  fillInBlankQuestionSchema,
]);

// Complete quiz schema
export const completeQuizSchema = quizBasicInfoSchema.extend({
  questions: z
    .array(questionSchema)
    .min(1, 'Quiz must have at least one question')
    .max(50, 'Quiz cannot exceed 50 questions'),
});

// Form-specific schemas for progressive validation
export const quizSettingsSchema = z.object({
  passingScore: z
    .number()
    .min(0, 'Passing score cannot be negative')
    .max(100, 'Passing score cannot exceed 100%'),
  maxAttempts: z
    .number()
    .min(1, 'Must allow at least 1 attempt')
    .max(10, 'Cannot exceed 10 attempts'),
  timeLimit: z
    .number()
    .min(1, 'Time limit must be at least 1 minute')
    .max(480, 'Time limit cannot exceed 8 hours')
    .optional(),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  allowReview: z.boolean().default(true),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
});

// Type exports for TypeScript
export type QuizBasicInfo = z.infer<typeof quizBasicInfoSchema>;
export type QuizSettings = z.infer<typeof quizSettingsSchema>;
export type CompleteQuiz = z.infer<typeof completeQuizSchema>;
export type Question = z.infer<typeof questionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type TrueFalseQuestion = z.infer<typeof trueFalseQuestionSchema>;
export type DescriptiveQuestion = z.infer<typeof descriptiveQuestionSchema>;
export type FillInBlankQuestion = z.infer<typeof fillInBlankQuestionSchema>;

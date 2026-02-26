import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    displayName: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name cannot exceed 50 characters'),
    role: z.enum(['student', 'admin', 'coach', 'parent']).default('student'),
    workflowType: z.enum(['automated', 'custom']).optional().default('automated'),
    coachCode: z.string().optional(),
    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, 'You must agree to the terms and conditions'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      // Coach code is required for custom workflow students
      if (data.role === 'student' && data.workflowType === 'custom') {
        return !!data.coachCode && data.coachCode.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Coach code is required for coach-guided learning',
      path: ['coachCode'],
    }
  )
  .refine(
    (data) => {
      // Validate coach code format if provided
      if (data.coachCode && data.coachCode.trim().length > 0) {
        // Format: LASTNAME-XXXX (uppercase letters, hyphen, 4 alphanumeric)
        const pattern = /^[A-Z]+-[A-Z0-9]{4}$/;
        return pattern.test(data.coachCode.toUpperCase());
      }
      return true;
    },
    {
      message: 'Invalid coach code format. Expected format: LASTNAME-XXXX (e.g., SMITH-7K3M)',
      path: ['coachCode'],
    }
  );

export const passwordResetSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const profileUpdateSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .optional(),
  photoURL: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          quiz: z.boolean().optional(),
          progress: z.boolean().optional(),
        })
        .optional(),
      privacy: z
        .object({
          profileVisible: z.boolean().optional(),
          progressVisible: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PasswordResetFormData = z.infer<typeof passwordResetSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
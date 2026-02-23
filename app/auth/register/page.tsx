'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth/context';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student' as const,
      workflowType: 'automated' as const,
      agreeToTerms: false,
    },
  });

  const selectedRole = watch('role');
  const selectedWorkflowType = watch('workflowType');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser(data);

      // Show success notification
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account before logging in.',
        duration: 6000,
      });

      // After successful registration, redirect to login with verification message
      router.push('/auth/login?message=verify-email');
    } catch (error) {
      // Handle AuthError properly
      if (isAuthError(error)) {
        setError('root', {
          message: error.userMessage,
        });
        toast.error('Registration failed', {
          description: error.userMessage,
        });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setError('root', {
          message: errorMessage,
        });
        toast.error('Registration failed', {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
          <CardDescription>
            Enter your information below to create your SmarterGoalie account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="register-form">
            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">I am a...</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as 'student' | 'parent')}
              >
                <SelectTrigger id="role" data-testid="role-select">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student" data-testid="role-student">Student / Athlete</SelectItem>
                  <SelectItem value="parent" data-testid="role-parent">Parent</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-destructive" data-testid="role-error">{errors.role.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Coaches are invited by administrators. Parents must have their child&apos;s Student ID to register.
              </p>
            </div>

            {/* Workflow Type Selection (Students Only) */}
            {selectedRole === 'student' && (
              <div className="space-y-2">
                <Label>Learning Mode</Label>
                <RadioGroup
                  value={selectedWorkflowType}
                  onValueChange={(value) => setValue('workflowType', value as 'automated' | 'custom')}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="automated" id="automated" className="mt-1" />
                    <Label htmlFor="automated" className="font-normal cursor-pointer flex-1">
                      <div className="font-semibold text-base mb-1">Self-Paced (Automated)</div>
                      <div className="text-sm text-muted-foreground">
                        Progress automatically as you complete quizzes and evaluations. Perfect for independent learners.
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="custom" id="custom" className="mt-1" />
                    <Label htmlFor="custom" className="font-normal cursor-pointer flex-1">
                      <div className="font-semibold text-base mb-1">Coach-Guided (Custom)</div>
                      <div className="text-sm text-muted-foreground">
                        Work with a coach who customizes your learning journey and provides personalized guidance.
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.workflowType && (
                  <p className="text-sm text-destructive">{errors.workflowType.message}</p>
                )}
              </div>
            )}

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your full name"
                {...register('displayName')}
                aria-invalid={!!errors.displayName}
                data-testid="display-name-input"
              />
              {errors.displayName && (
                <p className="text-sm text-destructive" data-testid="display-name-error">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                aria-invalid={!!errors.email}
                data-testid="email-input"
              />
              {errors.email && <p className="text-sm text-destructive" data-testid="email-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  data-testid="password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive" data-testid="password-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                  data-testid="confirm-password-input"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-confirm-password"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive" data-testid="confirm-password-error">{errors.confirmPassword.message}</p>
              )}
            </div>


            {/* Terms Agreement */}
            <div className="space-y-2">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="mt-1 h-4 w-4 text-primary"
                  data-testid="agree-terms-checkbox"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive" data-testid="agree-terms-error">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="register-submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-md bg-destructive/15 p-3" data-testid="register-error">
                <p className="text-sm text-destructive">{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary hover:underline" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
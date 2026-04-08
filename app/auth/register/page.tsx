'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth/context';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';
import { toast } from 'sonner';
import { userService } from '@/lib/database/services/user.service';
import { normalizeCoachCode } from '@/lib/utils/coach-code-generator';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [coachCodeStatus, setCoachCodeStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');
  const [validatedCoachName, setValidatedCoachName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student' as const,
      workflowType: 'automated' as const,
      agreeToTerms: false,
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  });

  const selectedRole = watch('role');
  const selectedWorkflowType = watch('workflowType');
  const watchedCoachCode = watch('coachCode');

  const validateCoachCode = async (code: string) => {
    if (!code || code.trim().length === 0) {
      setCoachCodeStatus('idle');
      setValidatedCoachName(null);
      return;
    }

    const normalizedCode = normalizeCoachCode(code);
    const formatPattern = /^[A-Z]+-[A-Z0-9]{4}$/;
    if (!formatPattern.test(normalizedCode)) {
      setCoachCodeStatus('idle');
      setValidatedCoachName(null);
      return;
    }

    setCoachCodeStatus('checking');

    try {
      const result = await userService.getCoachByCode(normalizedCode);
      if (result.success && result.data) {
        setCoachCodeStatus('valid');
        setValidatedCoachName(result.data.displayName);
      } else {
        setCoachCodeStatus('invalid');
        setValidatedCoachName(null);
      }
    } catch {
      setCoachCodeStatus('invalid');
      setValidatedCoachName(null);
    }
  };

  useEffect(() => {
    if (selectedRole !== 'student' || selectedWorkflowType !== 'custom') {
      setCoachCodeStatus('idle');
      setValidatedCoachName(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      if (watchedCoachCode) {
        validateCoachCode(watchedCoachCode);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedCoachCode, selectedRole, selectedWorkflowType]);

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      setIsLoading(true);
      await registerUser(data as RegisterFormData);

      toast.success('Account created successfully!', {
        description: 'Your account is ready. Let\'s complete onboarding.',
        duration: 6000,
      });

      if (data.role === 'parent') {
        router.push('/onboarding?role=parent');
      } else if (data.role === 'admin') {
        router.push('/admin');
      } else if (data.role === 'coach') {
        router.push('/coach');
      } else {
        router.push('/onboarding');
      }
    } catch (error) {
      if (isAuthError(error)) {
        setError('root', { message: error.userMessage });
        toast.error('Registration failed', { description: error.userMessage });
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Registration failed';
        setError('root', { message: errorMessage });
        toast.error('Registration failed', { description: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Register Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-4 flex justify-center">
            <Link href="/">
              <img src="/logo.png" alt="Smarter Goalie" className="h-10" />
            </Link>
          </div>

          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create an Account</h1>
            <p className="text-gray-500 text-sm">Enter your information to get started</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" data-testid="register-form">
            {/* Role Selection */}
            <div className="space-y-1">
              <Label htmlFor="role" className="text-gray-700 text-sm">I am a...</Label>
              <Select
                value={selectedRole}
                onValueChange={(value) => setValue('role', value as 'student' | 'parent' | 'coach')}
              >
                <SelectTrigger
                  id="role"
                  data-testid="role-select"
                  className="bg-gray-50 border-gray-300 text-gray-900 focus:ring-red-500"
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="student" data-testid="role-student" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Student / Athlete</SelectItem>
                  <SelectItem value="parent" data-testid="role-parent" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Parent</SelectItem>
                  <SelectItem value="coach" data-testid="role-coach" className="text-gray-900 hover:bg-gray-100 focus:bg-gray-100">Coach</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-500" data-testid="role-error">{errors.role.message}</p>
              )}
            </div>

            {/* Workflow Type Selection (Students Only) */}
            {selectedRole === 'student' && (
              <div className="space-y-1">
                <Label className="text-gray-700 text-sm">Learning Mode</Label>
                <RadioGroup
                  value={selectedWorkflowType}
                  onValueChange={(value) => setValue('workflowType', value as 'automated' | 'custom')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors">
                    <RadioGroupItem value="automated" id="automated" className="border-gray-300 text-red-500" />
                    <Label htmlFor="automated" className="font-normal cursor-pointer flex-1">
                      <div className="font-semibold text-sm text-gray-900">Self-Paced (Automated)</div>
                      <div className="text-xs text-gray-500">Progress automatically as you complete quizzes.</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 hover:bg-gray-100 transition-colors">
                    <RadioGroupItem value="custom" id="custom" className="border-gray-300 text-red-500" />
                    <Label htmlFor="custom" className="font-normal cursor-pointer flex-1">
                      <div className="font-semibold text-sm text-gray-900">Coach-Guided (Custom)</div>
                      <div className="text-xs text-gray-500">Work with a coach for personalized guidance.</div>
                    </Label>
                  </div>
                </RadioGroup>
                {errors.workflowType && (
                  <p className="text-xs text-red-500">{errors.workflowType.message}</p>
                )}
              </div>
            )}

            {/* Coach Code Input (Custom Workflow Students Only) */}
            {selectedRole === 'student' && selectedWorkflowType === 'custom' && (
              <div className="space-y-1">
                <Label htmlFor="coachCode" className="text-gray-700 text-sm">Coach Code</Label>
                <div className="relative">
                  <Input
                    id="coachCode"
                    placeholder="Enter your coach's code (e.g., SMITH-7K3M)"
                    {...register('coachCode')}
                    aria-invalid={!!errors.coachCode || coachCodeStatus === 'invalid'}
                    data-testid="coach-code-input"
                    className={`uppercase bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 ${
                      coachCodeStatus === 'valid'
                        ? 'border-green-500 focus-visible:ring-green-500'
                        : coachCodeStatus === 'invalid'
                        ? 'border-red-500 focus-visible:ring-red-500'
                        : ''
                    }`}
                    onChange={(e) => {
                      e.target.value = e.target.value.toUpperCase();
                      register('coachCode').onChange(e);
                    }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {coachCodeStatus === 'checking' && (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                    {coachCodeStatus === 'valid' && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {coachCodeStatus === 'invalid' && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
                {coachCodeStatus === 'valid' && validatedCoachName && (
                  <p className="text-sm text-green-600" data-testid="coach-code-valid">
                    Coach found: {validatedCoachName}
                  </p>
                )}
                {coachCodeStatus === 'invalid' && (
                  <p className="text-sm text-red-500" data-testid="coach-code-invalid">
                    Invalid coach code. Check with your coach.
                  </p>
                )}
                {errors.coachCode && (
                  <p className="text-sm text-red-500" data-testid="coach-code-error">
                    {errors.coachCode.message}
                  </p>
                )}
                <p className="text-[11px] text-gray-400">
                  Get this code from your coach before registering.
                </p>
              </div>
            )}

            {/* Display Name */}
            <div className="space-y-1">
              <Label htmlFor="displayName" className="text-gray-700 text-sm">Full Name</Label>
              <Input
                id="displayName"
                placeholder="Enter your full name"
                {...register('displayName')}
                aria-invalid={!!errors.displayName}
                data-testid="display-name-input"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 focus-visible:border-red-500"
              />
              {errors.displayName && (
                <p className="text-sm text-red-500" data-testid="display-name-error">{errors.displayName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-gray-700 text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                aria-invalid={!!errors.email}
                data-testid="email-input"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 focus-visible:border-red-500"
              />
              {errors.email && <p className="text-sm text-red-500" data-testid="email-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-gray-700 text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  data-testid="password-input"
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 focus-visible:border-red-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500" data-testid="password-error">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label htmlFor="confirmPassword" className="text-gray-700 text-sm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                  data-testid="confirm-password-input"
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 focus-visible:border-red-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  data-testid="toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500" data-testid="confirm-password-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="space-y-1">
              <label className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-gray-50 text-red-500 focus:ring-red-500"
                  data-testid="agree-terms-checkbox"
                />
                <span className="text-xs text-gray-500">
                  I agree to the{' '}
                  <Link href="/terms" className="text-red-500 hover:text-red-600 transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-red-500 hover:text-red-600 transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500" data-testid="agree-terms-error">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
              disabled={isLoading}
              data-testid="register-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Error */}
            {errors.root && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3" data-testid="register-error">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Login Link */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-red-500 hover:text-red-600 font-medium transition-colors" data-testid="login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right — Blurred Image Panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: 'url("/register.avif")' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-12">
          <Link href="/">
            <img src="/logo.png" alt="Smarter Goalie" className="h-12 mx-auto mb-8" />
          </Link>
          <h2 className="text-5xl font-bold text-white leading-tight mb-4">
            Start Your<br />Journey Today.
          </h2>
          <p className="text-zinc-300 text-lg max-w-md mx-auto">
            Join thousands of athletes training smarter with personalized drills, progress tracking, and expert coaching.
          </p>
        </div>
      </div>
    </div>
  );
}

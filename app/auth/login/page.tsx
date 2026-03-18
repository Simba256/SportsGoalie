'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/context';
import { loginSchema, type LoginFormData } from '@/lib/validation/auth';
import { isAuthError } from '@/lib/errors/auth-errors';

function VerificationMessage() {
  const searchParams = useSearchParams();
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'verify-email') {
      setShowMessage(true);
    }
  }, [searchParams]);

  if (!showMessage) return null;

  return (
    <div className="mb-4 rounded-lg border border-green-300 bg-green-50 p-4">
      <div className="flex items-center gap-2 text-green-700">
        <CheckCircle className="h-5 w-5" />
        <div>
          <p className="font-medium text-green-800">Registration Successful!</p>
          <p className="text-sm text-green-600">
            We&apos;ve sent a verification email to your inbox. Please verify your email before signing in.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      if (isAuthError(error)) {
        setError('root', {
          message: error.userMessage,
        });
      } else {
        setError('root', {
          message: error instanceof Error ? error.message : 'Login failed',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      let destination = '/dashboard';

      if (user.role === 'admin') {
        destination = '/admin';
      } else if (user.role === 'coach') {
        destination = '/coach';
      } else if (user.role === 'parent') {
        destination = '/parent';
      } else if (user.role === 'student' && !user.onboardingCompleted) {
        destination = '/onboarding';
      }

      console.log('[Auth Navigation] Redirecting after login', {
        userId: user.id,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        destination,
      });

      router.push(destination);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Blurred Image Panel */}
      <div className="relative hidden lg:flex lg:w-1/2 items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-sm scale-105"
          style={{ backgroundImage: 'url("/login.avif")' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 text-center px-12">
          <Link href="/">
            <img src="/logo.png" alt="Smarter Goalie" className="h-12 mx-auto mb-8" />
          </Link>
          <h2 className="text-5xl font-bold text-white leading-tight mb-4">
            Welcome Back,<br />Athlete.
          </h2>
          <p className="text-zinc-300 text-lg max-w-md mx-auto">
            Pick up where you left off — your drills, progress, and goals are waiting.
          </p>
        </div>
      </div>

      {/* Right — Sign In Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <img src="/logo.png" alt="Smarter Goalie" className="h-10" />
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </div>

          <Suspense fallback={null}>
            <VerificationMessage />
          </Suspense>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" data-testid="login-form">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                aria-invalid={!!errors.email}
                autoComplete="email"
                data-testid="email-input"
                className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-red-500 focus-visible:border-red-500"
              />
              {errors.email && <p className="text-sm text-red-500" data-testid="email-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <Link
                  href="/auth/reset-password"
                  className="text-sm text-red-500 hover:text-red-600 transition-colors"
                  data-testid="forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                  autoComplete="current-password"
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

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="rememberMe"
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-red-500 focus:ring-red-500"
                data-testid="remember-me-checkbox"
              />
              <Label htmlFor="rememberMe" className="text-sm font-normal text-gray-500">
                Remember me for 30 days
              </Label>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25"
              disabled={isLoading}
              data-testid="login-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            {/* Error */}
            {errors.root && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3" data-testid="login-error">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">Or</span>
            </div>
          </div>

          {/* Social Login Placeholder */}
          <div className="text-center">
            <p className="text-sm text-gray-400">Social login coming soon...</p>
          </div>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link href="/auth/register" className="text-red-500 hover:text-red-600 font-medium transition-colors" data-testid="register-link">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

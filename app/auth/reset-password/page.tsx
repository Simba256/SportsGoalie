'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/context';
import { passwordResetSchema, type PasswordResetFormData } from '@/lib/validations/auth';
import { isAuthError } from '@/lib/errors/auth-errors';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const onSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsLoading(true);
      await resetPassword(data.email);
      setIsEmailSent(true);
    } catch (error) {
      // Handle AuthError properly
      if (isAuthError(error)) {
        setError('root', {
          message: error.userMessage,
        });
      } else {
        setError('root', {
          message: error instanceof Error ? error.message : 'Failed to send reset email',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    const email = getValues('email');
    if (email) {
      try {
        setIsLoading(true);
        await resetPassword(email);
      } catch (error) {
        // Handle AuthError properly
        if (isAuthError(error)) {
          setError('root', {
            message: error.userMessage,
          });
        } else {
          setError('root', {
            message: error instanceof Error ? error.message : 'Failed to resend email',
          });
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isEmailSent) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Check Your Email</CardTitle>
            <CardDescription>
              We've sent a password reset link to your email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Reset link sent to: {getValues('email')}
                  </p>
                  <p className="text-sm text-blue-600">
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or
              </p>
              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full"
                data-testid="resend-email-button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend Email'
                )}
              </Button>
            </div>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="reset-password-form">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                {...register('email')}
                aria-invalid={!!errors.email}
                autoComplete="email"
                autoFocus
                data-testid="email-input"
              />
              {errors.email && <p className="text-sm text-destructive" data-testid="email-error">{errors.email.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading} data-testid="reset-password-submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            {/* Error Message */}
            {errors.root && (
              <div className="rounded-md bg-destructive/15 p-3" data-testid="reset-password-error">
                <p className="text-sm text-destructive">{errors.root.message}</p>
              </div>
            )}
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-primary hover:underline"
              data-testid="back-to-login-link"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Remember your password?{' '}
              <Link href="/auth/login" className="text-primary hover:underline" data-testid="signin-instead-link">
                Sign in instead
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
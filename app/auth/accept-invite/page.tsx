'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CoachInvitation } from '@/types/auth';
import { coachInvitationService } from '@/lib/services/coach-invitation.service';
import { useAuth } from '@/lib/auth/context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Lock,
  User,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Accept Coach Invitation Page Content
 */
function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { register } = useAuth();

  const [validating, setValidating] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<CoachInvitation | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    displayName: '',
    firstName: '',
    lastName: '',
  });

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setValidationError('Invalid invitation link. No token provided.');
      setValidating(false);
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (token: string) => {
    try {
      setValidating(true);
      const result = await coachInvitationService.validateInvitation(token);

      if (!result.valid) {
        setValidationError(result.error || 'Invalid invitation');
        setValidating(false);
        return;
      }

      setInvitation(result.invitation!);

      // Pre-fill form with invitation metadata
      if (result.invitation?.metadata) {
        setFormData(prev => ({
          ...prev,
          firstName: result.invitation!.metadata?.firstName || '',
          lastName: result.invitation!.metadata?.lastName || '',
          displayName:
            result.invitation!.metadata?.firstName && result.invitation!.metadata?.lastName
              ? `${result.invitation!.metadata.firstName} ${result.invitation!.metadata.lastName}`
              : '',
        }));
      }

      setValidating(false);
    } catch (error) {
      console.error('Token validation failed:', error);
      setValidationError('Failed to validate invitation');
      setValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation || !token) return;

    // Validate passwords
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    try {
      setSubmitting(true);

      // Register the coach using the auth context (same code path as student registration)
      // Skip email verification - clicking the invitation link IS the verification
      const { userId } = await register({
        email: invitation.email,
        password: formData.password,
        displayName: formData.displayName.trim(),
        role: 'coach',
        skipEmailVerification: true,
      });

      // Mark invitation as accepted
      await coachInvitationService.acceptInvitation(invitation.id, userId);

      toast.success('Coach account created successfully!', {
        description: 'Please verify your email to complete the registration.',
      });

      // Redirect to login page with email pre-filled
      router.push(`/auth/login?email=${encodeURIComponent(invitation.email)}&verified=pending`);
    } catch (error: any) {
      console.error('Registration failed:', error);
      toast.error('Failed to create coach account', {
        description: error.message || 'An error occurred during registration',
      });
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Loading state
  if (validating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-accent/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Validating invitation...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (validationError || !invitation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-accent/20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-6 w-6 text-destructive" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>{validationError}</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation link is invalid, expired, or has already been used.
                Please contact your administrator for a new invitation.
              </AlertDescription>
            </Alert>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/auth/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid invitation - show registration form
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-accent/20 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <CardTitle>Accept Coach Invitation</CardTitle>
          </div>
          <CardDescription>
            You've been invited to join as a coach by {invitation.invitedByName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Invitation Details */}
          <Alert className="mb-6">
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Email:</strong> {invitation.email}
              {invitation.metadata?.organizationName && (
                <>
                  <br />
                  <strong>Organization:</strong> {invitation.metadata.organizationName}
                </>
              )}
              {invitation.metadata?.customMessage && (
                <>
                  <br />
                  <br />
                  <em>"{invitation.metadata.customMessage}"</em>
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={e => handleChange('displayName', e.target.value)}
                  className="pl-10"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name (Optional)</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name (Optional)</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Email (disabled, pre-filled) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  className="pl-10 bg-muted"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email is pre-filled from your invitation
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  className="pl-10"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Coach Account'
              )}
            </Button>
          </form>

          {/* Already have account link */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Accept Coach Invitation Page (with Suspense boundary)
 */
export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}

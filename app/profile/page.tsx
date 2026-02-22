'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Loader2, Mail, Shield, User, Copy, Check } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/context';
import { profileUpdateSchema, type ProfileUpdateFormData } from '@/lib/validation/auth';

export default function ProfilePage() {
  const { user, updateUserProfile, resendEmailVerification } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [copiedStudentId, setCopiedStudentId] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      photoURL: user?.photoURL || '',
    },
  });

  const onSubmit = async (data: ProfileUpdateFormData) => {
    try {
      setIsLoading(true);
      await updateUserProfile(data);
      reset(data);
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsResendingVerification(true);
      await resendEmailVerification();
    } catch (error) {
      setError('root', {
        message: error instanceof Error ? error.message : 'Failed to send verification email',
      });
    } finally {
      setIsResendingVerification(false);
    }
  };

  const copyStudentIdToClipboard = async () => {
    if (user?.studentNumber) {
      await navigator.clipboard.writeText(user.studentNumber);
      setCopiedStudentId(true);
      setTimeout(() => setCopiedStudentId(false), 2000);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account information and preferences.</p>
        </div>

        {/* Email Verification Banner */}
        {!user.emailVerified && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Email not verified</p>
                    <p className="text-sm text-yellow-600">
                      Please verify your email address to access all features.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResendingVerification}
                >
                  {isResendingVerification ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your personal information and profile picture.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Profile"
                      width={80}
                      height={80}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="photoURL">Profile Picture URL</Label>
                  <Input
                    id="photoURL"
                    placeholder="https://example.com/photo.jpg"
                    {...register('photoURL')}
                    aria-invalid={!!errors.photoURL}
                  />
                  {errors.photoURL && (
                    <p className="text-sm text-destructive">{errors.photoURL.message}</p>
                  )}
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  {...register('displayName')}
                  aria-invalid={!!errors.displayName}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive">{errors.displayName.message}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed. Contact support if you need to update it.
                </p>
              </div>

              {/* Student ID (Read-only, only for students) */}
              {user.role === 'student' && user.studentNumber && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="studentId"
                      value={user.studentNumber}
                      disabled
                      className="bg-muted font-mono text-lg"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyStudentIdToClipboard}
                      title="Copy Student ID"
                    >
                      {copiedStudentId ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Share this ID with your parents so they can link their account to yours.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {errors.root && (
                <div className="rounded-md bg-destructive/15 p-3">
                  <p className="text-sm text-destructive">{errors.root.message}</p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Type</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                <p className="font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Status</p>
                <p className="font-medium">
                  {user.emailVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending Verification</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="font-medium">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
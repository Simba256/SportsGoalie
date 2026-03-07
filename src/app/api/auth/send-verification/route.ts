import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { emailService } from '@/lib/services/email.service';

/**
 * POST /api/auth/send-verification
 *
 * Sends a branded email verification email using Resend.
 * Generates a Firebase verification link and wraps it in our branded template.
 *
 * Request body:
 * - email: string - User's email address
 * - displayName: string - User's display name for personalization
 *
 * Response:
 * - 200: Email sent successfully
 * - 400: Missing required fields
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate Firebase email verification link
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?verified=true`,
      handleCodeInApp: false,
    };

    const verificationLink = await adminAuth.generateEmailVerificationLink(
      email,
      actionCodeSettings
    );

    // Send branded verification email via our email service
    await emailService.sendVerificationEmail({
      to: email,
      displayName: displayName || '',
      verificationLink,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);

    // Handle specific Firebase Admin errors
    if (error instanceof Error) {
      if (error.message.includes('auth/user-not-found')) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      if (error.message.includes('auth/invalid-email')) {
        return NextResponse.json(
          { error: 'Invalid email address' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

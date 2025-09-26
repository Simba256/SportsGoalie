import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * API endpoint to set up admin users using Firebase Custom Claims
 * This should be used with caution and proper authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { uid, email, secretKey } = await request.json();

    // Basic validation
    if (!uid || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing uid or email' },
        { status: 400 }
      );
    }

    // SECURITY: Add a secret key check for admin setup
    // In production, you might want to use environment variables
    const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET || 'your-secret-key-here';

    if (secretKey !== ADMIN_SETUP_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Invalid secret key' },
        { status: 401 }
      );
    }

    // Verify the user exists
    const userRecord = await adminAuth.getUser(uid);

    if (!userRecord) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Set custom claims for admin role
    await adminAuth.setCustomUserClaims(uid, {
      role: 'admin',
      admin: true,
      adminSetupDate: new Date().toISOString()
    });

    console.log(`✅ Admin role assigned to user: ${email} (${uid})`);

    return NextResponse.json({
      success: true,
      message: 'Admin role assigned successfully',
      user: {
        uid,
        email: userRecord.email,
        role: 'admin'
      }
    });

  } catch (error) {
    console.error('❌ Error setting up admin:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get current admin status of a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { success: false, error: 'Missing uid parameter' },
        { status: 400 }
      );
    }

    // Get user record with custom claims
    const userRecord = await adminAuth.getUser(uid);
    const claims = userRecord.customClaims || {};

    return NextResponse.json({
      success: true,
      user: {
        uid,
        email: userRecord.email,
        role: claims.role || 'student',
        isAdmin: claims.admin === true,
        adminSetupDate: claims.adminSetupDate || null
      }
    });

  } catch (error) {
    console.error('❌ Error getting admin status:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
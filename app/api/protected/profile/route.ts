import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for general user authentication middleware
 * This endpoint will be protected by our middleware.ts for any authenticated user
 */
export async function GET(request: NextRequest) {
  // At this point, the middleware has already validated the user authentication
  // User info is available in headers
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userEmail = request.headers.get('x-user-email');

  return NextResponse.json({
    success: true,
    message: 'Protected endpoint accessed successfully',
    user: {
      id: userId,
      role: userRole,
      email: userEmail,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function PUT(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  try {
    const body = await request.json();

    // Simulate updating user profile
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        ...body,
        updatedBy: userId,
        updatedAt: new Date().toISOString(),
      },
      user: {
        id: userId,
        role: userRole,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INVALID_REQUEST_BODY',
          message: 'Invalid JSON in request body',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}
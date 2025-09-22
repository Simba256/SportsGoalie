import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint for admin authentication middleware
 * This endpoint will be protected by our middleware.ts
 */
export async function GET(request: NextRequest) {
  // At this point, the middleware has already validated the admin role
  // User info is available in headers
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');
  const userEmail = request.headers.get('x-user-email');

  return NextResponse.json({
    success: true,
    message: 'Admin endpoint accessed successfully',
    user: {
      id: userId,
      role: userRole,
      email: userEmail,
    },
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id');
  const userRole = request.headers.get('x-user-role');

  try {
    const body = await request.json();

    return NextResponse.json({
      success: true,
      message: 'Admin POST request processed successfully',
      data: body,
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
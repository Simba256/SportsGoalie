import { NextResponse } from 'next/server';

/**
 * Public health check endpoint
 * This endpoint should NOT be protected by middleware
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Public API is healthy',
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '3.0.0',
  });
}
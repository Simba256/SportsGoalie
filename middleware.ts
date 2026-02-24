import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectApiRoute, createAuthErrorResponse } from '@/lib/auth/server-validation';

/**
 * Next.js Middleware for protecting admin routes and API endpoints
 * This runs on the Edge Runtime for optimal performance
 */

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes and static assets
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for routes that handle their own auth
  if (pathname === '/api/admin/chat') {
    return NextResponse.next();
  }

  // Protect admin API routes
  if (pathname.startsWith('/api/admin/')) {
    try {
      const authResult = await protectApiRoute(request, true); // Require admin

      if (!authResult.success) {
        return createAuthErrorResponse(authResult.error!, 401);
      }

      // Add user info to headers for downstream use
      const response = NextResponse.next();
      response.headers.set('x-user-id', authResult.user!.uid);
      response.headers.set('x-user-role', authResult.user!.role);
      response.headers.set('x-user-email', authResult.user!.email);

      return response;
    } catch (error) {
      return createAuthErrorResponse(
        {
          code: 'MIDDLEWARE_ERROR',
          message: 'Authentication middleware failed',
        },
        500
      );
    }
  }

  // Protect general API routes that require authentication
  if (pathname.startsWith('/api/protected/')) {
    try {
      const authResult = await protectApiRoute(request, false); // Any authenticated user

      if (!authResult.success) {
        return createAuthErrorResponse(authResult.error!, 401);
      }

      // Add user info to headers
      const response = NextResponse.next();
      response.headers.set('x-user-id', authResult.user!.uid);
      response.headers.set('x-user-role', authResult.user!.role);
      response.headers.set('x-user-email', authResult.user!.email);

      return response;
    } catch (error) {
      return createAuthErrorResponse(
        {
          code: 'MIDDLEWARE_ERROR',
          message: 'Authentication middleware failed',
        },
        500
      );
    }
  }

  return NextResponse.next();
}

/**
 * Determines if a route is public and doesn't require authentication
 */
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/sports',
    '/quizzes',
    '/help',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const publicPrefixes = [
    '/api/public/',
    '/api/auth/',
    '/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/images/',
    '/icons/',
  ];

  // Check exact matches
  if (publicRoutes.includes(pathname)) {
    return true;
  }

  // Check prefixes
  if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return true;
  }

  // Static files
  if (pathname.includes('.') && !pathname.startsWith('/api/')) {
    return true;
  }

  return false;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
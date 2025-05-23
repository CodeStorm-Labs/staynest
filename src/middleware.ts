import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// Create the i18n middleware
const i18nMiddleware = createMiddleware({
  locales: ['en', 'tr'],
  defaultLocale: 'tr',
  localePrefix: 'as-needed',
});

export default function middleware(request: NextRequest) {
  // Apply i18n middleware first
  const response = i18nMiddleware(request);
  
  // Check if the pathname should be public
  const publicPatterns = ['/login', '/signup', '/forgot-password', '/verify-request', '/error', '/'];
  const isPublicRoute = publicPatterns.some(pattern => 
    request.nextUrl.pathname.endsWith(pattern) || 
    request.nextUrl.pathname === pattern
  );

  // Admin-only routes that require admin privileges
  const adminRoutes = [
    '/admin',
    '/admin/users',
    '/admin/listings',
    '/admin/bookings',
    '/admin/settings',
  ];
  
  const isAdminRoute = adminRoutes.some(route => 
    request.nextUrl.pathname.includes(route)
  );

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard', 
    '/settings', 
    '/bookings', 
    '/properties',
    '/listings/new',
    '/listings/edit'
  ];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.includes(route)
  ) || isAdminRoute;

  // If it's a public route, just apply i18n and let the client handle auth checks
  if (!isProtectedRoute || isPublicRoute) {
    return response;
  }

  const locale = request.nextUrl.pathname.split('/')[1] || 'tr';
  
  // First check for admin_session cookie for admin routes
  const adminSessionCookie = request.cookies.get('admin_session');
  
  // If admin route but no admin session, redirect to login
  if (isAdminRoute) {
    // Check if admin_session cookie exists
    if (adminSessionCookie && adminSessionCookie.value === 'true') {
      // Allow access - we'll do the full admin verification in the API/page
      return response;
    }
    
    // Not an admin, redirect to dashboard or login
    const authSessionCookie = request.cookies.get('auth_session');
    if (authSessionCookie) {
      // User is logged in but not admin, redirect to regular dashboard
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    } else {
      // Not logged in at all, redirect to login
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }
  
  // For regular protected routes, check either admin or regular auth session
  if (adminSessionCookie && adminSessionCookie.value === 'true') {
    return response;
  }
  
  // Check for better-auth session
  const authSessionCookie = request.cookies.get('auth_session');
  if (!authSessionCookie) {
    // No session, redirect to login
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }
  
  // Allow the request to proceed
  return response;
}

// Matcher for routes that should invoke this middleware
export const config = {
  matcher: [
    // Apply to all paths except static files, api routes, and _next
    '/((?!api|_next|.*\\..*).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user_id from cookies
  const userIdCookie = request.cookies.get('user_id');
  const isAuthenticated = !!userIdCookie;
  
  // Define public routes (routes that don't require authentication)
  const publicRoutes = ['/auth/login', '/auth/sign-up', '/auth/sign-up-success'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access auth pages, redirect to home
  if (isAuthenticated && isPublicRoute && pathname !== '/auth/sign-up-success') {
    const homeUrl = new URL('/', request.url);
    return NextResponse.redirect(homeUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const apiKeys = {
  n8n: process.env.N8N_API_KEY}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    // Define external API routes that require bearer token authentication
    const externalApiRoutes = [
      '/api/todos/enhance',
      '/api/todos/pending'
    ];
    
    // Check if this is an external API route that needs bearer token
    const isExternalApi = externalApiRoutes.some(route => pathname.startsWith(route));
    
    if (isExternalApi) {
      // For external API calls, require bearer token authentication
      const authHeader = request.headers.get("Authorization");
      const callFrom = request.headers.get("x-call-from");
      const apiKey = apiKeys[callFrom as keyof typeof apiKeys];

      console.log(`Auth Header: ${authHeader}`);
      console.log(`API Key: ${apiKey}`);
      console.log(`Call From: ${callFrom}`);

      if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    // All other API routes (internal) will pass through without bearer token check

    return NextResponse.next();
  }
  
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
     * Match all request paths except for static files and Next.js internals
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (HMR)
     * - _next/* (all other Next.js internal routes)
     * - favicon.ico (favicon file)
     * - *.ico, *.png, *.svg, *.jpg, *.jpeg, *.gif, *.webp (image files)
     * Include API routes for authentication
     */
    '/((?!_next|favicon.ico|.*\\.ico$|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.webp$).*)',
  ],
};

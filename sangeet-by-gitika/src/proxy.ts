import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, getTokenFromCookie } from './lib/auth';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = getTokenFromCookie(request.headers.get('cookie'));

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('token');
      return response;
    }

    // Add user info to headers for use in pages
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-id', payload.id);
    requestHeaders.set('x-admin-email', payload.email);
    requestHeaders.set('x-admin-role', payload.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};

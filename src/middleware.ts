import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protect all main app routes from unauthenticated access
export async function middleware(req: NextRequest) {
  // List of protected routes
  const protectedRoutes = ['/dashboard', '/club', '/challenges', '/profile'];
  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
  return NextResponse.next();
}

// Protect all main routes
export const config = {
  matcher: ['/dashboard/:path*', '/club/:path*', '/challenges/:path*', '/profile/:path*'],
};

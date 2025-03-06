import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // More specific matcher pattern to prevent redirect loops
  matcher: [
    /*
     * Match all request paths except:
     * - API routes (/api/*)
     * - Auth routes (/api/auth/*)
     * - Next.js static files (_next/static/*)
     * - Next.js image optimization files (_next/image/*)
     * - Favicon (favicon.ico)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

// Re-enable middleware with safer configuration
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match only specific paths that need auth:
     * - /chat/:path* routes for chat functionality
     * - /login and /register for auth redirects
     */
    '/chat/:path*',
    '/login',
    '/register'
  ],
};

import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Exclude the auth API routes from the middleware to avoid circular redirects
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
    '/', 
    '/:id', 
    '/login', 
    '/register'
  ],
};

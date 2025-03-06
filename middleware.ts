import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

// Temporarily disabling middleware to test if it's causing navigation issues
// export default NextAuth(authConfig).auth;

export const config = {
  // Empty matcher to effectively disable
  matcher: [],
};

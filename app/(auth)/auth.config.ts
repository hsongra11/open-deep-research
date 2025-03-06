import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  providers: [
    // added later in auth.ts since it requires bcrypt which is only compatible with Node.js
    // while this file is also used in non-Node.js environments
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnRegister = nextUrl.pathname.startsWith('/register');
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnAuthPages = isOnLogin || isOnRegister;
      const isOnChatPage = nextUrl.pathname.startsWith('/chat/');
      const isOnHomePage = nextUrl.pathname === '/';
      const isOnPublicPage = isOnHomePage;

      // Always allow access to API routes for authenticated users
      if (nextUrl.pathname.startsWith('/api/') && isLoggedIn) {
        return true;
      }

      // Only redirect authenticated users away from auth pages if they are explicitly on those pages
      if (isLoggedIn && isOnAuthPages) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Only redirect unauthenticated users to login for specific protected pages
      if (!isLoggedIn && !isOnAuthPages && !isOnPublicPage) {
        // Allow limited preview access without forcing login for all routes
        if (isOnChatPage || nextUrl.pathname.includes('/history')) {
          console.log(`Redirecting unauthenticated user from ${nextUrl.pathname} to login`);
          return Response.redirect(new URL('/login', nextUrl));
        }
      }

      // Allow access to all other routes
      return true;
    },
  },
} satisfies NextAuthConfig;

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
      const isOnPublicPage = nextUrl.pathname === '/';

      // Only redirect authenticated users away from auth pages if they are explicitly on those pages
      // This prevents redirect loops when the middleware captures other paths
      if (isLoggedIn && isOnAuthPages) {
        return Response.redirect(new URL('/', nextUrl));
      }

      // Only redirect unauthenticated users to login for non-public pages
      if (!isLoggedIn && !isOnAuthPages && !isOnPublicPage) {
        return Response.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

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

      // Redirect authenticated users away from auth pages
      if (isLoggedIn && isOnAuthPages) {
        return Response.redirect(new URL('/', nextUrl as unknown as URL));
      }

      // Allow public access only to public pages and auth pages
      if (!isLoggedIn && !isOnAuthPages && !isOnPublicPage) {
        return Response.redirect(new URL('/login', nextUrl as unknown as URL));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

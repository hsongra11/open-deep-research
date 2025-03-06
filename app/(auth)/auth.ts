import { compare } from 'bcrypt-ts';
import NextAuth, { type User, type Session } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { getUser, createUser } from '@/lib/db/queries';
import { authConfig } from './auth.config';

interface ExtendedSession extends Session {
  user: User & { username?: string };
}

// This function is kept for backwards compatibility but will no longer be used
async function createAnonymousUser() {
  const anonymousEmail = `anon_${Date.now()}@anonymous.user`;
  const anonymousPassword = `anon_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  try {
    // First create the user without username to be compatible with existing database
    await createUser(anonymousEmail, anonymousPassword);
    
    // Then verify the user was created by fetching it
    const [user] = await getUser(anonymousEmail);
    return user;
    
  } catch (error) {
    console.error('Failed to create anonymous user:', error);
    // Instead of returning null, throw an error to prevent auth from proceeding
    throw new Error('Anonymous user creation failed');
  }
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        try {
          // No longer supporting anonymous access
          if (!email || !password) {
            return null;
          }

          // Handle regular authentication
          const users = await getUser(email);
          if (users.length === 0) return null;
          
          // biome-ignore lint: Forbidden non-null assertion.
          const passwordsMatch = await compare(password, users[0].password!);
          if (!passwordsMatch) return null;
          
          // Add fallback for username if it doesn't exist
          const user = {
            ...users[0],
            username: users[0].username || email.split('@')[0] // Use part of email as fallback username
          };
          
          console.log("User authenticated:", user.email);
          return user as any;
        } catch (error) {
          console.error('Authentication failed:', error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login', // Error code passed in query string as ?error=
  },
  // Add proxy configuration for Docker environment
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      },
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours - how frequently to resave
  },
  debug: process.env.NODE_ENV === 'development',
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.username = token.username as string;
      }

      return session;
    },
  },
});

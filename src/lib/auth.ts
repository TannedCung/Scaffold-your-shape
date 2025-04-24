import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

// Generate a default secret for development if not provided
const defaultSecret = 'THIS_IS_A_DEV_SECRET_DO_NOT_USE_IN_PRODUCTION';

// Simple in-memory user for dev/demo
const mockUser = {
  id: '1',
  email: 'demo@scaffold.com',
  password: 'demo123',
  name: 'Demo User',
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Simple local check for demo
        if (
          credentials?.email === mockUser.email &&
          credentials?.password === mockUser.password
        ) {
          return {
            id: mockUser.id,
            email: mockUser.email,
            name: mockUser.name,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/sign-in',
    signOut: '/',
    error: '/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url === baseUrl || url.startsWith(`${baseUrl}/`)) {
        if (url.includes('callbackUrl=')) {
          const callbackUrl = new URL(url).searchParams.get('callbackUrl');
          if (callbackUrl) return callbackUrl;
        }
        return `${baseUrl}/dashboard`;
      } else if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return url;
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || defaultSecret,
  debug: process.env.NODE_ENV === 'development',
};

export { authOptions };

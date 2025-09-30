// Removed unused NextAuth import
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from './supabase';

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !user) {
            return null;
          }

          // Fetch profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          return {
            id: user.id,
            email: user.email,
            name: profile?.name || user.email?.split('@')[0],
            profile: profile,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/sign-in',
    signOut: '/',
    error: '/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.profile = user.profile;
      }

      // Handle profile updates
      if (token.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', token.id)
          .maybeSingle();

        if (profile) {
          token.profile = profile;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.profile = token.profile;
      }
      return session;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || defaultSecret,
  debug: process.env.NODE_ENV === 'development',
};

export { authOptions };

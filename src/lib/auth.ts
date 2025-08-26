import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from './db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid email or password');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw new Error('Authentication failed');
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('NextAuth signIn callback:', { user: user?.email, account: account?.provider, profile: profile?.name });
      
      try {
        // Allow sign in for all providers
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // Prevent redirect loops by checking if we're already on signin page
      if (url.includes('/signin') || url.includes('/api/auth/signin')) {
        console.log('Preventing signin redirect loop, redirecting to dashboard');
        return `${baseUrl}/dashboard`;
      }
      
      // If it's a relative URL starting with /, use it
      if (url.startsWith('/')) {
        const targetUrl = `${baseUrl}${url}`;
        console.log('Relative URL redirect:', targetUrl);
        return targetUrl;
      }
      
      // If it's the same origin, allow it
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        if (urlObj.origin === baseUrlObj.origin) {
          console.log('Same origin redirect:', url);
          return url;
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
      
      // Default to dashboard page after signin
      const dashboardUrl = `${baseUrl}/dashboard`;
      console.log('Default dashboard redirect:', dashboardUrl);
      return dashboardUrl;
    },
    async jwt({ token, user, account }) {
      console.log('JWT callback:', { token: !!token, user: user?.email, account: account?.provider });
      
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      
      console.log('JWT callback result:', { id: token.id, email: token.email });
      return token;
    },
    async session({ session, token }) {
      console.log('Session callback:', { session: !!session, token: !!token });
      
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      
      console.log('Session callback result:', { id: session.user?.id, email: session.user?.email });
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
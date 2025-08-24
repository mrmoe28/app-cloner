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
      // Allow sign in for all providers
      return true;
    },
    async redirect({ url, baseUrl }) {
      console.log('NextAuth redirect callback:', { url, baseUrl });
      
      // If it's a relative URL starting with /, use it or default to dashboard
      if (url.startsWith('/')) {
        const targetUrl = url === '/' ? `${baseUrl}/dashboard` : `${baseUrl}${url}`;
        console.log('Relative URL redirect:', targetUrl);
        return targetUrl;
      }
      
      // If it's the same origin, allow it
      try {
        if (new URL(url).origin === baseUrl) {
          console.log('Same origin redirect:', url);
          return url;
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }
      
      // Default to dashboard
      const dashboardUrl = `${baseUrl}/dashboard`;
      console.log('Default dashboard redirect:', dashboardUrl);
      return dashboardUrl;
    },
    async session({ session, token, user }) {
      if (session?.user) {
        session.user.id = token.sub || user?.id || '';
        
        // Add additional user data to session
        if (token) {
          session.user.name = token.name as string;
          session.user.email = token.email as string;
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.uid = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      
      // Update token with OAuth profile data
      if (account && profile) {
        if (account.provider === 'google' && profile) {
          token.name = profile.name;
          token.picture = profile.picture;
        }
        if (account.provider === 'github' && profile) {
          token.name = profile.name || profile.login;
          token.picture = profile.avatar_url;
        }
      }
      
      return token;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    signUp: '/signup',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
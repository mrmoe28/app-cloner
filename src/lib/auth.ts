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
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth signIn callback:', { 
          user: user?.email, 
          account: account?.provider, 
          profile: profile?.name 
        });
      }
      
      try {
        // Allow sign in for all providers
        return true;
      } catch (error) {
        console.error('SignIn callback error:', error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (process.env.NODE_ENV === 'development') {
        console.log('NextAuth redirect callback:', { url, baseUrl });
      }
      
      // Always redirect to dashboard after successful signin
      // This prevents loops and ensures consistent behavior
      if (url.includes('/api/auth/signin') || url.includes('/signin')) {
        const dashboardUrl = `${baseUrl}/dashboard`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Redirecting from signin to dashboard:', dashboardUrl);
        }
        return dashboardUrl;
      }
      
      // For callback URLs, redirect to dashboard
      if (url.includes('/api/auth/callback')) {
        const dashboardUrl = `${baseUrl}/dashboard`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Redirecting from callback to dashboard:', dashboardUrl);
        }
        return dashboardUrl;
      }
      
      // Handle relative URLs that start with /
      if (url.startsWith('/') && !url.startsWith('//')) {
        // Only allow safe internal paths
        const safePaths = ['/dashboard', '/profile', '/create', '/subscription'];
        const pathMatch = safePaths.some(path => url.startsWith(path));
        
        if (pathMatch) {
          const targetUrl = `${baseUrl}${url}`;
          if (process.env.NODE_ENV === 'development') {
            console.log('Allowing safe relative URL redirect:', targetUrl);
          }
          return targetUrl;
        }
        
        // Default to dashboard for unsafe paths
        const dashboardUrl = `${baseUrl}/dashboard`;
        if (process.env.NODE_ENV === 'development') {
          console.log('Unsafe relative URL, redirecting to dashboard:', dashboardUrl);
        }
        return dashboardUrl;
      }
      
      // Handle absolute URLs - only allow same origin
      try {
        const urlObj = new URL(url);
        const baseUrlObj = new URL(baseUrl);
        
        if (urlObj.origin === baseUrlObj.origin) {
          // Additional safety check for allowed paths
          const safePaths = ['/dashboard', '/profile', '/create', '/subscription'];
          const pathMatch = safePaths.some(path => urlObj.pathname.startsWith(path));
          
          if (pathMatch) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Allowing safe same-origin redirect:', url);
            }
            return url;
          }
        }
      } catch (e) {
        console.error('Error parsing URL in redirect callback:', e);
      }
      
      // Default fallback - always go to dashboard
      const dashboardUrl = `${baseUrl}/dashboard`;
      if (process.env.NODE_ENV === 'development') {
        console.log('Fallback redirect to dashboard:', dashboardUrl);
      }
      return dashboardUrl;
    },
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id = user.id;
        session.user.name = user.name || session.user.name;
        session.user.email = user.email || session.user.email;
        session.user.image = user.image || session.user.image;
      }
      return session;
    },
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};
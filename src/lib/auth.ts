import { NextAuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { getMongoClientPromise } from '@/lib/db/mongoClient';
import connectDB from '@/lib/db/connect';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

// Lazy initialization of auth options to avoid build-time errors
let cachedAuthOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (cachedAuthOptions) {
    return cachedAuthOptions;
  }

  cachedAuthOptions = {
    adapter: MongoDBAdapter(getMongoClientPromise()) as NextAuthOptions['adapter'],
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      }),
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

          await connectDB();

          // Find user with password field explicitly selected
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user || !user.password) {
            throw new Error('No user found with this email');
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error('Invalid password');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
    ],
    session: {
      strategy: 'jwt',
    },
    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
          token.role = (user as { role?: string }).role;

          // If signing in with Google, sync user data to our User model
          if (account?.provider === 'google' && user.email) {
            await connectDB();
            const existingUser = await User.findOne({ email: user.email }).exec();

            if (!existingUser) {
              // Create user in our User model for Google OAuth users
              const newUser = await User.create({
                email: user.email,
                name: user.name || '',
                image: user.image || undefined,
                role: 'PARENT', // Default role for OAuth users
              });
              token.id = newUser._id.toString();
              token.role = newUser.role;
            } else {
              token.id = existingUser._id.toString();
              token.role = existingUser.role;
            }
          }
        } else if (token.id) {
          // Refresh role from DB on token refresh so role changes take effect without re-login
          await connectDB();
          const dbUser = await User.findById(token.id).select('role').lean().exec();
          if (dbUser) token.role = (dbUser as { role: string }).role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          (session.user as { id?: string }).id = token.id as string;
          (session.user as { role?: string }).role = token.role as string;
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
      error: '/login',
    },
    debug: process.env.NODE_ENV === 'development',
  };

  return cachedAuthOptions;
}

// For backwards compatibility
export const authOptions = {
  get adapter() { return getAuthOptions().adapter; },
  get providers() { return getAuthOptions().providers; },
  get session() { return getAuthOptions().session; },
  get callbacks() { return getAuthOptions().callbacks; },
  get pages() { return getAuthOptions().pages; },
} as NextAuthOptions;

// JWT verification helper for mobile app
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

export interface JWTPayload {
  id: string;
  email: string;
  role?: string;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function getRequestUserRole(request: NextRequest): Promise<string | undefined> {
  const token = extractTokenFromRequest(request);
  if (token) {
    const decoded = verifyJWT(token);
    if (decoded?.role) return decoded.role;
  }
  const session = await getServerSession(authOptions);
  return (session?.user as { role?: string })?.role;
}

export function extractTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
}

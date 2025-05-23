import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/db';
import { account, session, user, verification, userTier } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

type UserData = {
  name?: string;
  email: string;
  emailVerified?: boolean;
  image?: string;
};

type SessionData = {
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress?: string;
  userAgent?: string;
};

type AccountData = {
  userId: string;
  providerId: string;
  accountId: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  password?: string;
};

type VerificationData = {
  identifier: string;
  value: string;
  expiresAt: Date;
};

export const auth = betterAuth({
  secretKey: process.env.AUTH_SECRET || 'your-secret-key',
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      account,
      session,
      verification
    }
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    verifyEmail: false
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }
  }
});

export async function authMiddleware(request: NextRequest): Promise<boolean> {
  try {
    // Get the session token from cookies
    const cookieName = 'auth_session'; // Default better-auth cookie name
    const authCookie = request.cookies.get(cookieName);
    
    if (!authCookie || !authCookie.value) {
      return false;
    }
    
    // Validate the session token
    const headers = new Headers();
    headers.append('Cookie', `${cookieName}=${authCookie.value}`);
    
    const session = await auth.api.getSession({
      headers
    });
    
    if (!session || !session.user) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
}

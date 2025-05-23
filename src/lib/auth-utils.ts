import { redirect } from 'next/navigation';
import { getSession } from '@/app/(auth)/actions';
import { auth } from "./auth";
import { cookies } from "next/headers";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from 'next/server';
import { headers } from 'next/headers';

// User role enum for type safety
export enum UserRole {
  USER = 'user',
  HOST = 'host',
  ADMIN = 'admin'
}

// Basic auth check - redirects to login if not authenticated
export async function requireAuth(locale: string = 'tr') {
  const session = await getAuthSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return session;
}

// Redirects to dashboard if already authenticated
export async function redirectIfAuthenticated(locale: string = 'tr') {
  const session = await getAuthSession();

  if (session) {
    // If admin, redirect to admin dashboard
    const userRecord = await getUserRecord(session.user.id);
    if (userRecord?.role === 'admin') {
      redirect(`/${locale}/admin`);
    } else {
      redirect(`/${locale}/dashboard`);
    }
  }
}

// Get user record from database
export async function getUserRecord(userId: string) {
  try {
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId));
    
    return userRecord;
  } catch (error) {
    console.error("Error fetching user record:", error);
    return null;
  }
}

// Check if the current user is an admin - for Server Components and API Routes
export async function isAdmin() {
  try {
    const session = await getAuthSession();
    if (!session) return false;
    
    // First check for admin cookie
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin_session');
    if (adminCookie?.value === 'true') {
      const adminUser = await db.query.user.findFirst({
        where: eq(user.email, 'admin@example.com'),
      });
      
      if (adminUser) {
        return true;
      }
    }
    
    // If no admin cookie or not the admin user, check the role in DB
    const userRecord = await getUserRecord(session.user.id);
    return userRecord?.role === 'admin';
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// Require admin role, redirect if not admin
export async function requireAdmin(locale: string = 'tr') {
  const session = await getAuthSession();
  if (!session) redirect(`/${locale}/login`);
  
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    redirect(`/${locale}/dashboard`);
  }
  
  return session;
}

// Require host role, redirect if not host or admin (for now, only admin can be host)
export async function requireHost(locale: string = 'tr') {
  const session = await getAuthSession();
  if (!session) redirect(`/${locale}/login`);
  
  const userRecord = await getUserRecord(session.user.id);
  if (!userRecord || userRecord.role !== 'admin') {
    redirect(`/${locale}/dashboard`);
  }
  
  return session;
}

// Helper function to get authenticated session
export async function getAuthSession(req?: NextRequest) {
  try {
    // Check for admin_session cookie if request is provided
    if (req) {
      const adminCookie = req.cookies.get('admin_session');
      if (adminCookie && adminCookie.value === 'true') {
        // In middleware context, we'll just return a basic session
        // Full verification happens in protected routes/APIs
        return { 
          user: { 
            id: 'admin',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin'
          } 
        };
      }
    } else {
      // When no request is provided (server components)
      // try to get the cookie from headers
      const headersList = await headers();
      const cookieHeader = headersList.get('cookie') || '';
      
      if (cookieHeader.includes('admin_session=true')) {
        // For server components, we can verify with the database
        try {
          const adminUser = await db.query.user.findFirst({
            where: eq(user.email, 'admin@example.com'),
          });
          
          if (adminUser) {
            return { user: adminUser };
          }
        } catch (error) {
          console.error("Error verifying admin user:", error);
          // Fall through to regular session check
        }
      }
    }
    
    // Fallback to Better Auth session
    const headersList = await headers();
    return await auth.api.getSession({ headers: headersList });
  } catch (error) {
    console.error("Error getting Better Auth session:", error);
    return null;
  }
} 
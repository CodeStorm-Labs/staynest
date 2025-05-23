import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check for admin cookie
    const adminCookie = req.cookies.get('admin_session');
    if (adminCookie && adminCookie.value === 'true') {
      const adminUser = await db.query.user.findFirst({
        where: eq(user.email, 'admin@example.com'),
      });
      
      if (adminUser && adminUser.role === 'admin') {
        return NextResponse.json({ isAdmin: true });
      }
    }
    
    // Check Better Auth session
    const authHeader = req.headers.get('cookie');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized', isAdmin: false },
        { status: 401 }
      );
    }
    
    // Get session from auth cookie
    const headers = new Headers();
    headers.append('cookie', authHeader);
    
    const session = await auth.api.getSession({
      headers
    });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized', isAdmin: false },
        { status: 401 }
      );
    }
    
    // Check the user's role in the database
    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id));
    
    if (!userRecord || userRecord.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden', isAdmin: false },
        { status: 403 }
      );
    }
    
    // User is admin!
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error in verify-admin API:', error);
    return NextResponse.json(
      { error: 'Internal server error', isAdmin: false },
      { status: 500 }
    );
  }
} 
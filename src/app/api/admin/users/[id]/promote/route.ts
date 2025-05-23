import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if current user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  const { id } = params;
  
  try {
    // Update user role to admin
    await db
      .update(user)
      .set({ role: 'admin' })
      .where(eq(user.id, id));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
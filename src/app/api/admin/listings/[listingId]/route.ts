import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { listing } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { listingId: string } }
) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const { listingId } = params;
    const { action } = await req.json();
    
    if (!action || !['approve', 'reject', 'delete'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    if (action === 'delete') {
      await db.delete(listing).where(eq(listing.id, listingId));
      
      return NextResponse.json({ message: 'Listing deleted successfully' });
    } else {
      // Update listing status based on action
      await db
        .update(listing)
        .set({ 
          status: action === 'approve' ? 'ACTIVE' : 'REJECTED',
          updatedAt: new Date()
        })
        .where(eq(listing.id, listingId));
      
      return NextResponse.json({ 
        message: `Listing ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
      });
    }
  } catch (error) {
    console.error(`Error ${req.method} listing:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
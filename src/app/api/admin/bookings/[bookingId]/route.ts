import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { booking } from '@/db/schema';
import { isAdmin } from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  // Check if user is admin
  const isUserAdmin = await isAdmin();
  
  if (!isUserAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  try {
    const { bookingId } = params;
    const { action } = await req.json();
    
    if (!action || !['confirm', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    // Update booking status based on action
    await db
      .update(booking)
      .set({ 
        status: action === 'confirm' ? 'CONFIRMED' : 'CANCELLED',
        updatedAt: new Date()
      })
      .where(eq(booking.id, bookingId));
    
    return NextResponse.json({ 
      message: `Booking ${action === 'confirm' ? 'confirmed' : 'cancelled'} successfully` 
    });
  } catch (error) {
    console.error(`Error updating booking:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 
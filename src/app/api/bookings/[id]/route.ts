import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { booking } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getAuthSession } from '@/lib/auth-utils';

// GET a single booking by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const result = await db
    .select()
    .from(booking)
    .where(eq(booking.id, id));

  if (result.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const bookingData = result[0];
  
  // Only allow the booking user or the host to view the booking
  if (bookingData.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(bookingData);
}

// PATCH to update booking status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();

  if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be PENDING, CONFIRMED, or CANCELLED' },
      { status: 400 }
    );
  }

  // Get the current booking to check ownership
  const existingBookings = await db
    .select()
    .from(booking)
    .where(eq(booking.id, id));

  if (existingBookings.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const existingBooking = existingBookings[0];

  // Check if user owns the booking or is an admin (you could add more advanced authorization)
  if (existingBooking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Don't allow changing status of already cancelled bookings
  if (existingBooking.status === 'CANCELLED' && status !== 'CANCELLED') {
    return NextResponse.json(
      { error: 'Cannot change status of cancelled booking' },
      { status: 400 }
    );
  }

  // Update booking
  const now = new Date();
  await db
    .update(booking)
    .set({
      status,
      updatedAt: now,
    })
    .where(eq(booking.id, id));

  return NextResponse.json({ success: true, id, status });
}

// DELETE to cancel a booking
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Get the current booking to check ownership
  const existingBookings = await db
    .select()
    .from(booking)
    .where(eq(booking.id, id));

  if (existingBookings.length === 0) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  const existingBooking = existingBookings[0];

  // Check if user owns the booking
  if (existingBooking.userId !== session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Cancel booking instead of deleting it
  const now = new Date();
  await db
    .update(booking)
    .set({
      status: 'CANCELLED',
      updatedAt: now,
    })
    .where(eq(booking.id, id));

  return NextResponse.json({ success: true });
} 
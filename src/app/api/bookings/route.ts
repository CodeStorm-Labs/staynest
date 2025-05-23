import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/db';
import { booking, listing } from '@/db/schema';
import { and, lt, gt, eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { getAuthSession } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { listingId, checkIn, checkOut, guests } = await req.json();
  if (!listingId || !checkIn || !checkOut || !guests) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Check for overlapping bookings
  const overlapping = await db
    .select()
    .from(booking)
    .where(
      and(
        eq(booking.listingId, listingId),
        lt(booking.checkIn, new Date(checkOut)),
        gt(booking.checkOut, new Date(checkIn))
      )
    );
  if (overlapping.length > 0) {
    return NextResponse.json({ error: 'Selected dates are not available' }, { status: 400 });
  }

  // Get listing price
  const [item] = await db
    .select({ price: listing.price })
    .from(listing)
    .where(eq(listing.id, listingId));
  if (!item) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const totalPrice = nights * item.price;
  const id = uuid();
  const now = new Date();

  await db.insert(booking).values({
    id,
    userId: session.user.id,
    listingId,
    checkIn: start,
    checkOut: end,
    guests: Number(guests),
    totalPrice,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id, totalPrice });
}

export async function GET(req: NextRequest) {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const bookings = await db
    .select({
      id: booking.id,
      listingId: booking.listingId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      status: booking.status,
      title: listing.title,
      address: listing.address,
      price: listing.price,
    })
    .from(booking)
    .leftJoin(listing, eq(listing.id, booking.listingId))
    .where(eq(booking.userId, userId));

  return NextResponse.json(bookings);
} 
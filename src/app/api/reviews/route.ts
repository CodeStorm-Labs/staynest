import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { review, booking, user, listing } from '@/db/schema';
import { eq, desc, or, and, isNull } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const listingId = url.searchParams.get('listingId');
  if (!listingId) {
    return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
  }

  // Get reviews that are either directly for the listing or from bookings for the listing
  const reviews = await db
    .select({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: user.name,
    })
    .from(review)
    .leftJoin(booking, eq(booking.id, review.bookingId))
    .leftJoin(user, eq(user.id, review.userId))
    .where(
      or(
        eq(review.listingId, listingId),
        and(
          eq(booking.listingId, listingId),
          isNull(review.listingId)
        )
      )
    )
    .orderBy(desc(review.createdAt));

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await req.json();
  const { rating, comment } = data;

  if (rating == null || !comment) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Review can be associated with a booking OR directly with a listing
  const { bookingId, listingId } = data;
  
  if (!bookingId && !listingId) {
    return NextResponse.json({ error: 'Either bookingId or listingId is required' }, { status: 400 });
  }

  // Validate data based on the type of review
  if (bookingId) {
    // For booking-based review
  const [bk] = await db
    .select({ userId: booking.userId, listingId: booking.listingId, checkOut: booking.checkOut })
    .from(booking)
    .where(eq(booking.id, bookingId));

  if (!bk || bk.userId !== session.user.id) {
    return NextResponse.json({ error: 'Invalid booking' }, { status: 400 });
  }
    
  if (new Date(bk.checkOut) > new Date()) {
    return NextResponse.json({ error: 'Stay not completed' }, { status: 400 });
  }

    // Prevent duplicate reviews for the same booking
  const existing = await db
    .select()
    .from(review)
    .where(eq(review.bookingId, bookingId));
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already reviewed this booking' }, { status: 400 });
    }
  } else {
    // For direct listing review
    // Verify the listing exists
    const [ls] = await db
      .select({ id: listing.id })
      .from(listing)
      .where(eq(listing.id, listingId));

    if (!ls) {
      return NextResponse.json({ error: 'Invalid listing' }, { status: 400 });
    }

    // Limit to one review per user per listing for direct reviews
    const existing = await db
      .select()
      .from(review)
      .where(
        and(
          eq(review.listingId, listingId),
          eq(review.userId, session.user.id),
          isNull(review.bookingId)
        )
      );
    
  if (existing.length > 0) {
      return NextResponse.json({ error: 'You have already reviewed this listing' }, { status: 400 });
    }
  }

  const id = uuid();
  const now = new Date();
  
  await db.insert(review).values({
    id,
    bookingId: bookingId || null,
    listingId: listingId || null,
    userId: session.user.id,
    rating: Number(rating),
    comment,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ id });
} 
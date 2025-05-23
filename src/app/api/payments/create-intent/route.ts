import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe, calculateTotalPrice } from '@/lib/stripe';
import { getAuthSession } from '@/lib/auth-utils';
import { db } from '@/db';
import { listing } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { listingId, checkIn, checkOut, guests, nights } = await req.json();

    if (!listingId || !checkIn || !checkOut || !guests || !nights) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get listing details to calculate price
    const [listingData] = await db
      .select({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        hostId: listing.hostId,
      })
      .from(listing)
      .where(eq(listing.id, listingId));

    if (!listingData) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Prevent hosts from booking their own properties
    if (listingData.hostId === session.user.id) {
      return NextResponse.json({ error: 'Cannot book your own property' }, { status: 400 });
    }

    // Calculate pricing
    const subtotal = listingData.price * nights;
    const totalPrice = calculateTotalPrice(subtotal);
    const amountInCents = formatAmountForStripe(totalPrice, 'try');

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'try',
      metadata: {
        listingId,
        userId: session.user.id,
        checkIn,
        checkOut,
        guests: guests.toString(),
        nights: nights.toString(),
        subtotal: subtotal.toString(),
        totalPrice: totalPrice.toString(),
      },
      description: `Booking for ${listingData.title}`,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalPrice,
      subtotal,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
} 
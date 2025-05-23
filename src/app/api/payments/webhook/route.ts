import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db';
import { booking } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { headers } from 'next/headers';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature found' }, { status: 400 });
    }

    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Extract booking data from metadata
        const {
          listingId,
          userId,
          checkIn,
          checkOut,
          guests,
          totalPrice,
        } = paymentIntent.metadata;

        if (!listingId || !userId || !checkIn || !checkOut || !guests || !totalPrice) {
          console.error('Missing required metadata in payment intent:', paymentIntent.metadata);
          return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 });
        }

        // Create the booking in the database
        const bookingId = uuid();
        await db.insert(booking).values({
          id: bookingId,
          userId,
          listingId,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
          guests: parseInt(guests),
          totalPrice: parseInt(totalPrice),
          status: 'CONFIRMED', // Automatically confirm payment-based bookings
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        console.log(`Booking created successfully: ${bookingId} for payment ${paymentIntent.id}`);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.error('Payment failed:', failedPayment.id, failedPayment.last_payment_error);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
} 
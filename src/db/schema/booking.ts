import { pgTable, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { listing } from './listing';

export const bookingStatus = pgEnum('booking_status', ['PENDING', 'CONFIRMED', 'CANCELLED']);

export const booking = pgTable('booking', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  listingId: text('listing_id')
    .notNull()
    .references(() => listing.id, { onDelete: 'cascade' }),
  checkIn: timestamp('check_in').notNull(),
  checkOut: timestamp('check_out').notNull(),
  guests: integer('guests').notNull(),
  totalPrice: integer('total_price').notNull(),
  status: bookingStatus('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}); 
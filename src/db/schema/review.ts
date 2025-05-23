/* eslint-disable import/no-unresolved */
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { booking } from './booking';
import { user } from './auth-schema';
import { listing } from './listing';

export const review = pgTable('review', {
  id: text('id').primaryKey(),
  bookingId: text('booking_id')
    .references(() => booking.id, { onDelete: 'cascade' }),
  listingId: text('listing_id')
    .references(() => listing.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  rating: integer('rating').notNull(),
  comment: text('comment').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}); 
import { pgTable, text, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { listing } from './listing';

export const listingImage = pgTable('listing_image', {
  id: text('id').primaryKey(),
  listingId: text('listing_id')
    .notNull()
    .references(() => listing.id, { onDelete: 'cascade' }),
  imagePath: text('image_path').notNull(),
  isFeatured: text('is_featured').default('false'),
  sortOrder: text('sort_order').default('0'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}); 
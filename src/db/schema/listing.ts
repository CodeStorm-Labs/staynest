/* eslint-disable import/no-unresolved */
import { pgTable, text, timestamp, integer, real, pgEnum } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const propertyType = pgEnum('property_type', ['APARTMENT', 'HOUSE', 'UNIQUE', 'HOTEL']);

export const listing = pgTable('listing', {
  id: text('id').primaryKey(),
  hostId: text('host_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  latitude: real('latitude').notNull(),
  longitude: real('longitude').notNull(),
  price: integer('price').notNull(),
  propertyType: propertyType('property_type').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}); 
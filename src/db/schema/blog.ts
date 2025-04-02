import { pgTable, uuid, varchar, timestamp, boolean, pgEnum, text } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';

export const blogStatus = pgEnum('blog_status', ['active', 'suspended', 'deleted']);
export const domainStatus = pgEnum('domain_status', ['pending', 'active', 'failed']);

export const blog = pgTable('blog', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 256 }).notNull(),
  description: varchar('description', { length: 512 }),
  subdomain: varchar('subdomain', { length: 63 }).unique().notNull(),
  customDomain: varchar('custom_domain', { length: 255 }),
  customDomainStatus: domainStatus('custom_domain_status').default('pending'),
  ownerId: text('owner_id')
    .references(() => user.id)
    .notNull(),
  status: blogStatus('status').default('active').notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

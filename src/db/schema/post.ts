import { pgTable, uuid, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { blog } from './blog';

export const post = pgTable('post', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 256 }).notNull(),
  slug: varchar('slug', { length: 256 }).notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  authorId: text('author_id')
    .references(() => user.id)
    .notNull(),
  blogId: uuid('blog_id')
    .references(() => blog.id)
    .notNull(),
  isPublished: boolean('is_published').default(false).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

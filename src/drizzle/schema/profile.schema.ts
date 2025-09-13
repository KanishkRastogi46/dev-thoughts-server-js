import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from './users.schema';
import { postsTable } from './posts.schema';
import { commentsTable } from './comments.schema';
import { relations } from 'drizzle-orm';

export const profileTable = pgTable('profile', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .unique()
    .references(() => userTable.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  avatar: text('avatar'),
  role: text('role').default('user').notNull(),
  country: text('country').notNull(),
  code: text('code'),
  posts: integer('posts')
    .references(() => postsTable.id, { onDelete: 'set null' })
    .array()
    .default([]),
  comments: integer('comments')
    .references(() => commentsTable.id, { onDelete: 'set null' })
    .array()
    .default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const profileRelations = relations(profileTable, ({ one, many }) => ({
  user: one(userTable),
  posts: many(postsTable),
  comments: many(commentsTable),
}));

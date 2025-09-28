import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import { userTable } from './users.schema';

export const oauthTable = pgTable('oauth_users', {
  id: serial('id').primaryKey(),
  provider: text('provider').default('google'),
  identifier: text('identifier').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

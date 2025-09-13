import { sql } from 'drizzle-orm';
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const countries = pgTable('countries', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .default(sql`now()`)
    .$onUpdate(() => sql`now()`),
});

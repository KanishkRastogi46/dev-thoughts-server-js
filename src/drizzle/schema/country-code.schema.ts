import { sql } from 'drizzle-orm';
import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const CountryCode = pgTable('country_code', {
  id: integer('id').primaryKey(),
  code: text('code').notNull(),
  name: text('country_name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).default(
    sql`now()`,
  ),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`now()`)
    .$onUpdate(() => sql`now()`),
});

import { pgEnum, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const userRolesTable = pgTable('userRoles', {
  id: serial('id').primaryKey(),
  role: text('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

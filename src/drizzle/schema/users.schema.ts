import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { userRolesTable } from "./userRoles.schema";
import { relations, sql } from "drizzle-orm";
import { countries } from "./countries.schema";

export const userTable = pgTable('users', {
    id: serial('id').primaryKey(),
    fullname: text('full_name').notNull(),
    email: text('email').notNull().unique(),
    phoneNo: text('phone_no').notNull().unique(),
    username: text('username').notNull().unique(),
    password: text('password').notNull(),
    lastLogin: timestamp('last_login'),
    role: integer('role').references(() => userRolesTable.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
    country: integer('country').references(() => countries.id),
    createdAt: timestamp('created_at').default(sql`now()`).notNull(),
    updatedAt: timestamp('updated_at').default(sql`now()`).notNull()
})

export const userRelation = relations(userTable, ({ one }) => ({
    role: one(userRolesTable),
    country: one(countries),
}))
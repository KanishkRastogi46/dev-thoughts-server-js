import { pgEnum, pgTable, serial, timestamp } from "drizzle-orm/pg-core"

export const userRoles = pgEnum('user_roles_enum', ['admin', 'user']);

export const userRolesTable = pgTable('userRoles', {
    id: serial('id').primaryKey(),
    role: userRoles('role').default('user').array().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});
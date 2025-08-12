import { pgTable, timestamp, serial, text, integer } from "drizzle-orm/pg-core"
import { userTable } from "./users.schema"
import { relations, sql } from "drizzle-orm"


export const otp = pgTable('otps', {
    id: serial('id').primaryKey(),
    user: integer('user').notNull().references(() => userTable.id, { onDelete: 'cascade' }),
    otp: text('otp').notNull(),
    reason: text('reason').notNull(),
    status: text('status').notNull().default('pending'),
    attempts: integer('attempts').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').default(sql`now() + interval '5 minutes'`).notNull(),
    lastOtpTime: timestamp('last_otp_time').defaultNow(),
})

export const otpRelation = relations(otp, ({ one }) => ({
    user: one(userTable)
}))
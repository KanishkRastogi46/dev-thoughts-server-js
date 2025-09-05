import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core"
import { postCategoriesTable } from "./post-categories.schema"
import { commentsTable } from "./comments.schema"
import { relations } from "drizzle-orm"
import { profileTable } from "./profile.schema"

export const postsTable = pgTable("posts", {
    id: serial("id").primaryKey(),
    profile: integer('profile').references(() => profileTable.id, { onDelete: 'cascade' }),
    category: integer('category').references(() => postCategoriesTable.id, { onDelete: 'cascade' }).array().default([]),
    title: text('title').notNull(),
    text: text('text').notNull(),
    media: text('media').array().default([]),
    comments: integer('comments').references(() => commentsTable.id).array().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const postsRelations = relations(postsTable, ({ one, many }) => ({
    profile: one(profileTable, {
        fields: [postsTable.user],
        references: [profileTable.id]
    }),
    category: one(postCategoriesTable, {
        fields: [postsTable.category],
        references: [postCategoriesTable.id]
    }),
    comments: many(commentsTable)
}))
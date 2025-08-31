import { pgTable, integer, serial, text, timestamp } from "drizzle-orm/pg-core"
import { userTable } from "./users.schema"
import { postCategoriesTable } from "./post-categories.schema"
import { title } from "process"
import { commentsTable } from "./comments.schema"
import { relations } from "drizzle-orm"

export const postsTable = pgTable("posts", {
    id: serial("id").primaryKey(),
    user: integer('user').references(() => userTable.id, { onDelete: 'cascade' }),
    category: integer('category').references(() => postCategoriesTable.id, { onDelete: 'cascade' }).array().default([]),
    title: text('title').notNull(),
    text: text('text').notNull(),
    media: text('media').array().default([]),
    comments: integer('comments').references(() => commentsTable.id).array().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const postsRelations = relations(postsTable, ({ one, many }) => ({
    user: one(userTable, {
        fields: [postsTable.user],
        references: [userTable.id]
    }),
    category: one(postCategoriesTable, {
        fields: [postsTable.category],
        references: [postCategoriesTable.id]
    }),
    comments: many(commentsTable)
}))
import { pgTable, integer, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { postsTable } from './posts.schema'
import { boolean } from 'drizzle-orm/pg-core'
import { userTable } from './users.schema'
import { relations } from 'drizzle-orm'

export const commentsTable = pgTable('comments', {
    id: serial('id').primaryKey(),
    post: integer('post').references(() => postsTable.id, { onDelete: 'cascade' }),
    user: integer('user').references(() => userTable.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),   
    isReply: boolean('is_reply').default(false).notNull(),
    parentComment: integer('parent_comment').references(() => commentsTable.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const commentsRelations = relations(commentsTable, ({ one }) => ({
    parentComment: one(commentsTable, {
        fields: [commentsTable.parentComment],
        references: [commentsTable.id]
    }),
}))
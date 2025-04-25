import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const files = pgTable('files', {
    id: uuid('id').defaultRandom().primaryKey(),
    // basic info
    name: text('name').notNull(),
    path: text('path').notNull(),// /document/project/file.desi
    size: integer('size').notNull(),
    type: text('type').notNull(),
    // storage info
    fileUrl: text('file_url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    // ownership
    userId: text('user_id').notNull(),
    parentId: uuid('parent_id'),//(null for root items)
    // file/folder lags
    isFolder: boolean('is_folder').default(false).notNull(),
    isStarred: boolean('is_starred').default(false).notNull(),
    isTrashed: boolean('is_trashed').default(false).notNull(),
    // timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
import { pgTable, uuid, text, jsonb, integer, timestamp } from 'drizzle-orm/pg-core'
import type { Doc } from '~/lib/doc'

export const microsites = pgTable('microsites', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  draftDoc: jsonb('draft_doc').$type<Doc>().notNull(),
  liveDoc: jsonb('live_doc').$type<Doc>(),
  draftVersion: integer('draft_version').notNull().default(1),
  draftUpdatedAt: timestamp('draft_updated_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  firstPublishedAt: timestamp('first_published_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Microsite = typeof microsites.$inferSelect
export type NewMicrosite = typeof microsites.$inferInsert

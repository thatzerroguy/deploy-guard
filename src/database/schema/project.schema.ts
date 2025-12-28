import { pgTable, serial, text, uuid } from 'drizzle-orm/pg-core';
import { user } from './user.schema';
import { relations } from 'drizzle-orm';

export const project = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  owner_id: serial('owner_id').references(() => user.id),
});

export const projectRelations = relations(project, ({ one }) => ({
  owner: one(user, {
    fields: [project.owner_id],
    references: [user.id],
  }),
}));

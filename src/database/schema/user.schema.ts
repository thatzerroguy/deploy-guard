import { relations } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';
import { project } from './project.schema';

export const user = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull(),
  api_key: text('api_key').unique().notNull(),
});

export const userRelations = relations(user, ({ one }) => ({
  projects: one(project, {
    fields: [user.id],
    references: [project.owner_id],
  }),
}));

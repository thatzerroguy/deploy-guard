import { pgTable, uuid, text, jsonb } from 'drizzle-orm/pg-core';
import { project } from './project.schema';
import { relations } from 'drizzle-orm';

export const environmentSchema = pgTable('environment_schema', {
  id: uuid('id').primaryKey().defaultRandom(),
  project_id: uuid('project_id').references(() => project.id),
  environment_name: text('environment_name').notNull(),
  schema: jsonb('schema').notNull(),
});

export const environmentRelations = relations(environmentSchema, ({ one }) => ({
  project: one(project, {
    fields: [environmentSchema.project_id],
    references: [project.id],
  }),
}));

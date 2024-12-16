import {
  char,
  text,
  timestamp,
  varchar,
  pgTable,
  integer
} from "drizzle-orm/pg-core";


export const question = pgTable("questions",{
    question_id:char("question_id",{length:26}).primaryKey(),
    company_id:varchar("company_id",{length:26}),
    question: text("question").notNull(),
    images: text("images"),
    position: varchar("position",{length:50}),
    interview_type: varchar("interview_type",{length:50}),
    experience_level: integer("experience_level"),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  })
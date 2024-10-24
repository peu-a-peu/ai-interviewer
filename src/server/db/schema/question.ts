import {
  char,
  text,
  timestamp,
  varchar,
  pgTable
} from "drizzle-orm/pg-core";


export const question = pgTable("questions",{
    question_id:char("question_id",{length:26}).primaryKey(),
    company_id:varchar("company_id",{length:26}),
    question: text("question").notNull(),
    position: varchar("position",{length:50}),
    interview_type: varchar("interview_type",{length:50}),
    experience_level: varchar("experience_level",{length: 50}),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  })
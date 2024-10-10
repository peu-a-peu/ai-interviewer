import {
  char,
  text,
  timestamp,
  varchar,
  pgTable
} from "drizzle-orm/pg-core";
import { ulid } from "ulidx";


export const question = pgTable("questions",{
    question_id:char("question_id",{length:26}).default(ulid()).primaryKey(),
    company_id:varchar("company_id",{length:26}).default(ulid()),
    question: text("question").notNull(),
    postion: varchar("position",{length:50}),
    interview_type: varchar("interview_type",{length:50}),
    experience_level: varchar("experience_level",{length: 50}),
    created_at: timestamp('created_at').default(new Date()).notNull(),
    updated_at: timestamp('updated_at').default(new Date()).notNull(),
  })
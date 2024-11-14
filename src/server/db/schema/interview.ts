import {
  char,
  text,
  timestamp,
  varchar,
  pgTable,
  integer,
} from "drizzle-orm/pg-core";


export const interview = pgTable("interviews", {
  interview_id: char("interview_id", { length: 26 }).primaryKey(),
  company_id: varchar("company_id", { length: 26 }).notNull(),
  candidate_id: char("candidate_id", { length: 26 }),
  candidate_name: varchar("candidate_name", { length: 50 }),
  position: varchar("position", { length: 50 }),
  interview_type: varchar("interview_type", { length: 50 }),
  experience: integer("experience"),
  resume_summary: text("resume_summary"),
  category: varchar("category", { length: 15 }).default("default").notNull(),
  language: varchar("language", {length: 20}).default("ENGLISH").notNull(),  
  feedback: text("feedback"),
  created_at: timestamp('created_at').defaultNow().notNull(),
  ended_at: timestamp('ended_at')
})
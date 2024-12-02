import {
    text,
    timestamp,
    varchar,
    pgTable,
    char
} from "drizzle-orm/pg-core";


export const prompt = pgTable("prompts", {
    prompt_id: varchar("prompt_id", { length: 40 }).primaryKey(),
    position: varchar("position", { length: 60 }),
    interview_type: varchar("interview_type", { length: 40 }),
    company_id: char("company_id", { length: 26 }),
    prompt: text("prompt").notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
})
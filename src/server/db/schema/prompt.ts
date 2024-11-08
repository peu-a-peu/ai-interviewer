import {
    text,
    timestamp,
    varchar,
    pgTable
} from "drizzle-orm/pg-core";


export const prompt = pgTable("prompts", {
    prompt_id: varchar("prompt_id", { length: 40 }).primaryKey(),
    prompt: text("prompt").notNull(),
    created_at: timestamp('created_at').defaultNow().notNull(),
})
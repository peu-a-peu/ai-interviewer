import {
    char,
    text,
    timestamp,
    varchar,
    pgTable
} from "drizzle-orm/pg-core";


export const conversation = pgTable("conversations", {
    conversation_id: char("conversation_id", { length: 26 }).primaryKey(),
    interview_id: varchar("interview_id", { length: 26 }).notNull(),
    question: text("question").notNull(),
    answer: text("answer"),
    created_at: timestamp('created_at').defaultNow().notNull(),
})
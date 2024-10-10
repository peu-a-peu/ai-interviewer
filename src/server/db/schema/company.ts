import {
  char,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  boolean
} from "drizzle-orm/pg-core";

export const company = pgTable("companies", {
  company_id: char("company_id", { length: 26 }).primaryKey().notNull(),
  company_name: varchar("company_name", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  logo: varchar("logo", { length: 255 }),
  metadata:jsonb("metadata"),
  is_processed: boolean("is_processed").default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
})

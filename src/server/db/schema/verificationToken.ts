import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const verificationTokens = pgTable("verification_tokens", {
  token: varchar("token", { length: 255 }).notNull().primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

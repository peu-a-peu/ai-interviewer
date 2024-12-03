import { pgTable, varchar, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  userId: integer("userId").primaryKey().generatedAlwaysAsIdentity(),
  email: varchar("email", { length: 255 }).notNull(),
  ticketCount: integer("ticketCount").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

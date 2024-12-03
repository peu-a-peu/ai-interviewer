import { pgTable, integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user";
export const ticketTransactions = pgTable("ticket_transactions", {
  transactionId: integer("transactionId")
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  userId: integer("userId")
    .notNull()
    .references(() => users.userId),
  ticketBalanceChange: integer("ticketBalanceChange").notNull(), // Positive for additions, negative for consumption
  type: varchar("type", { length: 50 }).notNull(), // "PURCHASE", "CONSUMPTION", etc.
  description: varchar("description", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

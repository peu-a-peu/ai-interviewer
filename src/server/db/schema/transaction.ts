import {
  pgTable,
  integer,
  timestamp,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { users } from "./user";
export const TransactionDetails = pgTable("transactionLog", {
  transactionId: integer("transactionId")
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  userId: varchar("userId")
    .notNull()
    .references(() => users.id),
  orderId: varchar("orderId", { length: 100 }).notNull(),
  orderName: varchar("orderName", { length: 100 }).notNull(),
  paymentKey: varchar("paymentKey", { length: 200 }).notNull(),
  paymentStatus: varchar("paymentStatus", { length: 50 }).notNull(),
  paymentAmount: varchar("paymentAmount", { length: 50 }).notNull(),
  data: jsonb("data"),
  service: varchar("service",{length: 20}).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

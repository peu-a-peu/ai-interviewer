import { relations, sql } from "drizzle-orm";
import { char, text, timestamp, varchar, pgTable } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";
import { ulid } from "ulidx";
import { company } from "./company";
import { question } from "./question";
import { verificationTokens } from "./verificationToken";
import { users } from "./user";
import { ticketTransactions } from "./ticketTransaction";
import { TransactionDetails } from "./transaction";
import { accounts } from "./accounts";
import { sessions } from "./sessions";
import { nextAuthVerificationToken } from "./nextAuthVerificationToken";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */

// export const users = pgTable("user", {
//   user_id: varchar("user_id", { length: 26 })
//     .notNull()
//     .primaryKey()
//     .$defaultFn(() => ulid()),
//   name: varchar("name", { length: 255 }),
//   email: varchar("email", { length: 255 }).notNull(),
//   emailVerified: timestamp("email_verified", {
//     mode: "date",
//     withTimezone: true,
//   }).default(sql`CURRENT_TIMESTAMP`),
//   image: varchar("image", { length: 255 }),
// });

// export const usersRelations = relations(users, ({ many }) => ({
//   accounts: many(accounts),
// }));

// export const accounts = pgTable(
//   "account",
//   {
//     userId: varchar("user_id", { length: 255 })
//       .notNull()
//       .references(() => users.id),
//     type: varchar("type", { length: 255 })
//       .$type<AdapterAccount["type"]>()
//       .notNull(),
//     provider: varchar("provider", { length: 255 }).notNull(),
//     providerAccountId: varchar("provider_account_id", {
//       length: 255,
//     }).notNull(),
//     refresh_token: text("refresh_token"),
//     access_token: text("access_token"),
//     expires_at: integer("expires_at"),
//     token_type: varchar("token_type", { length: 255 }),
//     scope: varchar("scope", { length: 255 }),
//     id_token: text("id_token"),
//     session_state: varchar("session_state", { length: 255 }),
//   },
//   (account) => ({
//     compoundKey: primaryKey({
//       columns: [account.provider, account.providerAccountId],
//     }),
//     userIdIdx: index("account_user_id_idx").on(account.userId),
//   })
// );

// export const accountsRelations = relations(accounts, ({ one }) => ({
//   user: one(users, { fields: [accounts.userId], references: [users.id] }),
// }));

// export const sessions = pgTable(
//   "session",
//   {
//     sessionToken: varchar("session_token", { length: 255 })
//       .notNull()
//       .primaryKey(),
//     userId: varchar("user_id", { length: 255 })
//       .notNull()
//       .references(() => users.id),
//     expires: timestamp("expires", {
//       mode: "date",
//       withTimezone: true,
//     }).notNull(),
//   },
//   (session) => ({
//     userIdIdx: index("session_user_id_idx").on(session.userId),
//   })
// );

// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   user: one(users, { fields: [sessions.userId], references: [users.id] }),
// }));

export { company } from "./company";
export { question } from "./question";
export { interview } from "./interview";
export { conversation } from "./conversation";
export { prompt } from "./prompt";
export { verificationTokens } from "./verificationToken";
export { users } from "./user";
export { ticketTransactions } from "./ticketTransaction";
export { TransactionDetails } from "./transaction";
export { accounts } from "./accounts"
export {sessions} from "./sessions"
export {nextAuthVerificationToken} from "./nextAuthVerificationToken"

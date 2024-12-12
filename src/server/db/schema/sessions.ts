import {
  index,
  pgTable,
 
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./user";
export const sessions = pgTable(
    "session",
    {
      sessionToken: varchar("session_token", { length: 255 })
        .notNull()
        .primaryKey(),
      userId: varchar("user_id", { length: 255 })
        .notNull()
        .references(() => users.id),
      expires: timestamp("expires", {
        mode: "date",
        withTimezone: true,
      }).notNull(),
    },
    (session) => ({
      userIdIdx: index("session_user_id_idx").on(session.userId),
    })
  );
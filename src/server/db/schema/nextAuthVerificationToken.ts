import { pgTable, varchar, timestamp, primaryKey } from "drizzle-orm/pg-core";

export const nextAuthVerificationToken = pgTable(
    "verification_token",
    {
      identifier: varchar("identifier", { length: 255 }).notNull(),
      token: varchar("token", { length: 255 }).notNull(),
      expires: timestamp("expires", {
        mode: "date",
        withTimezone: true,
      }).notNull(),
    },
    (vt) => ({
      compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    })
  );
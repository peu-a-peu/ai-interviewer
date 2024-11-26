import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export async function up(db) {
  await db.schema.createTable("verification_tokens", (table) => {
    table.varchar("token", { length: 255 }).notNull().primaryKey();
    table.varchar("email", { length: 255 }).notNull();
    table.timestamp("expires", { mode: "date" }).notNull();
    table.timestamp("created_at").defaultNow();
  });
}

export async function down(db) {
  await db.schema.dropTable("verification_tokens");
}

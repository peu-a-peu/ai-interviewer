import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { env } from "@/env";
import path from "path";

async function main() {
  const client = new pg.Client({
    connectionString: env.DATABASE_URL,
  });

  await client.connect();
  const db = drizzle(client);

  console.log("Running migrations...");

  const migrationsFolder = path.join(process.cwd(), "drizzle");

  try {
    await migrate(db, { migrationsFolder });
    console.log("Migrations completed!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed!");
  console.error(err);
  process.exit(1);
});

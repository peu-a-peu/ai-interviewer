import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "@/env";

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client: pg.Client | undefined;
};

// Create a new pg pg.Client instance
const client = globalForDb.client ?? new pg.Client({
  connectionString: env.DATABASE_URL,
});

// Connect to the database if not already connected
if (!globalForDb.client) {
  client.connect().catch((error) => {
    console.error("Failed to connect to the database:", error);
  });
}

// Cache the client connection in development
if (env.NODE_ENV !== "production") globalForDb.client = client;

// Initialize Drizzle with the pg Client
export const db = drizzle(client);

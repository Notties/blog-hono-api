import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "@/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 20,
  idleTimeoutMillis: 30000, // 30 seconds
  connectionTimeoutMillis: 10000, // 10 seconds
});
export const db = drizzle({
  client: pool,
});

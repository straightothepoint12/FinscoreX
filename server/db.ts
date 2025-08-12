import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase database URL to environment variables.",
  );
}

// For Supabase connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
export { client };
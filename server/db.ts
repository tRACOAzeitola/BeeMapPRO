import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check if we're using in-memory storage for development
const useInMemory = process.env.NODE_ENV === 'development' && !process.env.USE_DATABASE;

if (!process.env.DATABASE_URL && !useInMemory) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create a dummy DB setup for in-memory mode
let pool: Pool | null = null;
let db: any = null;

// Only set up real database if not using in-memory storage
if (!useInMemory && process.env.DATABASE_URL) {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };

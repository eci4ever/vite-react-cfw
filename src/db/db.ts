import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function createDb(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

export type DB = ReturnType<typeof createDb>;

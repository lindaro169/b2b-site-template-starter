/**
 * Database Connection Layer
 * Initializes and exports Drizzle ORM database client for Cloudflare D1
 */

import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@/lib/d1-db';
import * as schema from '../drizzle/schema';

/**
 * Initialize Drizzle ORM with Cloudflare D1 database
 * This requires the D1 binding to be available in the Cloudflare Workers environment
 *
 * The D1 binding is configured in wrangler.jsonc:
 * - binding: "DB"
 * - database_id: "e2d43be6-16cc-432e-8172-802f882ef5b7"
 */
export function initializeDatabase(d1: D1Database) {
  return drizzle(d1, { schema });
}

/**
 * Type definition for database queries
 */
export type Database = ReturnType<typeof initializeDatabase>;

/**
 * Export schema types for use in route files
 */
export * from "../drizzle/schema";

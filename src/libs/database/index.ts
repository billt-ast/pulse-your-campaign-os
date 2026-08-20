/**
 * @pulse/database — adapter home for the Platform Data Kernel.
 *
 * Placeholder interfaces only: the Data Kernel resolves one of these adapters
 * at boot (2B.1.4). Domain code never imports a provider client directly.
 */
import type { DataProvider } from "@/services/data";

export interface QueryOptions {
  filter?: Record<string, unknown>;
  orderBy?: string;
  direction?: "asc" | "desc";
  cursor?: string;
  limit?: number;
}

export interface Page<T> {
  data: T[];
  nextCursor: string | null;
}

/** Minimum surface every database adapter must implement. */
export interface DatabaseAdapter {
  readonly provider: DataProvider;
  findById<T>(collection: string, id: string): Promise<T | null>;
  list<T>(collection: string, options?: QueryOptions): Promise<Page<T>>;
  insert<T>(collection: string, input: Partial<T>): Promise<T>;
  update<T>(collection: string, id: string, input: Partial<T>): Promise<T>;
  remove(collection: string, id: string): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  health(): Promise<{ status: "healthy" | "degraded" | "unavailable"; latencyMs: number }>;
}

export type DatabaseAdapterFactory = (config: { url?: string }) => DatabaseAdapter;

/** Registry of adapters, filled in 2B.1.4 (supabase, neon, mongo). */
export const databaseAdapters: Partial<Record<DataProvider, DatabaseAdapterFactory>> = {};

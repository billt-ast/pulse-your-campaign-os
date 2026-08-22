/**
 * Collection ↔ table naming and row key mapping.
 *
 * Domain code speaks camelCase collections; SQL providers speak snake_case
 * tables. This module is the single translation point so no kernel or domain
 * module ever hardcodes a physical table name.
 */

/** Logical kernel collection → physical table. */
export const COLLECTION_TABLES: Record<string, string> = {
  organizations: "organizations",
  workspaces: "workspaces",
  missions: "missions",
  invitations: "invitations",
  workflowInstances: "workflow_instances",
  storageAssets: "storage_assets",
};

export function tableFor(collection: string): string {
  return COLLECTION_TABLES[collection] ?? toSnake(collection);
}

export function toSnake(value: string): string {
  return value.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function toCamel(value: string): string {
  return value.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/** Map a domain object to a database row (camelCase → snake_case keys). */
export function toRow(input: Record<string, unknown>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    row[toSnake(key)] = value;
  }
  return row;
}

/** Map a database row back to a domain object (snake_case → camelCase keys). */
export function fromRow<T>(row: Record<string, unknown> | null): T | null {
  if (!row) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[toCamel(key)] = value instanceof Date ? value.toISOString() : value;
  }
  return out as T;
}

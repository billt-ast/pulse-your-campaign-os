/**
 * Neon provider — Postgres over Neon's SQL-over-HTTP endpoint.
 *
 * The platform runs on an edge worker runtime, so this speaks HTTP rather than
 * opening a TCP pool. Neon backs analytical / high-volume collections while
 * Supabase backs the transactional core; both satisfy the same Repository
 * contract, so the Data Kernel can move a collection between them without any
 * domain change.
 */
import { logger } from "@/libs/logging";
import type { QuerySpec, Repository } from "@/kernel/contracts/data";
import { fromRow, tableFor, toRow, toSnake } from "./naming";

export interface NeonConfig {
  connectionString: string;
  sqlEndpoint: string;
}

export function neonConfig(): NeonConfig | null {
  const connectionString = process.env["NEON_DATABASE_URL"] ?? process.env["DATABASE_URL"];
  if (!connectionString || !connectionString.startsWith("postgres")) return null;
  let host: string;
  try {
    host = new URL(connectionString).host;
  } catch {
    return null;
  }
  return { connectionString, sqlEndpoint: `https://${host.split("@").pop()}/sql` };
}

/** Execute a parameterised statement. Returns rows as plain objects. */
export async function neonQuery<T = Record<string, unknown>>(
  config: NeonConfig,
  query: string,
  params: unknown[] = [],
): Promise<T[]> {
  const response = await fetch(config.sqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Neon-Connection-String": config.connectionString,
      "Neon-Raw-Text-Output": "false",
      "Neon-Array-Mode": "false",
    },
    body: JSON.stringify({ query, params }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`[data:neon] query failed [${response.status}]: ${body}`);
  }
  const payload = (await response.json()) as { rows?: T[] };
  return payload.rows ?? [];
}

/** Identifier guard — collection/field names never interpolate untrusted text. */
function ident(value: string): string {
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) throw new Error(`[data:neon] unsafe identifier: ${value}`);
  return value;
}

export function createNeonRepository<T>(config: NeonConfig, collection: string): Repository<T> {
  const table = ident(tableFor(collection));

  return {
    async findById(id) {
      const rows = await neonQuery<Record<string, unknown>>(config, `select * from ${table} where id = $1 limit 1`, [id]);
      return fromRow<T>(rows[0] ?? null);
    },
    async list(spec?: QuerySpec) {
      const params: unknown[] = [];
      const where = Object.entries(spec?.filter ?? {}).map(([key, value]) => {
        if (value === null) return `${ident(toSnake(key))} is null`;
        params.push(value);
        return `${ident(toSnake(key))} = $${params.length}`;
      });
      const order = (spec?.orderBy ?? [{ field: "createdAt", direction: "desc" as const }])
        .map((o) => `${ident(toSnake(o.field))} ${o.direction === "asc" ? "asc" : "desc"}`)
        .join(", ");
      const limit = spec?.limit ?? 50;
      const offset = spec?.cursor ? Number(spec.cursor) : 0;
      const rows = await neonQuery<Record<string, unknown>>(
        config,
        `select * from ${table}${where.length ? ` where ${where.join(" and ")}` : ""} order by ${order} limit ${limit + 1} offset ${offset}`,
        params,
      );
      return {
        data: rows.slice(0, limit).map((row) => fromRow<T>(row)!),
        nextCursor: rows.length > limit ? String(offset + limit) : null,
      };
    },
    async create(input) {
      const row = toRow(input as Record<string, unknown>);
      const keys = Object.keys(row).map(ident);
      const values = Object.values(row);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
      const rows = await neonQuery<Record<string, unknown>>(
        config,
        `insert into ${table} (${keys.join(", ")}) values (${placeholders}) returning *`,
        values,
      );
      return fromRow<T>(rows[0]!)!;
    },
    async update(id, input) {
      const row = toRow(input as Record<string, unknown>);
      const keys = Object.keys(row).map(ident);
      const values = Object.values(row);
      const sets = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
      const rows = await neonQuery<Record<string, unknown>>(
        config,
        `update ${table} set ${sets} where id = $${values.length + 1} returning *`,
        [...values, id],
      );
      return fromRow<T>(rows[0]!)!;
    },
    async remove(id) {
      await neonQuery(config, `delete from ${table} where id = $1`, [id]);
    },
  };
}

export async function neonHealthy(config: NeonConfig): Promise<boolean> {
  try {
    await neonQuery(config, "select 1 as ok");
    return true;
  } catch (error) {
    logger.warn("neon health check failed", { error: (error as Error).message });
    return false;
  }
}

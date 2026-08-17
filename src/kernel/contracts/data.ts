/** Platform Data Kernel — persistence abstraction between domains and infrastructure. */
import type { KernelMeta } from "../types";

export interface QuerySpec {
  filter?: Record<string, unknown>;
  orderBy?: { field: string; direction: "asc" | "desc" }[];
  cursor?: string;
  limit?: number;
}
export interface Repository<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
  findById(id: string): Promise<T | null>;
  list(spec?: QuerySpec): Promise<{ data: T[]; nextCursor: string | null }>;
  create(input: TCreate): Promise<T>;
  update(id: string, input: TUpdate): Promise<T>;
  remove(id: string): Promise<void>;
}
export interface UnitOfWork {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  invalidate(prefix: string): Promise<void>;
}
export type DataProviderName = "supabase" | "neon" | "mongodb" | "redis" | "blob" | "memory";
export interface DataKernelApi {
  repository<T>(collection: string): Repository<T>;
  unitOfWork: UnitOfWork;
  cache: CacheService;
  /** Which provider currently backs a collection — swappable without domain changes. */
  providerFor(collection: string): DataProviderName;
}
export const dataKernelMeta: KernelMeta = {
  id: "data",
  name: "Platform Data Kernel",
  purpose: "Repositories, transactions, caching and read/write models over pluggable providers.",
  dependencies: ["security"],
  publishes: ["data.migration_applied"],
  consumes: [],
  extensionPoints: ["repository.provider", "cache.provider", "readmodel.projector"],
};

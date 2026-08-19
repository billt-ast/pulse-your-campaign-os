/**
 * context contracts — Context Kernel surface.
 *
 * Resolves who is acting, inside which tenant, mission, geography, locale and
 * theme. Every other service reads context rather than re-deriving it.
 */
import { z } from "zod";
import { isoTimestamp, uuid } from "@/packages/validators";

export const themePreference = z.enum(["light", "dark", "system"]);
export const geographyScopeLevel = z.enum(["country", "region", "county", "constituency", "ward"]);

export const geographyScope = z.object({
  level: geographyScopeLevel,
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(160),
});
export type GeographyScope = z.infer<typeof geographyScope>;

export const runtimeContext = z.object({
  requestId: z.string().min(1).max(120),
  organizationId: uuid.nullable(),
  workspaceId: uuid.nullable(),
  missionId: uuid.nullable(),
  userId: uuid.nullable(),
  permissions: z.array(z.string().max(120)).default([]),
  geography: geographyScope.nullable(),
  locale: z.string().max(20),
  timezone: z.string().max(64),
  theme: themePreference,
  now: isoTimestamp,
});
export type RuntimeContextShape = z.infer<typeof runtimeContext>;

export const resolveContextRequest = z.object({
  organizationId: uuid.nullable().optional(),
  workspaceId: uuid.nullable().optional(),
  missionId: uuid.nullable().optional(),
});
export const resolveContextResponse = runtimeContext;

export const setContextRequest = runtimeContext
  .pick({ organizationId: true, workspaceId: true, missionId: true, theme: true, locale: true, timezone: true })
  .partial()
  .extend({ geography: geographyScope.nullable().optional() });
export type SetContextRequest = z.infer<typeof setContextRequest>;

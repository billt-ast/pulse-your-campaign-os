/**
 * @pulse/validators
 * ---------------------------------------------------------------------------
 * Shared runtime contracts. Every domain service imports its request/response
 * schemas from `@/services/<domain>/contracts`, which in turn compose the
 * primitives defined here. This is the single source of truth for cross-cutting
 * shapes: identifiers, pagination, timestamps, tenancy, and the Mission model
 * that underpins every operational workflow in Pulse.
 * ---------------------------------------------------------------------------
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Primitives                                                          */
/* ------------------------------------------------------------------ */

export const uuid = z.string().uuid();
export const isoTimestamp = z.string().datetime({ offset: true });
export const slug = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, "must be a URL-safe slug");
export const email = z.string().email().max(320);
export const nonEmptyString = z.string().trim().min(1).max(2000);

export type Uuid = z.infer<typeof uuid>;
export type IsoTimestamp = z.infer<typeof isoTimestamp>;
export type Slug = z.infer<typeof slug>;

/* ------------------------------------------------------------------ */
/* Pagination + typed API result envelope                              */
/* ------------------------------------------------------------------ */

export const paginationInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});
export type PaginationInput = z.infer<typeof paginationInput>;

export const pageMeta = z.object({
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
  total: z.number().int().nonnegative().optional(),
});
export type PageMeta = z.infer<typeof pageMeta>;

export const paginated = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), page: pageMeta });

export const apiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});
export type ApiError = z.infer<typeof apiError>;

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

/* ------------------------------------------------------------------ */
/* Mission model — the primary operational abstraction                 */
/* ------------------------------------------------------------------ */

export const missionType = z.enum([
  "campaign",
  "governance",
  "ngo_program",
  "advocacy",
  "civic_engagement",
  "internal",
]);
export type MissionType = z.infer<typeof missionType>;

export const missionStatus = z.enum([
  "draft",
  "planning",
  "active",
  "paused",
  "completed",
  "archived",
]);
export type MissionStatus = z.infer<typeof missionStatus>;

export const missionVisibility = z.enum(["private", "internal", "public"]);

export const auditable = z.object({
  createdAt: isoTimestamp,
  updatedAt: isoTimestamp,
  createdBy: uuid.nullable(),
  updatedBy: uuid.nullable(),
});

export const tenantScoped = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable(),
});

/** Organization — top-level tenant. */
export const organization = z
  .object({
    id: uuid,
    slug,
    name: nonEmptyString.max(160),
    kind: z.enum(["party", "committee", "ngo", "government", "agency", "other"]),
  })
  .merge(auditable);
export type Organization = z.infer<typeof organization>;

/** Workspace — sub-tenant beneath an organization. */
export const workspace = z
  .object({
    id: uuid,
    organizationId: uuid,
    slug,
    name: nonEmptyString.max(160),
  })
  .merge(auditable);
export type Workspace = z.infer<typeof workspace>;

/** Mission — replaces "campaign" as the operational root. */
export const mission = z
  .object({
    id: uuid,
    slug,
    name: nonEmptyString.max(200),
    type: missionType,
    status: missionStatus,
    visibility: missionVisibility.default("internal"),
    startsAt: isoTimestamp.nullable(),
    endsAt: isoTimestamp.nullable(),
    summary: z.string().max(4000).optional(),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type Mission = z.infer<typeof mission>;

/** Program — a stream of work inside a mission. */
export const program = z
  .object({
    id: uuid,
    missionId: uuid,
    name: nonEmptyString.max(200),
    status: z.enum(["planned", "in_progress", "completed", "cancelled"]),
  })
  .merge(auditable);
export type Program = z.infer<typeof program>;

/** Project — bounded initiative under a program. */
export const project = z
  .object({
    id: uuid,
    programId: uuid,
    missionId: uuid,
    name: nonEmptyString.max(200),
    status: z.enum(["backlog", "active", "blocked", "done"]),
    dueAt: isoTimestamp.nullable(),
  })
  .merge(auditable);
export type Project = z.infer<typeof project>;

/** Community — audience / constituency grouping. */
export const community = z
  .object({
    id: uuid,
    missionId: uuid.nullable(),
    name: nonEmptyString.max(200),
    kind: z.enum(["district", "segment", "cohort", "region", "custom"]),
    size: z.number().int().nonnegative().nullable(),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type Community = z.infer<typeof community>;

/** Knowledge — canonical knowledge asset. */
export const knowledgeItem = z
  .object({
    id: uuid,
    missionId: uuid.nullable(),
    title: nonEmptyString.max(300),
    kind: z.enum(["doc", "brief", "policy", "faq", "playbook"]),
    body: z.string().max(200_000).optional(),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type KnowledgeItem = z.infer<typeof knowledgeItem>;

/** Analytics event — normalized event envelope. */
export const analyticsEvent = z.object({
  id: uuid,
  occurredAt: isoTimestamp,
  organizationId: uuid,
  missionId: uuid.nullable(),
  actorId: uuid.nullable(),
  name: nonEmptyString.max(120),
  properties: z.record(z.string(), z.unknown()).default({}),
});
export type AnalyticsEvent = z.infer<typeof analyticsEvent>;

/* ------------------------------------------------------------------ */
/* Domain events envelope (libs/events consumers)                      */
/* ------------------------------------------------------------------ */

export const domainEvent = z.object({
  id: uuid,
  name: z.string().min(1).max(160), // e.g. "mission.status_changed"
  occurredAt: isoTimestamp,
  organizationId: uuid,
  actorId: uuid.nullable(),
  correlationId: z.string().min(1).max(120),
  payload: z.record(z.string(), z.unknown()),
});
export type DomainEvent = z.infer<typeof domainEvent>;

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

/* ------------------------------------------------------------------ */
/* Mission depth — phases, objectives, tasks                           */
/* ------------------------------------------------------------------ */

export const missionPhaseStatus = z.enum(["upcoming", "current", "closed"]);

/** Phase — time-boxed stage of a mission lifecycle. */
export const missionPhase = z
  .object({
    id: uuid,
    missionId: uuid,
    name: nonEmptyString.max(200),
    sequence: z.number().int().min(0),
    status: missionPhaseStatus,
    startsAt: isoTimestamp.nullable(),
    endsAt: isoTimestamp.nullable(),
  })
  .merge(auditable);
export type MissionPhase = z.infer<typeof missionPhase>;

export const objectiveStatus = z.enum(["draft", "committed", "at_risk", "achieved", "missed"]);

/** Objective — measurable outcome owned by a mission or program. */
export const objective = z
  .object({
    id: uuid,
    missionId: uuid,
    programId: uuid.nullable(),
    name: nonEmptyString.max(200),
    status: objectiveStatus,
    metric: nonEmptyString.max(120),
    target: z.number(),
    current: z.number().default(0),
    unit: z.string().max(32).default("count"),
    dueAt: isoTimestamp.nullable(),
    ownerId: uuid.nullable(),
  })
  .merge(auditable);
export type Objective = z.infer<typeof objective>;

export const taskStatus = z.enum(["todo", "in_progress", "blocked", "review", "done", "cancelled"]);
export const taskPriority = z.enum(["low", "normal", "high", "critical"]);

/** Task — the smallest unit of assignable work. */
export const task = z
  .object({
    id: uuid,
    missionId: uuid,
    projectId: uuid.nullable(),
    objectiveId: uuid.nullable(),
    title: nonEmptyString.max(300),
    description: z.string().max(20_000).optional(),
    status: taskStatus,
    priority: taskPriority.default("normal"),
    assigneeId: uuid.nullable(),
    dueAt: isoTimestamp.nullable(),
    completedAt: isoTimestamp.nullable(),
  })
  .merge(auditable);
export type Task = z.infer<typeof task>;

/* ------------------------------------------------------------------ */
/* Identity depth — invitations, MFA, SSO                              */
/* ------------------------------------------------------------------ */

export const roleName = z.enum(["owner", "admin", "member", "viewer"]);
export type RoleName = z.infer<typeof roleName>;
export const invitationStatus = z.enum(["pending", "accepted", "revoked", "expired"]);

/** Invitation — a pending membership grant. */
export const invitation = z
  .object({
    id: uuid,
    email,
    role: roleName,
    status: invitationStatus,
    token: z.string().min(16).max(256),
    expiresAt: isoTimestamp,
    acceptedAt: isoTimestamp.nullable(),
    invitedBy: uuid.nullable(),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type Invitation = z.infer<typeof invitation>;

export const mfaMethod = z.enum(["totp", "sms", "webauthn", "recovery_code"]);
export const mfaFactorStatus = z.enum(["unverified", "verified", "revoked"]);

/** MFA factor — one enrolled second factor for a user. */
export const mfaFactor = z
  .object({
    id: uuid,
    userId: uuid,
    method: mfaMethod,
    status: mfaFactorStatus,
    label: z.string().max(120).nullable(),
    lastUsedAt: isoTimestamp.nullable(),
  })
  .merge(auditable);
export type MfaFactor = z.infer<typeof mfaFactor>;

export const ssoProtocol = z.enum(["saml", "oidc"]);

/** SSO connection — an enterprise identity provider bound to an organization. */
export const ssoConnection = z
  .object({
    id: uuid,
    organizationId: uuid,
    protocol: ssoProtocol,
    displayName: nonEmptyString.max(160),
    domains: z.array(z.string().max(253)).min(1),
    entityId: z.string().max(512).nullable(),
    metadataUrl: z.string().url().nullable(),
    enabled: z.boolean().default(false),
  })
  .merge(auditable);
export type SsoConnection = z.infer<typeof ssoConnection>;

/* ------------------------------------------------------------------ */
/* Knowledge depth — embeddings and graph edges                        */
/* ------------------------------------------------------------------ */

export const embeddingModel = z.enum(["text-embedding-3-small", "text-embedding-3-large", "gemini-embedding-001"]);

/** Embedding — a vector for a chunk of a knowledge item. */
export const embedding = z
  .object({
    id: uuid,
    knowledgeItemId: uuid,
    chunkIndex: z.number().int().nonnegative(),
    chunkText: nonEmptyString.max(20_000),
    model: embeddingModel,
    dimensions: z.number().int().positive(),
    vector: z.array(z.number()),
  })
  .merge(tenantScoped);
export type Embedding = z.infer<typeof embedding>;

export const graphEdgeKind = z.enum(["relates_to", "supersedes", "derived_from", "cites", "contradicts"]);

/** Graph edge — a typed relationship between two knowledge nodes. */
export const knowledgeGraphEdge = z
  .object({
    id: uuid,
    fromId: uuid,
    toId: uuid,
    kind: graphEdgeKind,
    weight: z.number().min(0).max(1).default(1),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type KnowledgeGraphEdge = z.infer<typeof knowledgeGraphEdge>;

/* ------------------------------------------------------------------ */
/* Spatial depth — ingest jobs, CRS, tile layers                       */
/* ------------------------------------------------------------------ */

export const spatialFormat = z.enum(["geojson", "shapefile", "kml", "csv_points", "geopackage"]);
export const coordinateSystem = z.enum(["EPSG:4326", "EPSG:3857", "EPSG:21037"]);
export const ingestJobStatus = z.enum(["queued", "validating", "processing", "completed", "failed"]);

/** Shapefile / dataset ingest job. */
export const spatialIngestJob = z
  .object({
    id: uuid,
    layerId: uuid,
    format: spatialFormat,
    sourceUrl: z.string().url(),
    crs: coordinateSystem.default("EPSG:4326"),
    status: ingestJobStatus,
    featureCount: z.number().int().nonnegative().nullable(),
    error: z.string().max(4000).nullable(),
    startedAt: isoTimestamp.nullable(),
    finishedAt: isoTimestamp.nullable(),
  })
  .merge(tenantScoped)
  .merge(auditable);
export type SpatialIngestJob = z.infer<typeof spatialIngestJob>;

/** Tile layer — a renderable basemap or overlay source. */
export const tileLayer = z.object({
  id: uuid,
  name: nonEmptyString.max(160),
  kind: z.enum(["vector", "raster", "satellite", "heatmap"]),
  url: z.string().max(1000),
  minZoom: z.number().int().min(0).max(24).default(0),
  maxZoom: z.number().int().min(0).max(24).default(18),
  attribution: z.string().max(300).nullable(),
  visible: z.boolean().default(true),
});
export type TileLayer = z.infer<typeof tileLayer>;

/* ------------------------------------------------------------------ */
/* Analytics depth — forecasts and executive summaries                 */
/* ------------------------------------------------------------------ */

export const timeGrain = z.enum(["hour", "day", "week", "month"]);

export const metricQuery = z.object({
  metric: nonEmptyString.max(120),
  from: isoTimestamp,
  to: isoTimestamp,
  grain: timeGrain.default("day"),
  groupBy: z.array(z.string().max(80)).default([]),
  filter: z.record(z.string(), z.unknown()).default({}),
});
export type MetricQuery = z.infer<typeof metricQuery>;

export const seriesPoint = z.object({ t: isoTimestamp, value: z.number() });
export const series = z.object({
  metric: nonEmptyString.max(120),
  points: z.array(seriesPoint),
});
export type Series = z.infer<typeof series>;

export const forecastMethod = z.enum(["linear", "holt_winters", "prophet", "ai"]);

export const forecastRequest = metricQuery.extend({
  horizonDays: z.number().int().min(1).max(365),
  method: forecastMethod.default("linear"),
  confidence: z.number().min(0.5).max(0.99).default(0.8),
});
export type ForecastRequest = z.infer<typeof forecastRequest>;

export const forecast = z.object({
  metric: nonEmptyString.max(120),
  method: forecastMethod,
  generatedAt: isoTimestamp,
  points: z.array(seriesPoint.extend({ lower: z.number(), upper: z.number() })),
});
export type Forecast = z.infer<typeof forecast>;

export const executiveSummaryRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  from: isoTimestamp,
  to: isoTimestamp,
  audience: z.enum(["principal", "leadership", "field", "board"]).default("leadership"),
});

export const executiveSummary = z.object({
  headline: nonEmptyString.max(300),
  narrative: nonEmptyString.max(20_000),
  kpis: z.record(z.string(), z.number()),
  risks: z.array(nonEmptyString.max(500)).default([]),
  generatedAt: isoTimestamp,
});
export type ExecutiveSummary = z.infer<typeof executiveSummary>;

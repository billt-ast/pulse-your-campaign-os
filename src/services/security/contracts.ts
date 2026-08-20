/**
 * security contracts — Security Kernel surface.
 *
 * Policy evaluation, secret references, rate limits, audit entries and
 * compliance reports. `services/audit` remains the read model over audit rows.
 */
import { z } from "zod";
import { isoTimestamp, nonEmptyString, paginated, paginationInput, uuid } from "@/packages/validators";

export const policyEffect = z.enum(["allow", "deny"]);

export const policyRule = z.object({
  id: uuid,
  action: nonEmptyString.max(120), // "mission.write"
  resource: z.string().max(160).default("*"),
  effect: policyEffect,
  condition: z.record(z.string(), z.unknown()).default({}),
});
export type PolicyRule = z.infer<typeof policyRule>;

export const evaluatePolicyRequest = z.object({
  action: nonEmptyString.max(120),
  resource: z.string().max(160).default("*"),
  organizationId: uuid.nullable(),
});
export const evaluatePolicyResponse = z.object({
  allowed: z.boolean(),
  matchedRuleId: uuid.nullable(),
  reason: z.string().max(500).nullable(),
});

/** Only the *name* of a secret ever crosses this boundary — never the value. */
export const secretReference = z.object({
  name: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[A-Z][A-Z0-9_]*$/, "must be an UPPER_SNAKE env name"),
  required: z.boolean().default(true),
});
export type SecretReference = z.infer<typeof secretReference>;

export const rateLimitRule = z.object({
  key: nonEmptyString.max(160),
  limit: z.number().int().min(1).max(100_000),
  windowSeconds: z.number().int().min(1).max(86_400),
});
export const rateLimitResult = z.object({
  allowed: z.boolean(),
  remaining: z.number().int().nonnegative(),
  resetAt: isoTimestamp,
});

export const auditEntry = z.object({
  id: uuid,
  occurredAt: isoTimestamp,
  actorId: uuid.nullable(),
  organizationId: uuid.nullable(),
  action: nonEmptyString.max(120),
  resource: z.string().max(200),
  outcome: z.enum(["success", "failure", "denied"]),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type AuditEntry = z.infer<typeof auditEntry>;

export const listAuditEntriesRequest = paginationInput.extend({
  organizationId: uuid,
  action: z.string().max(120).optional(),
  from: isoTimestamp.optional(),
  to: isoTimestamp.optional(),
});
export const listAuditEntriesResponse = paginated(auditEntry);

export const complianceReportRequest = z.object({
  organizationId: uuid,
  framework: z.enum(["internal", "gdpr", "kenya_dpa", "soc2"]).default("internal"),
  from: isoTimestamp,
  to: isoTimestamp,
});
export const complianceReportResponse = z.object({
  framework: z.string().max(40),
  generatedAt: isoTimestamp,
  findings: z.array(
    z.object({
      severity: z.enum(["info", "warning", "critical"]),
      title: nonEmptyString.max(300),
      detail: z.string().max(4000),
    }),
  ),
});

/**
 * audit contracts — immutable audit trail.
 */
import { z } from "zod";
import { uuid, isoTimestamp, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const auditEntry = z.object({
  id: uuid,
  organizationId: uuid,
  actorId: uuid.nullable(),
  action: nonEmptyString.max(120),
  entityType: z.string().min(1).max(80),
  entityId: z.string().min(1).max(120),
  occurredAt: isoTimestamp,
  diff: z.record(z.string(), z.unknown()).optional(),
});
export type AuditEntry = z.infer<typeof auditEntry>;

export const listAuditRequest = paginationInput.extend({
  organizationId: uuid,
  entityType: z.string().optional(),
});
export const listAuditResponse = paginated(auditEntry);

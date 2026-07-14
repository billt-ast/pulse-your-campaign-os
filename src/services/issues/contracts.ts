/**
 * issues contracts — issue tracker.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp, paginated, paginationInput } from "@/packages/validators";

export const issue = z.object({
  id: uuid,
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  status: z.enum(["open", "triaged", "resolved", "closed"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  reportedAt: isoTimestamp,
});
export type Issue = z.infer<typeof issue>;

export const createIssueRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  severity: issue.shape.severity.default("medium"),
});
export const listIssuesRequest = paginationInput.extend({
  organizationId: uuid,
  status: issue.shape.status.optional(),
});
export const listIssuesResponse = paginated(issue);

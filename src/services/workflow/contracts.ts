/**
 * workflow contracts — Workflow Kernel surface.
 *
 * Definitions, running instances, approvals, escalations and scheduling.
 * Calendar entities stay in `services/events`; scheduling lives here.
 */
import { z } from "zod";
import { isoTimestamp, nonEmptyString, paginated, paginationInput, tenantScoped, uuid } from "@/packages/validators";

export const workflowStepKind = z.enum(["task", "approval", "notification", "automation", "wait"]);
export const workflowStatus = z.enum(["pending", "running", "waiting", "completed", "failed", "cancelled"]);
export const approvalDecision = z.enum(["approved", "rejected", "delegated"]);

export const workflowStep = z.object({
  key: nonEmptyString.max(80),
  kind: workflowStepKind,
  name: nonEmptyString.max(200),
  assigneeRole: z.string().max(80).nullable(),
  timeoutMinutes: z.number().int().positive().nullable(),
  next: z.array(z.string().max(80)).default([]),
});
export type WorkflowStep = z.infer<typeof workflowStep>;

export const workflowDefinition = z
  .object({
    id: uuid,
    key: nonEmptyString.max(80),
    version: z.number().int().positive(),
    name: nonEmptyString.max(200),
    steps: z.array(workflowStep).min(1),
    entry: nonEmptyString.max(80),
  })
  .merge(tenantScoped);
export type WorkflowDefinition = z.infer<typeof workflowDefinition>;

export const registerWorkflowRequest = workflowDefinition.omit({ id: true, version: true });

export const startWorkflowRequest = z.object({
  key: nonEmptyString.max(80),
  missionId: uuid.nullable(),
  input: z.record(z.string(), z.unknown()).default({}),
});

export const workflowInstance = z.object({
  id: uuid,
  definitionKey: nonEmptyString.max(80),
  status: workflowStatus,
  currentStep: z.string().max(80).nullable(),
  startedAt: isoTimestamp,
  completedAt: isoTimestamp.nullable(),
  context: z.record(z.string(), z.unknown()).default({}),
});
export type WorkflowInstance = z.infer<typeof workflowInstance>;

export const sendWorkflowSignalRequest = z.object({
  instanceId: uuid,
  signal: nonEmptyString.max(80),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const approvalRequest = z.object({
  instanceId: uuid,
  stepKey: nonEmptyString.max(80),
  decision: approvalDecision,
  comment: z.string().max(4000).optional(),
  delegateTo: uuid.nullable().optional(),
});

export const escalationPolicy = z.object({
  id: uuid,
  stepKey: nonEmptyString.max(80),
  afterMinutes: z.number().int().positive(),
  notifyRole: nonEmptyString.max(80),
  thenDecision: approvalDecision.nullable(),
});

export const scheduleRequest = z.object({
  key: nonEmptyString.max(80),
  cron: z
    .string()
    .min(9)
    .max(120)
    .regex(/^[\d*/,\-\s?LW#]+$/, "must be a cron expression"),
  timezone: z.string().max(64).default("Africa/Nairobi"),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export const listWorkflowInstancesRequest = paginationInput.extend({
  definitionKey: z.string().max(80).optional(),
  status: workflowStatus.optional(),
});
export const listWorkflowInstancesResponse = paginated(workflowInstance);

/** Workflow Kernel — mission execution engine. */
import type { KernelMeta } from "../types";

export interface WorkflowDefinition {
  key: string;
  states: string[];
  initial: string;
  transitions: { from: string; to: string; on: string; requiresApproval?: boolean }[];
}
export interface WorkflowInstance {
  id: string;
  definitionKey: string;
  state: string;
  entityType: string;
  entityId: string;
  updatedAt: string;
}
export interface WorkflowKernelApi {
  register(def: WorkflowDefinition): void;
  start(definitionKey: string, entity: { type: string; id: string }): Promise<WorkflowInstance>;
  send(instanceId: string, event: string): Promise<WorkflowInstance>;
  approve(instanceId: string, approverId: string): Promise<WorkflowInstance>;
  schedule(instanceId: string, event: string, atIso: string): Promise<void>;
}
export const workflowKernelMeta: KernelMeta = {
  id: "workflow",
  name: "Workflow Kernel",
  purpose: "State machines, approvals, escalations, timers and automation rules.",
  dependencies: ["event", "mission", "context"],
  publishes: ["workflow.started", "workflow.transitioned", "workflow.escalated"],
  consumes: ["mission.status_changed", "mission.project_updated"],
  extensionPoints: ["workflow.definition", "automation.rule"],
};

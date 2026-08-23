/**
 * Workflow Kernel adapter — state machines over the Data + Event kernels.
 *
 * Definitions are registered in memory (they are code, not data); instances are
 * persisted through the Data Kernel so a worker can resume them.
 */
import { logger } from "@/libs/logging";
import type { ContextKernelApi } from "../contracts/context";
import type { DataKernelApi } from "../contracts/data";
import type { EventKernelApi } from "../contracts/event";
import type { WorkflowDefinition, WorkflowInstance, WorkflowKernelApi } from "../contracts/workflow";

/** Default mission lifecycle workflow, registered at boot. */
export const MISSION_LIFECYCLE: WorkflowDefinition = {
  key: "mission.lifecycle",
  states: ["draft", "planning", "active", "paused", "completed", "archived"],
  initial: "draft",
  transitions: [
    { from: "draft", to: "planning", on: "plan" },
    { from: "planning", to: "active", on: "launch", requiresApproval: true },
    { from: "active", to: "paused", on: "pause" },
    { from: "paused", to: "active", on: "resume" },
    { from: "active", to: "completed", on: "complete" },
    { from: "completed", to: "archived", on: "archive" },
  ],
};

export function createWorkflowKernel(deps: {
  data: DataKernelApi;
  events: EventKernelApi;
  context: ContextKernelApi;
}): WorkflowKernelApi {
  const { data, events, context } = deps;
  const instances = data.repository<WorkflowInstance>("workflowInstances");
  const definitions = new Map<string, WorkflowDefinition>();
  const pendingApprovals = new Map<string, string>();

  const api: WorkflowKernelApi = {
    register(def) {
      definitions.set(def.key, def);
    },
    async start(definitionKey, entity) {
      const def = definitions.get(definitionKey);
      if (!def) throw new Error(`unknown workflow definition: ${definitionKey}`);
      const instance = await instances.create({
        definitionKey,
        state: def.initial,
        entityType: entity.type,
        entityId: entity.id,
        updatedAt: context.current().now,
      } as Partial<WorkflowInstance>);
      await events.bus.publish("workflow.started", { instanceId: instance.id, definitionKey, entity }, context.current());
      return instance;
    },
    async send(instanceId, event) {
      const instance = await instances.findById(instanceId);
      if (!instance) throw new Error(`workflow instance not found: ${instanceId}`);
      const def = definitions.get(instance.definitionKey);
      if (!def) throw new Error(`unknown workflow definition: ${instance.definitionKey}`);
      const transition = def.transitions.find((t) => t.from === instance.state && t.on === event);
      if (!transition) throw new Error(`event "${event}" is not valid in state "${instance.state}"`);
      if (transition.requiresApproval && pendingApprovals.get(instanceId) !== event) {
        pendingApprovals.set(instanceId, event);
        await events.bus.publish("workflow.escalated", { instanceId, event, reason: "approval_required" }, context.current());
        return instance;
      }
      pendingApprovals.delete(instanceId);
      const updated = await instances.update(instanceId, {
        state: transition.to,
        updatedAt: context.current().now,
      } as Partial<WorkflowInstance>);
      await events.bus.publish(
        "workflow.transitioned",
        { instanceId, from: instance.state, to: transition.to, on: event },
        context.current(),
      );
      return updated;
    },
    async approve(instanceId, approverId) {
      const event = pendingApprovals.get(instanceId);
      if (!event) throw new Error(`no approval pending for instance ${instanceId}`);
      logger.info("workflow approval granted", { instanceId, approverId, event });
      pendingApprovals.set(instanceId, event);
      return api.send(instanceId, event);
    },
    async schedule(instanceId, event, atIso) {
      const delaySeconds = Math.max(0, Math.round((Date.parse(atIso) - Date.now()) / 1000));
      await events.queues.enqueue("workflow.timers", { instanceId, event }, { delaySeconds });
    },
  };

  api.register(MISSION_LIFECYCLE);
  return api;
}

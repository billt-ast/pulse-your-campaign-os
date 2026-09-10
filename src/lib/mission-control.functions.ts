/**
 * Mission Control server functions.
 *
 * Every handler talks to the Pulse Kernel only — no table, no vendor SDK.
 * The kernel module is server-only, so it is imported inside handlers.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { MissionKernelApi, MissionStatus } from "@/kernel/contracts/mission";
import type { WorkflowInstance, WorkflowKernelApi } from "@/kernel/contracts/workflow";
import type { DataKernelApi } from "@/kernel/contracts/data";
import type { EventKernelApi } from "@/kernel/contracts/event";
import type { ContextKernelApi } from "@/kernel/contracts/context";
import type { DomainEventEnvelope } from "@/kernel/events";
import type { Organization, Workspace, Mission } from "@/packages/validators";
import { missionType, nonEmptyString, organization, slug, uuid } from "@/packages/validators";

/* ------------------------------------------------------------------ */
/* Kernel access                                                       */
/* ------------------------------------------------------------------ */

async function kernelFor(userId: string, organizationId: string | null = null) {
  const { platformKernel } = await import("@/kernel/kernel.server");
  const kernel = await platformKernel();
  const context = kernel.get<ContextKernelApi>("context");
  context.set({ userId, organizationId, now: new Date().toISOString() });
  return {
    kernel,
    context,
    missions: kernel.get<MissionKernelApi>("mission"),
    workflow: kernel.get<WorkflowKernelApi>("workflow"),
    data: kernel.get<DataKernelApi>("data"),
    events: kernel.get<EventKernelApi>("event"),
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "untitled";
}

/** Lifecycle action → mission status the Mission Kernel should end up in. */
const ACTION_TARGET: Record<string, MissionStatus> = {
  plan: "planning",
  launch: "active",
  pause: "paused",
  resume: "active",
  complete: "completed",
  archive: "archived",
};

const lifecycleAction = z.enum(["plan", "launch", "pause", "resume", "complete", "archive"]);
export type LifecycleAction = z.infer<typeof lifecycleAction>;

export interface OrganizationSummary {
  organization: Organization;
  workspaces: Workspace[];
  missionCount: number;
}

export interface MissionRow {
  mission: Mission;
  workflow: WorkflowInstance | null;
}

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** Organizations this user created, with their workspaces and mission counts. */
export const listWorkspaceOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context: auth }): Promise<{ organizations: OrganizationSummary[]; missions: MissionRow[] }> => {
    const { missions, data } = await kernelFor(auth.userId);
    const all = await missions.organizations.list();
    const mine = all.filter((org) => org.createdBy === auth.userId || org.createdBy === null);

    const instances = data.repository<WorkflowInstance>("workflowInstances");
    const summaries: OrganizationSummary[] = [];
    const rows: MissionRow[] = [];

    for (const org of mine) {
      const workspaces = await missions.workspaces.listByOrganization(org.id);
      const orgMissions = await missions.missions.list({ organizationId: org.id });
      summaries.push({ organization: org, workspaces, missionCount: orgMissions.length });
      for (const mission of orgMissions) {
        const instance =
          (await instances.list({ filter: { entityType: "mission", entityId: mission.id }, limit: 1 })).data[0] ?? null;
        rows.push({ mission, workflow: instance });
      }
    }

    rows.sort((a, b) => (a.mission.createdAt < b.mission.createdAt ? 1 : -1));
    return { organizations: summaries, missions: rows };
  });

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

const createOrgInput = z.object({
  name: nonEmptyString.max(160),
  kind: organization.shape.kind.default("other"),
  workspaceName: nonEmptyString.max(160).default("Headquarters"),
});

export const createOrganizationWithWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createOrgInput.parse(input))
  .handler(async ({ data: input, context: auth }) => {
    const { missions, data } = await kernelFor(auth.userId);
    const org = await missions.organizations.create({
      name: input.name,
      slug: `${slugify(input.name)}-${Date.now().toString(36)}`,
      kind: input.kind,
    });
    const now = new Date().toISOString();
    const workspace = await data.repository<Workspace>("workspaces").create({
      organizationId: org.id,
      name: input.workspaceName,
      slug: slugify(input.workspaceName),
      createdAt: now,
      updatedAt: now,
      createdBy: auth.userId,
      updatedBy: auth.userId,
    } as Partial<Workspace>);
    return { organization: org, workspace };
  });

const createMissionInput = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable().default(null),
  name: nonEmptyString.max(200),
  type: missionType.default("campaign"),
  slug: slug.optional(),
});

export const createMissionWithWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createMissionInput.parse(input))
  .handler(async ({ data: input, context: auth }): Promise<MissionRow> => {
    const { missions, workflow } = await kernelFor(auth.userId, input.organizationId);
    const mission = await missions.missions.create({
      name: input.name,
      slug: `${input.slug ?? slugify(input.name)}-${Date.now().toString(36)}`,
      type: input.type,
      organizationId: input.organizationId,
      workspaceId: input.workspaceId,
    });
    const instance = await workflow.start("mission.lifecycle", { type: "mission", id: mission.id });
    return { mission, workflow: instance };
  });

const advanceInput = z.object({ missionId: uuid, action: lifecycleAction });

/**
 * Drive one lifecycle step through the Workflow + Mission kernels.
 * `launch` requires approval, so the escalation and the approval are handled
 * within the same kernel call and the emitted events are returned as a trace.
 */
export const advanceMission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => advanceInput.parse(input))
  .handler(async ({ data: input, context: auth }): Promise<MissionRow & { trace: { name: string }[] }> => {
    const { missions, workflow, data, events } = await kernelFor(auth.userId);
    const mission = await missions.missions.get(input.missionId);
    if (!mission) throw new Error("Mission not found");

    const instances = data.repository<WorkflowInstance>("workflowInstances");
    let instance =
      (await instances.list({ filter: { entityType: "mission", entityId: mission.id }, limit: 1 })).data[0] ?? null;
    if (!instance) instance = await workflow.start("mission.lifecycle", { type: "mission", id: mission.id });

    const trace: { name: string }[] = [];
    const unsubscribe = events.bus.subscribe("*", async (event: DomainEventEnvelope) => {
      trace.push({ name: event.name });
    });

    try {
      let next = await workflow.send(instance.id, input.action);
      // Unchanged state means the transition escalated for approval.
      if (next.state === instance.state) next = await workflow.approve(instance.id, auth.userId);

      const target = ACTION_TARGET[input.action]!;
      const updated = mission.status === target ? mission : await missions.missions.transition(mission.id, target);
      await events.bus.drain();
      return { mission: updated, workflow: next, trace };
    } finally {
      unsubscribe();
    }
  });

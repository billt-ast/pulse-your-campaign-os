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

interface Membership { id: string; organizationId: string; userId: string; role: string }

/** Is the caller a platform admin? Checked as the caller (RLS applies). */
export async function callerIsAdmin(supabase: { rpc: (...args: never[]) => unknown }, userId: string): Promise<boolean> {
  const { data } = await (supabase as unknown as {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: boolean | null }>;
  }).rpc("has_role", { _user_id: userId, _role: "admin" });
  return Boolean(data);
}

/** Organizations the user may operate: memberships, own creations, or all for admins. */
async function accessibleOrgIds(data: DataKernelApi, orgs: Organization[], userId: string, admin: boolean): Promise<Set<string>> {
  if (admin) return new Set(orgs.map((o) => o.id));
  const memberships = (await data.repository<Membership>("organizationMembers").list({ filter: { userId }, limit: 500 })).data;
  const ids = new Set(memberships.map((m) => m.organizationId));
  for (const o of orgs) if (o.createdBy === userId) ids.add(o.id);
  return ids;
}

async function assertOrgAccess(
  k: Awaited<ReturnType<typeof kernelFor>>,
  supabase: unknown,
  userId: string,
  organizationId: string,
) {
  const admin = await callerIsAdmin(supabase as never, userId);
  const orgs = await k.missions.organizations.list();
  const ids = await accessibleOrgIds(k.data, orgs, userId, admin);
  if (!ids.has(organizationId)) throw new Error("Forbidden: you are not a member of this organization");
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
  .handler(async ({ context: auth }): Promise<{ organizations: OrganizationSummary[]; missions: MissionRow[]; isAdmin: boolean }> => {
    const { missions, data } = await kernelFor(auth.userId);
    const isAdmin = await callerIsAdmin(auth.supabase as never, auth.userId);
    const all = await missions.organizations.list();
    const allowed = await accessibleOrgIds(data, all, auth.userId, isAdmin);
    const mine = all.filter((org) => allowed.has(org.id));

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
    return { organizations: summaries, missions: rows, isAdmin };
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
    await data.repository<Membership>("organizationMembers").create({
      organizationId: org.id,
      userId: auth.userId,
      role: "owner",
    } as Partial<Membership>);
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
    const k = await kernelFor(auth.userId, input.organizationId);
    await assertOrgAccess(k, auth.supabase, auth.userId, input.organizationId);
    const { missions, workflow } = k;
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
    const k = await kernelFor(auth.userId);
    const { missions, workflow, data, events } = k;
    const mission = await missions.missions.get(input.missionId);
    if (!mission) throw new Error("Mission not found");
    await assertOrgAccess(k, auth.supabase, auth.userId, mission.organizationId);

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

/* ------------------------------------------------------------------ */
/* AI mission planning                                                 */
/* ------------------------------------------------------------------ */

const planInput = z.object({
  brief: z.string().trim().min(20, "Brief should be at least 20 characters").max(8000),
  missionType: missionType.default("campaign"),
  organizationId: uuid.nullable().default(null),
});

export const generateMissionPlanFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => planInput.parse(input))
  .handler(async ({ data: input, context: auth }) => {
    const { generateMissionPlan, AiGatewayError } = await import("./mission-plan.server");
    let orgName: string | null = null;
    if (input.organizationId) {
      const k = await kernelFor(auth.userId, input.organizationId);
      await assertOrgAccess(k, auth.supabase, auth.userId, input.organizationId);
      const { missions } = k;
      orgName = (await missions.organizations.list()).find((o) => o.id === input.organizationId)?.name ?? null;
    }
    try {
      const plan = await generateMissionPlan(input.brief, { missionType: input.missionType, organization: orgName });
      return { ok: true as const, plan };
    } catch (error) {
      if (error instanceof AiGatewayError) {
        const message =
          error.status === 402
            ? "AI credits are used up for this workspace. Add credits in workspace billing to keep planning."
            : error.status === 429
              ? "Too many AI requests right now — please wait a moment and try again."
              : error.message;
        return { ok: false as const, error: message };
      }
      console.error("mission plan failed", error);
      return { ok: false as const, error: "Could not generate a plan. Please try again." };
    }
  });

const visibilityInput = z.object({ missionId: uuid, visibility: z.enum(["internal", "public"]) });

/** Publish a mission to (or hide it from) the public portal. */
export const setMissionVisibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => visibilityInput.parse(input))
  .handler(async ({ data: input, context: auth }) => {
    const k = await kernelFor(auth.userId);
    const mission = await k.missions.missions.get(input.missionId);
    if (!mission) throw new Error("Mission not found");
    await assertOrgAccess(k, auth.supabase, auth.userId, mission.organizationId);
    return k.missions.missions.setVisibility(mission.id, input.visibility);
  });

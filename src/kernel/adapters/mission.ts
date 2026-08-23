/**
 * Mission Kernel adapter — organizations, workspaces, missions.
 *
 * Provider-agnostic: it only speaks the Data Kernel `Repository` contract and
 * publishes on the Event Kernel bus, so the same implementation runs on
 * in-memory repositories in tests and on Supabase/Neon in production.
 */
import type { Community, Mission, MissionStatus, MissionType, Organization, Program, Project, Workspace } from "@/packages/validators";
import type { ContextKernelApi } from "../contracts/context";
import type { DataKernelApi } from "../contracts/data";
import type { MissionKernelApi } from "../contracts/mission";
import type { EventKernelApi } from "../contracts/event";

/** Legal mission lifecycle transitions — the kernel refuses anything else. */
export const MISSION_TRANSITIONS: Record<MissionStatus, MissionStatus[]> = {
  draft: ["planning", "archived"],
  planning: ["active", "draft", "archived"],
  active: ["paused", "completed"],
  paused: ["active", "completed", "archived"],
  completed: ["archived"],
  archived: [],
};

export class MissionTransitionError extends Error {
  constructor(from: MissionStatus, to: MissionStatus) {
    super(`illegal mission transition: ${from} -> ${to}`);
    this.name = "MissionTransitionError";
  }
}

export function createMissionKernel(deps: {
  data: DataKernelApi;
  events: EventKernelApi;
  context: ContextKernelApi;
}): MissionKernelApi {
  const { data, events, context } = deps;
  const organizations = data.repository<Organization>("organizations");
  const workspaces = data.repository<Workspace>("workspaces");
  const missions = data.repository<Mission>("missions");
  const programs = data.repository<Program>("programs");
  const projects = data.repository<Project>("projects");
  const communities = data.repository<Community>("communities");

  const stamp = () => {
    const ctx = context.current();
    return { createdAt: ctx.now, updatedAt: ctx.now, createdBy: ctx.userId, updatedBy: ctx.userId };
  };

  return {
    organizations: {
      async list() {
        return (await organizations.list({ limit: 200 })).data;
      },
      async create(input) {
        const organization = await organizations.create({ ...input, ...stamp() } as Partial<Organization>);
        await events.bus.publish("mission.organization_created", { organizationId: organization.id, slug: organization.slug }, context.current());
        return organization;
      },
    },
    workspaces: {
      async listByOrganization(organizationId) {
        return (await workspaces.list({ filter: { organizationId }, limit: 200 })).data;
      },
    },
    missions: {
      async list(filter) {
        const spec: Record<string, unknown> = {};
        if (filter?.organizationId) spec["organizationId"] = filter.organizationId;
        if (filter?.type) spec["type"] = filter.type;
        if (filter?.status) spec["status"] = filter.status;
        return (await missions.list({ filter: spec, limit: 200 })).data;
      },
      async get(id) {
        return missions.findById(id);
      },
      async create(input) {
        const mission = await missions.create({
          ...input,
          status: "draft" as MissionStatus,
          visibility: "internal",
          startsAt: null,
          endsAt: null,
          ...stamp(),
        } as Partial<Mission>);
        await events.bus.publish(
          "mission.created",
          { missionId: mission.id, type: mission.type as MissionType, organizationId: mission.organizationId },
          context.current(),
        );
        return mission;
      },
      async transition(id, status) {
        const current = await missions.findById(id);
        if (!current) throw new Error(`mission not found: ${id}`);
        if (!MISSION_TRANSITIONS[current.status].includes(status)) {
          throw new MissionTransitionError(current.status, status);
        }
        const ctx = context.current();
        const updated = await missions.update(id, { status, updatedAt: ctx.now, updatedBy: ctx.userId } as Partial<Mission>);
        await events.bus.publish("mission.status_changed", { missionId: id, from: current.status, to: status }, ctx);
        return updated;
      },
    },
    programs: {
      async listByMission(missionId) {
        return (await programs.list({ filter: { missionId }, limit: 200 })).data;
      },
    },
    projects: {
      async listByProgram(programId) {
        return (await projects.list({ filter: { programId }, limit: 200 })).data;
      },
    },
    communities: {
      async listByMission(missionId) {
        return (await communities.list({ filter: { missionId }, limit: 200 })).data;
      },
    },
  };
}

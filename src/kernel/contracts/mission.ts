/** Mission Kernel — the operational heart of Pulse. */
import type { KernelMeta } from "../types";
import type { Mission, Organization, Program, Project, Workspace, Community, MissionStatus, MissionType } from "@/packages/validators";

export type { Mission, MissionStatus, MissionType };

export interface MissionKernelApi {
  organizations: {
    list(): Promise<Organization[]>;
    create(input: Pick<Organization, "name" | "slug" | "kind">): Promise<Organization>;
  };
  workspaces: {
    listByOrganization(organizationId: string): Promise<Workspace[]>;
  };
  missions: {
    list(filter?: { organizationId?: string; type?: MissionType; status?: MissionStatus }): Promise<Mission[]>;
    get(id: string): Promise<Mission | null>;
    create(input: Pick<Mission, "name" | "slug" | "type" | "organizationId" | "workspaceId">): Promise<Mission>;
    transition(id: string, status: MissionStatus): Promise<Mission>;
  };
  programs: { listByMission(missionId: string): Promise<Program[]> };
  projects: { listByProgram(programId: string): Promise<Project[]> };
  communities: { listByMission(missionId: string): Promise<Community[]> };
}
export const missionKernelMeta: KernelMeta = {
  id: "mission",
  name: "Mission Kernel",
  purpose: "Organizations, workspaces, missions, programs, projects, objectives, tasks, communities.",
  dependencies: ["data", "identity", "context", "event"],
  publishes: ["mission.organization_created", "mission.created", "mission.status_changed", "mission.project_updated"],
  consumes: ["identity.workspace_changed"],
  extensionPoints: ["mission.type", "lifecycle.stage"],
};

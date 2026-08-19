/**
 * missions contracts — Mission Kernel surface (missions, phases, objectives, tasks).
 *
 * `services/campaigns` is a projection over missions of type "campaign"; this
 * module is the canonical mission surface every other projection composes.
 */
import { z } from "zod";
import {
  mission,
  missionPhase,
  missionStatus,
  missionType,
  missionVisibility,
  objective,
  objectiveStatus,
  paginated,
  paginationInput,
  program,
  project,
  slug,
  task,
  taskPriority,
  taskStatus,
  uuid,
  nonEmptyString,
  isoTimestamp,
} from "@/packages/validators";

/* Missions ---------------------------------------------------------- */

export const createMissionRequest = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable(),
  slug,
  name: nonEmptyString.max(200),
  type: missionType,
  visibility: missionVisibility.default("internal"),
  startsAt: isoTimestamp.nullable(),
  endsAt: isoTimestamp.nullable(),
});
export type CreateMissionRequest = z.infer<typeof createMissionRequest>;

export const transitionMissionRequest = z.object({ id: uuid, status: missionStatus });

export const listMissionsRequest = paginationInput.extend({
  organizationId: uuid,
  type: missionType.optional(),
  status: missionStatus.optional(),
});
export const listMissionsResponse = paginated(mission);

/* Phases ------------------------------------------------------------ */

export const createMissionPhaseRequest = missionPhase
  .pick({ missionId: true, name: true, sequence: true, startsAt: true, endsAt: true })
  .extend({ status: missionPhase.shape.status.default("upcoming") });
export const listMissionPhasesRequest = z.object({ missionId: uuid });
export const listMissionPhasesResponse = z.object({ data: z.array(missionPhase) });

/* Objectives -------------------------------------------------------- */

export const createObjectiveRequest = objective.pick({
  missionId: true,
  programId: true,
  name: true,
  metric: true,
  target: true,
  unit: true,
  dueAt: true,
  ownerId: true,
});
export const updateObjectiveProgressRequest = z.object({
  id: uuid,
  current: z.number(),
  status: objectiveStatus.optional(),
});
export const listObjectivesRequest = paginationInput.extend({
  missionId: uuid,
  status: objectiveStatus.optional(),
});
export const listObjectivesResponse = paginated(objective);

/* Tasks ------------------------------------------------------------- */

export const createTaskRequest = task.pick({
  missionId: true,
  projectId: true,
  objectiveId: true,
  title: true,
  description: true,
  assigneeId: true,
  dueAt: true,
}).extend({ priority: taskPriority.default("normal") });
export const updateTaskStatusRequest = z.object({ id: uuid, status: taskStatus });
export const listTasksRequest = paginationInput.extend({
  missionId: uuid,
  projectId: uuid.optional(),
  assigneeId: uuid.optional(),
  status: taskStatus.optional(),
});
export const listTasksResponse = paginated(task);

/* Structure read models --------------------------------------------- */

export const missionStructureResponse = z.object({
  mission,
  phases: z.array(missionPhase),
  programs: z.array(program),
  projects: z.array(project),
  objectives: z.array(objective),
});
export type MissionStructureResponse = z.infer<typeof missionStructureResponse>;

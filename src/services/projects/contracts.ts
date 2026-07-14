/**
 * projects contracts — project CRUD under a mission.
 */
import { z } from "zod";
import { project, uuid, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const createProjectRequest = z.object({
  programId: uuid,
  missionId: uuid,
  name: nonEmptyString.max(200),
  dueAt: z.string().datetime({ offset: true }).nullable(),
});
export const listProjectsRequest = paginationInput.extend({ missionId: uuid });
export const listProjectsResponse = paginated(project);

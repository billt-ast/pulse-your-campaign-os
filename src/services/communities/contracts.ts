/**
 * communities contracts — audience / constituency grouping.
 */
import { z } from "zod";
import { community, uuid, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const createCommunityRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  name: nonEmptyString.max(200),
  kind: community.shape.kind,
});
export const listCommunitiesRequest = paginationInput.extend({ organizationId: uuid });
export const listCommunitiesResponse = paginated(community);

/**
 * campaigns contracts — mission projections for campaign-typed missions.
 */
import { z } from "zod";
import { mission, missionType, missionStatus, uuid, nonEmptyString, paginated, paginationInput, slug } from "@/packages/validators";

/**
 * Campaigns are modeled as missions of type "campaign". These contracts are
 * thin projections over the shared Mission model so campaign-specific screens
 * stay aligned with governance, NGO and advocacy missions.
 */
export const createCampaignRequest = z.object({
  organizationId: uuid,
  workspaceId: uuid.nullable(),
  slug,
  name: nonEmptyString.max(200),
  startsAt: z.string().datetime({ offset: true }).nullable(),
  endsAt: z.string().datetime({ offset: true }).nullable(),
});
export const updateCampaignStatusRequest = z.object({
  id: uuid,
  status: missionStatus,
});
export const listCampaignsRequest = paginationInput.extend({
  organizationId: uuid,
  type: missionType.default("campaign"),
});
export const listCampaignsResponse = paginated(mission);

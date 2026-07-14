/**
 * knowledge contracts — knowledge asset library.
 */
import { z } from "zod";
import { knowledgeItem, uuid, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const createKnowledgeItemRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  kind: knowledgeItem.shape.kind,
  body: z.string().max(200_000).optional(),
});
export const listKnowledgeRequest = paginationInput.extend({
  organizationId: uuid,
  missionId: uuid.optional(),
});
export const listKnowledgeResponse = paginated(knowledgeItem);

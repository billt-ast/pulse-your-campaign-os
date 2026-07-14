/**
 * documents contracts — document CRUD.
 */
import { z } from "zod";
import { uuid, nonEmptyString, isoTimestamp, paginated, paginationInput } from "@/packages/validators";

export const document = z.object({
  id: uuid,
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  updatedAt: isoTimestamp,
});
export type Document = z.infer<typeof document>;

export const createDocumentRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable(),
  title: nonEmptyString.max(300),
  body: z.string().max(500_000).optional(),
});
export const listDocumentsRequest = paginationInput.extend({ organizationId: uuid });
export const listDocumentsResponse = paginated(document);

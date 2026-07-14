/**
 * organizations contracts — org CRUD and listing.
 */
import { z } from "zod";
import { organization, uuid, slug, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const createOrganizationRequest = z.object({
  slug,
  name: nonEmptyString.max(160),
  kind: organization.shape.kind,
});
export const updateOrganizationRequest = z.object({
  id: uuid,
  name: nonEmptyString.max(160).optional(),
});
export const listOrganizationsRequest = paginationInput;
export const listOrganizationsResponse = paginated(organization);

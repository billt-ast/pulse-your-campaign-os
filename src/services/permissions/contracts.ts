/**
 * permissions contracts — role grants.
 */
import { z } from "zod";
import { uuid } from "@/packages/validators";

export const appRole = z.enum(["admin", "manager", "operator", "viewer"]);
export type AppRole = z.infer<typeof appRole>;

export const grantRoleRequest = z.object({
  organizationId: uuid,
  userId: uuid,
  role: appRole,
});
export const revokeRoleRequest = grantRoleRequest;
export const listRolesRequest = z.object({ organizationId: uuid, userId: uuid.optional() });
export const listRolesResponse = z.object({
  assignments: z.array(z.object({ userId: uuid, role: appRole })),
});

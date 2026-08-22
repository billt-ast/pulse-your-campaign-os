/**
 * identity contracts — user profile lookup + update.
 */
import { z } from "zod";
import { uuid, email, nonEmptyString, paginated, paginationInput } from "@/packages/validators";

export const userProfile = z.object({
  id: uuid,
  email,
  displayName: nonEmptyString.max(160),
  avatarUrl: z.string().url().nullable(),
});
export type UserProfile = z.infer<typeof userProfile>;

export const getCurrentUserResponse = userProfile;
export const updateProfileRequest = z.object({
  displayName: nonEmptyString.max(160).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export const listUsersRequest = paginationInput;
export const listUsersResponse = paginated(userProfile);

/* Invitations, MFA and SSO (2B.1.1E) ------------------------------- */
import {
  invitation,
  invitationStatus,
  mfaFactor,
  mfaMethod,
  roleName,
  ssoConnection,
} from "@/packages/validators";

export const createInvitationRequest = invitation.pick({
  organizationId: true,
  workspaceId: true,
  email: true,
  role: true,
});
export const acceptInvitationRequest = z.object({ token: z.string().min(16).max(256) });
export const revokeInvitationRequest = z.object({ id: uuid });
export const listInvitationsRequest = paginationInput.extend({
  organizationId: uuid,
  status: invitationStatus.optional(),
});
/** Tokens are never returned to callers. */
export const listInvitationsResponse = paginated(invitation.omit({ token: true }));

export const enrollMfaRequest = z.object({ method: mfaMethod, label: z.string().max(120).nullable() });
export const enrollMfaResponse = z.object({
  factor: mfaFactor,
  secret: z.string().max(256).optional(),
  otpauthUrl: z.string().max(1000).optional(),
});
export const verifyMfaRequest = z.object({ factorId: uuid, code: z.string().min(4).max(12) });
export const listMfaFactorsResponse = z.object({ data: z.array(mfaFactor) });

export const upsertSsoConnectionRequest = ssoConnection.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
  updatedBy: true,
});
export const listSsoConnectionsRequest = z.object({ organizationId: uuid });
export const listSsoConnectionsResponse = z.object({ data: z.array(ssoConnection) });
export const assignRoleRequest = z.object({ userId: uuid, organizationId: uuid, role: roleName });

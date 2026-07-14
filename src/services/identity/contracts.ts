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

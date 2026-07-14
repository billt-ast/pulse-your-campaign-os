/**
 * communications contracts — outbound email + SMS.
 */
import { z } from "zod";
import { uuid, nonEmptyString, email } from "@/packages/validators";

export const sendEmailRequest = z.object({
  to: z.array(email).min(1).max(500),
  subject: nonEmptyString.max(200),
  body: z.string().max(200_000),
  missionId: uuid.nullable().optional(),
});
export const sendSmsRequest = z.object({
  to: z.array(z.string().regex(/^\+[1-9]\d{6,14}$/)).min(1).max(500),
  body: z.string().min(1).max(1600),
});

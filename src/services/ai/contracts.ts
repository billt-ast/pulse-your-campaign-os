/**
 * ai contracts — Lovable AI completions.
 */
import { z } from "zod";
import { uuid, nonEmptyString } from "@/packages/validators";

export const aiCompletionRequest = z.object({
  organizationId: uuid,
  missionId: uuid.nullable().optional(),
  prompt: nonEmptyString.max(20_000),
  model: z.string().default("google/gemini-2.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
});
export const aiCompletionResponse = z.object({
  text: z.string(),
  model: z.string(),
  tokens: z.object({ input: z.number(), output: z.number() }).optional(),
});

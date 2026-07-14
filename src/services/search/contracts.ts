/**
 * search contracts — cross-entity search.
 */
import { z } from "zod";
import { uuid, nonEmptyString } from "@/packages/validators";

export const searchRequest = z.object({
  organizationId: uuid,
  query: nonEmptyString.max(500),
  kinds: z.array(z.enum(["mission", "project", "community", "knowledge", "person"])).optional(),
  limit: z.number().int().min(1).max(100).default(20),
});
export const searchHit = z.object({
  kind: z.string(),
  id: uuid,
  title: z.string(),
  score: z.number(),
  snippet: z.string().optional(),
});
export const searchResponse = z.object({ hits: z.array(searchHit) });

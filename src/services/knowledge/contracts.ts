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

/* Embeddings and graph edges (2B.1.1E) ----------------------------- */
import { embedding, embeddingModel, graphEdgeKind, knowledgeGraphEdge } from "@/packages/validators";

export const indexEmbeddingsRequest = z.object({
  knowledgeItemId: uuid,
  model: embeddingModel.default("text-embedding-3-small"),
  chunkSize: z.number().int().min(200).max(8_000).default(1_200),
});
export const indexEmbeddingsResponse = z.object({ chunks: z.number().int().nonnegative() });

export const semanticSearchRequest = z.object({
  query: nonEmptyString.max(2_000),
  organizationId: uuid,
  missionId: uuid.nullable().optional(),
  limit: z.number().int().min(1).max(50).default(10),
  minScore: z.number().min(0).max(1).default(0.5),
});
export const semanticSearchResponse = z.object({
  data: z.array(
    z.object({
      knowledgeItemId: uuid,
      chunkIndex: z.number().int().nonnegative(),
      chunkText: nonEmptyString.max(20_000),
      score: z.number().min(0).max(1),
    }),
  ),
});
/** Vectors stay server-side; never ship them to clients. */
export const embeddingRecord = embedding;

export const linkKnowledgeRequest = knowledgeGraphEdge.pick({ fromId: true, toId: true, kind: true, weight: true });
export const relatedKnowledgeRequest = z.object({
  id: uuid,
  kind: graphEdgeKind.optional(),
  limit: z.number().int().min(1).max(50).default(10),
});
export const relatedKnowledgeResponse = z.object({ data: z.array(knowledgeGraphEdge) });

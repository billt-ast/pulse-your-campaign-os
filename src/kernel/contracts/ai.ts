/** AI Kernel — shared AI runtime (not messaging). */
import type { KernelMeta } from "../types";

export interface PromptDefinition {
  key: string;
  version: number;
  template: string;
  model: string;
}
export interface AiKernelApi {
  prompts: { register(def: PromptDefinition): void; get(key: string): PromptDefinition | null };
  complete(input: { promptKey?: string; prompt?: string; variables?: Record<string, unknown>; model?: string }): Promise<{ text: string; model: string }>;
  embed(input: { texts: string[]; model?: string }): Promise<number[][]>;
  retrieve(input: { query: string; limit?: number }): Promise<{ id: string; score: number; snippet: string }[]>;
  summarize(input: { text: string; style?: "executive" | "bullet" | "brief" }): Promise<string>;
  buildContext(input: { missionId?: string; question: string }): Promise<string>;
}
export const aiKernelMeta: KernelMeta = {
  id: "ai",
  name: "AI Kernel",
  purpose: "Prompt registry, embeddings, retrieval, context building and summarization.",
  dependencies: ["knowledge", "context", "security"],
  publishes: ["ai.completion_created", "ai.embedding_indexed"],
  consumes: ["knowledge.indexed"],
  extensionPoints: ["model.provider", "retriever", "prompt.pack"],
};

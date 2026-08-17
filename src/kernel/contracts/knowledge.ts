/** Knowledge Kernel — institutional memory and knowledge graph. */
import type { KernelMeta } from "../types";

export interface KnowledgeDocument {
  id: string;
  title: string;
  kind: "doc" | "brief" | "policy" | "faq" | "playbook" | "meeting" | "issue" | "media";
  missionId: string | null;
  updatedAt: string;
  version: number;
}
export interface KnowledgeKernelApi {
  index(doc: { id: string; title: string; body: string; kind: KnowledgeDocument["kind"] }): Promise<void>;
  search(query: string, opts?: { limit?: number; semantic?: boolean }): Promise<KnowledgeDocument[]>;
  related(id: string): Promise<KnowledgeDocument[]>;
  versions(id: string): Promise<{ version: number; updatedAt: string }[]>;
  link(fromId: string, toId: string, relation: string): Promise<void>;
}
export const knowledgeKernelMeta: KernelMeta = {
  id: "knowledge",
  name: "Knowledge Kernel",
  purpose: "Document indexing, entity linking, versioning, knowledge graph and RAG preparation.",
  dependencies: ["data", "storage", "event"],
  publishes: ["knowledge.indexed", "knowledge.graph_updated"],
  consumes: ["mission.project_updated", "storage.asset_uploaded"],
  extensionPoints: ["index.provider", "graph.provider"],
};

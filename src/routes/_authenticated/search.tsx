import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Search — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Intelligence" title="Search">
      <ComingSoon
        title="Universal search"
        description="Every entity — people, campaigns, documents, media, locations — reachable through a single command surface."
        bullets={["Command palette", "Full-text index", "Filters & saved searches", "Embeddings-backed semantic search"]}
      />
    </AppShell>
  ),
});

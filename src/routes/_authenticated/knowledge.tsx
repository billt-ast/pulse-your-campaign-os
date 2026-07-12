import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/knowledge")({
  head: () => ({ meta: [{ title: "Knowledge — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Governance" title="Knowledge">
      <ComingSoon
        title="Organizational knowledge"
        description="Documents, playbooks, decisions and briefings — versioned, searchable and grounded in the org's context."
        bullets={["Docs & briefings", "Decisions log", "Playbooks", "Versioned history"]}
      />
    </AppShell>
  ),
});

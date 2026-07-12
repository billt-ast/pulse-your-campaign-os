import { createFileRoute } from "@tanstack/react-router";
import { AppShell, ComingSoon } from "@/components/pulse";

export const Route = createFileRoute("/_authenticated/media")({
  head: () => ({ meta: [{ title: "Media — Pulse" }] }),
  component: () => (
    <AppShell eyebrow="Governance" title="Media">
      <ComingSoon
        title="Media library"
        description="Assets, briefs and creative deliverables — bound to campaigns, events and knowledge."
        bullets={["Uploads & storage", "Rights & consent", "Usage per campaign", "AI-assisted tagging"]}
      />
    </AppShell>
  ),
});
